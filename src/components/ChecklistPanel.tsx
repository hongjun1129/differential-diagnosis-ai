"use client";

import { AlertTriangle, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { FindingGroup } from "@/components/FindingGroup";
import { chestPainRules } from "@/data/chestPainRules";
import { detectConflicts, getActiveRules } from "@/lib/scoring";
import type { FindingCategory, FindingState, FindingStateMap } from "@/types/clinical";
import {
  findingCategoryLabels,
  findingStateLabels
} from "@/utils/categoryLabels";

type ChecklistPanelProps = {
  findingStates: FindingStateMap;
  autoFindingStates: FindingStateMap;
  onSetFindingState: (id: string, state: FindingState) => void;
  onClear: () => void;
};

const categoryOrder: FindingCategory[] = [
  "history",
  "vital",
  "physical",
  "ecg",
  "lab",
  "cardiac_imaging",
  "thoracic_imaging",
  "gi_test",
  "msk_neuro_skin",
  "psych_functional"
];

export function ChecklistPanel({
  findingStates,
  autoFindingStates,
  onSetFindingState,
  onClear
}: ChecklistPanelProps) {
  const [query, setQuery] = useState("");
  const activeRules = useMemo(() => getActiveRules(findingStates), [findingStates]);
  const conflicts = useMemo(() => detectConflicts(findingStates), [findingStates]);

  const filteredRules = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    if (!normalized) return chestPainRules;
    return chestPainRules.filter((rule) => {
      return (
        rule.labelKo.toLocaleLowerCase("ko").includes(normalized) ||
        rule.id.toLocaleLowerCase("ko").includes(normalized) ||
        findingCategoryLabels[rule.category]
          .toLocaleLowerCase("ko")
          .includes(normalized)
      );
    });
  }, [query]);

  return (
    <section className="rounded-lg border border-blue-200 bg-white shadow-soft">
      <div className="border-b border-blue-100 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-blue-950">체크리스트</h2>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              ECG/혈액/영상은 미확인·있음·없음으로 기록합니다. 없음은 규칙에
              명시된 경우에만 배제 근거로 반영됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            수동 입력 초기화
          </button>
        </div>

        {conflicts.length > 0 ? (
          <div className="mt-3 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-xs leading-5 text-purple-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="font-bold">
                  서로 모순되는 소견이 선택되었습니다.
                </p>
                <p>
                  검사 시점이 다른 경우 시간 정보를 추가하거나 항목을 수정하세요.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400"
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm"
              placeholder="ECG, troponin, CTPA, CTA"
            />
          </div>
          <span className="inline-flex h-9 items-center justify-center rounded-md bg-blue-50 px-3 text-xs font-bold text-blue-700">
            기록 {activeRules.length}
          </span>
        </div>

        {activeRules.length > 0 ? (
          <div className="mt-3 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
            {activeRules.map((rule) => (
              <button
                key={rule.id}
                type="button"
                onClick={() => onSetFindingState(rule.id, "unknown")}
                className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold ${
                  findingStates[rule.id] === "absent"
                    ? "bg-emerald-700 text-white"
                    : "bg-blue-700 text-white"
                }`}
              >
                <span className="truncate">
                  {findingStateLabels[findingStates[rule.id] ?? "unknown"]} ·{" "}
                  {rule.labelKo}
                </span>
                <X className="h-3 w-3 shrink-0" aria-hidden />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="max-h-[760px] space-y-3 overflow-y-auto px-4 py-3">
        {categoryOrder.map((category) => (
          <FindingGroup
            key={category}
            category={category}
            findings={filteredRules.filter((rule) => rule.category === category)}
            findingStates={findingStates}
            autoFindingStates={autoFindingStates}
            onSetFindingState={onSetFindingState}
          />
        ))}
      </div>
    </section>
  );
}
