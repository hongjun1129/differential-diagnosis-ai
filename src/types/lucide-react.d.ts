declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  export type LucideProps = SVGProps<SVGSVGElement> & {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  };

  export type LucideIcon = ComponentType<LucideProps>;

  export const AlertTriangle: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ClipboardCheck: LucideIcon;
  export const FileText: LucideIcon;
  export const Gauge: LucideIcon;
  export const HeartPulse: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const ListChecks: LucideIcon;
  export const ListFilter: LucideIcon;
  export const MessageSquareText: LucideIcon;
  export const Minus: LucideIcon;
  export const MinusCircle: LucideIcon;
  export const NotebookPen: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Search: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Stethoscope: LucideIcon;
  export const Target: LucideIcon;
  export const UserRound: LucideIcon;
  export const X: LucideIcon;
}
