import {
  AlertTriangle,
  ClipboardCheck,
  MinusCircle,
  PlusCircle,
  ShieldAlert
} from "lucide-react";
import type { DiagnosisScore, FindingRule } from "@/types/clinical";
import {
  diagnosisCategoryLabels,
  statusTone,
  urgencyLabels,
  urgencyTone
} from "@/utils/categoryLabels";

type DiagnosisDetailPanelProps = {
  score?: DiagnosisScore;
};

function EvidenceColumn({
  title,
  icon,
  items,
  emptyText,
  tone
}: {
  title: string;
  icon: React.ReactNode;
  items: FindingRule[];
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
              {item.labelKo}
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
  const sourceNotes = [...score.positiveFindings, ...score.negativeFindings]
    .map((finding) => finding.sourceNote)
    .filter((note): note is string => Boolean(note));

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
          {score.redFlagTriggered ? (
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
          ) : (
            <ClipboardCheck className="h-5 w-5 shrink-0 text-blue-700" aria-hidden />
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`rounded-md border px-2 py-1 text-xs font-bold ${statusTone[score.status].className}`}
          >
            {score.status}
          </span>
          <span
            className={`rounded-md border px-2 py-1 text-xs font-bold ${urgencyTone[diagnosis.urgency]}`}
          >
            {urgencyLabels[diagnosis.urgency]}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
            {diagnosisCategoryLabels[diagnosis.category]}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
            점수 {score.score}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <EvidenceColumn
            title="가능성 상승 근거"
            icon={<PlusCircle className="h-4 w-4 text-red-600" aria-hidden />}
            items={score.positiveFindings}
            emptyText="선택된 체크리스트 중 상승 근거가 없습니다."
            tone="border-red-100 bg-red-50 text-red-900"
          />
          <EvidenceColumn
            title="가능성 감소 근거"
            icon={<MinusCircle className="h-4 w-4 text-emerald-700" aria-hidden />}
            items={score.negativeFindings}
            emptyText="선택된 체크리스트 중 감소 근거가 없습니다."
            tone="border-emerald-100 bg-emerald-50 text-emerald-900"
          />
        </div>

        <CompactList title="아직 확인 필요" items={diagnosis.confirmatoryTests} />
        <CompactList
          title="배제를 위해 필요한 조건"
          items={diagnosis.ruleOutConsiderations}
        />

        {score.redFlagTriggered || diagnosis.redFlags.length > 0 ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-700" aria-hidden />
              <h3 className="text-sm font-bold text-amber-950">red flags</h3>
            </div>
            <ul className="grid gap-1.5 md:grid-cols-2">
              {diagnosis.redFlags.map((item) => (
                <li
                  key={item}
                  className="rounded-md bg-white px-2.5 py-2 text-xs leading-5 text-amber-950"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">
          AI가 진단을 대신하는 것이 아닙니다. 위 내용은 확정 진단이 아니라
          의료진이 감별진단과 배제 조건을 빠르게 검토하도록 돕는 보조 정보입니다.
        </div>

        {sourceNotes.length > 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
            {sourceNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
