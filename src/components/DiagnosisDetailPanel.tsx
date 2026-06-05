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

function RuleList({
  title,
  icon,
  items,
  emptyText,
  tone
}: {
  title: string;
  icon: React.ReactNode;
  items: ChestPainRule[];
  emptyText: string;
  tone: string;
}) {
  return (
    <section className={`rounded-lg border p-3 ${tone}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        <span className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-bold">
          {items.length}
        </span>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-md bg-white px-2.5 py-2 text-xs leading-5 text-slate-800"
            >
              <p className="font-semibold">{item.labelKo}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {item.effectType} · {item.evidenceLevel}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md bg-white px-2.5 py-2 text-xs leading-5 text-slate-500">
          {emptyText}
        </p>
      )}
    </section>
  );
}

function CompactList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <ul className="mt-2 grid gap-1.5 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md bg-slate-50 px-2.5 py-2 text-xs leading-5 text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DiagnosisDetailPanel({ score }: DiagnosisDetailPanelProps) {
  if (!score) {
    return (
      <aside className="rounded-lg border border-blue-200 bg-white p-4 shadow-soft">
        <p className="text-sm text-slate-500">선택된 감별진단이 없습니다.</p>
      </aside>
    );
  }

  const { diagnosis } = score;
  const tone = evidenceStatusTone[score.evidenceStatus];

  return (
    <aside className="rounded-lg border border-blue-200 bg-white shadow-soft">
      <div className="border-b border-blue-100 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase text-blue-700">
              선택 진단 근거
            </p>
            <h2 className="mt-1 text-lg font-extrabold leading-6 text-slate-950">
              {diagnosis.nameKo}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {diagnosis.description}
            </p>
          </div>
          {score.conflictWarnings.length > 0 ? (
            <AlertTriangle className="h-5 w-5 shrink-0 text-purple-700" aria-hidden />
          ) : (
            <ClipboardCheck className="h-5 w-5 shrink-0 text-blue-700" aria-hidden />
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-md border px-2 py-1 text-xs font-bold ${tone.className}`}>
            {evidenceStatusLabels[score.evidenceStatus]}
          </span>
          <span className={`rounded-md border px-2 py-1 text-xs font-bold ${urgencyTone[diagnosis.urgency]}`}>
            {urgencyLabels[diagnosis.urgency]}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
            {diagnosisCategoryLabels[diagnosis.category]}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
            체크리스트 지지도 {score.likelihoodSupportScore}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
            응급도 {score.urgencyScore}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {score.conflictWarnings.length > 0 ? (
          <section className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs leading-5 text-purple-950">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <h3 className="text-sm font-bold">상충 소견 경고</h3>
            </div>
            {score.conflictWarnings.map((conflict) => (
              <p key={conflict.id}>
                {conflict.messageKo} ({conflict.findingLabels.join(" vs ")})
              </p>
            ))}
          </section>
        ) : null}

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-700" aria-hidden />
            <h3 className="text-sm font-bold text-blue-950">
              왜 이 순위인가
            </h3>
          </div>
          <p className="mt-2 text-xs leading-5 text-blue-950">
            {score.whyRanked}
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-950">
            {score.explanationKo}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <RuleList
            title="이 진단을 지지하는 소견"
            icon={<PlusCircle className="h-4 w-4 text-blue-700" aria-hidden />}
            items={score.supportingFindings}
            emptyText="선택된 지지 근거가 없습니다."
            tone="border-blue-100 bg-blue-50 text-blue-950"
          />
          <RuleList
            title="이 진단과 맞지 않는 소견"
            icon={<MinusCircle className="h-4 w-4 text-emerald-700" aria-hidden />}
            items={score.findingsAgainst}
            emptyText="선택된 반대 근거가 없습니다."
            tone="border-emerald-100 bg-emerald-50 text-emerald-950"
          />
          <RuleList
            title="확정기 근거"
            icon={<ShieldAlert className="h-4 w-4 text-red-700" aria-hidden />}
            items={score.ruleInFindings}
            emptyText="현재 rule-in 확인 소견은 없습니다."
            tone="border-red-100 bg-red-50 text-red-950"
          />
          <RuleList
            title="배제 조건 중 충족된 것"
            icon={<ClipboardCheck className="h-4 w-4 text-slate-700" aria-hidden />}
            items={score.ruleOutFindings}
            emptyText="명시적 배제 조건은 아직 선택되지 않았습니다."
            tone="border-slate-200 bg-slate-50 text-slate-900"
          />
        </div>

        <CompactList
          title="배제 조건 중 아직 부족한 것"
          items={score.ruleOutCriteriaMissing}
        />
        <CompactList
          title="아직 확인되지 않은 핵심 정보"
          items={score.missingKeyData}
        />
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-bold text-slate-900">
            감별에 필요한 추가 정보
          </h3>
          <p className="mt-2 rounded-md bg-slate-50 px-2.5 py-2 text-xs leading-5 text-slate-700">
            {score.nextDiscriminatingInformation}
          </p>
        </section>
        <CompactList title="Red flags" items={diagnosis.redFlags} />

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">
          AI가 진단을 대신하는 것이 아닙니다. 위 내용은 확정 진단이나
          보정된 확률이 아니라, 의료진이 감별진단과 배제 조건을 빠르게 검토하도록
          돕는 규칙 기반 보조 정보입니다.
        </div>
      </div>
    </aside>
  );
}
