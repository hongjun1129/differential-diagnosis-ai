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

const missing = "미입력";

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
    <section className="h-full min-h-0 overflow-hidden rounded-lg border border-blue-200 bg-white p-2 shadow-soft">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <UserRound className="h-4 w-4" aria-hidden />
          </div>
          <h2 className="text-xs font-extrabold text-blue-950">환자 정보</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          aria-label="입력 초기화"
          title="입력 초기화"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="grid h-[80px] min-h-0 grid-cols-[minmax(0,1fr)_116px] gap-2">
        <div className="grid min-h-0 grid-cols-2 gap-1">
          <label className="min-w-0 text-[10px] font-bold text-slate-500">
            나이
            <input
              value={patient.age}
              onChange={(event) => updatePatient("age", event.target.value)}
              className="mt-0.5 h-5 w-full rounded border border-slate-200 px-1.5 text-[11px] font-bold text-slate-900"
              placeholder={missing}
            />
          </label>
          <label className="min-w-0 text-[10px] font-bold text-slate-500">
            성별
            <input
              value={patient.sex}
              onChange={(event) => updatePatient("sex", event.target.value)}
              className="mt-0.5 h-5 w-full rounded border border-slate-200 px-1.5 text-[11px] font-bold text-slate-900"
              placeholder={missing}
            />
          </label>
          <label className="col-span-2 min-w-0 text-[10px] font-bold text-slate-500">
            주호소
            <input
              value={patient.chiefComplaint}
              onChange={(event) => updatePatient("chiefComplaint", event.target.value)}
              className="mt-0.5 h-5 w-full rounded border border-slate-200 px-1.5 text-[11px] text-slate-900"
              placeholder="확인 필요"
            />
          </label>
          <label className="col-span-2 min-w-0 text-[10px] font-bold text-slate-500">
            증상 시작
            <input
              value={patient.onset}
              onChange={(event) => updatePatient("onset", event.target.value)}
              className="mt-0.5 h-5 w-full rounded border border-slate-200 px-1.5 text-[11px] text-slate-900"
              placeholder="확인 필요"
            />
          </label>
        </div>

        <div className="min-h-0 rounded-md bg-slate-50 px-1.5 py-1">
          <p className="mb-0.5 text-[10px] font-extrabold text-blue-950">
            Vital Signs
          </p>
          <div className="grid gap-0.5">
            {vitalFields.map((field) => (
              <label
                key={field.key}
                className="grid grid-cols-[32px_1fr] items-center gap-1 text-[10px] font-bold text-blue-900"
              >
                {field.label}
                <input
                  value={vitals[field.key]}
                  onChange={(event) => updateVitals(field.key, event.target.value)}
                  className="h-[15px] min-w-0 rounded border border-slate-200 px-1 text-[10px] font-semibold text-slate-800"
                  placeholder="--"
                />
                <span className="sr-only">{field.unit}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
