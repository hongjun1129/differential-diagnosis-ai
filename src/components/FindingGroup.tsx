import { Check, Minus, RotateCcw } from "lucide-react";
import { isTriStateRule } from "@/data/chestPainRules";
import type {
  ChestPainRule,
  FindingCategory,
  FindingState
} from "@/types/clinical";
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

function stateButtonClass(active: boolean, tone: "blue" | "green" | "slate") {
  if (active && tone === "blue") return "bg-blue-700 text-white";
  if (active && tone === "green") return "bg-emerald-700 text-white";
  if (active && tone === "slate") return "bg-slate-700 text-white";
  return "bg-slate-100 text-slate-600 hover:bg-slate-200";
}

export function FindingGroup({
  category,
  findings,
  findingStates,
  autoFindingStates,
  onSetFindingState
}: FindingGroupProps) {
  if (findings.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/80">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-2.5 py-2">
        <h3 className="text-xs font-extrabold text-blue-950">
          {findingCategoryLabels[category]}
        </h3>
        <span className="text-[11px] font-bold text-slate-400">
          {findings.length}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {findings.map((finding) => {
          const state = findingStates[finding.id] ?? "unknown";
          const autoState = autoFindingStates[finding.id];
          const triState = isTriStateRule(finding);
          const present = state === "present";
          const absent = state === "absent";

          return (
            <div
              key={finding.id}
              title={finding.labelKo}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-2 text-xs ${
                present
                  ? "bg-blue-50 text-blue-950"
                  : absent
                    ? "bg-emerald-50 text-emerald-950"
                    : "bg-white text-slate-700"
              }`}
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className="line-clamp-2 min-w-0 font-semibold leading-4">
                    {finding.labelKo}
                  </p>
                  {autoState ? (
                    <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                      자동
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                  {finding.effectType} · {finding.evidenceLevel} ·{" "}
                  {findingStateLabels[state]}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSetFindingState(finding.id, "present")}
                  className={`inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded px-2 text-[10px] font-bold ${stateButtonClass(
                    present,
                    "blue"
                  )}`}
                  aria-label={`${finding.labelKo} 있음`}
                  title="있음"
                >
                  <Check className="h-3 w-3" aria-hidden />
                  <span className="hidden sm:inline">있음</span>
                </button>
                {triState ? (
                  <button
                    type="button"
                    onClick={() => onSetFindingState(finding.id, "absent")}
                    className={`inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded px-2 text-[10px] font-bold ${stateButtonClass(
                      absent,
                      "green"
                    )}`}
                    aria-label={`${finding.labelKo} 없음`}
                    title="없음"
                  >
                    <Minus className="h-3 w-3" aria-hidden />
                    <span className="hidden sm:inline">없음</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onSetFindingState(finding.id, "unknown")}
                  className={`inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded px-2 text-[10px] font-bold ${stateButtonClass(
                    state === "unknown",
                    "slate"
                  )}`}
                  aria-label={`${finding.labelKo} 미확인`}
                  title="미확인"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden />
                  <span className="hidden sm:inline">미확인</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
