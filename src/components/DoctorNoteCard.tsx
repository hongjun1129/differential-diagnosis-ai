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
    <section className="flex h-full min-h-[240px] flex-col overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] xl:min-h-0">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-bold leading-5 text-slate-900">
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
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-[8px] border border-blue-600 bg-gradient-to-b from-blue-500 to-blue-700 px-3 text-[11px] font-bold text-white shadow-[0_2px_6px_rgba(37,99,235,0.28)] hover:brightness-95 disabled:border-slate-300 disabled:bg-slate-300 disabled:shadow-none"
          title="로컬 규칙 parser와 서버 구조화 추출 결과를 preview로 보여준 뒤 선택 항목만 반영합니다."
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {isAnalyzing ? "분석 중" : "자유입력 분석"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <textarea
          value={patient.memo}
          onChange={(event) => onChange({ ...patient, memo: event.target.value })}
          className="min-h-[128px] w-full flex-1 resize-y rounded-[9px] border border-slate-200 bg-[#fcfcfd] px-3 py-2 text-xs leading-6 text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-blue-400 xl:min-h-0"
          placeholder="예: 55세 남성, 30분 전 갑작스러운 흉통. 등으로 방사. 위험인자, ECG, troponin 등 감별 단서를 자유롭게 기록."
          maxLength={1000}
        />

        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold leading-3 text-slate-400">
          <span>AI 반영 전 의료진 확인 필요</span>
          <span>{patient.memo.length} / 1000자</span>
        </div>
      </div>
    </section>
  );
}
