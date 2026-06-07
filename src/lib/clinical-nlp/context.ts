import type { ClinicalContext } from "@/types/clinical";

const contextPatterns: Record<ClinicalContext, RegExp[]> = {
  family_history: [
    /가족력/i,
    /아버지|어머니|형제|자매|부친|모친/i,
    /family history|FHx/i
  ],
  hypothesis: [/의심/i, /\br\/o\b/i, /rule\s*out/i, /감별/i, /배제\s*필요/i, /가능성/i],
  test_result: [
    /ECG|EKG|troponin|트로포닌|D-?dimer|디다이머|CXR|CT|CTA|CTPA|TEE|MRI|lab/i,
    /검사|영상|상승|음성|양성|확인|소견/i
  ],
  past_history: [/과거력|병력|이전|예전|수년\s*전|previously|history of|s\/p|PCI|CABG|수술력/i],
  risk_factor: [
    /흡연|당뇨|고혈압|고지혈증|비만|임신|산욕기|장거리|비행|부동|최근\s*수술/i,
    /smok|diabetes|HTN|HLD|pregnan|postpartum|immobil/i
  ],
  current_symptom: [/현재|금일|오늘|내원|호소|시작|발생|동반|ongoing|acute/i],
  unknown: []
};

function matches(patterns: RegExp[], sentence: string) {
  return patterns.some((pattern) => pattern.test(sentence));
}

export function detectClinicalContext(
  sentence: string,
  fallback: ClinicalContext = "unknown"
): ClinicalContext {
  if (matches(contextPatterns.family_history, sentence)) return "family_history";
  if (matches(contextPatterns.hypothesis, sentence)) return "hypothesis";
  if (matches(contextPatterns.test_result, sentence)) return "test_result";
  if (matches(contextPatterns.past_history, sentence)) return "past_history";
  if (matches(contextPatterns.risk_factor, sentence)) return "risk_factor";
  if (matches(contextPatterns.current_symptom, sentence)) return "current_symptom";
  return fallback;
}
