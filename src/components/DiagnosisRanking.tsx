"use client";

import { AlertTriangle, BarChart3, ChevronRight, ListFilter } from "lucide-react";
import { useMemo, useState } from "react";
import {
  emergencyDisplayNames,
  emergencyMustNotMissCodes
} from "@/data/chestPainRules";
import type {
  DiagnosisCategory,
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

type ViewMode =
  | "top6"
  | "emergency"
  | "supported"
  | "rule_out"
  | "insufficient"
  | "cardiovascular"
  | "pulmonary_pleural"
  | "gastrointestinal"
  | "musculoskeletal_neuro_skin"
  | "psychiatric_functional"
  | "all";

export const DEFAULT_TOP_DIAGNOSIS_COUNT = 12;
export const DEFAULT_TOP_DIAGNOSIS_LABEL = `상위 ${DEFAULT_TOP_DIAGNOSIS_COUNT}`;

const viewLabels: Record<ViewMode, string> = {
  top6: DEFAULT_TOP_DIAGNOSIS_LABEL,
  emergency: "응급/Red flag",
  supported: "지지됨",
  rule_out: "배제",
  insufficient: "정보 부족",
  cardiovascular: "심혈관",
  pulmonary_pleural: "폐/흉막",
  gastrointestinal: "위장관",
  musculoskeletal_neuro_skin: "근골격",
  psychiatric_functional: "정신/기능",
  all: "전체"
};

const viewStatusFilter: Partial<Record<ViewMode, EvidenceStatus[]>> = {
  supported: ["supported", "strongly_supported", "rule_in_evidence"],
  rule_out: ["rule_out_candidate", "excluded"],
  insufficient: ["insufficient_information"]
};

const categoryFilters: Partial<Record<ViewMode, DiagnosisCategory[]>> = {
  cardiovascular: ["cardiac", "aortic"],
  pulmonary_pleural: ["pulmonary_pleural"],
  gastrointestinal: ["gastrointestinal"],
  musculoskeletal_neuro_skin: ["musculoskeletal_neuro_skin"],
  psychiatric_functional: ["psychiatric_functional"]
};

const compactEmergencyCodes: DiagnosisCode[] = [
  "STEMI",
  "NSTEMI",
  "DIS",
  "PE",
  "TPTX",
  "PERI",
  "BOER"
];

const compactEmergencyLabels: Partial<Record<DiagnosisCode, string>> = {
  STEMI: "STEMI",
  NSTEMI: "NSTEMI/ACS",
  DIS: "대동맥 박리",
  PE: "폐색전증",
  TPTX: "긴장성 기흉",
  PERI: "심장압전",
  BOER: "식도파열"
};

export function getTopDiagnosisScores(
  scores: DiagnosisEvaluation[],
  findingStates: FindingStateMap,
  count = DEFAULT_TOP_DIAGNOSIS_COUNT
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
  onSelect: (code: string) => void;
}) {
  const orderedEmergencyScores = compactEmergencyCodes
    .map((code) =>
      emergencyScores.find((score) => score.diagnosis.code === code)
    )
    .filter((score): score is DiagnosisEvaluation => Boolean(score));

  return (
    <section className="shrink-0 border-t border-red-100 bg-red-50/70">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-red-700" aria-hidden />
          <h3 className="text-xs font-extrabold text-red-950">
            응급 배제 필요
          </h3>
        </div>
        <span className="text-[10px] font-bold text-red-700">
          must-not-miss
        </span>
      </div>

      <div className="grid gap-1 overflow-y-auto px-2 pb-2">
        {orderedEmergencyScores.map((score) => {
          const active = activeCode === score.diagnosis.code;
          const tone = evidenceStatusTone[score.evidenceStatus];

          return (
            <button
              key={score.diagnosis.code}
              type="button"
              onClick={() => onSelect(score.diagnosis.code)}
              className={`grid min-h-[28px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border bg-white px-2 py-1 text-left text-[11px] transition ${
                active
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-red-100 hover:border-red-200"
              }`}
            >
              <span className="min-w-0 truncate font-bold text-slate-950">
                {compactEmergencyLabels[score.diagnosis.code] ??
                  emergencyDisplayNames[score.diagnosis.code] ??
                  score.diagnosis.nameKo}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${tone.className}`}
                >
                  {evidenceStatusLabels[score.evidenceStatus]}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  red {score.matchedRedFlags.length}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  miss {score.missingKeyData.length}
                </span>
              </span>
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
    if (viewMode === "top6") {
      return selectedFindingCount === 0
        ? emergencyScores.slice(0, DEFAULT_TOP_DIAGNOSIS_COUNT)
        : scores.slice(0, DEFAULT_TOP_DIAGNOSIS_COUNT);
    }
    if (viewMode === "emergency") return emergencyScores;
    if (viewMode === "all") return scores;

    const allowedStatuses = viewStatusFilter[viewMode];
    if (allowedStatuses) {
      return scores.filter((score) =>
        allowedStatuses.includes(score.evidenceStatus)
      );
    }

    const categories = categoryFilters[viewMode];
    if (categories) {
      return scores.filter((score) =>
        categories.includes(score.diagnosis.category)
      );
    }

    return scores.slice(0, DEFAULT_TOP_DIAGNOSIS_COUNT);
  }, [emergencyScores, scores, selectedFindingCount, viewMode]);

  return (
    <section className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-lg border border-blue-200 bg-white shadow-soft xl:min-h-0">
      <div className="shrink-0 border-b border-blue-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <BarChart3 className="h-4 w-4 shrink-0 text-blue-700" aria-hidden />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold text-blue-950">
                감별진단 우선순위
              </h2>
              <p className="truncate text-[11px] text-slate-500">
                기본은 {DEFAULT_TOP_DIAGNOSIS_LABEL}개 표시, 전체 탭에서 모든 감별진단 확인
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
            기록 {selectedFindingCount}
          </span>
        </div>

        <div className="mt-2 flex gap-1 overflow-x-auto">
          {(Object.keys(viewLabels) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-bold ${
                viewMode === mode
                  ? "border-blue-600 bg-blue-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mode === "all" ? (
                <ListFilter className="h-3 w-3" aria-hidden />
              ) : null}
              {viewLabels[mode]}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span>
            표시 {visibleScores.length} / 전체 {scores.length}
          </span>
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className="font-bold text-blue-700 hover:text-blue-900"
          >
            전체 감별진단 보기
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
        {visibleScores.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs font-semibold text-slate-500">
            현재 필터에 해당하는 감별진단이 없습니다.
          </p>
        ) : null}

        {visibleScores.map((score) => {
          const active = activeCode === score.diagnosis.code;
          const tone = evidenceStatusTone[score.evidenceStatus];
          const rank = scores.findIndex(
            (item) => item.diagnosis.code === score.diagnosis.code
          ) + 1;

          return (
            <button
              key={score.diagnosis.code}
              type="button"
              onClick={() => onSelect(score.diagnosis.code)}
              className={`grid min-h-[44px] w-full grid-cols-[28px_minmax(0,1fr)_92px] items-center gap-2 px-3 py-1.5 text-left transition ${
                active ? "bg-blue-50" : "bg-white hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {rank}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-950">
                  {score.diagnosis.nameKo}
                </span>
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-slate-500">
                  <span>상승 {score.supportingFindings.length}</span>
                  <span>감소 {score.findingsAgainst.length}</span>
                  <span>rule-in {score.ruleInFindings.length}</span>
                </span>
              </span>

              <span className="min-w-0">
                <span
                  className={`block truncate rounded border px-1.5 py-0.5 text-center text-[10px] font-bold ${tone.className}`}
                >
                  {evidenceStatusLabels[score.evidenceStatus]}
                </span>
                <span className="mt-1 flex items-center gap-1">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full ${tone.barClassName}`}
                      style={{
                        width: supportWidth(score.likelihoodSupportScore)
                      }}
                    />
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-slate-400"
                    aria-hidden
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <EmergencyPanel
        emergencyScores={emergencyScores}
        activeCode={activeCode}
        onSelect={onSelect}
      />
    </section>
  );
}
