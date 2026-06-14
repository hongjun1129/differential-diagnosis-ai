import { describe, expect, it } from "vitest";
import {
  DEFAULT_TOP_DIAGNOSIS_COUNT,
  DEFAULT_TOP_DIAGNOSIS_LABEL
} from "@/components/DiagnosisRanking";

describe("diagnosis ranking defaults", () => {
  it("keeps the default top diagnosis label aligned with the count", () => {
    expect(DEFAULT_TOP_DIAGNOSIS_COUNT).toBe(12);
    expect(DEFAULT_TOP_DIAGNOSIS_LABEL).toBe(
      `상위 ${DEFAULT_TOP_DIAGNOSIS_COUNT}`
    );
  });
});
