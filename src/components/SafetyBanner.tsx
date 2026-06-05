import { ShieldAlert } from "lucide-react";

export function SafetyBanner() {
  return (
    <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-950">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden />
      <p className="leading-5">
        AI가 진단을 대신하는 것이 아닙니다. 의료진이 감별진단을 체계적으로
        사고하도록 돕는 보조 도구입니다. 표시되는 값은 확률이 아니라 선택된
        소견 기반 규칙 지지도이며, 실제 진료에서는 의료진의 판단과 최신
        진료지침을 우선해야 합니다.
      </p>
    </div>
  );
}
