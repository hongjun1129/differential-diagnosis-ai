import { BarChart3 } from "lucide-react";
import type { DiagnosisScore } from "@/types/clinical";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import {
  getMustRuleOutScores,
  MustRuleOutPanel
} from "@/components/MustRuleOutPanel";

type DiagnosisRankingProps = {
  scores: DiagnosisScore[];
  selectedFindingCount: number;
  activeCode?: string;
  onSelect: (code: string) => void;
};

export function DiagnosisRanking({
  scores,
  selectedFindingCount,
  activeCode,
  onSelect
}: DiagnosisRankingProps) {
  const noFindings = selectedFindingCount === 0;
  const mustScores = getMustRuleOutScores(scores, noFindings);
  const mustCodes = new Set(mustScores.map((score) => score.diagnosis.code));

  const higherScores = scores
    .filter((score) => !mustCodes.has(score.diagnosis.code))
    .filter(
      (score) =>
        score.status === "가능성 높음" || score.status === "가능성 중등도"
    )
    .slice(0, 8);
  const higherCodes = new Set(higherScores.map((score) => score.diagnosis.code));

  const otherScores = scores
    .filter(
      (score) =>
        !mustCodes.has(score.diagnosis.code) &&
        !higherCodes.has(score.diagnosis.code)
    )
    .filter(
      (score) =>
        !noFindings ||
        score.diagnosis.mustNotMiss ||
        score.positiveFindings.length > 0 ||
        score.negativeFindings.length > 0
    )
    .slice(0, 12);

  return (
    <section className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" aria-hidden />
          <h2 className="text-base font-semibold text-clinical-ink">
            감별진단 순위
          </h2>
        </div>
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          {selectedFindingCount}개 소견 반영
        </span>
      </div>

      <div className="space-y-6">
        <MustRuleOutPanel
          scores={scores}
          noFindings={noFindings}
          activeCode={activeCode}
          onSelect={onSelect}
        />

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-clinical-ink">
            B. 가능성 높은 감별진단
          </h2>
          {higherScores.length > 0 ? (
            <div className="grid gap-3">
              {higherScores.map((score) => (
                <DiagnosisCard
                  key={score.diagnosis.code}
                  score={score}
                  active={activeCode === score.diagnosis.code}
                  onSelect={() => onSelect(score.diagnosis.code)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
              선택된 소견만으로 가능성 높음 또는 중등도에 도달한 항목이 없습니다.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-clinical-ink">
            C. 추가 확인/가능성 낮음
          </h2>
          <div className="grid gap-3">
            {otherScores.map((score) => (
              <DiagnosisCard
                key={score.diagnosis.code}
                score={score}
                active={activeCode === score.diagnosis.code}
                onSelect={() => onSelect(score.diagnosis.code)}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
