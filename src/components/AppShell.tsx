import type { ReactNode } from "react";
import { HeartPulse, ShieldAlert } from "lucide-react";

type AppShellProps = {
  children: ReactNode;
  topBarContent?: ReactNode;
};

export function AppShell({ children, topBarContent }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-800 xl:h-screen xl:w-screen xl:overflow-hidden">
      <div className="min-w-0 xl:flex xl:h-screen xl:min-h-0 xl:flex-col xl:overflow-hidden">
        <header className="shrink-0 bg-[#0f1623] text-slate-100 shadow-[0_10px_28px_rgba(15,22,35,0.18)]">
          <div className="mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 xl:flex-row xl:items-stretch xl:gap-4">
            <div className="flex min-w-0 shrink-0 items-center gap-3 border-slate-700/80 xl:w-[260px] xl:border-r xl:pr-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-inner">
                <HeartPulse className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold leading-5 text-white">
                  흉통 평가 워크플로우
                </h1>
                <p className="truncate text-[11px] font-medium text-slate-400">
                  임상 추론 보조 AI
                </p>
              </div>
            </div>

            {topBarContent ? (
              <div className="min-w-0 flex-1">{topBarContent}</div>
            ) : null}

            <div className="flex min-w-[230px] shrink-0 items-center gap-3 rounded-[11px] bg-gradient-to-b from-red-500 to-red-600 px-4 py-2 text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] xl:ml-auto">
              <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold leading-5">
                  현재 상태 평가 필요
                </p>
                <p className="truncate text-[11px] font-medium text-red-50">
                  응급 질환 우선 배제 필요
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-0 w-full max-w-[1680px] flex-1 overflow-y-auto px-3 py-3 xl:overflow-hidden xl:px-0 xl:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}
