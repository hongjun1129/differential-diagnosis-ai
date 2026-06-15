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

const vitalUnits: Record<VitalKey, string> = {
  bp: "mmHg",
  hr: "bpm",
  rr: "/min",
  spo2: "%",
  bt: "C"
};

const vitalPlaceholders: Record<VitalKey, string> = {
  bp: "120/80",
  hr: "80",
  rr: "18",
  spo2: "98",
  bt: "36.8"
};

const inputBase =
  "h-9 min-w-0 rounded-[7px] border px-2 text-xs font-semibold shadow-inner transition placeholder:text-slate-500";

const darkInput =
  "border-[#2a3548] bg-[#1b2536] text-slate-100 focus:border-blue-400";

function statusText(evaluation: VitalEvaluation) {
  if (evaluation.status === "empty") return "";
  if (evaluation.status === "invalid") return "확인";
  return evaluation.reason ?? (evaluation.status === "normal" ? "정상 범위" : "비정상");
}

function inputTone(evaluation: VitalEvaluation) {
  if (evaluation.status === "empty") return darkInput;
  if (evaluation.status === "normal") {
    return "border-emerald-500/40 bg-emerald-950/30 text-emerald-50";
  }
  if (evaluation.status === "invalid") {
    return "border-amber-500/50 bg-amber-950/30 text-amber-50";
  }
  return evaluation.severity === "danger"
    ? "border-red-400/70 bg-red-950/40 text-red-50"
    : "border-orange-400/60 bg-orange-950/35 text-orange-50";
}

function labelTone(evaluation: VitalEvaluation) {
  if (evaluation.status === "empty") return "text-slate-500";
  if (evaluation.status === "normal") return "text-emerald-300";
  if (evaluation.status === "invalid") return "text-amber-300";
  return evaluation.severity === "danger" ? "text-red-300" : "text-orange-300";
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
    <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:items-end xl:gap-3">
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-[minmax(110px,1fr)_72px_92px_minmax(120px,1.1fr)_minmax(120px,1.1fr)]">
        <label className="grid min-w-0 gap-1">
          <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
            환자 성명
          </span>
          <input
            value={patient.name ?? ""}
            onChange={(event) => updatePatient("name", event.target.value)}
            className={`${inputBase} ${darkInput}`}
            placeholder="성명"
            aria-label="환자 성명"
          />
        </label>

        <label className="grid min-w-0 gap-1">
          <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
            나이
          </span>
          <input
            value={patient.age}
            onChange={(event) => updatePatient("age", event.target.value)}
            className={`${inputBase} ${darkInput}`}
            inputMode="numeric"
            placeholder="세"
            aria-label="나이"
          />
        </label>

        <label className="grid min-w-0 gap-1">
          <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
            성별
          </span>
          <select
            value={patient.sex}
            onChange={(event) => updatePatient("sex", event.target.value)}
            className={`${inputBase} ${darkInput}`}
            aria-label="성별"
          >
            <option value="">미상</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="기타/미상">기타/미상</option>
          </select>
        </label>

        <label className="grid min-w-0 gap-1">
          <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
            주호소
          </span>
          <input
            value={patient.chiefComplaint}
            onChange={(event) =>
              updatePatient("chiefComplaint", event.target.value)
            }
            className={`${inputBase} ${darkInput}`}
            placeholder="흉통"
            aria-label="주호소"
          />
        </label>

        <label className="grid min-w-0 gap-1">
          <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
            발병 시점
          </span>
          <input
            value={patient.onset}
            onChange={(event) => updatePatient("onset", event.target.value)}
            className={`${inputBase} ${darkInput}`}
            placeholder="2시간 전"
            aria-label="발병 시점"
          />
        </label>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-2 border-slate-700/80 xl:border-l xl:pl-3">
        {(Object.keys(vitalLabels) as VitalKey[]).map((key) => {
          const evaluation = evaluations[key];
          const summary = statusText(evaluation);
          const title = summary || "입력 없음";

          return (
            <label
              key={key}
              className={`grid gap-1 ${key === "bp" ? "w-[118px]" : "w-[78px]"}`}
            >
              <span className="flex min-w-0 items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
                  {vitalLabels[key]}
                </span>
                <span className="truncate text-[9px] font-bold text-slate-500">
                  {vitalUnits[key]}
                </span>
              </span>
              <span className="relative block">
                <input
                  value={vitals[key]}
                  onChange={(event) => updateVitals(key, event.target.value)}
                  className={`${inputBase} w-full pr-2 ${inputTone(evaluation)}`}
                  placeholder={vitalPlaceholders[key]}
                  aria-label={`${vitalLabels[key]} 입력`}
                  title={title}
                />
              </span>
              {summary ? (
                <span className={`truncate text-[9px] font-extrabold ${labelTone(evaluation)}`}>
                  {summary}
                </span>
              ) : null}
            </label>
          );
        })}

        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-[#2a3548] bg-[#1b2536] text-slate-300 hover:border-blue-400 hover:text-white"
            aria-label="환자 정보와 체크리스트 초기화"
            title="초기화"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
