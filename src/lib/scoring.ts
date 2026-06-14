import { diagnoses } from "@/data/diagnoses";
import {
  chestPainRuleById,
  chestPainRules,
  conflictDefinitions,
  emergencyMustNotMissCodes,
  missingKeyDataByDiagnosis,
  nextDiscriminatingInfoByDiagnosis
} from "@/data/chestPainRules";
import { evaluateVitalSigns } from "@/lib/vitals";
import type {
  ChestPainRule,
  ConflictWarning,
  DiagnosisCode,
  DiagnosisEvaluation,
  EvidenceStatus,
  FindingRule,
  FindingStateMap,
  RuleEffect,
  VitalSigns
} from "@/types/clinical";

const urgencyScoreByUrgency = {
  emergent: 30,
  urgent: 20,
  routine: 10
} as const;

const evidenceRank: Record<EvidenceStatus, number> = {
  rule_in_evidence: 8,
  strongly_supported: 7,
  conflicting_evidence: 6,
  supported: 5,
  possible: 4,
  rule_out_candidate: 3,
  insufficient_information: 2,
  excluded: 1
};

export const diagnosisByCode = new Map(
  diagnoses.map((diagnosis) => [diagnosis.code, diagnosis])
);

export const findingRuleById = new Map(
  chestPainRules.map((finding) => [finding.id, finding])
);

export const AUTO_VITAL_FINDING_IDS = {
  hypotension: "V28",
  generatedHypotension: "AK-195",
  hypertension: "AK-002",
  severeBp: "AK-003",
  tachycardia: "V30",
  bradycardia: "V156",
  tachypnea: "V157",
  generatedTachypnea: "AK-004",
  hypoxemia: "V29",
  generatedHypoxia: "AK-185",
  fever: "V31"
} as const;

function applies(effect: RuleEffect, states: FindingStateMap) {
  if (
    effect.requiresAllOf &&
    !effect.requiresAllOf.every((id) => states[id] === "present")
  ) {
    return false;
  }

  if (
    effect.appliesOnlyIf &&
    !effect.appliesOnlyIf.every(
      (condition) => states[condition.findingId] === condition.state
    )
  ) {
    return false;
  }

  return true;
}

export function detectConflicts(states: FindingStateMap): ConflictWarning[] {
  return conflictDefinitions
    .filter(({ findingIds }) => findingIds.every((id) => states[id] === "present"))
    .map(({ findingIds, affectedDiagnosisIds }) => {
      const labels = findingIds.map(
        (id) => chestPainRuleById.get(id)?.labelKo ?? id
      );
      return {
        id: findingIds.join("__"),
        findingIds,
        findingLabels: labels,
        affectedDiagnosisIds,
        messageKo:
          "서로 모순되는 소견이 선택되었습니다. 검사 시점이 다른 경우 시간 정보를 추가하거나 항목을 수정하세요."
      };
    });
}

function markPresentIfKnown(states: FindingStateMap, id: string) {
  if (chestPainRuleById.has(id)) states[id] = "present";
}

export function getAutoVitalFindingStates(vitals: VitalSigns): FindingStateMap {
  const states: FindingStateMap = {};
  const evaluations = evaluateVitalSigns(vitals);

  if (evaluations.bp.flags.includes("hypotension")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.hypotension);
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.generatedHypotension);
  }
  if (evaluations.bp.flags.includes("hypertension")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.hypertension);
  }
  if (evaluations.bp.flags.includes("severe_bp")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.severeBp);
  }
  if (evaluations.hr.flags.includes("tachycardia")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.tachycardia);
  }
  if (evaluations.hr.flags.includes("bradycardia")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.bradycardia);
  }
  if (evaluations.rr.flags.includes("tachypnea")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.tachypnea);
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.generatedTachypnea);
  }
  if (evaluations.spo2.flags.includes("hypoxemia")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.hypoxemia);
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.generatedHypoxia);
  }
  if (evaluations.bt.flags.includes("fever")) {
    markPresentIfKnown(states, AUTO_VITAL_FINDING_IDS.fever);
  }

  return states;
}

