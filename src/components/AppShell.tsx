import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

type AppShellProps = {
  children: ReactNode;
  topBarContent?: ReactNode;
};

export function AppShell({ children, topBarContent }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 xl:h-screen xl:w-screen xl:overflow-hidden">
      <div className="xl:hidden">
        <Sidebar />
      </div>

      <div className="min-w-0 xl:flex xl:h-screen xl:min-h-0 xl:flex-col xl:overflow-hidden">
        <header className="shrink-0 border-b border-blue-100 bg-white/95 px-3 py-2">
          <div className="flex min-h-14 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="flex min-w-0 shrink-0 items-center justify-between gap-3 lg:w-[320px] xl:w-[360px]">
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold leading-5 text-slate-950 md:text-xl">
                  흉통 감별진단 체크리스트 보조 AI
                </h1>
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  의료진 보조용 규칙 기반 임상 추론 프로토타입
                </p>
              </div>
              <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                prototype
              </span>
            </div>

            {topBarContent ? (
              <div className="min-w-0 flex-1">{topBarContent}</div>
            ) : null}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-16 md:pb-3 xl:overflow-hidden xl:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
