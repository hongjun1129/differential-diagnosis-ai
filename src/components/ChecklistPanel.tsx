"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { findingRules } from "@/data/findingRules";
import { getSelectedFindingRules } from "@/lib/scoring";
import type { FindingCategory } from "@/types/clinical";
import { findingCategoryLabels } from "@/utils/categoryLabels";
import { FindingGroup } from "@/components/FindingGroup";

type ChecklistPanelProps = {
  selectedFindingIds: string[];
  onToggleFinding: (id: string) => void;
  onRemoveFinding: (id: string) => void;
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
  selectedFindingIds,
  onToggleFinding,
  onRemoveFinding,
  onClear
}: ChecklistPanelProps) {
  const [query, setQuery] = useState("");
  const selectedIds = useMemo(
    () => new Set(selectedFindingIds),
    [selectedFindingIds]
  );
  const selectedRules = useMemo(
    () => getSelectedFindingRules(selectedFindingIds),
    [selectedFindingIds]
  );

  const filteredRules = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    if (!normalized) return findingRules;
    return findingRules.filter((rule) => {
      return (
        rule.labelKo.toLocaleLowerCase("ko").includes(normalized) ||
        rule.id.toLocaleLowerCase("ko").includes(normalized) ||
        findingCategoryLabels[rule.category].toLocaleLowerCase("ko").includes(normalized)
      );
    });
  }, [query]);

  return (
    <section className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-clinical-ink">체크리스트</h2>
          <p className="mt-1 text-xs text-slate-500">
            선택 {selectedFindingIds.length}개 / 규칙 {findingRules.length}개
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          선택 해제
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
          placeholder="문진, ECG, D-dimer"
        />
      </div>

      {selectedRules.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedRules.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => onRemoveFinding(rule.id)}
              className="inline-flex max-w-full items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white"
            >
              <span className="truncate">{rule.labelKo}</span>
              <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 max-h-[860px] space-y-4 overflow-y-auto pr-1">
        {categoryOrder.map((category) => (
          <FindingGroup
            key={category}
            category={category}
            findings={filteredRules.filter((rule) => rule.category === category)}
            selectedIds={selectedIds}
            onToggle={onToggleFinding}
          />
        ))}
      </div>
    </section>
  );
}