export function mergeFindingStates(
  manualStates: FindingStateMap,
  autoStates: FindingStateMap
): FindingStateMap {
  return {
    ...autoStates,
    ...manualStates
  };
}

export function selectedIdsToFindingStates(
  selectedFindingIds: string[]
): FindingStateMap {
  return Object.fromEntries(
    selectedFindingIds.map((id) => [id, "present" as const])
  );
}

export function getPresentRules(states: FindingStateMap): ChestPainRule[] {
  return Object.entries(states)
    .filter(([, state]) => state === "present")
    .map(([id]) => chestPainRuleById.get(id))
    .filter((rule): rule is ChestPainRule => Boolean(rule));
}

export function getActiveRules(states: FindingStateMap): ChestPainRule[] {
  return Object.entries(states)
    .filter(([, state]) => state !== "unknown")
    .map(([id]) => chestPainRuleById.get(id))
    .filter((rule): rule is ChestPainRule => Boolean(rule));
}

function resolveEvidenceStatus({
  likelihoodSupportScore,
  hasRuleIn,
  hasRedFlag,
  hasRuleOut,
  hasAgainstOnly,
  hasConflict,
  diagnosisMustNotMiss
}: {
  likelihoodSupportScore: number;
  hasRuleIn: boolean;
  hasRedFlag: boolean;
  hasRuleOut: boolean;
  hasAgainstOnly: boolean;
  hasConflict: boolean;
  diagnosisMustNotMiss: boolean;
}): EvidenceStatus {
  if (hasConflict) return "conflicting_evidence";
  if (hasRuleIn) return "rule_in_evidence";
  if (hasRedFlag || likelihoodSupportScore >= 6) return "strongly_supported";
  if (likelihoodSupportScore >= 3) return "supported";
  if (likelihoodSupportScore > 0) return "possible";
  if (hasRuleOut || likelihoodSupportScore <= -4) {
    return diagnosisMustNotMiss ? "rule_out_candidate" : "excluded";
  }
  if (hasAgainstOnly) return "rule_out_candidate";
  return "insufficient_information";
}

function whyRankedText(evaluation: Pick<
  DiagnosisEvaluation,
  | "evidenceStatus"
  | "likelihoodSupportScore"
  | "urgencyScore"
  | "ruleInFindings"
  | "redFlagFindings"
  | "conflictWarnings"
>) {
  if (evaluation.conflictWarnings.length > 0) {
    return "상충 소견이 있어 확정적 지지 또는 배제 판단을 보류합니다.";
  }
  if (evaluation.ruleInFindings.length > 0) {
    return "확인 소견이 있어 약한 소견 여러 개보다 우선해 표시됩니다.";
  }
  if (evaluation.redFlagFindings.length > 0) {
    return "red flag가 선택되어 응급 배제 필요 항목으로 우선 표시됩니다.";
  }
  if (evaluation.evidenceStatus === "rule_out_candidate") {
    return "배제 조건에 가까운 소견이 있으나 단독 확정 배제가 아니라 추가 확인이 필요합니다.";
  }
  return `체크리스트 지지도 ${evaluation.likelihoodSupportScore}, 응급도 ${evaluation.urgencyScore}를 함께 고려했습니다.`;
}

