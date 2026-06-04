import { AlertTriangle, ClipboardList, FileSearch, ShieldCheck } from "lucide-react";
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

function FindingList({
  title,
  items,
  emptyText
}: {
  title: string;
  items: FindingRule[];
  emptyText: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-clinical-ink">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-700"
            >
              {item.labelKo}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-500">
          {emptyText}
        </p>
      )}
    </section>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-clinical-ink">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-slate-700"
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
      <aside className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
        <p className="text-sm text-slate-500">선택된 감별진단이 없습니다.</p>
      </aside>
    );
  }

  const { diagnosis } = score;
  const sourceNotes = [...score.positiveFindings, ...score.negativeFindings]
    .map((finding) => finding.sourceNote)
    .filter((note): note is string => Boolean(note));

  return (
    <aside className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-blue-600">
            {diagnosis.code}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-6 text-clinical-ink">
            {diagnosis.nameKo}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {diagnosis.description}
          </p>
        </div>
        {score.redFlagTriggered ? (
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
        ) : (
          <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${statusTone[score.status].className}`}>
          {score.status}
        </span>
        <span className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${urgencyTone[diagnosis.urgency]}`}>
          {urgencyLabels[diagnosis.urgency]}
        </span>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
          점수 {score.score}
        </span>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
          {diagnosisCategoryLabels[diagnosis.category]}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs leading-5 text-blue-900">
        AI가 진단을 대신하는 것이 아닙니다. 이 패널은 가능성 상승/감소와
        배제를 위해 필요한 조건을 정리하는 보조 화면입니다.
      </div>

      <div className="mt-5 space-y-5">
        <FindingList
          title="가능성 상승 근거"
          items={score.positiveFindings}
          emptyText="선택된 소견 중 이 감별진단을 올리는 근거가 없습니다."
        />
        <FindingList
          title="가능성 감소 근거"
          items={score.negativeFindings}
          emptyText="선택된 소견 중 이 감별진단을 낮추는 근거가 없습니다."
        />
        <TextList title="핵심 감별 포인트" items={diagnosis.keyDifferentiators} />
        <TextList title="권장 확인 항목" items={diagnosis.confirmatoryTests} />
        <TextList title="아직 배제되지 않은 이유" items={diagnosis.ruleOutConsiderations} />
        <TextList title="red flags" items={diagnosis.redFlags} />

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-500" aria-hidden />
            <h3 className="text-sm font-semibold text-clinical-ink">source note</h3>
          </div>
          <div className="mt-2 space-y-2 text-sm leading-5 text-slate-600">
            {sourceNotes.length > 0 ? (
              sourceNotes.map((note) => <p key={note}>{note}</p>)
            ) : (
              <p>
                진단 지식은 `src/data/diagnoses.ts`, 소견 가중치는
                `src/data/findingRules.ts`의 편집 가능한 규칙에서 계산됩니다.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-amber-700" aria-hidden />
            <h3 className="text-sm font-semibold text-amber-900">표현 원칙</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            “확인을 위한 검사”, “배제를 위해 필요한 조건”, “의료진 판단 필요”로
            표현하며 치료 권고 또는 최종 진단 주장을 생성하지 않습니다.
          </p>
        </section>
      </div>
    </aside>
  );
}
