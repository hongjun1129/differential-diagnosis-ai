import { Check } from "lucide-react";
import type { FindingCategory, FindingRule } from "@/types/clinical";
import { findingCategoryLabels } from "@/utils/categoryLabels";

type FindingGroupProps = {
  category: FindingCategory;
  findings: FindingRule[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function FindingGroup({
  category,
  findings,
  selectedIds,
  onToggle
}: FindingGroupProps) {
  if (findings.length === 0) return null;

  return (
    <section className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-clinical-ink">
          {findingCategoryLabels[category]}
        </h3>
        <span className="text-xs text-slate-400">{findings.length}</span>
      </div>

      <div className="space-y-2">
        {findings.map((finding) => {
          const selected = selectedIds.has(finding.id);
          return (
            <button
              key={finding.id}
              type="button"
              onClick={() => onToggle(finding.id)}
              className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                selected
                  ? "border-blue-300 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              </span>
              <span className="min-w-0 flex-1 leading-5">{finding.labelKo}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
