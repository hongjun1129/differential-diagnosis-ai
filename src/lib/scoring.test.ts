import { describe, expect, it } from "vitest";
import {
  calculateDiagnosisScores,
  validateFindingRuleCodes
} from "@/lib/scoring";
import type { DiagnosisCode, DiagnosisScore } from "@/types/clinical";

function byCode(scores: DiagnosisScore[], code: DiagnosisCode) {
  const item = scores.find((score) => score.diagnosis.code === code);
  if (!item) throw new Error(`Missing diagnosis ${code}`);
  return item;
}

describe("scoring engine", () => {
  it("troponin elevation alone increases myocardial injury differentials and decreases UA", () => {
    const scores = calculateDiagnosisScores(["L61"]);

    for (const code of [
      "NSTEMI",
      "STEMI",
      "MYO",
      "PERI",
      "TTS",
      "PE",
      "AHF"
    ] as DiagnosisCode[]) {
      expect(byCode(scores, code).score).toBeGreaterThan(0);
    }

    expect(byCode(scores, "UA").score).toBeLessThan(0);
  });

  it("ST elevation with reciprocal change triggers STEMI red flag", () => {
    const stemi = byCode(calculateDiagnosisScores(["E50"]), "STEMI");

    expect(stemi.score).toBe(2);
    expect(stemi.redFlagTriggered).toBe(true);
    expect(stemi.status).toBe("즉시 배제 필요");
  });

  it("low or intermediate PE probability with negative D-dimer strongly decreases PE", () => {
    const pe = byCode(calculateDiagnosisScores(["L68"]), "PE");

    expect(pe.score).toBe(-2);
    expect(pe.negativeFindings).toHaveLength(1);
  });

  it("normal high-quality aortic CTA strongly decreases acute aortic syndrome codes", () => {
    const scores = calculateDiagnosisScores(["T97"]);

    for (const code of ["DIS", "IMH", "PAU", "TAA"] as DiagnosisCode[]) {
      expect(byCode(scores, code).score).toBe(-2);
    }
  });

  it("chest wall tenderness increases COSTO/STRAIN and decreases STEMI/NSTEMI/PE/DIS", () => {
    const scores = calculateDiagnosisScores(["M137"]);

    expect(byCode(scores, "COSTO").score).toBe(2);
    expect(byCode(scores, "STRAIN").score).toBe(2);

    for (const code of ["STEMI", "NSTEMI", "PE", "DIS"] as DiagnosisCode[]) {
      expect(byCode(scores, code).score).toBe(-1);
    }
  });

  it("does not reference undefined diagnosis codes in finding rules", () => {
    expect(validateFindingRuleCodes()).toEqual([]);
  });
});
