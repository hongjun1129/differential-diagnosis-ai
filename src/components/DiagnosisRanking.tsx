import { BarChart3, ChevronRight } from "lucide-react";
import { dangerousBaselineCodes } from "@/data/diagnoses";
import type { DiagnosisScore } from "@/types/clinical";
import { statusTone } from "@/utils/categoryLabels";

type DiagnosisRankingProps = {
  scores: DiagnosisScore[];
  selectedFindingCount: number;
  activeCode?: string;
  onSelect: (code: string) => void;
};

export function getTopDiagnosisScores(
  scores: DiagnosisScore[],
  selectedFindingCount: number,
  count = 6
) {
  if (selectedFindingCount === 0) {
    const baselineOrder = new Map(
      dangerousBaselineCodes.map((code, index) => [code, index])
    );

    return scores
      .filter((score) => baselineOrder.has(score.diagnosis.code))
      .sort(
        (a, b) =>
          (baselineOrder.get(a.diagnosis.code) ?? 99) -
          (baselineOrder.get(b.diagnosis.code) ?? 99)
      )
      .slice(0, count);
  }

  return scores.slice(0, count);
}

function confidenceWidth(score: number) {
  return `${Math.min(100, Math.max(8, (score + 5) * 9))}%`;
}

export function DiagnosisRanking({
  scores,
  selectedFindingCount,
  activeCode,
  onSelect
}: DiagnosisRankingProps) {
  return (
    <section className="rounded-lg border border-blue-200 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-700" aria-hidden />
          <div>
            <h2 className="text-sm font-bold text-blue-950">
              감별진단 우선순위
            </h2>
            <p className="text-[11px] text-slate-500">
              체크리스트 변경 시 상위 6개가 자동 갱신됩니다.
            </p>
          </div>
        </div>
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          소견 {selectedFindingCount}개
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {scores.map((score, index) => {
          const active = activeCode === score.diagnosis.code;
          const tone = statusTone[score.status];

          return (
            <button
              key={score.diagnosis.code}
              type="button"
              onClick={() => onSelect(score.diagnosis.code)}
              className={`grid w-full grid-cols-[34px_1fr_86px] items-center gap-3 px-4 py-3 text-left transition sm:grid-cols-[34px_1fr_100px_88px] ${
                active
                  ? "bg-blue-50"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {index + 1}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-950">
                  {score.diagnosis.nameKo}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>{score.diagnosis.code}</span>
                  <span>점수 {score.score}</span>
                  <span>상승 {score.positiveFindings.length}</span>
                  <span>감소 {score.negativeFindings.length}</span>
                </span>
              </span>

              <span
                className={`justify-self-start rounded-md border px-2 py-1 text-[11px] font-bold ${tone.className}`}
              >
                {score.status}
              </span>

              <span className="hidden items-center gap-2 sm:flex">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full ${tone.barClassName}`}
                    style={{ width: confidenceWidth(score.score) }}
                  />
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-blue-100 bg-blue-50/60 px-4 py-2 text-[11px] leading-5 text-blue-900">
        가능성은 선택된 체크리스트 기반 점수이며, 의료진의 임상 판단과 검사
        결과로 재평가되어야 합니다.
      </div>
    </section>
  );
}
