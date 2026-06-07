export function normalizeClinicalText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[，、]/g, ",")
    .replace(/[；]/g, ";")
    .replace(/[ \t\f\v]+/g, " ")
    .trim();
}
