import { RotateCcw, UserRound } from "lucide-react";
import type { PatientInfo, VitalSigns } from "@/types/clinical";

type PatientSnapshotPanelProps = {
  patient: PatientInfo;
  vitals: VitalSigns;
  onPatientChange: (patient: PatientInfo) => void;
  onVitalsChange: (vitals: VitalSigns) => void;
  onReset: () => void;
};

const vitalFields: Array<{ key: keyof VitalSigns; label: string; unit?: string }> = [
  { key: "bp", label: "BP", unit: "mmHg" },
  { key: "hr", label: "HR", unit: "bpm" },
  { key: "rr", label: "RR", unit: "/min" },
  { key: "spo2", label: "SpO2", unit: "%" },
  { key: "bt", label: "BT", unit: "°C" }
];

export function PatientSnapshotPanel({
  patient,
  vitals,
  onPatientChange,
  onVitalsChange,
  onReset
}: PatientSnapshotPanelProps) {
  const updatePatient = (key: keyof PatientInfo, value: string | string[]) => {
    onPatientChange({ ...patient, [key]: value });
  };

  const updateVitals = (key: keyof VitalSigns, value: string) => {
    onVitalsChange({ ...vitals, [key]: value });
  };

  return (
    <section className="rounded-lg border border-blue-200 bg-white shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[280px_230px_minmax(360px,1fr)]">
        <div className="border-b border-blue-100 p-3 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-blue-900">환자 정보</h2>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="입력 초기화"
              title="입력 초기화"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-[52px_1fr] gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserRound className="h-7 w-7" aria-hidden />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] font-semibold text-slate-500">
                나이
                <input
                  value={patient.age}
                  onChange={(event) => updatePatient("age", event.target.value)}
                  className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-sm font-semibold text-slate-900"
                  placeholder="30"
                />
              </label>
              <label className="text-[11px] font-semibold text-slate-500">
                성별
                <input
                  value={patient.sex}
                  onChange={(event) => updatePatient("sex", event.target.value)}
                  className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-sm font-semibold text-slate-900"
                  placeholder="남"
                />
              </label>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <label className="text-[11px] font-semibold text-slate-500">
              주호소
              <input
                value={patient.chiefComplaint}
                onChange={(event) =>
                  updatePatient("chiefComplaint", event.target.value)
                }
                className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-sm text-slate-900"
                placeholder="흉통"
              />
            </label>
            <label className="text-[11px] font-semibold text-slate-500">
              증상 시작
              <input
                value={patient.onset}
                onChange={(event) => updatePatient("onset", event.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-sm text-slate-900"
                placeholder="24시간 전부터 지속"
              />
            </label>
          </div>
        </div>

        <div className="border-b border-blue-100 p-3 lg:border-b-0 lg:border-r">
          <h2 className="mb-3 text-sm font-bold text-blue-900">Vital Signs</h2>
          <div className="grid gap-1.5">
            {vitalFields.map((field) => (
              <label
                key={field.key}
                className="grid grid-cols-[42px_1fr_44px] items-center gap-2 text-xs"
              >
                <span className="font-bold text-blue-900">{field.label}</span>
                <input
                  value={vitals[field.key]}
                  onChange={(event) => updateVitals(field.key, event.target.value)}
                  className="h-7 rounded-md border border-slate-200 px-2 text-sm text-slate-900"
                />
                <span className="text-[11px] text-slate-400">{field.unit}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-blue-900">
              의사 자유입력
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              서술형 입력
            </span>
          </div>
          <textarea
            value={patient.memo}
            onChange={(event) => updatePatient("memo", event.target.value)}
            className="h-[118px] w-full resize-none rounded-md border border-blue-300 px-3 py-2 text-sm leading-5 text-slate-900"
            placeholder="오전부터 쥐어짜는 흉통, 계단 오를 때 악화. 심전도 ST elevation 없음. Troponin 검사 진행 중."
          />
        </div>
      </div>
    </section>
  );
}
