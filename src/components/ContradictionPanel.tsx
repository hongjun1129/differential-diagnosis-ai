import { AlertTriangle } from "lucide-react";
import type { ChecklistPatchConflict } from "@/types/clinical";
import { findingStateLabels } from "@/utils/categoryLabels";

type ContradictionPanelProps = {
  conflicts: ChecklistPatchConflict[];
};

export function ContradictionPanel({ conflicts }: ContradictionPanelProps) {
  if (conflicts.length === 0) return null;

  return (
    <section className="rounded-lg border border-purple-200 bg-purple-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-purple-950">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        <h3 className="text-sm font-extrabold">모순 가능성</h3>
      </div>
      <div className="space-y-2">
        {conflicts.map((conflict) => (
          <div key={conflict.itemId} className="rounded-md bg-white/80 p-2 text-xs text-purple-950">
            <p className="font-extrabold">{conflict.labelKo}</p>
            <p className="mt-0.5 text-purple-800">의사 확인 필요</p>
            <div className="mt-2 space-y-1">
              {conflict.patches.map((patch, index) => (
                <div
                  key={`${patch.itemId}-${patch.status}-${index}`}
                  className="rounded border border-purple-100 bg-purple-50/70 px-2 py-1"
                >
                  <p className="font-bold">상태: {findingStateLabels[patch.status]}</p>
                  <p className="mt-0.5 leading-4">근거: {patch.evidenceText}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
