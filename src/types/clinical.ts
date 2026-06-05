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

export type FindingState = "unknown" | "present" | "absent";

export type FindingStateMap = Partial<Record<string, FindingState>>;

export type EvidenceLevel =
  | "weak"
  | "moderate"
  | "strong"
  | "guideline"
  | "confirmatory";

export type RuleEffectType =
  | "weak_support"
  | "moderate_support"
  | "strong_support"
  | "rule_in"
  | "weak_against"
  | "strong_against"
  | "rule_out_condition"
  | "red_flag"
  | "exclusion_requirement";

export type RuleCondition = {
  findingId: string;
  state: FindingState;
};

export type FindingRule = {
  id: string;
  labelKo: string;
  category: FindingCategory;
  description?: string;
  weights: Partial<Record<DiagnosisCode, FindingWeight>>;
  redFlagFor?: DiagnosisCode[];
  sourceNote?: string;
};

export type RuleEffect = {
  targetDiagnosisId: DiagnosisCode;
  effectType: RuleEffectType;
  weight: number;
  evidenceLevel: EvidenceLevel;
  sourceNote?: string;
  requiresAllOf?: string[];
  appliesOnlyIf?: RuleCondition[];
};

export type ChestPainRule = {
  id: string;
  labelKo: string;
  category: FindingCategory;
  targetDiagnosisIds: DiagnosisCode[];
  effectType: RuleEffectType;
  weight: number;
  evidenceLevel: EvidenceLevel;
  sourceNote: string;
  conflictsWith: string[];
  requiresAllOf?: string[];
  appliesOnlyIf?: RuleCondition[];
  presentEffects: RuleEffect[];
  absentEffects?: RuleEffect[];
};

export type EvidenceStatus =
  | "insufficient_information"
  | "possible"
  | "supported"
  | "strongly_supported"
  | "rule_in_evidence"
  | "rule_out_candidate"
  | "conflicting_evidence"
  | "excluded";

export type ConflictWarning = {
  id: string;
  findingIds: string[];
  findingLabels: string[];
  affectedDiagnosisIds: DiagnosisCode[];
  messageKo: string;
};

export type DiagnosisEvaluation = {
  diagnosis: Diagnosis;
  likelihoodSupportScore: number;
  urgencyScore: number;
  evidenceStatus: EvidenceStatus;
  supportingFindings: ChestPainRule[];
  findingsAgainst: ChestPainRule[];
  ruleInFindings: ChestPainRule[];
  ruleOutFindings: ChestPainRule[];
  redFlagFindings: ChestPainRule[];
  missingKeyData: string[];
  conflictWarnings: ConflictWarning[];
  matchedRedFlags: string[];
  urgentNextCheck: string;
  whyRanked: string;
};

export type DiagnosisScore = DiagnosisEvaluation;

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
