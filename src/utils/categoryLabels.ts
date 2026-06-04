import type {
  DiagnosisCategory,
  DiagnosisStatus,
  FindingCategory,
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
  thoracic_imaging: "영상/흉부 검사",
  gi_test: "위장관 검사",
  msk_neuro_skin: "근골격/신경/피부",
  psych_functional: "정신건강/기능성"
};

export const urgencyLabels: Record<Urgency, string> = {
  emergent: "응급",
  urgent: "긴급",
  routine: "일반"
};

export const statusTone: Record<
  DiagnosisStatus,
  { className: string; barClassName: string }
> = {
  "즉시 배제 필요": {
    className: "border-red-200 bg-red-50 text-red-700",
    barClassName: "bg-red-600"
  },
  "가능성 높음": {
    className: "border-blue-200 bg-blue-50 text-blue-700",
    barClassName: "bg-blue-600"
  },
  "가능성 중등도": {
    className: "border-orange-200 bg-orange-50 text-orange-700",
    barClassName: "bg-orange-500"
  },
  "추가 확인 필요": {
    className: "border-slate-200 bg-slate-50 text-slate-700",
    barClassName: "bg-slate-500"
  },
  "가능성 낮음": {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    barClassName: "bg-emerald-600"
  },
  "배제 가능": {
    className: "border-slate-200 bg-white text-slate-500",
    barClassName: "bg-slate-300"
  }
};

export const urgencyTone: Record<Urgency, string> = {
  emergent: "border-red-200 bg-red-50 text-red-700",
  urgent: "border-orange-200 bg-orange-50 text-orange-700",
  routine: "border-emerald-200 bg-emerald-50 text-emerald-700"
};
