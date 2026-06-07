import { checklistNlpRules } from "@/data/checklistNlpRules";
import { normalizeClinicalText } from "@/lib/clinical-nlp/normalizeClinicalText";
import { splitClinicalSentences } from "@/lib/clinical-nlp/splitClinicalSentences";
import type { ClinicalSentence, RuleMatch } from "@/lib/clinical-nlp/types";
import type { ChecklistNlpRule } from "@/types/clinical";

function normalizedLower(text: string) {
  return normalizeClinicalText(text).toLocaleLowerCase("ko");
}

function levenshtein(left: string, right: string) {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);
  for (let index = 1; index <= right.length; index += 1) rows[0][index] = index;

  for (let row = 1; row <= left.length; row += 1) {
    for (let col = 1; col <= right.length; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      rows[row][col] = Math.min(
        rows[row - 1][col] + 1,
        rows[row][col - 1] + 1,
        rows[row - 1][col - 1] + cost
      );
    }
  }

  return rows[left.length][right.length];
}

function similarity(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length);
  if (maxLength === 0) return 1;
  return 1 - levenshtein(left, right) / maxLength;
}

function matchRegex(rule: ChecklistNlpRule, sentence: ClinicalSentence): RuleMatch | undefined {
  for (const pattern of rule.patterns) {
    const flags = pattern.flags.replace("g", "");
    const match = new RegExp(pattern.source, flags).exec(sentence.text);
    if (!match || match.index === undefined) continue;
    return {
      rule,
      sentence,
      matchText: match[0],
      start: sentence.start + match.index,
      end: sentence.start + match.index + match[0].length,
      confidence: rule.redFlag ? 0.92 : 0.94,
      kind: "regex"
    };
  }
  return undefined;
}

function matchSynonym(rule: ChecklistNlpRule, sentence: ClinicalSentence): RuleMatch | undefined {
  const lowered = normalizedLower(sentence.text);
  for (const synonym of rule.synonyms) {
    const loweredSynonym = normalizedLower(synonym);
    const index = lowered.indexOf(loweredSynonym);
    if (index < 0) continue;
    return {
      rule,
      sentence,
      matchText: sentence.text.slice(index, index + synonym.length),
      start: sentence.start + index,
      end: sentence.start + index + synonym.length,
      confidence: rule.redFlag ? 0.84 : 0.86,
      kind: "synonym"
    };
  }
  return undefined;
}

function matchFuzzy(rule: ChecklistNlpRule, sentence: ClinicalSentence): RuleMatch | undefined {
  const tokens = normalizedLower(sentence.text)
    .split(/[,\s/]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

  let best: { token: string; score: number } | undefined;
  for (const token of tokens) {
    for (const synonym of rule.synonyms) {
      const normalizedSynonym = normalizedLower(synonym).replace(/\s+/g, "");
      if (normalizedSynonym.length < 4) continue;
      const score = similarity(token, normalizedSynonym);
      if (score >= 0.82 && (!best || score > best.score)) {
        best = { token, score };
      }
    }
  }

  if (!best) return undefined;
  const index = normalizedLower(sentence.text).indexOf(best.token);
  if (index < 0) return undefined;

  return {
    rule,
    sentence,
    matchText: sentence.text.slice(index, index + best.token.length),
    start: sentence.start + index,
    end: sentence.start + index + best.token.length,
    confidence: Math.max(0.65, Math.min(0.78, best.score - 0.08)),
    kind: "fuzzy"
  };
}

export function matchChecklistRules(text: string): RuleMatch[] {
  const sentences = splitClinicalSentences(text);
  const matches = new Map<string, RuleMatch>();

  for (const sentence of sentences) {
    for (const rule of checklistNlpRules) {
      const match =
        matchRegex(rule, sentence) ?? matchSynonym(rule, sentence) ?? matchFuzzy(rule, sentence);
      if (!match || match.confidence < rule.previewThreshold) continue;

      const key = `${rule.itemId}:${sentence.index}`;
      const current = matches.get(key);
      if (!current || match.confidence > current.confidence) {
        matches.set(key, match);
      }
    }
  }

  return [...matches.values()];
}
