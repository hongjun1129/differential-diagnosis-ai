import {
  ClipboardCheck,
  FileText,
  HeartPulse,
  ListChecks,
  NotebookPen,
  Stethoscope
} from "lucide-react";

const items = [
  { label: "대시보드", icon: HeartPulse },
  { label: "감별진단", icon: Stethoscope },
  { label: "체크리스트", icon: ListChecks },
  { label: "검사결과", icon: ClipboardCheck },
  { label: "요약", icon: FileText },
  { label: "메모", icon: NotebookPen }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-clinical-line bg-white/90 px-4 py-5 lg:block">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <HeartPulse className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-clinical-ink">흉통 CDS</p>
          <p className="text-xs text-clinical-muted">v0.1 prototype</p>
        </div>
      </div>

      <nav className="space-y-1" aria-label="대시보드 섹션">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                index === 0
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-slate-600"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
