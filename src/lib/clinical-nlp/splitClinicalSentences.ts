import { normalizeClinicalText } from "@/lib/clinical-nlp/normalizeClinicalText";
import type { ClinicalSentence } from "@/lib/clinical-nlp/types";

function isDigit(value: string | undefined) {
  return Boolean(value && /\d/.test(value));
}

function isBoundary(text: string, index: number) {
  const char = text[index];
  if (char === "\n" || char === ";" || char === "!" || char === "?" || char === "。") {
    return true;
  }

  if (char !== ".") return false;
  return !(isDigit(text[index - 1]) && isDigit(text[index + 1]));
}

export function splitClinicalSentences(text: string): ClinicalSentence[] {
  const normalized = normalizeClinicalText(text);
  const sentences: ClinicalSentence[] = [];
  let start = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    if (!isBoundary(normalized, index)) continue;
    const sentence = normalized.slice(start, index).trim();
    if (sentence) {
      const leadingSpace = normalized.slice(start).search(/\S/);
      const sentenceStart = start + Math.max(leadingSpace, 0);
      sentences.push({
        text: sentence,
        index: sentences.length,
        start: sentenceStart,
        end: sentenceStart + sentence.length
      });
    }
    start = index + 1;
  }

  const tail = normalized.slice(start).trim();
  if (tail) {
    const leadingSpace = normalized.slice(start).search(/\S/);
    const sentenceStart = start + Math.max(leadingSpace, 0);
    sentences.push({
      text: tail,
      index: sentences.length,
      start: sentenceStart,
      end: sentenceStart + tail.length
    });
  }

  return sentences;
}
