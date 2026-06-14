import { describe, expect, it } from "vitest";
import {
  appKeyChecklistItems,
  checklistEvaluationStateMappings,
  comprehensiveChecklistItems,
  redFlagGates,
  scoreItems
} from "@/data/clinicalChecklistData";
import { diseaseRegistry } from "@/data/diseaseRegistry";
import { diagnoses, diagnosisCodeByV12No } from "@/data/diagnoses";
import { findingRules } from "@/data/findingRules";
import {
  calculateDiagnosisScores,
  detectConflicts,
  evaluateDiagnoses,
  getAutoVitalFindingStates,
  getEmergencyEvaluations,
  validateFindingRuleCodes
} from "@/lib/scoring";
import type { DiagnosisCode, DiagnosisEvaluation, FindingStateMap } from "@/types/clinical";

function byCode(scores: DiagnosisEvaluation[], code: DiagnosisCode) {
  const item = scores.find((score) => score.diagnosis.code === code);
  if (!item) throw new Error(`Missing diagnosis ${code}`);
  return item;
}

function states(ids: string[]): FindingStateMap {
  return Object.fromEntries(ids.map((id) => [id, "present" as const]));
}

const scenarioFixtures: Array<{
  name: string;
  states: FindingStateMap;
  expectedCode: DiagnosisCode;
}> = [
  {
    name: "STEMI with ST elevation and reciprocal change",
    states: states(["H01", "H05", "E50"]),
    expectedCode: "STEMI"
  },
  {
    name: "NSTEMI with dynamic T inversion and troponin rise/fall",
    states: states(["H01", "E52", "L62"]),
    expectedCode: "NSTEMI"
  },
  {
    name: "PE with pleuritic pain, dyspnea, tachycardia, CTPA positive",
    states: states(["H07", "H12", "V30", "T98"]),
    expectedCode: "PE"
  },
  {
    name: "Aortic dissection with tearing pain, pulse deficit, CTA flap",
    states: states(["H09", "P41", "T93"]),
    expectedCode: "DIS"
  },
  {
    name: "Tension pneumothorax with unilateral breath sound, shock, imaging",
    states: states(["P32", "V28", "T104"]),
    expectedCode: "TPTX"
  },
  {
    name: "Pericarditis with positional pain and diffuse ST elevation",
    states: states(["H08", "E54", "P36"]),
    expectedCode: "PERI"
  },
  {
    name: "Pneumonia with fever, cough/sputum, infiltrate",
    states: states(["H14", "V31", "T105"]),
    expectedCode: "PNA"
  },
  {
    name: "GERD with post-prandial/lying pain and PPI response",
    states: states(["H17", "G118"]),
    expectedCode: "GERD"
  },
  {
    name: "Costochondritis with reproducible chest wall tenderness",
    states: states(["H22", "M137"]),
    expectedCode: "COSTO"
  },
  {
    name: "Panic/hyperventilation with normal checks and paresthesia",
    states: states(["H25", "H26", "PS153"]),
    expectedCode: "HVS"
  }
];

