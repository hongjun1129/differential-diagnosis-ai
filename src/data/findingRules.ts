import { appKeyFindingRules } from "@/data/generatedChecklistRules";
import {
  legacyFindingRules,
  type LegacyFindingRule
} from "@/data/legacyFindingRules";
import { diagnoses } from "@/data/diagnoses";
import type { DiagnosisCode, FindingRule, FindingWeight } from "@/types/clinical";

const currentDiagnosisCodes = new Set<DiagnosisCode>(
  diagnoses.map((diagnosis) => diagnosis.code)
);

const legacyDiagnosisCodeMap: Record<string, DiagnosisCode[]> = {
  ASTH_COPD: ["ASTHMA_EXAC", "COPD_EXAC"],
  CRAD: ["CRAD_TRAD"],
  TRAD: ["CRAD_TRAD"],
  IMH: ["AAS_IMH_PAU"],
  PAU: ["AAS_IMH_PAU"],
  PH: ["PH_RV_ISCHEMIA"]
};

function clampWeight(value: number): FindingWeight {
  if (value >= 2) return 2;
  if (value <= -2) return -2;
  if (value === 0) return 0;
  return value > 0 ? 1 : -1;
}

function mappedCodes(code: string): DiagnosisCode[] {
  const mapped = legacyDiagnosisCodeMap[code];
  if (mapped) return mapped;
  return currentDiagnosisCodes.has(code as DiagnosisCode)
    ? [code as DiagnosisCode]
    : [];
}

function normalizeLegacyWeights(
  weights: LegacyFindingRule["weights"]
): Partial<Record<DiagnosisCode, FindingWeight>> {
  const next: Partial<Record<DiagnosisCode, FindingWeight>> = {};

  for (const [legacyCode, weight] of Object.entries(weights)) {
    if (weight === undefined) continue;
    for (const code of mappedCodes(legacyCode)) {
      next[code] = clampWeight((next[code] ?? 0) + weight);
    }
  }

  return next;
}

function normalizeLegacyRedFlags(redFlagFor?: string[]) {
  if (!redFlagFor) return undefined;
  const codes = [
    ...new Set(redFlagFor.flatMap((legacyCode) => mappedCodes(legacyCode)))
  ];
  return codes.length > 0 ? codes : undefined;
}

function normalizeLegacyRule(rule: LegacyFindingRule): FindingRule {
  const normalized: FindingRule = {
    ...rule,
    weights: normalizeLegacyWeights(rule.weights),
    redFlagFor: normalizeLegacyRedFlags(rule.redFlagFor)
  };

  if (!normalized.redFlagFor) {
    delete normalized.redFlagFor;
  }

  return normalized;
}

export const findingRules: FindingRule[] = [
  ...legacyFindingRules.map(normalizeLegacyRule),
  ...appKeyFindingRules
];