function explanationText({
  diagnosisCode,
  evidenceStatus,
  supportingFindings,
  findingsAgainst,
  ruleInFindings,
  ruleOutFindings,
  missingKeyData
}: {
  diagnosisCode: DiagnosisCode;
  evidenceStatus: EvidenceStatus;
  supportingFindings: ChestPainRule[];
  findingsAgainst: ChestPainRule[];
  ruleInFindings: ChestPainRule[];
  ruleOutFindings: ChestPainRule[];
  missingKeyData: string[];
}) {
  if (evidenceStatus === "conflicting_evidence") {
    return "상충 소견 때문에 진단 상태를 확정적으로 올리거나 내리지 않고 보류합니다.";
  }
  if (ruleInFindings.length > 0) {
    return `${diagnosisCode} 확인 근거: ${ruleInFindings
      .map((rule) => rule.labelKo)
      .slice(0, 2)
      .join(", ")} 선택됨.`;
  }
  if (ruleOutFindings.length > 0) {
    return `${diagnosisCode} 배제 후보: ${ruleOutFindings
      .map((rule) => rule.labelKo)
      .slice(0, 2)
      .join(", ")} 선택됨. 단독 확정 배제는 아니며 부족 정보: ${missingKeyData
      .slice(0, 2)
      .join(", ")}.`;
  }
  if (supportingFindings.length > 0 && findingsAgainst.length > 0) {
    return `지지 소견과 반대 소견이 함께 있어 unresolved 상태로 재평가가 필요합니다. 지지: ${supportingFindings[0].labelKo}; 반대: ${findingsAgainst[0].labelKo}.`;
  }
  if (supportingFindings.length > 0) {
    return `${diagnosisCode} 지지도 상승: ${supportingFindings
      .map((rule) => rule.labelKo)
      .slice(0, 3)
      .join(", ")} 선택됨.`;
  }
  if (findingsAgainst.length > 0) {
    return `${diagnosisCode} 지지도 하락: ${findingsAgainst
      .map((rule) => rule.labelKo)
      .slice(0, 3)
      .join(", ")} 선택됨.`;
  }
  return `아직 핵심 정보가 부족합니다: ${missingKeyData.slice(0, 3).join(", ")}.`;
}

export function evaluateDiagnoses(
  findingStates: FindingStateMap
): DiagnosisEvaluation[] {
  const conflicts = detectConflicts(findingStates);

  const evaluations = diagnoses.map((diagnosis) => {
    let likelihoodSupportScore = 0;
    const supportingFindings: ChestPainRule[] = [];
    const findingsAgainst: ChestPainRule[] = [];
    const ruleInFindings: ChestPainRule[] = [];
    const ruleOutFindings: ChestPainRule[] = [];
    const redFlagFindings: ChestPainRule[] = [];

    for (const [id, state] of Object.entries(findingStates)) {
      if (state === "unknown") continue;
      const rule = chestPainRuleById.get(id);
      if (!rule) continue;
      const effects =
        state === "present" ? rule.presentEffects : rule.absentEffects ?? [];

      for (const effect of effects) {
        if (effect.targetDiagnosisId !== diagnosis.code || !applies(effect, findingStates)) {
          continue;
        }

        likelihoodSupportScore += effect.weight;

        if (
          effect.effectType === "weak_support" ||
          effect.effectType === "moderate_support" ||
          effect.effectType === "strong_support"
        ) {
          supportingFindings.push(rule);
        }
        if (effect.effectType === "rule_in") {
          ruleInFindings.push(rule);
          supportingFindings.push(rule);
        }
        if (effect.effectType === "red_flag") {
          redFlagFindings.push(rule);
          supportingFindings.push(rule);
        }
        if (
          effect.effectType === "weak_against" ||
          effect.effectType === "strong_against"
        ) {
          findingsAgainst.push(rule);
        }
        if (
          effect.effectType === "rule_out_condition" ||
          effect.effectType === "exclusion_requirement"
        ) {
          ruleOutFindings.push(rule);
          findingsAgainst.push(rule);
        }
      }
    }

    const conflictWarnings = conflicts.filter((conflict) =>
      conflict.affectedDiagnosisIds.includes(diagnosis.code)
    );
    const hasConflict = conflictWarnings.length > 0;
    const urgencyScore = urgencyScoreByUrgency[diagnosis.urgency];
    const evidenceStatus = resolveEvidenceStatus({
      likelihoodSupportScore,
      hasRuleIn: ruleInFindings.length > 0,
      hasRedFlag: redFlagFindings.length > 0,
      hasRuleOut: ruleOutFindings.length > 0,
      hasAgainstOnly:
        findingsAgainst.length > 0 &&
        supportingFindings.length === 0 &&
        ruleInFindings.length === 0,
      hasConflict,
      diagnosisMustNotMiss: diagnosis.mustNotMiss
    });
    const missingKeyData =
      missingKeyDataByDiagnosis[diagnosis.code] ??
      diagnosis.confirmatoryTests.slice(0, 3);

    const evaluation: DiagnosisEvaluation = {
      diagnosis,
      likelihoodSupportScore,
      supportScore: likelihoodSupportScore,
      urgencyScore,
      evidenceStatus,
      status: evidenceStatus,
      supportingFindings: [...new Set(supportingFindings)],
      findingsAgainst: [...new Set(findingsAgainst)],
      againstFindings: [...new Set(findingsAgainst)],
      ruleInFindings: [...new Set(ruleInFindings)],
      ruleOutFindings: [...new Set(ruleOutFindings)],
      ruleOutCriteriaMet: [...new Set(ruleOutFindings)],
      ruleOutCriteriaMissing: missingKeyData,
      redFlagFindings: [...new Set(redFlagFindings)],
      missingKeyData,
      conflictWarnings,
      matchedRedFlags: [...new Set(redFlagFindings.map((rule) => rule.labelKo))],
      nextDiscriminatingInformation:
        nextDiscriminatingInfoByDiagnosis[diagnosis.code] ??
        diagnosis.confirmatoryTests[0] ??
        "감별에 필요한 추가 정보가 부족합니다.",
      whyRanked: "",
      explanationKo: ""
    };

    evaluation.whyRanked = whyRankedText(evaluation);
    evaluation.explanationKo = explanationText({
      diagnosisCode: diagnosis.code,
      evidenceStatus,
      supportingFindings: evaluation.supportingFindings,
      findingsAgainst: evaluation.findingsAgainst,
      ruleInFindings: evaluation.ruleInFindings,
      ruleOutFindings: evaluation.ruleOutFindings,
      missingKeyData: evaluation.missingKeyData
    });
    return evaluation;
  });

  return evaluations.sort((a, b) => {
    const statusDelta =
      evidenceRank[b.evidenceStatus] - evidenceRank[a.evidenceStatus];
    if (statusDelta !== 0) return statusDelta;

    if (a.urgencyScore !== b.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }

    if (a.likelihoodSupportScore !== b.likelihoodSupportScore) {
      return b.likelihoodSupportScore - a.likelihoodSupportScore;
    }

    return a.diagnosis.nameKo.localeCompare(b.diagnosis.nameKo, "ko");
  });
}

