"use client";

import { RotateCcw } from "lucide-react";
import { evaluateVitalSigns, type VitalEvaluation } from "@/lib/vitals";
import type { PatientInfo, VitalSigns } from "@/types/clinical";

type TopPatientBarProps = {
  patient: PatientInfo;
  vitals: VitalSigns;
  onPatientChange: (patient: PatientInfo) => void;
  onVitalsChange: (vitals: VitalSigns) => void;
  onReset?: () => void;
};

type VitalKey = keyof VitalSigns;

const vitalLabels: Record<VitalKey, string> = {
  bp: "BP",
  hr: "HR",
  rr: "RR",
  spo2: "SpO2",
  bt: "BT"
};

const vitalPlaceholders: Record<VitalKey, string> = {
  bp: "120/80",
  hr: "80",
  rr: "18",
  spo2: "98%",
  bt: "36.8"
};

function statusText(evaluation: VitalEvaluation) {
  if (evaluation.status === "empty") return "";
  if (evaluation.status === "invalid") return "확인";
  return evaluation.reason ?? (evaluation.status === "normal" ? "정상 범위" : "비정상");
}

function inputTone(evaluation: VitalEvaluation) {
  if (evaluation.status === "empty") {
    return "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";
  }
  if (evaluation.status === "normal") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }
  if (evaluation.status === "invalid") {
    return "border-amber-300 bg-amber-50 text-amber-950";
  }
  return evaluation.severity === "danger"
    ? "border-rose-300 bg-rose-50 text-rose-950"
    : "border-rose-200 bg-rose-50 text-rose-950";
}

function labelTone(evaluation: VitalEvaluation) {
  if (evaluation.status === "empty") return "text-slate-400";
  if (evaluation.status === "normal") return "text-emerald-700";
  if (evaluation.status === "invalid") return "text-amber-700";
  return "text-rose-700";
}

export function TopPatientBar({
  patient,
  vitals,
  onPatientChange,
  onVitalsChange,
  onReset
}: TopPatientBarProps) {
  const evaluations = evaluateVitalSigns(vitals);

  const updatePatient = (key: keyof PatientInfo, value: string | string[]) => {
    onPatientChange({ ...patient, [key]: value });
  };
  const updateVitals = (key: VitalKey, value: string) => {
    onVitalsChange({ ...vitals, [key]: value });
  };

  return (
    <div className="flex min-w-0 flex-wrap items-end gap-2">
      <label className="grid min-w-[120px] max-w-[160px] flex-[1_1_120px] gap-1">
        <span className="text-[10px] font-bold uppercase tracking-normal text-slate-500">
          환자 성명
        </span>
        <input
          value={patient.name ?? ""}
          onChange={(event) => updatePatient("name", event.target.value)}
          className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900"
          placeholder="성명"
          aria-label="환자 성명"
        />
      </label>

      <label className="grid w-[76px] gap-1">
        <span className="text-[10px] font-bold uppercase tracking-normal text-slate-500">
          나이
        </span>
        <input
          value={patient.age}
          onChange={(event) => updatePatient("age", event.target.value)}
          className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900"
          inputMode="numeric"
          placeholder="세"
          aria-label="나이"
        />
      </label>

      <label className="grid w-[96px] gap-1">
        <span className="text-[10px] font-bold uppercase tracking-normal text-slate-500">
          성별
        </span>
        <select
          value={patient.sex}
          onChange={(event) => updatePatient("sex", event.target.value)}
          className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900"
          aria-label="성별"
        >
          <option value="">미상</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
          <option value="기타/미상">기타/미상</option>
        </select>
      </label>

      {(Object.keys(vitalLabels) as VitalKey[]).map((key) => {
        const evaluation = evaluations[key];
        const summary = statusText(evaluation);
        const title = summary || "입력 없음";

        return (
          <label
            key={key}
            className={`grid gap-1 ${key === "bp" ? "w-[112px]" : "w-[82px]"}`}
          >
            <span className="flex min-w-0 items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-normal text-slate-500">
                {vitalLabels[key]}
              </span>
              {summary ? (
                <span className={`truncate text-[9px] font-extrabold ${labelTone(evaluation)}`}>
                  {summary}
                </span>
              ) : null}
            </span>
            <input
              value={vitals[key]}
              onChange={(event) => updateVitals(key, event.target.value)}
              className={`h-9 min-w-0 rounded-md border px-2 text-xs font-semibold transition ${inputTone(evaluation)}`}
              placeholder={vitalPlaceholders[key]}
              aria-label={`${vitalLabels[key]} 입력`}
              title={title}
            />
          </label>
        );
      })}

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mb-0 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
          aria-label="환자 정보와 체크리스트 초기화"
          title="초기화"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
