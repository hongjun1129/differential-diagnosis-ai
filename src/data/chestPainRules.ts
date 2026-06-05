import { findingRules } from "@/data/findingRules";
import type {
  ChestPainRule,
  DiagnosisCode,
  EvidenceLevel,
  FindingCategory,
  FindingRule,
  FindingWeight,
  RuleEffect,
  RuleEffectType
} from "@/types/clinical";

const triStateCategories = new Set<FindingCategory>([
  "ecg",
  "lab",
  "cardiac_imaging",
  "thoracic_imaging",
  "gi_test"
]);

const conflictPairs: Array<[string, string, DiagnosisCode[]]> = [
  ["T98", "T99", ["PE"]],
  ["T93", "T97", ["DIS", "IMH", "PAU", "TAA"]],
  ["T94", "T97", ["DIS", "IMH", "PAU", "TAA"]],
  ["T95", "T97", ["DIS", "IMH", "PAU", "TAA"]],
  ["T96", "T97", ["DIS", "IMH", "PAU", "TAA"]],
  ["L62", "L64", ["STEMI", "NSTEMI", "UA", "MYO", "TTS"]],
  ["T102", "T106", ["PTX", "TPTX"]],
  ["T103", "T106", ["PTX", "TPTX"]],
  ["T104", "T106", ["PTX", "TPTX"]],
  ["C87", "C92", ["PERI"]],
  ["C86", "C92", ["PERI"]],
  ["C91", "C92", ["AHF"]]
];

const conflictMap = new Map<string, string[]>();

for (const [left, right] of conflictPairs) {
  conflictMap.set(left, [...(conflictMap.get(left) ?? []), right]);
  conflictMap.set(right, [...(conflictMap.get(right) ?? []), left]);
}

const ruleInOverrides: Partial<Record<string, DiagnosisCode[]>> = {
  E50: ["STEMI"],
  C76: ["STEMI", "NSTEMI"],
  T93: ["DIS"],
  T98: ["PE"],
  T102: ["PTX"],
  T103: ["PTX"],
  T104: ["TPTX"],
  C87: ["PERI"],
  G122: ["BOER"],
  G126: ["PERF_PUD"]
};

const strongSupportOverrides: Partial<Record<string, DiagnosisCode[]>> = {
  L62: ["STEMI", "NSTEMI"],
  C82: ["STEMI", "NSTEMI"],
  T105: ["PNA"],
  G133: ["PANC"],
  G134: ["PANC"]
};

const ruleOutOverrides: Partial<Record<string, DiagnosisCode[]>> = {
  L64: ["STEMI", "NSTEMI", "UA"],
  L68: ["PE"],
  T97: ["DIS", "IMH", "PAU", "TAA"],
  T99: ["PE"],
  G124: ["BOER"],
  G135: ["CHOLE", "CHOLANG", "BILCOL"],
  G136: ["PANC"]
};

export const emergencyMustNotMissCodes: DiagnosisCode[] = [
  "STEMI",
  "NSTEMI",
  "DIS",
  "PE",
  "TPTX",
  "PERI",
  "BOER"
];

