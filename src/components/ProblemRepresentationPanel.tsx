import { FileText } from "lucide-react";
import { getActiveRules } from "@/lib/scoring";
import type { FindingStateMap, PatientInfo, VitalSigns } from "@/types/clinical";

type ProblemRepresentationPanelProps = {
  patient: PatientInfo;
  vitals: VitalSigns;
  findingStates: FindingStateMap;
};

function compactJoin(items: string[], fallback: string) {
  return items.length > 0 ? items.slice(0, 2).join(" / ") : fallback;
}

function vitalSummary(vitals: VitalSigns) {
  const parts = [
    vitals.bp ? `BP ${vitals.bp}` : "",
    vitals.hr ? `HR ${vitals.hr}` : "",
    vitals.rr ? `RR ${vitals.rr}` : "",
    vitals.spo2 ? `SpO2 ${vitals.spo2}` : "",
    vitals.bt ? `BT ${vitals.bt}` : ""
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "활력징후 일부 미입력";
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
  const testLabels = presentRules
    .filter((rule) => ["ecg", "lab", "cardiac_imaging", "thoracic_imaging"].includes(rule.category))
    .map((rule) => rule.labelKo);

  const ageSex =
    patient.age || patient.sex
      ? `${patient.age || "나이 미입력"} / ${patient.sex || "성별 미입력"}`
      : "나이/성별 미입력";

  const representation = [
    ageSex,
    patient.chiefComplaint || "주호소 미입력",
    patient.onset || "증상 시작 확인 필요",
    compactJoin(historyLabels, "통증 양상/동반 증상 확인 필요"),
    vitalSummary(vitals),
    compactJoin(testLabels, "ECG/검사 정보 미입력")
  ].join(" / ");

  return (
    <section className="h-full min-h-0 overflow-hidden rounded-lg border border-blue-200 bg-white p-2 shadow-soft">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-blue-700" aria-hidden />
          <h2 className="text-xs font-extrabold leading-4 text-blue-950">
            Problem Representation
          </h2>
        </div>
        <details className="relative text-[11px]">
          <summary className="cursor-pointer font-bold text-blue-700">
            자세히
          </summary>
          <div className="absolute right-0 top-6 z-20 w-80 rounded-lg border border-blue-100 bg-white p-3 text-xs leading-5 text-slate-700 shadow-soft">
            문제 표현: {representation}
          </div>
        </details>
      </div>

      <p className="line-clamp-2 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold leading-4 text-blue-950">
        문제 표현: {representation}
      </p>
    </section>
  );
}
