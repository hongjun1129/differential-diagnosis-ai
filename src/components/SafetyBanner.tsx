import { ShieldAlert } from "lucide-react";

export function SafetyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex gap-2 rounded-md border border-red-200 bg-red-50 text-red-950 ${
        compact ? "px-2 py-1 text-[11px]" : "px-3 py-2 text-xs"
      }`}
    >
      <ShieldAlert
        className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} mt-0.5 shrink-0 text-red-700`}
        aria-hidden
      />
      <p className={compact ? "truncate" : "leading-5"}>
        의료진 보조용 규칙 기반 도구입니다. 실제 확률이나 확정 진단이
        아닙니다.
      </p>
    </div>
  );
}