describe("clinical rule evaluation", () => {
  it("evaluates every disease in the canonical registry", () => {
    const scores = evaluateDiagnoses({});
    expect(diseaseRegistry).toHaveLength(diagnoses.length);
    expect(scores).toHaveLength(diseaseRegistry.length);
  });

  it("keeps must-not-miss diagnoses visible in the emergency panel", () => {
    const emergency = getEmergencyEvaluations(evaluateDiagnoses({}));
    expect(emergency.map((item) => item.diagnosis.code)).toEqual(
      redFlagGates.map((gate) => gate.code)
    );
  });

  it("loads the v1.2 source-of-truth workbook counts", () => {
    expect(diagnoses).toHaveLength(90);
    expect(Object.keys(diagnosisCodeByV12No)).toHaveLength(90);
    expect(appKeyChecklistItems).toHaveLength(262);
    expect(comprehensiveChecklistItems).toHaveLength(1169);
    expect(redFlagGates).toHaveLength(18);
    expect(scoreItems).toHaveLength(33);
  });

  it("keeps diagnosis and finding-rule references internally valid", () => {
    const codes = diagnoses.map((diagnosis) => diagnosis.code);
    const knownCodes = new Set(codes);

    expect(new Set(codes).size).toBe(codes.length);
    expect(validateFindingRuleCodes()).toEqual([]);

    for (const rule of findingRules) {
      for (const code of Object.keys(rule.weights)) {
        expect(knownCodes.has(code as DiagnosisCode), `${rule.id}:${code}`).toBe(
          true
        );
      }
      for (const code of rule.redFlagFor ?? []) {
        expect(
          knownCodes.has(code as DiagnosisCode),
          `${rule.id}:redFlagFor:${code}`
        ).toBe(true);
      }
    }
  });

  it("preserves workbook state-label mapping conservatively", () => {
    expect(checklistEvaluationStateMappings).toEqual(
      expect.arrayContaining([
        { labelKo: "미확인", state: "unknown" },
        { labelKo: "있음", state: "present" },
        { labelKo: "없음", state: "absent" },
        { labelKo: "해당없음", state: "unknown" }
      ])
    );
  });

  it.each(scenarioFixtures)(
    "$name routes the target diagnosis into the top results",
    ({ states: fixtureStates, expectedCode }) => {
      const scores = evaluateDiagnoses(fixtureStates);
      expect(scores.slice(0, 6).map((score) => score.diagnosis.code)).toContain(
        expectedCode
      );
    }
  );

  it("rule-in findings cannot be outweighed by multiple weak findings", () => {
    const scores = evaluateDiagnoses(
      states(["T98", "H17", "G118", "H22", "M137", "H25"])
    );
    const pe = byCode(scores, "PE");
    expect(pe.evidenceStatus).toBe("rule_in_evidence");
    expect(scores.slice(0, 6).map((score) => score.diagnosis.code)).toContain(
      "PE"
    );
  });

  it("contradictory positive and negative test findings trigger conflict warnings", () => {
    const conflictStates = states(["T98", "T99"]);
    const conflicts = detectConflicts(conflictStates);
    const pe = byCode(evaluateDiagnoses(conflictStates), "PE");
    expect(conflicts).toHaveLength(1);
    expect(pe.evidenceStatus).toBe("conflicting_evidence");
  });

  it("serial troponin negative rule-out pattern does not mark ACS as excluded", () => {
    const scores = evaluateDiagnoses(states(["L64"]));
    expect(byCode(scores, "STEMI").evidenceStatus).toBe("rule_out_candidate");
    expect(byCode(scores, "NSTEMI").evidenceStatus).toBe("rule_out_candidate");
  });

  it("auto-maps numeric vitals to derived findings", () => {
    expect(
      getAutoVitalFindingStates({
        bp: "84/52",
        hr: "118",
        rr: "28",
        spo2: "88",
        bt: "38.4"
      })
    ).toEqual({
      V28: "present",
      V30: "present",
      V29: "present",
      V31: "present",
      V157: "present"
    });
  });

  it("keeps legacy selected-id calculation available", () => {
    const stemi = byCode(calculateDiagnosisScores(["E50"]), "STEMI");
    expect(stemi.evidenceStatus).toBe("rule_in_evidence");
  });

  it("models ACS progression across staged information", () => {
    const stage1 = byCode(evaluateDiagnoses(states(["H01", "H02"])), "NSTEMI");
    expect(["possible", "supported"]).toContain(stage1.status);

    const stage2 = byCode(
      evaluateDiagnoses(states(["H01", "H02", "E60"])),
      "NSTEMI"
    );
    expect(stage2.status).not.toBe("excluded");

    const stage3 = byCode(
      evaluateDiagnoses(states(["H01", "H02", "E52", "L62"])),
      "NSTEMI"
    );
    expect(["strongly_supported", "rule_in_evidence"]).toContain(stage3.status);
  });

  it("models PE progression across staged information", () => {
    const stage1 = byCode(evaluateDiagnoses(states(["H07", "H12"])), "PE");
    expect(["possible", "supported"]).toContain(stage1.status);

    const stage2 = byCode(
      evaluateDiagnoses(states(["H07", "H12", "V30", "V29"])),
      "PE"
    );
    expect(["supported", "strongly_supported"]).toContain(stage2.status);

    const stage3 = byCode(
      evaluateDiagnoses(states(["H07", "H12", "V30", "V29", "T98"])),
      "PE"
    );
    expect(stage3.status).toBe("rule_in_evidence");
  });

  it("keeps GERD supported while ACS remains conservative after negative basic checks", () => {
    const scores = evaluateDiagnoses(states(["H17", "G118", "E60", "L64"]));
    expect(byCode(scores, "GERD").status).toBe("supported");
    expect(["rule_out_candidate", "insufficient_information"]).toContain(
      byCode(scores, "NSTEMI").status
    );
    expect(byCode(scores, "NSTEMI").status).not.toBe("excluded");
  });

  it("does not reference undefined diagnosis codes in rule metadata", () => {
    expect(validateFindingRuleCodes()).toEqual([]);
  });
});
