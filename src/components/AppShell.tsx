import { Activity, Github, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";
import { SafetyBanner } from "@/components/SafetyBanner";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef5fb]">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-clinical-line bg-white/95 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white lg:hidden">
                  <Stethoscope className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-normal text-clinical-ink sm:text-2xl">
                    흉통 감별진단 체크리스트 보조 AI
                  </h1>
                  <p className="mt-1 max-w-4xl text-sm leading-6 text-clinical-muted">
                    주요 단서 기반 감별진단을 구조화하여 의료진이 위험질환을
                    빠뜨리지 않고 체계적으로 배제하도록 돕는 서비스
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Activity className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                  client-side
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Github className="h-3.5 w-3.5 text-slate-700" aria-hidden />
                  editable rules
                </span>
              </div>
            </div>
            <div className="mt-4">
              <SafetyBanner />
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6">{children}</main>

          <footer className="border-t border-clinical-line bg-white px-4 py-3 text-center text-xs text-slate-500">
            사진, 치료, 처방, 검사 결정은 자동화하지 않습니다. 의료진 검토와
            승인 없이 환자 설명문으로 사용하지 마십시오.
          </footer>
        </div>
      </div>
    </div>
  );
}
