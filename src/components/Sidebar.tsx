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
  { label: "진단", icon: Stethoscope },
  { label: "체크", icon: ListChecks },
  { label: "검사", icon: ClipboardCheck },
  { label: "근거", icon: FileText },
  { label: "메모", icon: NotebookPen }
];

export function Sidebar() {
  return (
    <>
      <aside className="hidden h-screen w-20 shrink-0 bg-blue-950 px-2 py-3 text-white xl:block">
        <div className="mb-4 flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <HeartPulse className="h-5 w-5" aria-hidden />
          </div>
          <p className="text-[10px] font-bold text-blue-100">Chest CDS</p>
        </div>

        <nav className="space-y-2" aria-label="대시보드 섹션">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-bold ${
                  index === 0
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-blue-100 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 shadow-soft md:hidden">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </>
  );
}
