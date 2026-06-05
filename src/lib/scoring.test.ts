import { describe, expect, it } from "vitest";
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
  it("keeps must-not-miss diagnoses visible in the emergency panel", () => {
    const emergency = getEmergencyEvaluations(evaluateDiagnoses({}));
    expect(emergency.map((item) => item.diagnosis.code)).toEqual([
      "STEMI",
      "NSTEMI",
      "DIS",
      "PE",
      "TPTX",
      "PERI",
      "BOER"
    ]);
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
      H12: "present"
    });
  });

  it("keeps legacy selected-id calculation available", () => {
    const stemi = byCode(calculateDiagnosisScores(["E50"]), "STEMI");
    expect(stemi.evidenceStatus).toBe("rule_in_evidence");
  });

  it("does not reference undefined diagnosis codes in rule metadata", () => {
    expect(validateFindingRuleCodes()).toEqual([]);
  });
});
