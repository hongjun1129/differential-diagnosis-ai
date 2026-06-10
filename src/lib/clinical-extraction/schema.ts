import type {
  ChecklistPatch,
  ChecklistSource,
  ChecklistStatus,
  ClinicalAssertion,
  ClinicalContext,
  ClinicalContradiction,
  ClinicalExtractionResult,
  DiseaseCandidate,
  DiseaseCandidateRelation,
  ExtractedFinding,
  MissingQuestion,
  SafetyWarning
} from "@/types/clinical";

export const clinicalExtractionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    extractedFindings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          findingId: { type: "string" },
          normalizedText: { type: "string" },
          originalText: { type: "string" },
          assertion: {
            type: "string",
            enum: ["present", "absent", "uncertain", "hypothesis"]
          },
          context: {
            type: "string",
            enum: [
              "current_symptom",
              "past_history",
              "family_history",
              "risk_factor",
              "test_result",
              "medication",
              "procedure",
              "hypothesis",
              "unknown"
            ]
          },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          evidenceText: { type: "string" }
        },
        required: [
          "findingId",
          "normalizedText",
          "originalText",
          "assertion",
          "context",
          "confidence",
          "evidenceText"
        ]
      }
    },
    checklistPatches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          itemId: { type: "string" },
          status: { type: "string", enum: ["present", "absent", "unknown"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          evidenceText: { type: "string" },
          assertion: {
            type: "string",
            enum: ["present", "absent", "uncertain", "hypothesis"]
          },
          context: { type: "string" },
          source: {
            type: "string",
            enum: ["llm_extractor", "rule_parser", "vital_parser", "lab_parser"]
          },
          reason: { type: "string" },
          requiresConfirmation: { type: "boolean" }
        },
        required: [
          "itemId",
          "status",
          "confidence",
          "evidenceText",
          "assertion",
          "context",
          "source",
          "reason",
          "requiresConfirmation"
        ]
      }
    },
    diseaseCandidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          diseaseId: { type: "string" },
          relation: {
            type: "string",
            enum: [
              "supports",
              "against",
              "rule_in_possible",
              "rule_out_possible",
              "must_not_miss_consider",
              "insufficient_information"
            ]
          },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          evidenceText: { type: "string" },
          reason: { type: "string" },
          requiresConfirmation: { type: "boolean" }
        },
        required: [
          "diseaseId",
          "relation",
          "confidence",
          "evidenceText",
          "reason",
          "requiresConfirmation"
        ]
      }
    },
    missingQuestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          reason: { type: "string" },
          relatedDiseaseIds: { type: "array", items: { type: "string" } },
          priority: { type: "string", enum: ["high", "medium", "low"] }
        },
        required: ["question", "reason", "relatedDiseaseIds", "priority"]
      }
    },
    contradictions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          targetId: { type: "string" },
          evidenceA: { type: "string" },
          evidenceB: { type: "string" },
          explanation: { type: "string" },
          requiresUserReview: { type: "boolean", const: true }
        },
        required: [
          "targetId",
          "evidenceA",
          "evidenceB",
          "explanation",
          "requiresUserReview"
        ]
      }
    },
    safetyWarnings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["red_flag", "uncertain_diagnosis", "insufficient_data", "conflict"]
          },
          message: { type: "string" },
          relatedDiseaseIds: { type: "array", items: { type: "string" } }
        },
        required: ["type", "message", "relatedDiseaseIds"]
      }
    },
    summary: { type: ["string", "null"] }
  },
  required: [
    "extractedFindings",
    "checklistPatches",
    "diseaseCandidates",
    "missingQuestions",
    "contradictions",
    "safetyWarnings",
    "summary"
  ]
} as const;

