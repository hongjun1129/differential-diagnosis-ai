import { chestPainRuleById } from "@/data/chestPainRules";
import type {
  ChecklistStateMap,
  FindingStateMap,
  PatientInfo,
  VitalSigns
} from "@/types/clinical";

function compact(items: string[], fallback: string, count = 2) {
  return items.length > 0 ? items.slice(0, count).join(", ") : fallback;
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

export function buildProblemRepresentationFromChecklist(
  findingStates: FindingStateMap,
  checklistState: ChecklistStateMap,
  patient: PatientInfo,
  vitals: VitalSigns
) {
  const ageSex =
    patient.age || patient.sex
      ? `${patient.age || "나이 미입력"} ${patient.sex || "성별 미입력"}`
      : "나이/성별 미입력";
  const onset = patient.onset || "증상 시작 확인 필요";

  const presentLabels = Object.entries(findingStates)
    .filter(([, state]) => state === "present")
    .map(([id]) => chestPainRuleById.get(id))
    .filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));
  const absentLabels = Object.entries(findingStates)
    .filter(([, state]) => state === "absent")
    .map(([id]) => chestPainRuleById.get(id)?.labelKo)
    .filter((label): label is string => Boolean(label));
  const redFlagCandidates = Object.entries(checklistState)
    .filter(([, value]) => value?.source !== "manual")
    .filter(([id, value]) => value?.context === "hypothesis" || chestPainRuleById.get(id)?.effectType === "red_flag")
    .map(([id]) => chestPainRuleById.get(id)?.labelKo)
    .filter((label): label is string => Boolean(label));

  const history = presentLabels
    .filter((rule) => rule.category === "history")
    .map((rule) => rule.labelKo);
  const tests = presentLabels
    .filter((rule) => ["ecg", "lab", "cardiac_imaging", "thoracic_imaging"].includes(rule.category))
    .map((rule) => rule.labelKo);

  return [
    ageSex,
    patient.chiefComplaint || "주호소 미입력",
    onset,
    compact(history, "통증 양상/동반 증상 확인 필요", 3),
    absentLabels.length > 0 ? `${compact(absentLabels, "주요 음성 소견", 2)} 없음/부인` : "",
    vitalSummary(vitals),
    compact(tests, "ECG/검사 정보 미입력", 2),
    redFlagCandidates.length > 0
      ? `${compact([...new Set(redFlagCandidates)], "must-not-miss 원인", 2)} 확인 필요`
      : ""
  ]
    .filter(Boolean)
    .join(" / ");
}
