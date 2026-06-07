import { detectAssertion } from "@/lib/clinical-nlp/assertion";
import { detectClinicalContext } from "@/lib/clinical-nlp/context";
import { splitClinicalSentences } from "@/lib/clinical-nlp/splitClinicalSentences";
import type { ClinicalSentence } from "@/lib/clinical-nlp/types";
import type { ChecklistPatch, ChecklistSource } from "@/types/clinical";

type TestRule = {
  itemId: string;
  pattern: RegExp;
  source: ChecklistSource;
  reason: string;
  redFlag?: boolean;
  confidence?: number;
};

const testRules: TestRule[] = [
  {
    itemId: "L61",
    pattern: /(troponin|트로포닌|TnI|TnT).{0,18}(상승|양성|증가|high|elevated|positive|음성|negative|정상)/i,
    source: "lab_parser",
    reason: "troponin 표현을 검사값 후보로 인식했습니다.",
    confidence: 0.93
  },
  {
    itemId: "L67",
    pattern: /(D-?dimer|d\s*dimer|디다이머).{0,18}(상승|양성|증가|elevated|positive|음성|negative|정상|\d{3,})/i,
    source: "lab_parser",
    reason: "D-dimer 표현을 검사값 후보로 인식했습니다.",
    confidence: 0.9
  },
  {
    itemId: "E50",
    pattern: /(?:ECG|EKG)?.{0,12}ST\s*(?:상승|elevation|분절\s*상승)|\bSTE\b|STEMI/i,
    source: "test_parser",
    reason: "ST elevation 표현을 ECG 후보로 인식했습니다.",
    redFlag: true,
    confidence: 0.94
  },
  {
    itemId: "E52",
    pattern: /ST\s*(?:depression|하강)|T\s*wave\s*inversion|T파\s*역전|T\s*inversion/i,
    source: "test_parser",
    reason: "ST depression 또는 T-wave inversion 표현을 ECG 후보로 인식했습니다.",
    confidence: 0.92
  },
  {
    itemId: "E156",
    pattern: /(?:new|새|신규).{0,8}(?:LBBB|좌각차단)|new\s*LBBB/i,
    source: "test_parser",
    reason: "new LBBB 표현을 ECG 후보로 인식했습니다.",
    redFlag: true,
    confidence: 0.9
  },
  {
    itemId: "L70",
    pattern: /(WBC|CRP|백혈구|염증수치).{0,18}(상승|증가|high|elevated|positive)/i,
    source: "lab_parser",
    reason: "WBC/CRP 상승 표현을 검사값 후보로 인식했습니다.",
    confidence: 0.88
  },
  {
    itemId: "T102",
    pattern: /(CXR|흉부\s*X선|CT).{0,20}(pneumothorax|기흉)|pneumothorax/i,
    source: "test_parser",
    reason: "기흉 영상 소견을 후보로 인식했습니다.",
    redFlag: true,
    confidence: 0.92
  },
  {
    itemId: "T105",
    pattern: /(CXR|흉부\s*X선|CT).{0,20}(consolidation|침윤|pneumonia|폐렴)/i,
    source: "test_parser",
    reason: "폐 침윤/폐렴 영상 소견을 후보로 인식했습니다.",
    confidence: 0.9
  },
  {
    itemId: "T156",
    pattern: /widened\s*mediastinum|종격동\s*확대/i,
    source: "test_parser",
    reason: "widened mediastinum 소견을 후보로 인식했습니다.",
    redFlag: true,
    confidence: 0.9
  },
  {
    itemId: "T93",
    pattern: /(CTA|TEE|MRI|CT).{0,24}(dissection|대동맥\s*박리|intimal\s*flap|flap)/i,
    source: "test_parser",
    reason: "대동맥 박리 영상 확인 표현을 후보로 인식했습니다.",
    redFlag: true,
    confidence: 0.95
  },
  {
    itemId: "T98",
    pattern: /(CTPA|CT|영상).{0,24}(PE|폐색전|pulmonary\s*embol)/i,
    source: "test_parser",
    reason: "폐색전증 영상 확인 표현을 후보로 인식했습니다.",
    redFlag: true,
    confidence: 0.94
  }
];

function numericDimerPatch(sentence: ClinicalSentence): ChecklistPatch | undefined {
  const match = /(D-?dimer|d\s*dimer|디다이머)\s*:?\s*(\d{3,6})/i.exec(sentence.text);
  if (!match || match.index === undefined) return undefined;
  const value = Number(match[2]);
  if (Number.isNaN(value) || value < 500) return undefined;
  return {
    itemId: "L67",
    status: "present",
    source: "lab_parser",
    evidenceText: match[0],
    confidence: 0.82,
    context: "test_result",
    reason: "D-dimer 숫자가 보수적 양성 기준 후보로 인식되었습니다.",
    sentenceIndex: sentence.index,
    start: sentence.start + match.index,
    end: sentence.start + match.index + match[0].length,
    requiresConfirmation: true
  };
}

function makePatch(rule: TestRule, sentence: ClinicalSentence): ChecklistPatch | undefined {
  const match = new RegExp(rule.pattern.source, rule.pattern.flags.replace("g", "")).exec(sentence.text);
  if (!match || match.index === undefined) return undefined;

  const assertion = detectAssertion(sentence.text, {
    start: match.index,
    end: match.index + match[0].length
  });
  const context = detectClinicalContext(sentence.text, "test_result");
  const uncertain = assertion === "uncertain" || context === "hypothesis";
  const status = uncertain ? "unknown" : assertion;

  return {
    itemId: rule.itemId,
    status,
    source: rule.source,
    evidenceText: sentence.text,
    confidence: rule.confidence ?? 0.9,
    context,
    reason: uncertain ? `${rule.reason} 의심/가설 표현이어서 확인이 필요합니다.` : rule.reason,
    negated: assertion === "absent",
    sentenceIndex: sentence.index,
    start: sentence.start + match.index,
    end: sentence.start + match.index + match[0].length,
    isRedFlag: rule.redFlag,
    requiresConfirmation: Boolean(rule.redFlag || uncertain)
  };
}

export function extractLabsAndTests(text: string): ChecklistPatch[] {
  const patches: ChecklistPatch[] = [];
  const sentences = splitClinicalSentences(text);

  for (const sentence of sentences) {
    const dimerPatch = numericDimerPatch(sentence);
    if (dimerPatch) patches.push(dimerPatch);

    for (const rule of testRules) {
      const patch = makePatch(rule, sentence);
      if (patch) patches.push(patch);
    }
  }

  return patches;
}
