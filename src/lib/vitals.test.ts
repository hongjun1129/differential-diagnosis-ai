import { describe, expect, it } from "vitest";
import {
  evaluateVitalSigns,
  parseBloodPressure,
  parseFirstNumber
} from "@/lib/vitals";
import type { VitalSigns } from "@/types/clinical";

const blankVitals: VitalSigns = {
  bp: "",
  hr: "",
  rr: "",
  spo2: "",
  bt: ""
};

describe("vital sign parsing and evaluation", () => {
  it("parses blood pressure values with common formatting", () => {
    expect(parseBloodPressure("140/90")).toEqual({
      systolic: 140,
      diastolic: 90
    });
    expect(parseBloodPressure("150 / 95 mmHg")).toEqual({
      systolic: 150,
      diastolic: 95
    });
    expect(parseBloodPressure("BP 85/55")).toEqual({
      systolic: 85,
      diastolic: 55
    });
  });

  it("parses the first numeric value from vital text", () => {
    expect(parseFirstNumber("SpO2 91%")).toBe(91);
  });

  it("marks BP 140/90 and above as hypertension", () => {
    const evaluations = evaluateVitalSigns({ ...blankVitals, bp: "140/90" });

    expect(evaluations.bp.status).toBe("abnormal");
    expect(evaluations.bp.flags).toContain("hypertension");
    expect(evaluations.bp.reason).toBe("고혈압");
  });

  it("does not mark BP 139/89 as hypertension", () => {
    const evaluations = evaluateVitalSigns({ ...blankVitals, bp: "139/89" });

    expect(evaluations.bp.status).toBe("normal");
    expect(evaluations.bp.flags).not.toContain("hypertension");
  });

  it("marks BP 180/120 and above as severe BP", () => {
    const evaluations = evaluateVitalSigns({ ...blankVitals, bp: "180/120" });

    expect(evaluations.bp.status).toBe("abnormal");
    expect(evaluations.bp.flags).toContain("hypertension");
    expect(evaluations.bp.flags).toContain("severe_bp");
    expect(evaluations.bp.reason).toBe("severe BP");
  });
});