const statusValues = new Set<ChecklistStatus>(["present", "absent", "unknown"]);
const assertionValues = new Set<ClinicalAssertion>([
  "present",
  "absent",
  "uncertain",
  "hypothesis"
]);
const contextValues = new Set<ClinicalContext>([
  "current_symptom",
  "past_history",
  "family_history",
  "risk_factor",
  "test_result",
  "medication",
  "procedure",
  "hypothesis",
  "unknown"
]);
const sourceValues = new Set<ChecklistSource>([
  "llm_extractor",
  "rule_parser",
  "vital_parser",
  "lab_parser",
  "test_parser",
  "free_text_parser"
]);
const relationValues = new Set<DiseaseCandidateRelation>([
  "supports",
  "against",
  "rule_in_possible",
  "rule_out_possible",
  "must_not_miss_consider",
  "insufficient_information"
]);
const priorityValues = new Set<MissingQuestion["priority"]>([
  "high",
  "medium",
  "low"
]);
const warningTypes = new Set<SafetyWarning["type"]>([
  "red_flag",
  "uncertain_diagnosis",
  "insufficient_data",
  "conflict"
]);

type ValidationOptions = {
  validItemIds: Set<string>;
  validDiseaseIds: Set<string>;
  redFlagItemIds: Set<string>;
  mustNotMissDiseaseIds: Set<string>;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.slice(0, 1000) : fallback;
}

function asBoolean(value: unknown) {
  return value === true;
}

function clampConfidence(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return 0.5;
  return Math.max(0, Math.min(1, numberValue));
}

function normalizeStatus(value: unknown): ChecklistStatus | undefined {
  return typeof value === "string" && statusValues.has(value as ChecklistStatus)
    ? (value as ChecklistStatus)
    : undefined;
}

function normalizeAssertion(
  value: unknown,
  status: ChecklistStatus
): ClinicalAssertion {
  if (typeof value === "string" && assertionValues.has(value as ClinicalAssertion)) {
    return value as ClinicalAssertion;
  }
  if (status === "present") return "present";
  if (status === "absent") return "absent";
  return "uncertain";
}

function normalizeContext(value: unknown): ClinicalContext {
  return typeof value === "string" && contextValues.has(value as ClinicalContext)
    ? (value as ClinicalContext)
    : "unknown";
}

function normalizeSource(value: unknown): ChecklistSource {
  return typeof value === "string" && sourceValues.has(value as ChecklistSource)
    ? (value as ChecklistSource)
    : "llm_extractor";
}

function sanitizeRelatedDiseaseIds(
  value: unknown,
  validDiseaseIds: Set<string>
) {
  return asArray(value)
    .filter((item): item is string => typeof item === "string")
    .filter((id) => validDiseaseIds.has(id));
}

export function createEmptyClinicalExtractionResult(
  summary?: string
): ClinicalExtractionResult {
  return {
    extractedFindings: [],
    checklistPatches: [],
    diseaseCandidates: [],
    missingQuestions: [],
    contradictions: [],
    safetyWarnings: [],
    summary
  };
}

