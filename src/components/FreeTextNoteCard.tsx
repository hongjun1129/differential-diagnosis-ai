import { NotebookPen } from "lucide-react";
import type { PatientInfo } from "@/types/clinical";

type FreeTextNoteCardProps = {
  patient: PatientInfo;
  onChange: (patient: PatientInfo) => void;
};

export function FreeTextNoteCard({ patient, onChange }: FreeTextNoteCardProps) {
  return (
    <section className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <NotebookPen className="h-5 w-5 text-blue-600" aria-hidden />
        <h2 className="text-base font-semibold text-clinical-ink">자유입력 메모</h2>
      </div>
      <textarea
        value={patient.memo}
        onChange={(event) => onChange({ ...patient, memo: event.target.value })}
        rows={5}
        className="min-h-32 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
      />
    </section>
  );
}
