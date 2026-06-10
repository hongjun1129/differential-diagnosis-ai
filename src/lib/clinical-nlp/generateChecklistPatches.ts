import { detectAssertion } from "@/lib/clinical-nlp/assertion";
import { detectClinicalContext } from "@/lib/clinical-nlp/context";
import { extractLabsAndTests } from "@/lib/clinical-nlp/extractLabsAndTests";
import { extractVitals } from "@/lib/clinical-nlp/extractVitals";
import { matchChecklistRules } from "@/lib/clinical-nlp/matchChecklistRules";
import type { RuleMatch } from "@/lib/clinical-nlp/types";
import type { ChecklistPatch, ChecklistSource } from "@/types/clinical";

function patchFromMatch(match: RuleMatch): ChecklistPatch {
  const localStart = match.start - match.sentence.start;
  const localEnd = match.end - match.sentence.start;
  const assertion = match.rule.negatable
    ? detectAssertion(match.sentence.text, { start: localStart, end: localEnd })
    : "present";
  const context = detectClinicalContext(match.sentence.text, match.rule.defaultContext);
  const uncertain = assertion === "uncertain" || (context === "hypothesis" && Boolean(match.rule.redFlag));
  const status = uncertain ? "unknown" : assertion;
  const confidence =
    match.kind === "fuzzy"
      ? Math.min(match.confidence, match.rule.autoApplyThreshold - 0.08)
      : match.confidence;

  return {
    itemId: match.rule.itemId,
    status,
    source: "rule_parser",
    evidenceText: match.sentence.text,
    confidence,
    context,
    reason: uncertain
      ? `${match.rule.labelKo} 후보를 찾았지만 의심/가설 표현이어서 확인이 필요합니다.`
      : `${match.rule.labelKo} 관련 표현을 자유입력에서 찾았습니다.`,
    negated: assertion === "absent",
    sentenceIndex: match.sentence.index,
    start: match.start,
    end: match.end,
    isRedFlag: match.rule.redFlag,
    requiresConfirmation:
      Boolean(match.rule.redFlag) || uncertain || confidence < match.rule.autoApplyThreshold
  };
}

const sourcePriority: Record<ChecklistSource, number> = {
  test_parser: 5,
  lab_parser: 5,
  vital_parser: 5,
  rule_parser: 4,
  free_text_parser: 3,
  llm_extractor: 2,
  system: 2,
  manual: 1
};

function shouldReplacePatch(current: ChecklistPatch, next: ChecklistPatch) {
  const priorityDelta = sourcePriority[next.source] - sourcePriority[current.source];
  if (priorityDelta !== 0) return priorityDelta > 0;
  return next.confidence > current.confidence;
}

function dedupePatches(patches: ChecklistPatch[]) {
  const byKey = new Map<string, ChecklistPatch>();
  for (const patch of patches) {
    const key = `${patch.itemId}:${patch.status}:${patch.evidenceText}`;
    const current = byKey.get(key);
    if (!current || shouldReplacePatch(current, patch)) {
      byKey.set(key, patch);
    }
  }

  return [...byKey.values()].sort((left, right) => {
    if ((left.sentenceIndex ?? 0) !== (right.sentenceIndex ?? 0)) {
      return (left.sentenceIndex ?? 0) - (right.sentenceIndex ?? 0);
    }
    return right.confidence - left.confidence;
  });
}

export function generateChecklistPatches(text: string): ChecklistPatch[] {
  const freeTextPatches = matchChecklistRules(text).map(patchFromMatch);
  return dedupePatches([
    ...extractVitals(text),
    ...extractLabsAndTests(text),
    ...freeTextPatches
  ]);
}
