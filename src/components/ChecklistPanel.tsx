"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { FindingGroup } from "@/components/FindingGroup";
import { findingRules } from "@/data/findingRules";
import { getSelectedFindingRules } from "@/lib/scoring";
import type { FindingCategory } from "@/types/clinical";
import { findingCategoryLabels } from "@/utils/categoryLabels";

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
              문진, 진찰, ECG, 혈액검사, 영상검사 체크 시 감별진단이 즉시 갱신됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            초기화
          </button>
        </div>

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
              placeholder="ECG, troponin, D-dimer"
            />
          </div>
          <span className="inline-flex h-9 items-center justify-center rounded-md bg-blue-50 px-3 text-xs font-bold text-blue-700">
            선택 {selectedFindingIds.length}
          </span>
        </div>

        {selectedRules.length > 0 ? (
          <div className="mt-3 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto">
            {selectedRules.map((rule) => (
              <button
                key={rule.id}
                type="button"
                onClick={() => onRemoveFinding(rule.id)}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-blue-700 px-2 py-1 text-[11px] font-bold text-white"
              >
                <span className="truncate">{rule.labelKo}</span>
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
            selectedIds={selectedIds}
            onToggle={onToggleFinding}
          />
        ))}
      </div>
    </section>
  );
}
