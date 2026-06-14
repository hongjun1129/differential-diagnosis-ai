import type { ReactNode } from "react";
import { SafetyBanner } from "@/components/SafetyBanner";
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
        <header className="shrink-0 border-b border-blue-100 bg-white/95 px-3">
          <div className="flex min-h-14 items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold leading-5 text-slate-950 md:text-xl">
                흉통 감별진단 체크리스트 보조 AI
              </h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                의료진 보조용 규칙 기반 임상 추론 프로토타입
              </p>
            </div>

            <div className="hidden min-w-0 max-w-2xl flex-1 lg:block">
              <SafetyBanner compact />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                prototype
              </span>
              <details className="relative hidden text-[11px] sm:block">
                <summary className="cursor-pointer font-bold text-blue-700">
                  자세히
                </summary>
                <div className="absolute right-0 top-7 z-30 w-[460px] rounded-lg border border-blue-100 bg-white p-3 text-xs leading-5 text-slate-700 shadow-soft">
                  AI가 진단을 대신하는 것이 아닙니다. 치료, 처방, 검사 결정은
                  자동화하지 않습니다. 의료진의 판단과 최신 진료지침을 우선해야
                  합니다.
                </div>
              </details>
            </div>
          </div>

          {topBarContent ? (
            <div className="border-t border-blue-50 py-2">{topBarContent}</div>
          ) : null}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-16 md:pb-3 xl:overflow-hidden xl:p-0">
          {children}
        </main>

        <div className="border-t border-blue-100 bg-white px-3 py-2 text-[11px] text-slate-500 xl:hidden">
          <details>
            <summary className="cursor-pointer font-bold text-blue-700">
              의료 안전 고지 자세히 보기
              </summary>
            <p className="mt-1 leading-5">
              의료진 보조용 규칙 기반 도구입니다. 실제 확률이나 확정 진단이
              아닙니다.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