export function sanitizeClinicalExtractionResult(
  raw: unknown,
  options: ValidationOptions
): ClinicalExtractionResult {
  const record = asRecord(raw);
  if (!record) return createEmptyClinicalExtractionResult();

  const extractedFindings = asArray(record.extractedFindings)
    .map((value): ExtractedFinding | undefined => {
      const item = asRecord(value);
      if (!item) return undefined;
      const assertion = normalizeAssertion(item.assertion, "unknown");
      return {
        findingId: asString(item.findingId),
        normalizedText: asString(item.normalizedText),
        originalText: asString(item.originalText),
        assertion,
        context: normalizeContext(item.context),
        confidence: clampConfidence(item.confidence),
        evidenceText: asString(item.evidenceText)
      };
    })
    .filter((item): item is ExtractedFinding => Boolean(item?.evidenceText));

  const checklistPatches = asArray(record.checklistPatches)
    .map((value): ChecklistPatch | undefined => {
      const item = asRecord(value);
      if (!item) return undefined;
      const itemId = asString(item.itemId);
      if (!options.validItemIds.has(itemId)) return undefined;
      const status = normalizeStatus(item.status);
      if (!status) return undefined;
      const assertion = normalizeAssertion(item.assertion, status);
      const context = normalizeContext(item.context);
      const source = normalizeSource(item.source);
      const isRedFlag = options.redFlagItemIds.has(itemId);
      const requiresConfirmation =
        isRedFlag ||
        status === "unknown" ||
        assertion === "uncertain" ||
        assertion === "hypothesis" ||
        asBoolean(item.requiresConfirmation);

      return {
        itemId,
        status,
        source,
        evidenceText: asString(item.evidenceText),
        confidence: clampConfidence(item.confidence),
        context,
        assertion,
        reason: asString(item.reason, "LLM structured extraction result"),
        isRedFlag,
        requiresConfirmation
      };
    })
    .filter((item): item is ChecklistPatch => Boolean(item?.evidenceText));

  const diseaseCandidates = asArray(record.diseaseCandidates)
    .map((value): DiseaseCandidate | undefined => {
      const item = asRecord(value);
      if (!item) return undefined;
      const diseaseId = asString(item.diseaseId);
      if (!options.validDiseaseIds.has(diseaseId)) return undefined;
      const relation =
        typeof item.relation === "string" &&
        relationValues.has(item.relation as DiseaseCandidateRelation)
          ? (item.relation as DiseaseCandidateRelation)
          : "insufficient_information";
      const mustNotMiss = options.mustNotMissDiseaseIds.has(diseaseId);
      return {
        diseaseId,
        relation: mustNotMiss ? "must_not_miss_consider" : relation,
        confidence: clampConfidence(item.confidence),
        evidenceText: asString(item.evidenceText),
        reason: asString(item.reason),
        requiresConfirmation:
          mustNotMiss ||
          relation === "must_not_miss_consider" ||
          relation === "rule_in_possible" ||
          asBoolean(item.requiresConfirmation)
      };
    })
    .filter((item): item is DiseaseCandidate => Boolean(item?.evidenceText));

  const missingQuestions = asArray(record.missingQuestions)
    .map((value): MissingQuestion | undefined => {
      const item = asRecord(value);
      if (!item) return undefined;
      const priority =
        typeof item.priority === "string" &&
        priorityValues.has(item.priority as MissingQuestion["priority"])
          ? (item.priority as MissingQuestion["priority"])
          : "medium";
      return {
        question: asString(item.question),
        reason: asString(item.reason),
        relatedDiseaseIds: sanitizeRelatedDiseaseIds(
          item.relatedDiseaseIds,
          options.validDiseaseIds
        ),
        priority
      };
    })
    .filter((item): item is MissingQuestion => Boolean(item?.question));

  const validTargets = new Set([
    ...options.validItemIds,
    ...options.validDiseaseIds
  ]);
  const contradictions = asArray(record.contradictions)
    .map((value): ClinicalContradiction | undefined => {
      const item = asRecord(value);
      if (!item) return undefined;
      const targetId = asString(item.targetId);
      if (!validTargets.has(targetId)) return undefined;
      return {
        targetId,
        evidenceA: asString(item.evidenceA),
        evidenceB: asString(item.evidenceB),
        explanation: asString(item.explanation),
        requiresUserReview: true
      };
    })
    .filter((item): item is ClinicalContradiction => Boolean(item?.evidenceA));

  const safetyWarnings = asArray(record.safetyWarnings)
    .map((value): SafetyWarning | undefined => {
      const item = asRecord(value);
      if (!item) return undefined;
      const type =
        typeof item.type === "string" && warningTypes.has(item.type as SafetyWarning["type"])
          ? (item.type as SafetyWarning["type"])
          : "insufficient_data";
      return {
        type,
        message: asString(item.message),
        relatedDiseaseIds: sanitizeRelatedDiseaseIds(
          item.relatedDiseaseIds,
          options.validDiseaseIds
        )
      };
    })
    .filter((item): item is SafetyWarning => Boolean(item?.message));

  return {
    extractedFindings,
    checklistPatches,
    diseaseCandidates,
    missingQuestions,
    contradictions,
    safetyWarnings,
    summary: typeof record.summary === "string" ? record.summary.slice(0, 1000) : undefined
  };
}

export function redactDirectIdentifiers(text: string) {
  return text
    .replace(/\b\d{6}-?\d{7}\b/g, "[REDACTED_RRN]")
    .replace(/\b01[016789]-?\d{3,4}-?\d{4}\b/g, "[REDACTED_PHONE]")
    .replace(/\b\d{2,4}-\d{3,4}-\d{4}\b/g, "[REDACTED_PHONE]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(/(성명|이름|환자명)\s*[:：]?\s*[가-힣]{2,4}/g, "$1: [REDACTED_NAME]")
    .slice(0, 4000);
}
