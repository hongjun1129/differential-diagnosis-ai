import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  MinusCircle,
  PlusCircle,
  ShieldAlert,
  Target
} from "lucide-react";
import type { ChestPainRule, DiagnosisEvaluation } from "@/types/clinical";
import {
  diagnosisCategoryLabels,
  evidenceStatusLabels,
  evidenceStatusTone,
  urgencyLabels,
  urgencyTone
} from "@/utils/categoryLabels";

type DiagnosisDetailPanelProps = {
  score?: DiagnosisEvaluation;
};

function DetailSection({
  title,
  count,
  icon,
  defaultOpen,
  children,
  tone = "border-slate-200 bg-white"
}: {
  title: string;
  count?: number;
  icon: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  tone?: string;
}) {
  return (
    <details className={`rounded-lg border ${tone}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2">
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate text-sm font-extrabold">{title}</span>
        </span>
        {count !== undefined ? (
          <span className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-bold">
            {count}
          </span>
        ) : null}
      </summary>
      <div className="border-t border-current/10 px-3 py-2">{children}</div>
    </details>
  );
}

function RuleList({
  items,
  emptyText
}: {
  items: ChestPainRule[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-md bg-white/80 px-2.5 py-2 text-xs leading-5 text-slate-500">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="grid gap-1.5">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-md bg-white/80 px-2.5 py-2 text-xs leading-5 text-slate-800"
        >
          <p className="font-semibold">{item.labelKo}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {item.effectType} · {item.evidenceLevel}
          </p>
        </li>
      ))}
    </ul>
  );
}

function TextList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return (
      <p className="rounded-md bg-white/80 px-2.5 py-2 text-xs leading-5 text-slate-500">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="grid gap-1.5 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md bg-white/80 px-2.5 py-2 text-xs leading-5 text-slate-700"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DiagnosisDetailPanel({ score }: DiagnosisDetailPanelProps) {
  if (!score) {
    return (
      <aside className="flex h-full min-h-[360px] items-center justify-center rounded-lg border border-blue-200 bg-white p-4 shadow-soft xl:min-h-0">
        <p className="text-sm text-slate-500">선택된 감별진단이 없습니다.</p>
      </aside>
    );
  }

  const { diagnosis } = score;
  const tone = evidenceStatusTone[score.evidenceStatus];

  return (
    <aside className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-lg border border-blue-200 bg-white shadow-soft xl:min-h-0">
      <div className="sticky top-0 z-10 shrink-0 border-b border-blue-100 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase text-blue-700">
              선택 진단 근거
            </p>
            <h2 className="mt-0.5 truncate text-lg font-extrabold leading-6 text-slate-950">
              {diagnosis.nameKo}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
              {diagnosis.description}
            </p>
          </div>
          {score.conflictWarnings.length > 0 ? (
            <AlertTriangle className="h-5 w-5 shrink-0 text-purple-700" aria-hidden />
          ) : (
            <ClipboardCheck className="h-5 w-5 shrink-0 text-blue-700" aria-hidden />
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            className={`rounded-md border px-2 py-1 text-[11px] font-bold ${tone.className}`}
          >
            {evidenceStatusLabels[score.evidenceStatus]}
          </span>
          <span
            className={`rounded-md border px-2 py-1 text-[11px] font-bold ${urgencyTone[diagnosis.urgency]}`}
          >
            {urgencyLabels[diagnosis.urgency]}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
            {diagnosisCategoryLabels[diagnosis.category]}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
            지지도 {score.likelihoodSupportScore}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
            응급도 {score.urgencyScore}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {score.conflictWarnings.length > 0 ? (
          <DetailSection
            title="상충 소견 경고"
            count={score.conflictWarnings.length}
            icon={<AlertTriangle className="h-4 w-4 text-purple-700" aria-hidden />}
            defaultOpen
            tone="border-purple-200 bg-purple-50 text-purple-950"
          >
            <div className="grid gap-1 text-xs leading-5">
              {score.conflictWarnings.map((conflict) => (
                <p key={conflict.id}>
                  {conflict.messageKo} ({conflict.findingLabels.join(" vs ")})
                </p>
              ))}
            </div>
          </DetailSection>
        ) : null}

        <DetailSection
          title="왜 이 순위인가 / 현재 상태"
          icon={<Target className="h-4 w-4 text-blue-700" aria-hidden />}
          defaultOpen
          tone="border-blue-100 bg-blue-50 text-blue-950"
        >
          <p className="text-xs leading-5">{score.whyRanked}</p>
          <p className="mt-1 text-xs leading-5">{score.explanationKo}</p>
          <p className="mt-2 rounded-md bg-white/80 px-2.5 py-2 text-xs leading-5">
            다음 감별 정보: {score.nextDiscriminatingInformation}
          </p>
        </DetailSection>

        <DetailSection
          title="상승 근거"
          count={score.supportingFindings.length}
          icon={<PlusCircle className="h-4 w-4 text-blue-700" aria-hidden />}
          defaultOpen
          tone="border-blue-100 bg-blue-50 text-blue-950"
        >
          <RuleList
            items={score.supportingFindings}
            emptyText="선택된 지지 근거가 없습니다."
          />
        </DetailSection>

        <DetailSection
          title="반대 / 감소 소견"
          count={score.findingsAgainst.length}
          icon={<MinusCircle className="h-4 w-4 text-emerald-700" aria-hidden />}
          tone="border-emerald-100 bg-emerald-50 text-emerald-950"
        >
          <RuleList
            items={score.findingsAgainst}
            emptyText="선택된 반대 근거가 없습니다."
          />
        </DetailSection>

        <DetailSection
          title="아직 확인되지 않은 핵심 정보"
          count={score.missingKeyData.length}
          icon={<ClipboardCheck className="h-4 w-4 text-slate-700" aria-hidden />}
          defaultOpen
          tone="border-slate-200 bg-slate-50 text-slate-900"
        >
          <TextList
            items={score.missingKeyData}
            emptyText="현재 누락된 핵심 정보가 없습니다."
          />
        </DetailSection>

        <DetailSection
          title="확정 근거 / Rule-in"
          count={score.ruleInFindings.length}
          icon={<ShieldAlert className="h-4 w-4 text-red-700" aria-hidden />}
          tone="border-red-100 bg-red-50 text-red-950"
        >
          <RuleList
            items={score.ruleInFindings}
            emptyText="현재 rule-in 확인 소견은 없습니다."
          />
        </DetailSection>

        <DetailSection
          title="배제 조건"
          count={score.ruleOutFindings.length}
          icon={<ClipboardCheck className="h-4 w-4 text-slate-700" aria-hidden />}
        >
          <div className="grid gap-2">
            <RuleList
              items={score.ruleOutFindings}
              emptyText="명시적 배제 조건은 아직 선택되지 않았습니다."
            />
            <TextList
              items={score.ruleOutCriteriaMissing}
              emptyText="추가 배제 조건이 없습니다."
            />
          </div>
        </DetailSection>

        <DetailSection
          title="Red flags"
          count={diagnosis.redFlags.length}
          icon={<AlertTriangle className="h-4 w-4 text-red-700" aria-hidden />}
          defaultOpen={score.redFlagFindings.length > 0}
          tone="border-red-100 bg-red-50 text-red-950"
        >
          <TextList items={diagnosis.redFlags} emptyText="등록된 red flag가 없습니다." />
        </DetailSection>

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">
          AI가 진단을 대신하는 것이 아닙니다. 위 내용은 확정 진단이나 보정된
          확률이 아니라, 의료진이 감별진단과 배제 조건을 빠르게 검토하도록 돕는
          규칙 기반 보조 정보입니다.
        </div>
      </div>
    </aside>
  );
}