export const emergencyDisplayNames: Record<DiagnosisCode, string> = {
  STEMI: "STEMI",
  NSTEMI: "NSTEMI / ACS",
  DIS: "Aortic dissection",
  PE: "Pulmonary embolism",
  TPTX: "Tension pneumothorax",
  PERI: "Cardiac tamponade",
  BOER: "Esophageal rupture / Boerhaave syndrome",
  UA: "불안정 협심증",
  SA_CCD: "안정형 협심증",
  VSA: "이형 협심증",
  T2MI: "2형 심근경색",
  INOCA: "INOCA",
  MYO: "심근염",
  TTS: "Takotsubo",
  HCM: "비후성 심근병증",
  AS: "대동맥판막 협착증",
  ARR: "부정맥",
  AHF: "급성 심부전",
  MVP: "승모판 탈출증",
  IMH: "대동맥 벽내혈종",
  PAU: "관통성 대동맥 궤양",
  TAA: "흉부 대동맥류",
  PNA: "폐렴",
  PLEUR: "흉막염",
  PTX: "기흉",
  PH: "폐고혈압",
  PLEFF: "흉수",
  EMP: "농흉",
  ASTH_COPD: "천식/COPD 악화",
  PMED: "기종격동",
  LUNGCA: "폐암/종격동 종양",
  GERD: "GERD",
  HH: "식도열공탈장",
  ESPASM: "식도연축",
  ESOPH: "식도염",
  PUD: "소화성 궤양",
  PERF_PUD: "천공성 소화성 궤양",
  DYSPEP: "소화불량",
  BILCOL: "담도산통",
  CHOLE: "담낭염",
  CHOLANG: "담관염",
  PANC: "췌장염",
  COSTO: "늑연골염",
  TIETZE: "Tietze 증후군",
  STRAIN: "흉벽 근육 염좌",
  RIB: "늑골골절",
  CRAD: "경추 신경근병증",
  TRAD: "흉추 신경근병증",
  ICN: "늑간신경통",
  SHOULDER: "어깨 질환",
  XIPHO: "검상돌기통",
  ZOSTER: "대상포진",
  FIBRO: "섬유근통",
  PANIC: "공황발작",
  ANX: "불안 관련 흉부 압박감",
  HVS: "과호흡 증후군",
  FCP: "기능성 흉통"
};

export const nextDiscriminatingInfoByDiagnosis: Partial<Record<DiagnosisCode, string>> = {
  STEMI: "ACS 감별에 필요한 추가 정보: 반복 ECG 변화, serial hs-troponin 변화, 증상 시작 시점",
  NSTEMI: "NSTEMI/ACS 감별에 필요한 추가 정보: serial hs-troponin 상승/하강, 반복 ECG 변화, 혈역학 안정성",
  DIS: "급성 대동맥증후군 감별에 필요한 추가 정보: 등 방사통, 양팔 혈압/맥박 차이, 대동맥 영상 상태",
  PE: "PE와 폐렴/기흉 감별에 필요한 추가 정보: SpO2, PE 사전확률, D-dimer/CTPA 상태, 우심부담 여부",
  TPTX: "기흉/긴장성 기흉 감별에 필요한 추가 정보: 한쪽 호흡음, 혈역학 상태, CXR/폐초음파 소견",
  PERI: "심낭염/압전 감별에 필요한 추가 정보: 자세성 통증, 경정맥 팽대, 심낭삼출/압전 생리 여부",
  BOER: "식도파열 감별에 필요한 추가 정보: 구토 후 발생, 종격동 공기/흉수, 식도 조영 누출 여부"
};

export const missingKeyDataByDiagnosis: Partial<Record<DiagnosisCode, string[]>> = {
  STEMI: ["반복 ECG", "serial hs-troponin", "허혈성 증상 시간축"],
  NSTEMI: ["serial hs-troponin 상승/하강", "반복 ECG 변화", "ACS 위험도"],
  DIS: ["양팔 혈압/맥박 차이", "신경학적 결손", "대동맥 CTA"],
  PE: ["PE 사전확률", "D-dimer 또는 CTPA", "산소포화도/우심부담"],
  TPTX: ["한쪽 호흡음", "혈역학 안정성", "CXR/폐초음파"],
  PERI: ["자세성 흉통", "심낭 마찰음", "심초음파"],
  BOER: ["구토 후 발생 여부", "종격동 공기/흉수", "식도 조영 누출"]
};

export function isTriStateRule(rule: ChestPainRule) {
  return triStateCategories.has(rule.category);
}

function baseEffectType(weight: FindingWeight): RuleEffectType {
  if (weight === 2) return "strong_support";
  if (weight === 1) return "moderate_support";
  if (weight === -1) return "weak_against";
  return "strong_against";
}

function baseEvidenceLevel(weight: FindingWeight): EvidenceLevel {
  if (Math.abs(weight) === 2) return "strong";
  return "moderate";
}