export function calculateDiagnosisScores(
  selectedFindingIds: string[]
): DiagnosisEvaluation[] {
  return evaluateDiagnoses(selectedIdsToFindingStates(selectedFindingIds));
}

export function getSelectedFindingRules(
  findingStatesOrIds: FindingStateMap | string[]
): ChestPainRule[] {
  const states = Array.isArray(findingStatesOrIds)
    ? selectedIdsToFindingStates(findingStatesOrIds)
    : findingStatesOrIds;
  return getPresentRules(states);
}

export function getEmergencyEvaluations(
  evaluations: DiagnosisEvaluation[]
): DiagnosisEvaluation[] {
  const byCode = new Map(
    evaluations.map((evaluation) => [evaluation.diagnosis.code, evaluation])
  );
  return emergencyMustNotMissCodes
    .map((code) => byCode.get(code))
    .filter((item): item is DiagnosisEvaluation => Boolean(item));
}

export function validateFindingRuleCodes(): DiagnosisCode[] {
  const invalidCodes = new Set<DiagnosisCode>();
  const knownCodes = new Set(diagnoses.map((diagnosis) => diagnosis.code));

  for (const rule of chestPainRules) {
    for (const code of rule.targetDiagnosisIds) {
      if (!knownCodes.has(code)) invalidCodes.add(code);
    }
    for (const effect of [...rule.presentEffects, ...(rule.absentEffects ?? [])]) {
      if (!knownCodes.has(effect.targetDiagnosisId)) {
        invalidCodes.add(effect.targetDiagnosisId);
      }
    }
  }

  return [...invalidCodes];
}

export function legacyFindingRule(id: string): FindingRule | undefined {
  const rule = chestPainRuleById.get(id);
  if (!rule) return undefined;
  return {
    id: rule.id,
    labelKo: rule.labelKo,
    category: rule.category,
    weights: {},
    sourceNote: rule.sourceNote
  };
}
