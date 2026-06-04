import { UserRound } from "lucide-react";
import type { PatientInfo } from "@/types/clinical";

type PatientInfoCardProps = {
  patient: PatientInfo;
  onChange: (patient: PatientInfo) => void;
};

export function PatientInfoCard({ patient, onChange }: PatientInfoCardProps) {
  const update = (key: keyof PatientInfo, value: string | string[]) => {
    onChange({ ...patient, [key]: value });
  };

  return (
    <section className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <UserRound className="h-5 w-5 text-blue-600" aria-hidden />
        <h2 className="text-base font-semibold text-clinical-ink">환자정보</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">나이</span>
          <input
            value={patient.age}
            onChange={(event) => update("age", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">성별</span>
          <input
            value={patient.sex}
            onChange={(event) => update("sex", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 block space-y-1 text-sm">
        <span className="font-medium text-slate-700">주호소</span>
        <input
          value={patient.chiefComplaint}
          onChange={(event) => update("chiefComplaint", event.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block space-y-1 text-sm">
        <span className="font-medium text-slate-700">증상 시작 시점</span>
        <input
          value={patient.onset}
          onChange={(event) => update("onset", event.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block space-y-1 text-sm">
        <span className="font-medium text-slate-700">과거력/risk factors</span>
        <input
          value={patient.riskFactors.join(", ")}
          onChange={(event) =>
            update(
              "riskFactors",
              event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
    </section>
  );
}
