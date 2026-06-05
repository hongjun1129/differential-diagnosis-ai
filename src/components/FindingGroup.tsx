import { Check, Minus, RotateCcw } from "lucide-react";
import { isTriStateRule } from "@/data/chestPainRules";
import type { ChestPainRule, FindingCategory, FindingState } from "@/types/clinical";
import {
  findingCategoryLabels,
  findingStateLabels
} from "@/utils/categoryLabels";

type FindingGroupProps = {
  category: FindingCategory;
  findings: ChestPainRule[];
  findingStates: Partial<Record<string, FindingState>>;
  autoFindingStates: Partial<Record<string, FindingState>>;
  onSetFindingState: (id: string, state: FindingState) => void;
};

export function FindingGroup({
  category,
  findings,
  findingStates,
  autoFindingStates,
  onSetFindingState
}: FindingGroupProps) {
  if (findings.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-blue-950">
          {findingCategoryLabels[category]}
        </h3>
        <span className="text-[11px] font-bold text-slate-400">
          {findings.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {findings.map((finding) => {
          const state = findingStates[finding.id] ?? "unknown";
          const autoState = autoFindingStates[finding.id];
          const triState = isTriStateRule(finding);
          const present = state === "present";
          const absent = state === "absent";

          return (
            <div
              key={finding.id}
              className={`rounded-md border px-2.5 py-2 text-xs transition ${
                present
                  ? "border-blue-300 bg-blue-50 text-blue-950"
                  : absent
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSetFindingState(
                      finding.id,
                      present ? "unknown" : "present"
                    )
                  }
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    present
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-label={`${finding.labelKo} 있음`}
                  title="있음"
                >
                  {present ? <Check className="h-3 w-3" aria-hidden /> : null}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="min-w-0 flex-1 leading-5">{finding.labelKo}</p>
                    {autoState ? (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                        자동
                      </span>
                    ) : null}
                    {triState ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {findingStateLabels[state]}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => onSetFindingState(finding.id, "present")}
                      className={`inline-flex h-6 items-center gap-1 rounded px-2 text-[10px] font-bold ${
                        present
                          ? "bg-blue-700 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-blue-50"
                      }`}
                    >
                      <Check className="h-3 w-3" aria-hidden />
                      있음
                    </button>
                    {triState ? (
                      <button
                        type="button"
                        onClick={() => onSetFindingState(finding.id, "absent")}
                        className={`inline-flex h-6 items-center gap-1 rounded px-2 text-[10px] font-bold ${
                          absent
                            ? "bg-emerald-700 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-emerald-50"
                        }`}
                      >
                        <Minus className="h-3 w-3" aria-hidden />
                        없음
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onSetFindingState(finding.id, "unknown")}
                      className="inline-flex h-6 items-center gap-1 rounded bg-slate-100 px-2 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden />
                      미확인
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
