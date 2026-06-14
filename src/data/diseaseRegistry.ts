import { chestPainRules } from "@/data/chestPainRules";
import { diagnoses } from "@/data/diagnoses";
import type {
  DiagnosisCategory,
  DiagnosisCode,
  RuleEffectType,
  Urgency
} from "@/types/clinical";

export type DiseaseRegistryEntry = {
  diseaseId: DiagnosisCode;
  nameKo: string;
  nameEn: string;
  aliases: string[];
  category: DiagnosisCategory;
  emergencyLevel: Urgency;
  mustNotMiss: boolean;
  redFlags: string[];
  supportingFindings: string[];
  againstFindings: string[];
  requiredQuestions: string[];
  initialTests: string[];
};

export type DiseaseShortlistItem = Pick<
  DiseaseRegistryEntry,
  | "diseaseId"
  | "nameKo"
  | "nameEn"
  | "aliases"
  | "redFlags"
  | "requiredQuestions"
> & {
  keyFindings: string[];
};

const diagnosisEnglishNames: Partial<Record<string, string>> = {
  STEMI: "ST-elevation myocardial infarction",
  NSTEMI: "Non-ST-elevation myocardial infarction",
  UA: "Unstable angina",
  SA_CCD: "Stable angina / chronic coronary disease",
  VSA: "Vasospastic angina",
  T2MI: "Type 2 myocardial infarction",
  INOCA: "Ischemia with non-obstructive coronary arteries",
  MYO: "Myocarditis",
  PERI: "Pericarditis / pericardial effusion / tamponade",
  TTS: "Takotsubo cardiomyopathy",
  HCM: "Hypertrophic cardiomyopathy",
  AS: "Aortic stenosis",
  ARR: "Arrhythmia-related chest discomfort",
  AHF: "Acute heart failure / pulmonary edema",
  MVP: "Mitral valve prolapse",
  DIS: "Acute aortic dissection",
  IMH: "Aortic intramural hematoma",
  PAU: "Penetrating aortic ulcer",
  TAA: "Thoracic aortic aneurysm acute expansion or rupture risk",
  PE: "Pulmonary embolism",
  PNA: "Pneumonia",
  PLEUR: "Pleuritis",
  PTX: "Pneumothorax",
  TPTX: "Tension pneumothorax",
  PH: "Pulmonary hypertension",
  PLEFF: "Pleural effusion",
  EMP: "Empyema",
  ASTH_COPD: "Asthma/COPD exacerbation",
  PMED: "Pneumomediastinum",
  LUNGCA: "Lung cancer / mediastinal tumor",
  GERD: "Gastroesophageal reflux disease",
  HH: "Hiatal hernia",
  ESPASM: "Esophageal spasm",
  ESOPH: "Esophagitis / eosinophilic esophagitis",
  BOER: "Esophageal rupture / Boerhaave syndrome",
  PUD: "Peptic ulcer disease",
  PERF_PUD: "Perforated peptic ulcer",
  DYSPEP: "Dyspepsia / functional dyspepsia",
  BILCOL: "Biliary colic",
  CHOLE: "Cholecystitis",
  CHOLANG: "Cholangitis",
  PANC: "Pancreatitis",
  COSTO: "Costochondritis",
  TIETZE: "Tietze syndrome",
  STRAIN: "Chest wall muscle strain",
  RIB: "Rib fracture / contusion",
  CRAD: "Cervical radiculopathy",
  TRAD: "Thoracic radiculopathy",
  ICN: "Intercostal neuralgia",
  SHOULDER: "Shoulder disorder",
  XIPHO: "Xiphodynia",
  ZOSTER: "Herpes zoster prodrome / postherpetic neuralgia",
  FIBRO: "Fibromyalgia",
  PANIC: "Panic attack / panic disorder",
  ANX: "Anxiety-related chest tightness",
  HVS: "Hyperventilation syndrome",
  FCP: "Functional chest pain"
};

const supportingEffectTypes = new Set<RuleEffectType>([
  "weak_support",
  "moderate_support",
  "strong_support",
  "rule_in",
  "red_flag"
]);

