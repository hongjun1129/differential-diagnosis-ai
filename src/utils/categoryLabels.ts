import type {
  DiagnosisCategory,
  EvidenceStatus,
  FindingCategory,
  FindingState,
  Urgency
} from "@/types/clinical";

export const diagnosisCategoryLabels: Record<DiagnosisCategory, string> = {
  cardiac: "심장",
  aortic: "대동맥",
  pulmonary_pleural: "폐/흉막",
  gastrointestinal: "위장관",
  musculoskeletal_neuro_skin: "근골격/신경/피부",
  psychiatric_functional: "정신건강/기능성"
};

export const findingCategoryLabels: Record<FindingCategory, string> = {
  history: "문진",
  vital: "활력징후",
  physical: "신체진찰",
  ecg: "ECG",
  lab: "혈액검사",
  cardiac_imaging: "심장 관련 검사",
  thoracic_imaging: "흉부/대동맥/폐 영상",
  gi_test: "위장관 검사",
  msk_neuro_skin: "근골격/신경/피부",
  psych_functional: "정신건강/기능성"
};

export const urgencyLabels: Record<Urgency, string> = {
  emergent: "응급",
  urgent: "긴급",
  routine: "일반"
};

export const evidenceStatusLabels: Record<EvidenceStatus, string> = {
  insufficient_information: "정보 부족",
  possible: "가능",
  supported: "지지됨",
  strongly_supported: "강하게 지지",
  rule_in_evidence: "확인 소견",
  rule_out_candidate: "배제 후보",
  conflicting_evidence: "상충 소견",
  excluded: "배제 가능"
};

export const evidenceStatusTone: Record<
  EvidenceStatus,
  { className: string; barClassName: string }
> = {
  insufficient_information: {
    className: "border-slate-200 bg-slate-50 text-slate-600",
    barClassName: "bg-slate-300"
  },
  possible: {
    className: "border-sky-200 bg-sky-50 text-sky-700",
    barClassName: "bg-sky-500"
  },
  supported: {
    className: "border-blue-200 bg-blue-50 text-blue-700",
    barClassName: "bg-blue-600"
  },
  strongly_supported: {
    className: "border-orange-200 bg-orange-50 text-orange-700",
    barClassName: "bg-orange-500"
  },
  rule_in_evidence: {
    className: "border-red-200 bg-red-50 text-red-700",
    barClassName: "bg-red-600"
  },
  rule_out_candidate: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    barClassName: "bg-emerald-600"
  },
  conflicting_evidence: {
    className: "border-purple-200 bg-purple-50 text-purple-700",
    barClassName: "bg-purple-600"
  },
  excluded: {
    className: "border-slate-200 bg-white text-slate-500",
    barClassName: "bg-slate-300"
  }
};

export const findingStateLabels: Record<FindingState, string> = {
  unknown: "미확인",
  present: "있음",
  absent: "없음"
};

export const urgencyTone: Record<Urgency, string> = {
  emergent: "border-red-200 bg-red-50 text-red-700",
  urgent: "border-orange-200 bg-orange-50 text-orange-700",
  routine: "border-emerald-200 bg-emerald-50 text-emerald-700"
};
