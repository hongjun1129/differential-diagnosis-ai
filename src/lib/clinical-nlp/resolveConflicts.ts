import { chestPainRuleById } from "@/data/chestPainRules";
import type { ChecklistPatch, ChecklistPatchConflict } from "@/types/clinical";

export function resolveConflicts(patches: ChecklistPatch[]) {
  const groups = new Map<string, ChecklistPatch[]>();
  for (const patch of patches) {
    groups.set(patch.itemId, [...(groups.get(patch.itemId) ?? []), patch]);
  }

  const conflicts: ChecklistPatchConflict[] = [];
  for (const [itemId, itemPatches] of groups) {
    const statuses = new Set(itemPatches.map((patch) => patch.status));
    if (!(statuses.has("present") && statuses.has("absent"))) continue;
    conflicts.push({
      itemId,
      labelKo: chestPainRuleById.get(itemId)?.labelKo ?? itemId,
      patches: itemPatches.filter((patch) => patch.status === "present" || patch.status === "absent"),
      messageKo: "같은 항목에 대해 있음과 없음 후보가 함께 추출되었습니다. 의사 확인이 필요합니다."
    });
  }

  return {
    patches,
    conflicts
  };
}
