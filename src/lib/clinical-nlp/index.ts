import { generateChecklistPatches } from "@/lib/clinical-nlp/generateChecklistPatches";
import type { ClinicalTextAnalyzer } from "@/types/clinical";

export { detectAssertion } from "@/lib/clinical-nlp/assertion";
export { detectClinicalContext } from "@/lib/clinical-nlp/context";
export { extractLabsAndTests } from "@/lib/clinical-nlp/extractLabsAndTests";
export { extractVitals } from "@/lib/clinical-nlp/extractVitals";
export { generateChecklistPatches } from "@/lib/clinical-nlp/generateChecklistPatches";
export { matchChecklistRules } from "@/lib/clinical-nlp/matchChecklistRules";
export { normalizeClinicalText } from "@/lib/clinical-nlp/normalizeClinicalText";
export { buildProblemRepresentationFromChecklist } from "@/lib/clinical-nlp/problemRepresentation";
export { resolveConflicts } from "@/lib/clinical-nlp/resolveConflicts";
export { splitClinicalSentences } from "@/lib/clinical-nlp/splitClinicalSentences";

export class RuleBasedClinicalTextAnalyzer implements ClinicalTextAnalyzer {
  analyze(text: string) {
    return generateChecklistPatches(text);
  }
}
