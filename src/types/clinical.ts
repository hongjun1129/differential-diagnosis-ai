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
  | "INOCA"
  | "SCAD"
  | "DIS"
  | "TAA"
  | "PERI"
  | "MYO"
  | "AHF"
  | "AS"
  | "MVP"
  | "HCM"
  | "ARR"
  | "TTS"
  | "HTN_EMERG"
  | "PE"
  | "TPTX"
  | "PTX"
  | "TRAUMATIC_PTX_HEMOTHORAX"
  | "PNA"
  | "PLEUR"
  | "PLEFF"
  | "PULM_INFARCT"
  | "PMED"
  | "ASTHMA_EXAC"
  | "COPD_EXAC"
  | "LUNGCA"
  | "GERD"
  | "ESOPH"
  | "ESPASM"
  | "BOER"
  | "MALLORY_WEISS"
  | "PUD"
  | "DYSPEP"
  | "BILCOL"
  | "CHOLE"
  | "CHOLANG"
  | "PANC"
  | "HH"
  | "COSTO"
  | "TIETZE"
  | "STRAIN"
  | "RIB"
  | "CHEST_CONTUSION"
  | "ICN"
  | "CRAD_TRAD"
  | "ZOSTER"
  | "FIBRO"
  | "TOS"
  | "PANIC"
  | "ANX"
  | "HVS"
  | "FCP"
  | "SOMATIC_CHEST_PAIN"
  | "T2MI"
  | "AAS_IMH_PAU"
  | "CORONARY_EMBOLISM"
  | "STIMULANT_ISCHEMIA"
  | "MINOCA"
  | "TAMPONADE"
  | "PH_RV_ISCHEMIA"
  | "ANOMALOUS_CORONARY"
  | "EMP"
  | "VIRAL_PLEURITIS"
  | "TB_PLEURITIS"
  | "SICKLE_ACUTE_CHEST"
  | "VIRAL_PNA"
  | "LUNG_ABSCESS"
  | "MEDIASTINITIS"
  | "PERF_PUD"
  | "ACHALASIA"
  | "PILL_INFECTIOUS_EOE_ESOPHAGITIS"
  | "ESOPHAGEAL_CANCER"
  | "GASTRIC_VOLVULUS"
  | "SPLENIC_INFARCT"
  | "SUBPHRENIC_ABSCESS"
  | "THORACIC_COMPRESSION_FX"
  | "SLIPPING_RIB"
  | "SC_JOINT_INFECTION"
  | "XIPHO"
  | "PRECORDIAL_CATCH"
  | "AUTOIMMUNE_SEROSITIS"
  | "CO_POISONING_ISCHEMIA"
  | "MASTITIS_MONDOR"
  | "TRAUMATIC_AORTIC_INJURY"
  | "PULM_CONTUSION_FLAIL"
  | "STRANGULATED_HERNIA";

export type Diagnosis = {
  code: DiagnosisCode;
  nameKo: string;
  nameEn?: string;
  category: DiagnosisCategory;
  urgency: Urgency;
  mustNotMiss: boolean;
  description: string;
  keyDifferentiators: string[];
  confirmatoryTests: string[];
  ruleOutConsiderations: string[];
  redFlags: string[];
  originalCategory?: string;
  priorityLabel?: string;
  mustNotMissGate?: string;
  sourceUrls?: string[];
  evidenceLevel?: string;
  evidenceGrade?: string;
  reviewStatus?: string;
  primaryEvidence?: string;
  v12ChangeNote?: string;
  sourceNote?: string;
  checklistIds?: {
    appKey: string[];
    comprehensive: string[];
  };
};


export type AppKeyChecklistItem = {
  id: string;
  section: string;
  labelKo: string;
  defaultState: FindingState;
  memo: string;
  relatedDiagnosisNames: string[];
  relatedDiagnosisCodes: DiagnosisCode[];
  redFlag: boolean;
  sourceExample: string;
};

export type ComprehensiveChecklistItem = {
  id: string;
  section: string;
  labelKo: string;
  defaultState: FindingState;
  memo: string;
  relatedDiagnosisNames: string[];
  relatedDiagnosisCodes: DiagnosisCode[];
  redFlag: boolean;
  impact: string;
  sourceColumn: string;
  representativeSourceText: string;
};

export type RedFlagGate = {
  no: number;
  code: DiagnosisCode;
  nameKo: string;
  nameEn: string;
  gate: string;
  appKeyChecklistIds: string[];
  comprehensiveChecklistIds: string[];
  caution: string;
};

export type ScoreItem = {
  id: string;
  labelKo: string;
  relatedDiagnosisNames: string[];
  relatedDiagnosisCodes: DiagnosisCode[];
  sourceColumn: string;
  representativeSourceText: string;
  defaultState: FindingState;
  memo: string;
};

export type VerbatimChecklistMapping = {
  checklistId: string;
  diagnosisNo: number;
  diagnosisCode: DiagnosisCode;
  diagnosisNameKo: string;
  section: string;
  labelKo: string;
  impact: string;
  sourceColumn: string;
  verbatimCell: string;
  sourceUrls: string[];
  evidenceLevel: string;
  evidenceGrade: string;
  v12ChangeNote: string;
};

export type ChecklistEvaluationStateMapping = {
  labelKo: string;
  state: FindingState;
};

export type ClinicalSourceReference = {
  key: string;
  title: string;
  url: string;
  coverage: string;
  doiOrFormalUrl: string;
  year: string;
  evidenceType: string;
};

export type ClinicalWorkflowRule = {
  id: string;
  ruleKo: string;
  caution: string;
};

export type ClinicalDispositionRow = Record<string, string>;

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
