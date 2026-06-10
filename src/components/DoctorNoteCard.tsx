import { Sparkles } from "lucide-react";
import type { PatientInfo } from "@/types/clinical";

type DoctorNoteCardProps = {
  patient: PatientInfo;
  onChange: (patient: PatientInfo) => void;
  onAnalyze: () => void | Promise<void>;
  isAnalyzing?: boolean;
};

export function DoctorNoteCard({
  patient,
  onChange,
  onAnalyze,
  isAnalyzing = false
}: DoctorNoteCardProps) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-blue-200 bg-white p-3 shadow-soft">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-extrabold leading-5 text-blue-950">
            의사의 자유입력
          </h2>
          <p className="truncate text-[11px] leading-4 text-slate-500">
            증상, 활력징후, ECG, 검사 결과, 위험인자를 자유롭게 입력하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={patient.memo.trim().length === 0 || isAnalyzing}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-blue-700 px-3 text-[11px] font-bold text-white hover:bg-blue-800 disabled:bg-slate-300"
          title="로컬 규칙 parser와 서버 구조화 추출 결과를 preview로 보여준 뒤 선택 항목만 반영합니다."
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {isAnalyzing ? "분석 중" : "자유입력 분석"}
        </button>
      </div>

      <textarea
        value={patient.memo}
        onChange={(event) => onChange({ ...patient, memo: event.target.value })}
        className="min-h-[150px] w-full flex-1 resize-y rounded-md border border-blue-200 px-3 py-2 text-xs leading-5 text-slate-900 md:min-h-[180px] xl:min-h-[190px]"
        placeholder="예: 55세 남성, 30분 전 갑작스럽게 찢어지는 흉통. 등으로 방사. BP 85/55, HR 124. 호흡곤란은 없음. ECG ST elevation 없음. Troponin 검사 진행 중."
        maxLength={1000}
      />

      <div className="mt-1 text-right text-[10px] font-medium leading-3 text-slate-400">
        {patient.memo.length} / 1000자
      </div>
    </section>
  );
}
