import { AlertTriangle, ArrowRight, CircleDot } from "lucide-react";
import type { DiagnosisScore } from "@/types/clinical";
import {
  diagnosisCategoryLabels,
  statusTone,
  urgencyLabels,
  urgencyTone
} from "@/utils/categoryLabels";

type DiagnosisCardProps = {
  score: DiagnosisScore;
  active: boolean;
  onSelect: () => void;
};

export function DiagnosisCard({ score, active, onSelect }: DiagnosisCardProps) {
  const { diagnosis } = score;
  const tone = statusTone[score.status];
  const barWidth = Math.min(100, Math.max(6, (score.score + 5) * 9));

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border bg-white p-3 text-left transition ${
        active
          ? "border-blue-400 shadow-soft"
          : "border-slate-200 hover:border-blue-200 hover:shadow-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-sm font-semibold leading-5 text-clinical-ink">
              {diagnosis.nameKo}
            </h3>
            {score.redFlagTriggered ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
            ) : diagnosis.mustNotMiss ? (
              <CircleDot className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {diagnosis.code} · {diagnosisCategoryLabels[diagnosis.category]}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-lg border px-2 py-1 text-xs font-medium ${tone.className}`}>
          {score.status}
        </span>
        <span
          className={`rounded-lg border px-2 py-1 text-xs font-medium ${urgencyTone[diagnosis.urgency]}`}
        >
          {urgencyLabels[diagnosis.urgency]}
        </span>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
          점수 {score.score}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone.barClassName}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <span>상승 근거 {score.positiveFindings.length}</span>
        <span>감소 근거 {score.negativeFindings.length}</span>
      </div>
    </button>
  );
}
