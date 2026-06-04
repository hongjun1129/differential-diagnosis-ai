import { Gauge } from "lucide-react";
import type { VitalSigns } from "@/types/clinical";

type VitalSignsCardProps = {
  vitals: VitalSigns;
  onChange: (vitals: VitalSigns) => void;
};

const fields: Array<{ key: keyof VitalSigns; label: string; suffix?: string }> = [
  { key: "bp", label: "BP" },
  { key: "hr", label: "HR", suffix: "/min" },
  { key: "rr", label: "RR", suffix: "/min" },
  { key: "spo2", label: "SpO2", suffix: "%" },
  { key: "bt", label: "BT", suffix: "°C" }
];

export function VitalSignsCard({ vitals, onChange }: VitalSignsCardProps) {
  const update = (key: keyof VitalSigns, value: string) => {
    onChange({ ...vitals, [key]: value });
  };

  return (
    <section className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Gauge className="h-5 w-5 text-blue-600" aria-hidden />
        <h2 className="text-base font-semibold text-clinical-ink">활력징후</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5">
        {fields.map((field) => (
          <label key={field.key} className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">{field.label}</span>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white">
              <input
                value={vitals[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              />
              {field.suffix ? (
                <span className="pr-2 text-xs text-slate-400">{field.suffix}</span>
              ) : null}
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
