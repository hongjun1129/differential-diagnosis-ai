import { diagnoses } from "@/data/diagnoses";
import { findingRules } from "@/data/findingRules";
import type {
  DiagnosisCode,
  DiagnosisScore,
  DiagnosisStatus,
  FindingRule
} from "@/types/clinical";

const urgencyRank = {
  emergent: 3,
  urgent: 2,
  routine: 1
} as const;

export const diagnosisByCode = new Map(
  diagnoses.map((diagnosis) => [diagnosis.code, diagnosis])
);

export const findingRuleById = new Map(
  findingRules.map((finding) => [finding.id, finding])
);

export function getDiagnosisStatus(
  score: number,
  redFlagTriggered: boolean
): DiagnosisStatus {
  if (redFlagTriggered) return "즉시 배제 필요";
  if (score >= 5) return "가능성 높음";
  if (score >= 2) return "가능성 중등도";
  if (score >= 0) return "추가 확인 필요";
  if (score >= -3) return "가능성 낮음";
  return "배제 가능";
}

export function calculateDiagnosisScores(
  selectedFindingIds: string[]
): DiagnosisScore[] {
  const selectedIdSet = new Set(selectedFindingIds);
  const selectedRules = findingRules.filter((rule) => selectedIdSet.has(rule.id));

  const scores = diagnoses.map((diagnosis) => {
    let score = 0;
    const positiveFindings: FindingRule[] = [];
    const negativeFindings: FindingRule[] = [];
    let redFlagTriggered = false;

    // Each finding contributes only its configured diagnosis weight.
    // Red flags are tracked separately so urgent rule-out conditions float to the top.
    for (const rule of selectedRules) {
      const weight = rule.weights[diagnosis.code] ?? 0;
      score += weight;

      if (weight > 0) positiveFindings.push(rule);
      if (weight < 0) negativeFindings.push(rule);
      if (rule.redFlagFor?.includes(diagnosis.code)) redFlagTriggered = true;
    }

    return {
      diagnosis,
      score,
      status: getDiagnosisStatus(score, redFlagTriggered),
      positiveFindings,
      negativeFindings,
      redFlagTriggered
    };
  });

  return scores.sort((a, b) => {
    if (a.redFlagTriggered !== b.redFlagTriggered) {
      return a.redFlagTriggered ? -1 : 1;
    }

    const aMustNotMiss = a.diagnosis.mustNotMiss && a.score >= 1;
    const bMustNotMiss = b.diagnosis.mustNotMiss && b.score >= 1;
    if (aMustNotMiss !== bMustNotMiss) return aMustNotMiss ? -1 : 1;

    if (a.score !== b.score) return b.score - a.score;

    const urgencyDelta =
      urgencyRank[b.diagnosis.urgency] - urgencyRank[a.diagnosis.urgency];
    if (urgencyDelta !== 0) return urgencyDelta;

    return a.diagnosis.nameKo.localeCompare(b.diagnosis.nameKo, "ko");
  });
}

export function getSelectedFindingRules(
  selectedFindingIds: string[]
): FindingRule[] {
  return selectedFindingIds
    .map((id) => findingRuleById.get(id))
    .filter((rule): rule is FindingRule => Boolean(rule));
}

export function validateFindingRuleCodes(): DiagnosisCode[] {
  const invalidCodes = new Set<DiagnosisCode>();
  const knownCodes = new Set(diagnoses.map((diagnosis) => diagnosis.code));

  for (const rule of findingRules) {
    for (const code of Object.keys(rule.weights) as DiagnosisCode[]) {
      if (!knownCodes.has(code)) invalidCodes.add(code);
    }

    for (const code of rule.redFlagFor ?? []) {
      if (!knownCodes.has(code)) invalidCodes.add(code);
    }
  }

  return [...invalidCodes];
}