const againstEffectTypes = new Set<RuleEffectType>([
  "weak_against",
  "strong_against",
  "rule_out_condition",
  "exclusion_requirement"
]);

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function rulesForDiagnosis(
  diseaseId: DiagnosisCode,
  effectTypes: Set<RuleEffectType>
) {
  return unique(
    chestPainRules.flatMap((rule) => {
      const matched = rule.presentEffects.some(
        (effect) =>
          effect.targetDiagnosisId === diseaseId &&
          effectTypes.has(effect.effectType)
      );
      return matched ? [rule.labelKo] : [];
    })
  );
}

function buildAliases(code: DiagnosisCode, nameKo: string, nameEn: string) {
  const fragments = [nameKo, nameEn].flatMap((name) =>
    name
      .split(/[\/,()]/)
      .map((part) => part.trim())
      .filter(Boolean)
  );

  return unique([code, nameKo, nameEn, ...fragments]);
}

export const diseaseRegistry: DiseaseRegistryEntry[] = diagnoses.map(
  (diagnosis) => {
    const nameEn =
      diagnosis.nameEn ?? diagnosisEnglishNames[diagnosis.code] ?? diagnosis.code;
    return {
      diseaseId: diagnosis.code,
      nameKo: diagnosis.nameKo,
      nameEn,
      aliases: buildAliases(diagnosis.code, diagnosis.nameKo, nameEn),
      category: diagnosis.category,
      emergencyLevel: diagnosis.urgency,
      mustNotMiss: diagnosis.mustNotMiss,
      redFlags: diagnosis.redFlags,
      supportingFindings: rulesForDiagnosis(
        diagnosis.code,
        supportingEffectTypes
      ),
      againstFindings: rulesForDiagnosis(diagnosis.code, againstEffectTypes),
      requiredQuestions: diagnosis.keyDifferentiators,
      initialTests: diagnosis.confirmatoryTests
    };
  }
);

export const diseaseRegistryById: Map<string, DiseaseRegistryEntry> = new Map(
  diseaseRegistry.map((entry) => [entry.diseaseId, entry])
);

function normalize(value: string) {
  return value.toLocaleLowerCase("ko");
}

function keywordTokens(values: string[]) {
  return unique(
    values.flatMap((value) =>
      normalize(value)
        .split(/[\s,./()·:;|+-]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2)
    )
  );
}

function scoreDiseaseForText(entry: DiseaseRegistryEntry, text: string) {
  const normalizedText = normalize(text);
  if (!normalizedText) return entry.mustNotMiss ? 2 : 0;

  let score = entry.mustNotMiss ? 3 : 0;
  if (entry.emergencyLevel === "emergent") score += 1;

  for (const phrase of [
    ...entry.aliases,
    ...entry.redFlags,
    ...entry.supportingFindings
  ]) {
    const normalizedPhrase = normalize(phrase);
    if (normalizedPhrase && normalizedText.includes(normalizedPhrase)) {
      score += 8;
    }
  }

  for (const token of keywordTokens([
    ...entry.aliases,
    ...entry.redFlags,
    ...entry.supportingFindings,
    ...entry.requiredQuestions
  ])) {
    if (normalizedText.includes(token)) score += 1;
  }

  return score;
}

export function getDiseaseShortlistForNote(text: string, maxItems = 40) {
  return diseaseRegistry
    .map((entry) => ({ entry, score: scoreDiseaseForText(entry, text) }))
    .filter(({ entry, score }) => score > 0 || entry.mustNotMiss)
    .sort((left, right) => {
      if (left.score !== right.score) return right.score - left.score;
      if (left.entry.mustNotMiss !== right.entry.mustNotMiss) {
        return left.entry.mustNotMiss ? -1 : 1;
      }
      return left.entry.nameKo.localeCompare(right.entry.nameKo, "ko");
    })
    .slice(0, maxItems)
    .map<DiseaseShortlistItem>(({ entry }) => ({
      diseaseId: entry.diseaseId,
      nameKo: entry.nameKo,
      nameEn: entry.nameEn,
      aliases: entry.aliases.slice(0, 6),
      keyFindings: entry.supportingFindings.slice(0, 8),
      redFlags: entry.redFlags.slice(0, 5),
      requiredQuestions: entry.requiredQuestions.slice(0, 5)
    }));
}
