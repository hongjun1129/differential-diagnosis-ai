import type { ReactNode } from "react";
import { SafetyBanner } from "@/components/SafetyBanner";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 xl:h-screen xl:w-screen xl:overflow-hidden">
      <div className="xl:grid xl:h-screen xl:grid-cols-[80px_minmax(0,1fr)] xl:overflow-hidden">
        <Sidebar />
        <div className="min-w-0 xl:flex xl:h-screen xl:min-h-0 xl:flex-col xl:overflow-hidden">
          <header className="border-b border-blue-100 bg-white/95 px-3 py-2 xl:h-12 xl:shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold text-slate-950">
                  흉통 감별진단 체크리스트 보조 AI
                </h1>
                <p className="hidden truncate text-[11px] text-slate-500 sm:block">
                  의료진 보조용 규칙 기반 임상 추론 프로토타입
                </p>
              </div>
              <div className="hidden max-w-2xl flex-1 xl:block">
                <SafetyBanner compact />
              </div>
              <span className="shrink-0 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                prototype
              </span>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-16 md:pb-3 xl:overflow-hidden">
            {children}
          </main>

          <footer className="hidden h-8 shrink-0 items-center justify-between border-t border-blue-100 bg-white px-3 text-[11px] text-slate-500 xl:flex">
            <span>
              의료진 보조용 규칙 기반 도구입니다. 실제 확률이나 확정 진단이
              아닙니다.
            </span>
            <details className="relative">
              <summary className="cursor-pointer font-bold text-blue-700">
                자세한 설명 보기
              </summary>
              <div className="absolute bottom-6 right-0 z-30 w-[520px] rounded-lg border border-blue-100 bg-white p-3 text-xs leading-5 text-slate-700 shadow-soft">
                AI가 진단을 대신하는 것이 아닙니다. 치료, 처방, 검사 결정은
                자동화하지 않습니다. 의료진의 판단과 최신 진료지침을 우선해야
                합니다.
              </div>
            </details>
          </footer>
        </div>
      </div>
    </div>
  );
}
