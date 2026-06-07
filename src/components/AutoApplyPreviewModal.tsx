"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ContradictionPanel } from "@/components/ContradictionPanel";
import { chestPainRuleById } from "@/data/chestPainRules";
import type {
  ChecklistPatch,
  ChecklistPatchConflict,
  ChecklistSource,
  ChecklistStateMap,
  ClinicalContext
} from "@/types/clinical";
import { findingStateLabels } from "@/utils/categoryLabels";

type AutoApplyPreviewModalProps = {
  patches: ChecklistPatch[];
  conflicts: ChecklistPatchConflict[];
  checklistState: ChecklistStateMap;
  onApply: (patches: ChecklistPatch[]) => void;
  onClose: () => void;
};

const contextLabels: Record<ClinicalContext, string> = {
  current_symptom: "현재 증상",
  past_history: "과거력",
  family_history: "가족력",
  risk_factor: "위험인자",
  test_result: "검사 결과",
  hypothesis: "의심/가설",
  unknown: "미분류"
};

const sourceLabels: Record<ChecklistSource, string> = {
  manual: "수동",
  free_text_parser: "자유입력",
  vital_parser: "활력징후",
  lab_parser: "검사",
  test_parser: "검사",
  system: "시스템"
};

function confidenceLabel(confidence: number) {
  if (confidence >= 0.9) return "높음";
  if (confidence >= 0.78) return "중간";
  return "낮음";
}

function patchKey(patch: ChecklistPatch, index: number) {
  return `${patch.itemId}:${patch.status}:${patch.source}:${patch.sentenceIndex ?? "v"}:${index}`;
}

function isManualBlocked(checklistState: ChecklistStateMap, itemId: string) {
  const value = checklistState[itemId];
  return value?.source === "manual" || value?.manuallyOverridden;
}

export function AutoApplyPreviewModal({
  patches,
  conflicts,
  checklistState,
  onApply,
  onClose
}: AutoApplyPreviewModalProps) {
  const conflictItemIds = useMemo(
    () => new Set(conflicts.map((conflict) => conflict.itemId)),
    [conflicts]
  );
  const defaultSelected = useMemo(() => {
    return new Set(
      patches
        .map((patch, index) => ({ patch, key: patchKey(patch, index) }))
        .filter(({ patch }) => !conflictItemIds.has(patch.itemId))
        .filter(({ patch }) => !isManualBlocked(checklistState, patch.itemId))
        .filter(({ patch }) => !patch.requiresConfirmation && patch.status !== "unknown")
        .map(({ key }) => key)
    );
  }, [checklistState, conflictItemIds, patches]);
  const [selected, setSelected] = useState(defaultSelected);

  const selectableKeys = patches
    .map((patch, index) => ({ patch, key: patchKey(patch, index) }))
    .filter(({ patch }) => !conflictItemIds.has(patch.itemId))
    .filter(({ patch }) => !isManualBlocked(checklistState, patch.itemId))
    .map(({ key }) => key);

  const selectedPatches = patches.filter((patch, index) =>
    selected.has(patchKey(patch, index))
  );

  const toggle = (key: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-apply-preview-title"
    >
      <section className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h2 id="auto-apply-preview-title" className="text-base font-extrabold text-blue-950">
              자동 반영 후보
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              아래 항목은 자유입력에서 추출된 후보입니다. 의료진이 확인한 뒤 반영하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="자동 반영 후보 닫기"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <ContradictionPanel conflicts={conflicts} />

          {patches.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm font-semibold text-slate-500">
              자유입력에서 체크리스트에 연결할 후보를 찾지 못했습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {patches.map((patch, index) => {
                const key = patchKey(patch, index);
                const rule = chestPainRuleById.get(patch.itemId);
                const manualBlocked = isManualBlocked(checklistState, patch.itemId);
                const conflictBlocked = conflictItemIds.has(patch.itemId);
                const disabled = manualBlocked || conflictBlocked;

                return (
                  <label
                    key={key}
                    htmlFor={key}
                    className={`grid gap-2 rounded-lg border p-3 text-xs ${
                      patch.isRedFlag
                        ? "border-red-200 bg-red-50"
                        : disabled
                          ? "border-slate-200 bg-slate-50"
                          : "border-blue-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id={key}
                        type="checkbox"
                        checked={selected.has(key)}
                        disabled={disabled}
                        onChange={() => toggle(key)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-extrabold text-slate-950">
                            {rule?.labelKo ?? patch.itemId}
                          </p>
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-700">
                            상태: {findingStateLabels[patch.status]}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">
                            {contextLabels[patch.context]}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">
                            {sourceLabels[patch.source]}
                          </span>
                          {patch.isRedFlag ? (
                            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-700">
                              <AlertTriangle className="h-3 w-3" aria-hidden />
                              의사 확인 필요
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 leading-5 text-slate-700">근거: “{patch.evidenceText}”</p>
                        <p className="mt-1 text-slate-500">
                          신뢰도: {confidenceLabel(patch.confidence)} ({patch.confidence.toFixed(2)}) · {patch.reason}
                        </p>
                        {manualBlocked ? (
                          <p className="mt-1 font-bold text-slate-600">
                            주의: 이 항목은 기존에 수동 수정되어 자동으로 덮어쓰지 않습니다.
                          </p>
                        ) : null}
                        {conflictBlocked ? (
                          <p className="mt-1 font-bold text-purple-700">
                            모순 가능성이 있어 자동 선택하지 않습니다.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set(selectableKeys))}
              className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              모두 선택
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              선택 해제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => onApply(selectedPatches)}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-700 px-3 text-xs font-bold text-white hover:bg-blue-800 disabled:bg-slate-300"
              disabled={selectedPatches.length === 0}
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              선택 항목 반영
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
