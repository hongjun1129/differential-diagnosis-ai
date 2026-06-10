import { describe, expect, it } from "vitest";
import {
  redactDirectIdentifiers,
  sanitizeClinicalExtractionResult
} from "@/lib/clinical-extraction/schema";

const validationOptions = {
  validItemIds: new Set(["H09", "H12"]),
  validDiseaseIds: new Set(["DIS", "PE"]),
  redFlagItemIds: new Set(["H09"]),
  mustNotMissDiseaseIds: new Set(["DIS"])
};

describe("clinical extraction validation", () => {
  it("drops unknown checklist and disease ids", () => {
    const result = sanitizeClinicalExtractionResult(
      {
        extractedFindings: [],
        checklistPatches: [
          {
            itemId: "H12",
            status: "present",
            confidence: 0.8,
            evidenceText: "호흡곤란 동반",
            assertion: "present",
            context: "current_symptom",
            source: "llm_extractor",
            reason: "dyspnea mentioned",
            requiresConfirmation: false
          },
          {
            itemId: "NEW_ITEM",
            status: "present",
            confidence: 0.8,
            evidenceText: "invented item",
            assertion: "present",
            context: "current_symptom",
            source: "llm_extractor",
            reason: "invalid",
            requiresConfirmation: false
          }
        ],
        diseaseCandidates: [
          {
            diseaseId: "PE",
            relation: "supports",
            confidence: 0.7,
            evidenceText: "호흡곤란",
            reason: "dyspnea",
            requiresConfirmation: false
          },
          {
            diseaseId: "NEW_DISEASE",
            relation: "supports",
            confidence: 0.7,
            evidenceText: "invented disease",
            reason: "invalid",
            requiresConfirmation: false
          }
        ],
        missingQuestions: [],
        contradictions: [],
        safetyWarnings: [],
        summary: null
      },
      validationOptions
    );

    expect(result.checklistPatches.map((patch) => patch.itemId)).toEqual([
      "H12"
    ]);
    expect(result.diseaseCandidates.map((candidate) => candidate.diseaseId)).toEqual([
      "PE"
    ]);
  });

  it("forces red flags and must-not-miss candidates to require confirmation", () => {
    const result = sanitizeClinicalExtractionResult(
      {
        extractedFindings: [],
        checklistPatches: [
          {
            itemId: "H09",
            status: "present",
            confidence: 1.4,
            evidenceText: "찢어지는 흉통",
            assertion: "present",
            context: "current_symptom",
            source: "llm_extractor",
            reason: "red flag symptom",
            requiresConfirmation: false
          }
        ],
        diseaseCandidates: [
          {
            diseaseId: "DIS",
            relation: "supports",
            confidence: 0.95,
            evidenceText: "박리 의심",
            reason: "must-not-miss",
            requiresConfirmation: false
          }
        ],
        missingQuestions: [],
        contradictions: [],
        safetyWarnings: [],
        summary: null
      },
      validationOptions
    );

    expect(result.checklistPatches[0]).toMatchObject({
      itemId: "H09",
      confidence: 1,
      isRedFlag: true,
      requiresConfirmation: true
    });
    expect(result.diseaseCandidates[0]).toMatchObject({
      diseaseId: "DIS",
      relation: "must_not_miss_consider",
      requiresConfirmation: true
    });
  });

  it("redacts direct identifiers before the server prompt is built", () => {
    const redacted = redactDirectIdentifiers(
      "이름 홍길동, 010-1234-5678, 900101-1234567, test@example.com"
    );

    expect(redacted).toContain("이름: [REDACTED_NAME]");
    expect(redacted).toContain("[REDACTED_PHONE]");
    expect(redacted).toContain("[REDACTED_RRN]");
    expect(redacted).toContain("[REDACTED_EMAIL]");
    expect(redacted).not.toContain("010-1234-5678");
    expect(redacted).not.toContain("900101-1234567");
  });
});
