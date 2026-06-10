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

export type ChecklistStatus = FindingState;

export type ChecklistSource =
  | "manual"
  | "rule_parser"
  | "free_text_parser"
  | "llm_extractor"
  | "vital_parser"
  | "lab_parser"
  | "test_parser"
  | "system";

export type ClinicalAssertion =
  | "present"
  | "absent"
  | "uncertain"
  | "hypothesis";

export type ClinicalContext =
  | "current_symptom"
  | "past_history"
  | "family_history"
  | "risk_factor"
  | "test_result"
  | "medication"
  | "procedure"
  | "hypothesis"
  | "unknown";

export type ChecklistPatch = {
  itemId: string;
  status: ChecklistStatus;
  source: ChecklistSource;
  evidenceText: string;
  confidence: number;
  context: ClinicalContext;
  assertion?: ClinicalAssertion;
  reason: string;
  negated?: boolean;
  sentenceIndex?: number;
  start?: number;
  end?: number;
  isRedFlag?: boolean;
  requiresConfirmation: boolean;
};

export type ChecklistStateValue = {
  status: ChecklistStatus;
  source: ChecklistSource;
  evidenceText?: string;
  confidence?: number;
  updatedAt: string;
  manuallyOverridden?: boolean;
  context?: ClinicalContext;
};

export type ChecklistStateMap = Partial<Record<string, ChecklistStateValue>>;

export type ChecklistNlpConceptType =
  | "symptom"
  | "vital"
  | "physical"
  | "ecg"
  | "lab"
  | "imaging"
  | "risk_factor"
  | "history";

export type ChecklistNlpRule = {
  itemId: string;
  labelKo: string;
  labelEn?: string;
  conceptType: ChecklistNlpConceptType;
  conceptId: string;
  patterns: RegExp[];
  synonyms: string[];
  negatable: boolean;
  defaultContext: ClinicalContext;
  redFlag?: boolean;
  autoApplyThreshold: number;
  previewThreshold: number;
};

export type ChecklistPatchConflict = {
  itemId: string;
  labelKo: string;
  patches: ChecklistPatch[];
  messageKo: string;
};

export type ClinicalTextAnalyzer = {
  analyze(text: string): ChecklistPatch[];
};

export type ExtractedFinding = {
  findingId: string;
  normalizedText: string;
  originalText: string;
  assertion: ClinicalAssertion;
  context: ClinicalContext;
  confidence: number;
  evidenceText: string;
};

export type DiseaseCandidateRelation =
  | "supports"
  | "against"
  | "rule_in_possible"
  | "rule_out_possible"
  | "must_not_miss_consider"
  | "insufficient_information";

export type DiseaseCandidate = {
  diseaseId: string;
  relation: DiseaseCandidateRelation;
  confidence: number;
  evidenceText: string;
  reason: string;
  requiresConfirmation: boolean;
};

export type MissingQuestion = {
  question: string;
  reason: string;
  relatedDiseaseIds: string[];
  priority: "high" | "medium" | "low";
};

export type ClinicalContradiction = {
  targetId: string;
  evidenceA: string;
  evidenceB: string;
  explanation: string;
  requiresUserReview: true;
};

export type SafetyWarning = {
  type: "red_flag" | "uncertain_diagnosis" | "insufficient_data" | "conflict";
  message: string;
  relatedDiseaseIds: string[];
};

export type ClinicalExtractionResult = {
  extractedFindings: ExtractedFinding[];
  checklistPatches: ChecklistPatch[];
  diseaseCandidates: DiseaseCandidate[];
  missingQuestions: MissingQuestion[];
  contradictions: ClinicalContradiction[];
  safetyWarnings: SafetyWarning[];
  summary?: string;
};

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

export type ReasoningStage =
  | "initial_history"
  | "vitals_and_exam"
  | "basic_tests"
  | "advanced_tests"
  | "follow_up_results";

export type DiagnosisEvaluation = {
  diagnosis: Diagnosis;
  likelihoodSupportScore: number;
  supportScore: number;
  urgencyScore: number;
  evidenceStatus: EvidenceStatus;
  status: EvidenceStatus;
  supportingFindings: ChestPainRule[];
  findingsAgainst: ChestPainRule[];
  againstFindings: ChestPainRule[];
  ruleInFindings: ChestPainRule[];
  ruleOutFindings: ChestPainRule[];
  ruleOutCriteriaMet: ChestPainRule[];
  ruleOutCriteriaMissing: string[];
  redFlagFindings: ChestPainRule[];
  missingKeyData: string[];
  conflictWarnings: ConflictWarning[];
  matchedRedFlags: string[];
  nextDiscriminatingInformation: string;
  whyRanked: string;
  explanationKo: string;
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
