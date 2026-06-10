import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { chestPainRules } from "@/data/chestPainRules";
import {
  diseaseRegistry,
  diseaseRegistryById,
  getDiseaseShortlistForNote,
  type DiseaseShortlistItem
} from "@/data/diseaseRegistry";
import {
  clinicalExtractionJsonSchema,
  createEmptyClinicalExtractionResult,
  redactDirectIdentifiers,
  sanitizeClinicalExtractionResult
} from "@/lib/clinical-extraction/schema";
import type { ClinicalExtractionResult } from "@/types/clinical";

export const runtime = "nodejs";

const CACHE_TTL_MS = 1000 * 60 * 20;
const MAX_FREE_TEXT_LENGTH = 4000;
const DEFAULT_MODEL = "gpt-4.1-mini";
const SCHEMA_VERSION = "clinical-extraction-v1";

const SYSTEM_PROMPT = `
You are a structured clinical information extractor for a clinician-facing
clinical decision support dashboard. You are not the treating physician and you
must not make final diagnoses.

Extract only information explicitly stated in the clinician free text. Use only
the provided checklist itemId values and diseaseId values. Never invent a new
checklist item, disease, itemId, or diseaseId.

Differentiate current symptoms, past history, family history, risk factors,
medications, procedures, test results, and hypotheses. Treat negation precisely:
"dyspnea absent" means dyspnea absent; "dyspnea present" means dyspnea present.
"father had MI" is family_history, not current MI. "prior PCI" is past_history
or risk_factor, not current ACS. "aortic dissection suspected" is a hypothesis
or must-not-miss candidate, not a confirmed diagnosis. "CTA confirmed
dissection" is test_result evidence.

Red flags and must-not-miss diagnoses always require clinician confirmation.
Conflicts must be marked for review and must not be silently resolved. Return
only JSON matching the supplied schema.
`.trim();

type CacheEntry = {
  expiresAt: number;
  result: ClinicalExtractionResult;
};

declare global {
  var clinicalExtractionCache: Map<string, CacheEntry> | undefined;
}

const extractionCache =
  globalThis.clinicalExtractionCache ??
  (globalThis.clinicalExtractionCache = new Map<string, CacheEntry>());

const validItemIds: Set<string> = new Set(chestPainRules.map((rule) => rule.id));
const validDiseaseIds: Set<string> = new Set(
  diseaseRegistry.map((entry) => entry.diseaseId)
);
const redFlagItemIds: Set<string> = new Set(
  chestPainRules
    .filter((rule) =>
      rule.presentEffects.some((effect) => effect.effectType === "red_flag")
    )
    .map((rule) => rule.id)
);
const mustNotMissDiseaseIds: Set<string> = new Set(
  diseaseRegistry.filter((entry) => entry.mustNotMiss).map((entry) => entry.diseaseId)
);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sanitizedChecklistItems(value: unknown) {
  const items = Array.isArray(value) ? value : [];
  const clientItems = items
    .map((item) => asRecord(item))
    .map((item) => ({
      itemId: asString(item.itemId),
      labelKo: asString(item.labelKo),
      category: asString(item.category)
    }))
    .filter((item) => validItemIds.has(item.itemId));

  if (clientItems.length > 0) return clientItems;

  return chestPainRules.map((rule) => ({
    itemId: rule.id,
    labelKo: rule.labelKo,
    category: rule.category
  }));
}

function sanitizedDiseaseShortlist(
  value: unknown,
  redactedFreeText: string
): DiseaseShortlistItem[] {
  const items = Array.isArray(value) ? value : [];
  const clientShortlist = items
    .map((item) => asRecord(item))
    .map((item) => {
      const diseaseId = asString(item.diseaseId);
      const entry = diseaseRegistryById.get(diseaseId);
      if (!entry) return undefined;
      return {
        diseaseId: entry.diseaseId,
        nameKo: entry.nameKo,
        nameEn: entry.nameEn,
        aliases: entry.aliases.slice(0, 6),
        keyFindings: entry.supportingFindings.slice(0, 8),
        redFlags: entry.redFlags.slice(0, 5),
        requiredQuestions: entry.requiredQuestions.slice(0, 5)
      };
    })
    .filter((item): item is DiseaseShortlistItem => Boolean(item));

  return clientShortlist.length > 0
    ? clientShortlist.slice(0, 50)
    : getDiseaseShortlistForNote(redactedFreeText, 40);
}

function cacheKey(payload: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function getOutputText(data: unknown) {
  const record = asRecord(data);
  if (typeof record.output_text === "string") return record.output_text;

  const output = Array.isArray(record.output) ? record.output : [];
  const parts: string[] = [];
  for (const item of output) {
    const outputItem = asRecord(item);
    const content = Array.isArray(outputItem.content) ? outputItem.content : [];
    for (const contentItem of content) {
      const contentRecord = asRecord(contentItem);
      if (typeof contentRecord.text === "string") {
        parts.push(contentRecord.text);
      }
    }
  }

  return parts.join("\n");
}

async function callOpenAi(payload: unknown, apiKey: string, model: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "clinical_extraction_result",
          strict: true,
          schema: clinicalExtractionJsonSchema
        }
      },
      max_output_tokens: 2200
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      text: await response.text()
    };
  }

  return {
    ok: true,
    status: response.status,
    data: await response.json()
  };
}

export async function POST(request: Request) {
  const body = asRecord(await request.json().catch(() => ({})));
  const freeText = asString(body.freeText).slice(0, MAX_FREE_TEXT_LENGTH);
  const redactedFreeText = redactDirectIdentifiers(freeText);
  const patientContext = asRecord(body.patientContext);
  const checklistItems = sanitizedChecklistItems(body.checklistItems);
  const diseaseShortlist = sanitizedDiseaseShortlist(
    body.diseaseShortlist,
    redactedFreeText
  );
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!freeText.trim()) {
    return NextResponse.json({
      ok: true,
      cached: false,
      result: createEmptyClinicalExtractionResult()
    });
  }

  const llmPayload = {
    schemaVersion: SCHEMA_VERSION,
    freeText: redactedFreeText,
    patientContext,
    checklistItems,
    diseaseShortlist
  };
  const key = cacheKey({ model, llmPayload });
  const cached = extractionCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({
      ok: true,
      cached: true,
      result: cached.result
    });
  }
  extractionCache.delete(key);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        cached: false,
        error:
          "OPENAI_API_KEY is not configured. Rule-based extraction can still be shown on the client.",
        result: createEmptyClinicalExtractionResult()
      },
      { status: 503 }
    );
  }

  const openAiResult = await callOpenAi(llmPayload, apiKey, model);
  if (!openAiResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        cached: false,
        error: `OpenAI extraction request failed with status ${openAiResult.status}.`,
        result: createEmptyClinicalExtractionResult()
      },
      { status: 502 }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(getOutputText(openAiResult.data));
  } catch {
    parsed = {};
  }

  const result = sanitizeClinicalExtractionResult(parsed, {
    validItemIds,
    validDiseaseIds,
    redFlagItemIds,
    mustNotMissDiseaseIds
  });

  extractionCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    result
  });

  return NextResponse.json({
    ok: true,
    cached: false,
    result
  });
}
