"use client";

import { AlertTriangle, BarChart3, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { emergencyDisplayNames, emergencyMustNotMissCodes } from "@/data/chestPainRules";
import type {
  DiagnosisCode,
  DiagnosisEvaluation,
  EvidenceStatus,
  FindingStateMap
} from "@/types/clinical";
import {
  evidenceStatusLabels,
  evidenceStatusTone
} from "@/utils/categoryLabels";

type DiagnosisRankingProps = {
  scores: DiagnosisEvaluation[];
  emergencyScores: DiagnosisEvaluation[];
  selectedFindingCount: number;
  activeCode?: string;
  onSelect: (code: string) => void;
};

type ViewMode = "top6" | "all" | "emergency" | "rule_out" | "insufficient";

const viewLabels: Record<ViewMode, string> = {
  top6: "상위 6개",
  all: "전체 감별진단",
  emergency: "응급 배제 필요",
  rule_out: "배제 후보",
  insufficient: "정보 부족"
};

const viewStatusFilter: Partial<Record<ViewMode, EvidenceStatus[]>> = {
  rule_out: ["rule_out_candidate", "excluded"],
  insufficient: ["insufficient_information"]
};

export function getTopDiagnosisScores(
  scores: DiagnosisEvaluation[],
  findingStates: FindingStateMap,
  count = 6
) {
  const activeStateCount = Object.values(findingStates).filter(
    (state) => state === "present" || state === "absent"
  ).length;

  if (activeStateCount === 0) {
    const baselineOrder = new Map(
      emergencyMustNotMissCodes.map((code, index) => [code, index])
    );

    return scores
      .filter((score) => baselineOrder.has(score.diagnosis.code))
      .sort(
        (a, b) =>
          (baselineOrder.get(a.diagnosis.code) ?? 99) -
          (baselineOrder.get(b.diagnosis.code) ?? 99)
      )
      .slice(0, count);
  }

  return scores.slice(0, count);
}

function supportWidth(score: number) {
  return `${Math.min(100, Math.max(8, (score + 8) * 7))}%`;
}

function EmergencyPanel({
  emergencyScores,
  activeCode,
  onSelect
}: {
  emergencyScores: DiagnosisEvaluation[];
  activeCode?: string;
  onSelect: (code: DiagnosisCode) => void;
}) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50/60">
      <div className="flex items-center gap-2 border-b border-red-100 px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-red-700" aria-hidden />
        <h3 className="text-sm font-extrabold text-red-950">
          응급 배제 필요 질환
        </h3>
      </div>
      <div className="grid gap-2 p-2">
        {emergencyScores.map((score) => {
          const tone = evidenceStatusTone[score.evidenceStatus];
          return (
            <button
              key={score.diagnosis.code}
              type="button"
              onClick={() => onSelect(score.diagnosis.code)}
              className={`rounded-md border bg-white px-2.5 py-2 text-left text-xs transition ${
                activeCode === score.diagnosis.code
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-red-100 hover:border-red-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-950">
                  {emergencyDisplayNames[score.diagnosis.code]}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${tone.className}`}
                >
                  {evidenceStatusLabels[score.evidenceStatus]}
                </span>
              </div>
              <div className="mt-1 grid gap-1 text-[11px] leading-4 text-slate-600">
                <p>
                  red flag:{" "}
                  {score.matchedRedFlags.length > 0
                    ? score.matchedRedFlags.slice(0, 2).join(", ")
                    : "현재 선택 없음"}
                </p>
                <p>
                  누락 확인: {score.missingKeyData.slice(0, 2).join(", ")}
                </p>
                <p className="font-semibold text-red-800">
                  다음 확인: {score.urgentNextCheck}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function DiagnosisRanking({
  scores,
  emergencyScores,
  selectedFindingCount,
  activeCode,
  onSelect
}: DiagnosisRankingProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("top6");
  const visibleScores = useMemo(() => {
    if (viewMode === "top6") return scores;
    if (viewMode === "emergency") return emergencyScores;
    const allowedStatuses = viewStatusFilter[viewMode];
    if (allowedStatuses) {
      return scores.filter((score) =>
        allowedStatuses.includes(score.evidenceStatus)
      );
    }
    return scores;
  }, [emergencyScores, scores, viewMode]);

  return (
    <section className="rounded-lg border border-blue-200 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-700" aria-hidden />
          <div>
            <h2 className="text-sm font-bold text-blue-950">
              규칙 기반 우선 검토 순위
            </h2>
            <p className="text-[11px] text-slate-500">
              체크리스트 지지도와 응급도를 분리해 정렬합니다.
            </p>
          </div>
        </div>
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          기록 {selectedFindingCount}개
        </span>
      </div>

      <div className="px-4 py-3">
        <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-950">
          이 순위는 선택된 소견 기반 지지도이며 실제 질병 확률이 아닙니다.
          응급 배제 필요 질환은 지지도와 무관하게 별도 확인해야 합니다.
        </div>

        <EmergencyPanel
          emergencyScores={emergencyScores}
          activeCode={activeCode}
          onSelect={onSelect}
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(viewLabels) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-bold ${
                viewMode === mode
                  ? "border-blue-600 bg-blue-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mode === "all" ? (
                <Eye className="h-3.5 w-3.5" aria-hidden />
              ) : mode === "top6" ? (
                <EyeOff className="h-3.5 w-3.5" aria-hidden />
              ) : null}
              {viewLabels[mode]}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleScores.map((score, index) => {
          const active = activeCode === score.diagnosis.code;
          const tone = evidenceStatusTone[score.evidenceStatus];

          return (
            <button
              key={score.diagnosis.code}
              type="button"
              onClick={() => onSelect(score.diagnosis.code)}
              className={`grid w-full grid-cols-[34px_1fr_94px] items-center gap-3 px-4 py-3 text-left transition sm:grid-cols-[34px_1fr_110px_92px] ${
                active ? "bg-blue-50" : "bg-white hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {index + 1}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-950">
                  {score.diagnosis.nameKo}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>지지도 {score.likelihoodSupportScore}</span>
                  <span>응급도 {score.urgencyScore}</span>
                  <span>rule-in {score.ruleInFindings.length}</span>
                  <span>red flag {score.redFlagFindings.length}</span>
                </span>
              </span>

              <span
                className={`justify-self-start rounded-md border px-2 py-1 text-[11px] font-bold ${tone.className}`}
              >
                {evidenceStatusLabels[score.evidenceStatus]}
              </span>

              <span className="hidden items-center gap-2 sm:flex">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full ${tone.barClassName}`}
                    style={{ width: supportWidth(score.likelihoodSupportScore) }}
                  />
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
