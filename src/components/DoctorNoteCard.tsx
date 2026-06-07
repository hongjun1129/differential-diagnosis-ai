import { Sparkles } from "lucide-react";
import type { PatientInfo } from "@/types/clinical";

type DoctorNoteCardProps = {
  patient: PatientInfo;
  onChange: (patient: PatientInfo) => void;
  onAnalyze: () => void;
};

export function DoctorNoteCard({ patient, onChange, onAnalyze }: DoctorNoteCardProps) {
  return (
    <section className="h-full min-h-0 overflow-hidden rounded-lg border border-blue-200 bg-white p-2 shadow-soft">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="text-xs font-extrabold leading-4 text-blue-950">
          의사 자유입력
        </h2>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={patient.memo.trim().length === 0}
          className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md bg-blue-700 px-2 text-[10px] font-bold text-white hover:bg-blue-800"
          title="외부 API 전송 없이 브라우저 안에서 규칙 기반으로 분석합니다."
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          자유입력 분석
        </button>
      </div>
      <textarea
        value={patient.memo}
        onChange={(event) => onChange({ ...patient, memo: event.target.value })}
        className="h-12 w-full resize-none rounded-md border border-blue-200 px-2 py-1 text-xs leading-4 text-slate-900"
        placeholder="쥐어짜는 흉통, 운동 시 악화, ECG/검사 정보 등 의사 메모"
      />
      <div className="text-right text-[10px] font-medium leading-3 text-slate-400">
        {patient.memo.length} / 1000자
      </div>
    </section>
  );
}
