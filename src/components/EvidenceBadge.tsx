import type { ChecklistSource, ChecklistStateValue } from "@/types/clinical";

type EvidenceBadgeProps = {
  value?: ChecklistStateValue;
};

const sourceLabels: Record<ChecklistSource, string> = {
  manual: "수동 입력",
  rule_parser: "규칙 parser",
  free_text_parser: "자유입력 parser",
  llm_extractor: "LLM 구조화 추출",
  vital_parser: "활력징후 parser",
  lab_parser: "검사 parser",
  test_parser: "검사 parser",
  system: "시스템"
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function EvidenceBadge({ value }: EvidenceBadgeProps) {
  if (!value) return null;

  const manual = value.source === "manual" || value.manuallyOverridden;
  const title = [
    value.evidenceText ? `근거: ${value.evidenceText}` : undefined,
    `출처: ${sourceLabels[value.source]}`,
    value.confidence !== undefined ? `신뢰도: ${value.confidence.toFixed(2)}` : undefined,
    `반영 시각: ${formatUpdatedAt(value.updatedAt)}`
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <span
      className={`shrink-0 rounded-[6px] px-1.5 py-0.5 text-[10px] font-bold ${
        manual ? "bg-slate-100 text-slate-600" : "bg-sky-100 text-sky-700"
      }`}
      title={title}
    >
      {manual ? "수동 입력" : "자동 추출"}
    </span>
  );
}
