import type {
  ChecklistNlpRule,
  ChecklistPatch,
  ChecklistPatchConflict,
  ClinicalContext
} from "@/types/clinical";

export type AssertionStatus = "present" | "absent" | "uncertain";

export type ClinicalSentence = {
  text: string;
  index: number;
  start: number;
  end: number;
};

export type RuleMatchKind = "regex" | "synonym" | "fuzzy";

export type RuleMatch = {
  rule: ChecklistNlpRule;
  sentence: ClinicalSentence;
  matchText: string;
  start: number;
  end: number;
  confidence: number;
  kind: RuleMatchKind;
};

export type ResolvedChecklistPatches = {
  patches: ChecklistPatch[];
  conflicts: ChecklistPatchConflict[];
};

export type ContextPatternSet = Record<ClinicalContext, RegExp[]>;

export type { ChecklistPatch, ChecklistPatchConflict };
