import {
  negativeAssertionPatterns,
  positiveAssertionPatterns,
  uncertainAssertionPatterns
} from "@/data/negationRules";
import type { AssertionStatus } from "@/lib/clinical-nlp/types";

type MatchRange = {
  start: number;
  end: number;
};

function hasAny(patterns: RegExp[], text: string) {
  return patterns.some((pattern) => pattern.test(text));
}

export function detectAssertion(
  sentence: string,
  matchRange: MatchRange
): AssertionStatus {
  const before = sentence.slice(Math.max(0, matchRange.start - 24), matchRange.start);
  const after = sentence.slice(matchRange.end, Math.min(sentence.length, matchRange.end + 28));
  const around = sentence.slice(
    Math.max(0, matchRange.start - 24),
    Math.min(sentence.length, matchRange.end + 28)
  );

  const uncertain = hasAny(uncertainAssertionPatterns, around) || hasAny(uncertainAssertionPatterns, sentence);
  const negative = hasAny(negativeAssertionPatterns, around) || hasAny(negativeAssertionPatterns, after);
  const positive = hasAny(positiveAssertionPatterns, around) || hasAny(positiveAssertionPatterns, after);

  if (uncertain && !positive) return "uncertain";
  if (negative) return "absent";
  if (positive) return "present";
  if (hasAny(negativeAssertionPatterns, before)) return "absent";
  return "present";
}
