"use client";

import { RotateCcw, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChecklistPanel } from "@/components/ChecklistPanel";
import { DiagnosisDetailPanel } from "@/components/DiagnosisDetailPanel";
import { DiagnosisRanking } from "@/components/DiagnosisRanking";
import { FreeTextNoteCard } from "@/components/FreeTextNoteCard";
import { PatientInfoCard } from "@/components/PatientInfoCard";
import { PatientSummaryPreview } from "@/components/PatientSummaryPreview";
import { VitalSignsCard } from "@/components/VitalSignsCard";
import { emptyPatient, emptyVitals, sampleCases } from "@/data/sampleCases";
import {
  calculateDiagnosisScores,
  getSelectedFindingRules
} from "@/lib/scoring";
import type { PatientInfo, VitalSigns } from "@/types/clinical";

type MainTab = "ranking" | "summary";

export function ClinicalDashboard() {
  const [patient, setPatient] = useState<PatientInfo>(emptyPatient);
  const [vitals, setVitals] = useState<VitalSigns>(emptyVitals);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [activeDiagnosisCode, setActiveDiagnosisCode] = useState<string>();
  const [mainTab, setMainTab] = useState<MainTab>("ranking");

  const scores = useMemo(
    () => calculateDiagnosisScores(selectedFindingIds),
    [selectedFindingIds]
  );
  const selectedFindings = useMemo(
    () => getSelectedFindingRules(selectedFindingIds),
    [selectedFindingIds]
  );
  const selectedScore =
    scores.find((score) => score.diagnosis.code === activeDiagnosisCode) ??
    scores[0];
  const activeCode = selectedScore?.diagnosis.code;

  const toggleFinding = (id: string) => {
    setSelectedFindingIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const loadSample = (sampleId: string) => {
    const sample = sampleCases.find((item) => item.id === sampleId);
    if (!sample) return;
    setPatient(sample.patient);
    setVitals(sample.vitals);
    setSelectedFindingIds(sample.selectedFindingIds);
    setActiveDiagnosisCode(undefined);
    setMainTab("ranking");
  };

  const resetAll = () => {
    setPatient(emptyPatient);
    setVitals(emptyVitals);
    setSelectedFindingIds([]);
    setActiveDiagnosisCode(undefined);
    setMainTab("ranking");
  };

  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[330px_minmax(430px,1fr)_minmax(360px,0.95fr)]">
        <div className="space-y-5">
          <section className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" aria-hidden />
                <h2 className="text-base font-semibold text-clinical-ink">
                  샘플 케이스
                </h2>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="초기화"
                title="초기화"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="grid gap-2">
              {sampleCases.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample.id)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                >
                  {sample.labelKo}
                </button>
              ))}
            </div>
          </section>

          <PatientInfoCard patient={patient} onChange={setPatient} />
          <VitalSignsCard vitals={vitals} onChange={setVitals} />
          <FreeTextNoteCard patient={patient} onChange={setPatient} />
        </div>

        <div className="space-y-5">
          <div className="flex rounded-lg border border-clinical-line bg-white p-1 shadow-soft">
            <button
              type="button"
              onClick={() => setMainTab("ranking")}
              className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold ${
                mainTab === "ranking"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              감별진단
            </button>
            <button
              type="button"
              onClick={() => setMainTab("summary")}
              className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold ${
                mainTab === "summary"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              환자용 요약
            </button>
          </div>

          {mainTab === "ranking" ? (
            <DiagnosisRanking
              scores={scores}
              selectedFindingCount={selectedFindingIds.length}
              activeCode={activeCode}
              onSelect={setActiveDiagnosisCode}
            />
          ) : (
            <PatientSummaryPreview
              patient={patient}
              vitals={vitals}
              selectedFindings={selectedFindings}
            />
          )}
        </div>

        <div className="space-y-5">
          <ChecklistPanel
            selectedFindingIds={selectedFindingIds}
            onToggleFinding={toggleFinding}
            onRemoveFinding={(id) =>
              setSelectedFindingIds((current) =>
                current.filter((item) => item !== id)
              )
            }
            onClear={() => setSelectedFindingIds([])}
          />
          <DiagnosisDetailPanel score={selectedScore} />
        </div>
      </div>
    </AppShell>
  );
}