function ruleEffectType(rule: FindingRule, diagnosisId: DiagnosisCode, weight: FindingWeight) {
  if (ruleInOverrides[rule.id]?.includes(diagnosisId)) return "rule_in";
  if (strongSupportOverrides[rule.id]?.includes(diagnosisId)) return "strong_support";
  if (rule.redFlagFor?.includes(diagnosisId)) return "red_flag";
  if (ruleOutOverrides[rule.id]?.includes(diagnosisId)) return "rule_out_condition";
  return baseEffectType(weight);
}

function ruleEvidenceLevel(rule: FindingRule, diagnosisId: DiagnosisCode, weight: FindingWeight) {
  const effectType = ruleEffectType(rule, diagnosisId, weight);
  if (effectType === "rule_in" || effectType === "rule_out_condition") {
    return "confirmatory";
  }
  if (effectType === "red_flag") return "guideline";
  return baseEvidenceLevel(weight);
}

function effectWeight(effectType: RuleEffectType, originalWeight: FindingWeight) {
  if (effectType === "rule_in") return Math.max(6, originalWeight);
  if (effectType === "red_flag") return Math.max(4, originalWeight);
  if (effectType === "rule_out_condition") return Math.min(-4, originalWeight);
  if (effectType === "strong_support") return Math.max(3, originalWeight);
  if (effectType === "strong_against") return Math.min(-2, originalWeight);
  return originalWeight;
}

function sourceNoteFor(rule: FindingRule, effectType: RuleEffectType) {
  if (rule.sourceNote) return rule.sourceNote;
  if (effectType === "rule_in") {
    return "확정 진단 주장이 아니라, 해당 감별진단을 강하게 지지하는 확인 소견입니다.";
  }
  if (effectType === "rule_out_condition") {
    return "단독 음성이 아니라 라벨에 포함된 조건이 충족될 때 배제 후보로 해석합니다.";
  }
  if (effectType === "red_flag") {
    return "응급 배제가 필요한 red flag 소견입니다.";
  }
  return "선택된 체크리스트 소견이 규칙 기반 지지도를 조정합니다.";
}

function toChestPainRule(rule: FindingRule): ChestPainRule {
  const presentEffects: RuleEffect[] = [];

  for (const [diagnosisId, rawWeight] of Object.entries(rule.weights) as Array<
    [DiagnosisCode, FindingWeight]
  >) {
    if (rawWeight === 0) continue;
    const effectType = ruleEffectType(rule, diagnosisId, rawWeight);
    presentEffects.push({
      targetDiagnosisId: diagnosisId,
      effectType,
      weight: effectWeight(effectType, rawWeight),
      evidenceLevel: ruleEvidenceLevel(rule, diagnosisId, rawWeight),
      sourceNote: sourceNoteFor(rule, effectType),
      requiresAllOf: ruleOutOverrides[rule.id]?.includes(diagnosisId)
        ? [rule.id]
        : undefined
    });
  }

  return {
    id: rule.id,
    labelKo: rule.labelKo,
    category: rule.category,
    targetDiagnosisIds: presentEffects.map((effect) => effect.targetDiagnosisId),
    effectType: presentEffects[0]?.effectType ?? "weak_support",
    weight: presentEffects[0]?.weight ?? 0,
    evidenceLevel: presentEffects[0]?.evidenceLevel ?? "weak",
    sourceNote: rule.sourceNote ?? "규칙 기반 체크리스트 소견입니다.",
    conflictsWith: conflictMap.get(rule.id) ?? [],
    requiresAllOf: ruleOutOverrides[rule.id] ? [rule.id] : undefined,
    presentEffects,
    absentEffects: []
  };
}

export const chestPainRules: ChestPainRule[] = findingRules.map(toChestPainRule);

export const chestPainRuleById = new Map(
  chestPainRules.map((rule) => [rule.id, rule])
);

export const conflictDefinitions = conflictPairs.map(
  ([left, right, affectedDiagnosisIds]) => ({
    findingIds: [left, right],
    affectedDiagnosisIds
  })
);
