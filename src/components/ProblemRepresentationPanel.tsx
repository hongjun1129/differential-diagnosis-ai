import { FileText } from "lucide-react";
import { buildProblemRepresentationFromChecklist } from "@/lib/clinical-nlp";
import type {
  ChecklistStateMap,
  FindingStateMap,
  PatientInfo,
  VitalSigns
} from "@/types/clinical";

type ProblemRepresentationPanelProps = {
  patient: PatientInfo;
  vitals: VitalSigns;
  findingStates: FindingStateMap;
  checklistState: ChecklistStateMap;
};

export function ProblemRepresentationPanel({
  patient,
  vitals,
  findingStates,
  checklistState
}: ProblemRepresentationPanelProps) {
  const representation = buildProblemRepresentationFromChecklist(
    findingStates,
    checklistState,
    patient,
    vitals
  );

  return (
    <section className="h-full min-h-0 overflow-hidden rounded-lg border border-blue-200 bg-white p-2 shadow-soft">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-blue-700" aria-hidden />
          <h2 className="text-xs font-extrabold leading-4 text-blue-950">
            Problem Representation
          </h2>
        </div>
        <details className="relative text-[11px]">
          <summary className="cursor-pointer font-bold text-blue-700">
            자세히
          </summary>
          <div className="absolute right-0 top-6 z-20 w-80 rounded-lg border border-blue-100 bg-white p-3 text-xs leading-5 text-slate-700 shadow-soft">
            문제 표현: {representation}
          </div>
        </details>
      </div>

      <p className="line-clamp-2 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold leading-4 text-blue-950">
        문제 표현: {representation}
      </p>
    </section>
  );
}
