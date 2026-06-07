"use client";

import { AlertTriangle, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { FindingGroup } from "@/components/FindingGroup";
import { chestPainRules } from "@/data/chestPainRules";
import { detectConflicts, getActiveRules } from "@/lib/scoring";
import type {
  ChecklistStateMap,
  FindingCategory,
  FindingState,
  FindingStateMap
} from "@/types/clinical";
import {
  findingCategoryLabels,
  findingStateLabels
} from "@/utils/categoryLabels";

type ChecklistPanelProps = {
  findingStates: FindingStateMap;
  autoFindingStates: FindingStateMap;
  checklistState: ChecklistStateMap;
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

const shortCategoryLabels: Record<FindingCategory, string> = {
  history: "문진",
  vital: "활력",
  physical: "진찰",
  ecg: "ECG",
  lab: "혈액",
  cardiac_imaging: "심장",
  thoracic_imaging: "영상",
  gi_test: "위장관",
  msk_neuro_skin: "근골격",
  psych_functional: "정신/기능"
};

export function ChecklistPanel({
  findingStates,
  autoFindingStates,
  checklistState,
  onSetFindingState,
  onClear
}: ChecklistPanelProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<FindingCategory>("history");
  const activeRules = useMemo(
    () => getActiveRules(findingStates),
    [findingStates]
  );
  const conflicts = useMemo(
    () => detectConflicts(findingStates),
    [findingStates]
  );

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

  const categoryCounts = useMemo(() => {
    return Object.fromEntries(
      categoryOrder.map((category) => [
        category,
        chestPainRules.filter((rule) => rule.category === category).length
      ])
    ) as Record<FindingCategory, number>;
  }, []);

  const activeCategoryRules = filteredRules.filter(
    (rule) => rule.category === activeCategory
  );
  const redFlagCount = activeRules.filter(
    (rule) => findingStates[rule.id] === "present" && rule.effectType === "red_flag"
  ).length;
  const unknownCriticalCount = chestPainRules.filter(
    (rule) =>
      ["ecg", "lab", "cardiac_imaging", "thoracic_imaging"].includes(
        rule.category
      ) && (findingStates[rule.id] ?? "unknown") === "unknown"
  ).length;

  return (
    <section className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-lg border border-blue-200 bg-white shadow-soft xl:min-h-0">
      <div className="shrink-0 border-b border-blue-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold text-blue-950">
              체크리스트
            </h2>
            <p className="truncate text-[11px] text-slate-500">
              ECG/혈액/영상은 미확인·있음·없음으로 기록
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
            title="수동 입력 초기화"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            초기화
          </button>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1">
          {[
            ["기록", activeRules.length],
            ["Red", redFlagCount],
            ["모순", conflicts.length],
            ["미확인", unknownCriticalCount]
          ].map(([label, count]) => (
            <div
              key={label}
              className="rounded-md bg-slate-50 px-2 py-1 text-center"
            >
              <p className="text-[10px] font-bold text-slate-500">{label}</p>
              <p className="text-sm font-extrabold text-slate-950">{count}</p>
            </div>
          ))}
        </div>

        {conflicts.length > 0 ? (
          <div className="mt-2 rounded-md border border-purple-200 bg-purple-50 px-2 py-1.5 text-[11px] leading-4 text-purple-900">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <p>
                서로 모순되는 소견이 선택되었습니다. 검사 시점 또는 항목을
                확인하세요.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-2 grid gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400"
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-8 w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-2 text-xs"
              placeholder="ECG, troponin, CTPA, CTA"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {categoryOrder.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-bold ${
                  activeCategory === category
                    ? "border-blue-600 bg-blue-700 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {shortCategoryLabels[category]}
                <span
                  className={`rounded px-1 text-[10px] ${
                    activeCategory === category
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {categoryCounts[category]}
                </span>
              </button>
            ))}
          </div>

          {activeRules.length > 0 ? (
            <div className="flex max-h-14 flex-wrap gap-1 overflow-y-auto">
              {activeRules.slice(0, 12).map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => onSetFindingState(rule.id, "unknown")}
                  className={`inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    findingStates[rule.id] === "absent"
                      ? "bg-emerald-700 text-white"
                      : "bg-blue-700 text-white"
                  }`}
                  title="미확인으로 되돌리기"
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <FindingGroup
          category={activeCategory}
          findings={activeCategoryRules}
          findingStates={findingStates}
          autoFindingStates={autoFindingStates}
          checklistState={checklistState}
          onSetFindingState={onSetFindingState}
        />
        {activeCategoryRules.length === 0 ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-500">
            현재 탭에서 검색 결과가 없습니다.
          </p>
        ) : null}
      </div>
    </section>
  );
}
