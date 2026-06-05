import { FileText, Layers3 } from "lucide-react";
import { getActiveRules } from "@/lib/scoring";
import type { FindingCategory, FindingStateMap, PatientInfo, VitalSigns } from "@/types/clinical";
import { findingCategoryLabels } from "@/utils/categoryLabels";

type ProblemRepresentationPanelProps = {
  patient: PatientInfo;
  vitals: VitalSigns;
  findingStates: FindingStateMap;
};

const stageDefinitions: Array<{
  id: string;
  title: string;
  categories: FindingCategory[];
}> = [
  {
    id: "initial_history",
    title: "1단계: 초기 문진/증상",
    categories: ["history"]
  },
  {
    id: "vitals_and_exam",
    title: "2단계: 활력징후/신체진찰",
    categories: ["vital", "physical"]
  },
  {
    id: "basic_tests",
    title: "3단계: 기본 검사",
    categories: ["ecg", "lab"]
  },
  {
    id: "advanced_tests",
    title: "4단계: 추가 검사",
    categories: ["cardiac_imaging", "thoracic_imaging", "gi_test"]
  },
  {
    id: "follow_up_results",
    title: "5단계: 진단 상태 업데이트",
    categories: ["msk_neuro_skin", "psych_functional"]
  }
];

function compactJoin(items: string[], fallback: string) {
  return items.length > 0 ? items.slice(0, 3).join(" / ") : fallback;
}

function vitalSummary(vitals: VitalSigns) {
  const parts = [
    vitals.bp ? `BP ${vitals.bp}` : "",
    vitals.hr ? `HR ${vitals.hr}` : "",
    vitals.rr ? `RR ${vitals.rr}` : "",
    vitals.spo2 ? `SpO2 ${vitals.spo2}` : "",
    vitals.bt ? `BT ${vitals.bt}` : ""
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "활력징후 미입력";
}

export function ProblemRepresentationPanel({
  patient,
  vitals,
  findingStates
}: ProblemRepresentationPanelProps) {
  const activeRules = getActiveRules(findingStates);
  const presentRules = activeRules.filter(
    (rule) => findingStates[rule.id] === "present"
  );
  const historyLabels = presentRules
    .filter((rule) => rule.category === "history")
    .map((rule) => rule.labelKo);
  const ecgLabels = presentRules
    .filter((rule) => rule.category === "ecg")
    .map((rule) => rule.labelKo);
  const labLabels = presentRules
    .filter((rule) => rule.category === "lab")
    .map((rule) => rule.labelKo);
  const imagingLabels = presentRules
    .filter((rule) =>
      ["cardiac_imaging", "thoracic_imaging", "gi_test"].includes(
        rule.category
      )
    )
    .map((rule) => rule.labelKo);

  const ageSex =
    patient.age || patient.sex
      ? `${patient.age || "나이 미입력"} / ${patient.sex || "성별 미입력"}`
      : "나이/성별 미입력";

  const representation = [
    ageSex,
    patient.chiefComplaint || "주호소 미입력",
    patient.onset || "증상 시작 시점 확인 필요",
    compactJoin(historyLabels, "통증 양상/동반 증상 확인 필요"),
    vitalSummary(vitals),
    `ECG: ${compactJoin(ecgLabels, "정보 미입력")}`,
    `혈액검사: ${compactJoin(labLabels, "정보 미입력")}`,
    `영상/추가검사: ${compactJoin(imagingLabels, "정보 미입력")}`
  ].join(" / ");

  return (
    <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-lg border border-blue-200 bg-white p-3 shadow-soft">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-700" aria-hidden />
          <h2 className="text-sm font-extrabold text-blue-950">
            Problem Representation
          </h2>
        </div>
        <p className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950">
          문제 표현: {representation}
        </p>
        <p className="mt-2 text-[11px] leading-4 text-slate-500">
          미입력 항목은 정상으로 가정하지 않습니다. 확인 필요 정보로 남겨
          working differential을 업데이트합니다.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
        <div className="mb-2 flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-blue-700" aria-hidden />
          <h2 className="text-sm font-extrabold text-blue-950">
            단계별 추론 입력
          </h2>
        </div>
        <div className="grid gap-1.5">
          {stageDefinitions.map((stage) => {
            const count = activeRules.filter((rule) =>
              stage.categories.includes(rule.category)
            ).length;
            return (
              <div
                key={stage.id}
                className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-xs"
              >
                <span className="font-semibold text-slate-700">
                  {stage.title}
                </span>
                <span className="rounded bg-white px-2 py-0.5 font-bold text-blue-700">
                  {count}개
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          분류 기준: {Object.values(findingCategoryLabels).join(", ")}
        </p>
      </div>
    </section>
  );
}
