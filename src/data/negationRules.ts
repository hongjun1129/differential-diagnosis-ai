export const negativeAssertionPatterns = [
  /없(?:음|다|고|으며|어|습니다)?/i,
  /부인(?:함|합니다)?/i,
  /denies?/i,
  /\bno\b/i,
  /\bnot\b/i,
  /negative/i,
  /관찰되지\s*않음/i,
  /보이지\s*않음/i,
  /동반되지\s*않음/i,
  /해당\s*없음/i,
  /\(-\)/,
  /음성/i,
  /정상/i
];

export const positiveAssertionPatterns = [
  /있(?:음|다|고|으며|어|습니다)?/i,
  /동반/i,
  /호소/i,
  /관찰/i,
  /보임/i,
  /확인/i,
  /positive/i,
  /\(\+\)/,
  /양성/i,
  /상승/i,
  /증가/i,
  /elevated/i,
  /\bhigh\b/i
];

export const uncertainAssertionPatterns = [
  /의심/i,
  /가능(?:성)?/i,
  /배제\s*필요/i,
  /\br\/o\b/i,
  /rule\s*out/i,
  /\?/,
  /uncertain/i,
  /cannot\s*exclude/i,
  /감별\s*필요/i
];
