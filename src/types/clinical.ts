export type DiagnosisCategory =
  | "cardiac"
  | "aortic"
  | "pulmonary_pleural"
  | "gastrointestinal"
  | "musculoskeletal_neuro_skin"
  | "psychiatric_functional";

export type Urgency = "emergent" | "urgent" | "routine";

export type DiagnosisCode =
  | "STEMI"
  | "NSTEMI"
  | "UA"
  | "SA_CCD"
  | "VSA"
  | "T2MI"
  | "INOCA"
  | "MYO"
  | "PERI"
  | "TTS"
  | "HCM"
  | "AS"
  | "ARR"
  | "AHF"
  | "MVP"
  | "DIS"
  | "IMH"
  | "PAU"
  | "TAA"
  | "PE"
  | "PNA"
  | "PLEUR"
  | "PTX"
  | "TPTX"
  | "PH"
  | "PLEFF"
  | "EMP"
  | "ASTH_COPD"
  | "PMED"
  | "LUNGCA"
  | "GERD"
  | "HH"
  | "ESPASM"
  | "ESOPH"
  | "BOER"
  | "PUD"
  | "PERF_PUD"
  | "DYSPEP"
  | "BILCOL"
  | "CHOLE"
  | "CHOLANG"
  | "PANC"
  | "COSTO"
  | "TIETZE"
  | "STRAIN"
  | "RIB"
  | "CRAD"
  | "TRAD"
  | "ICN"
  | "SHOULDER"
  | "XIPHO"
  | "ZOSTER"
  | "FIBRO"
  | "PANIC"
  | "ANX"
  | "HVS"
  | "FCP";

export type Diagnosis = {
  code: DiagnosisCode;
  nameKo: string;
  category: DiagnosisCategory;
  urgency: Urgency;
  mustNotMiss: boolean;
  description: string;
  keyDifferentiators: string[];
  confirmatoryTests: string[];
  ruleOutConsiderations: string[];
  redFlags: string[];
};

export type FindingCategory =
  | "history"
  | "vital"
  | "physical"
  | "ecg"
  | "lab"
  | "cardiac_imaging"
  | "thoracic_imaging"
  | "gi_test"
  | "msk_neuro_skin"
  | "psych_functional";

export type FindingWeight = -2 | -1 | 0 | 1 | 2;

export type FindingRule = {
  id: string;
  labelKo: string;
  category: FindingCategory;
  description?: string;
  weights: Partial<Record<DiagnosisCode, FindingWeight>>;
  redFlagFor?: DiagnosisCode[];
  sourceNote?: string;
};

export type DiagnosisStatus =
  | "즉시 배제 필요"
  | "가능성 높음"
  | "가능성 중등도"
  | "추가 확인 필요"
  | "가능성 낮음"
  | "배제 가능";

export type DiagnosisScore = {
  diagnosis: Diagnosis;
  score: number;
  status: DiagnosisStatus;
  positiveFindings: FindingRule[];
  negativeFindings: FindingRule[];
  redFlagTriggered: boolean;
};

export type PatientInfo = {
  age: string;
  sex: string;
  chiefComplaint: string;
  onset: string;
  riskFactors: string[];
  memo: string;
};

export type VitalSigns = {
  bp: string;
  hr: string;
  rr: string;
  spo2: string;
  bt: string;
};
