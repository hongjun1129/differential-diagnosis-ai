import { ShieldAlert } from "lucide-react";
import { dangerousBaselineCodes } from "@/data/diagnoses";
import type { DiagnosisScore } from "@/types/clinical";
import { DiagnosisCard } from "@/components/DiagnosisCard";

type MustRuleOutPanelProps = {
  scores: DiagnosisScore[];
  noFindings: boolean;
  activeCode?: string;
  onSelect: (code: string) => void;
};

export function getMustRuleOutScores(
  scores: DiagnosisScore[],
  noFindings: boolean
) {
  if (noFindings) {
    const baseline = new Set(dangerousBaselineCodes);
    return scores.filter((score) => baseline.has(score.diagnosis.code));
  }

  return scores.filter(
    (score) =>
      score.redFlagTriggered ||
      (score.diagnosis.mustNotMiss && score.score >= 1)
  );
}

export function MustRuleOutPanel({
  scores,
  noFindings,
  activeCode,
  onSelect
}: MustRuleOutPanelProps) {
  const items = getMustRuleOutScores(scores, noFindings);

  return (
    <section className="space-y-3">
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-clinical-ink">
            A. 즉시 배제 필요
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {noFindings
              ? "기본 체크: ACS, PE, 급성 대동맥증후군, 긴장성 기흉, 심장압전, 식도파열"
              : "선택된 red flag 또는 must-not-miss 조건으로 우선 검토되는 항목"}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((score) => (
          <DiagnosisCard
            key={score.diagnosis.code}
            score={score}
            active={activeCode === score.diagnosis.code}
            onSelect={() => onSelect(score.diagnosis.code)}
          />
        ))}
      </div>
    </section>
  );
}
