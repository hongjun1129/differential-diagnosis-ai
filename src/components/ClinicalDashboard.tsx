"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChecklistPanel } from "@/components/ChecklistPanel";
import { DiagnosisDetailPanel } from "@/components/DiagnosisDetailPanel";
import {
  DiagnosisRanking,
  getTopDiagnosisScores
} from "@/components/DiagnosisRanking";
import { PatientSnapshotPanel } from "@/components/PatientSnapshotPanel";
import {
  calculateDiagnosisScores,
} from "@/lib/scoring";
import type { PatientInfo, VitalSigns } from "@/types/clinical";

const emptyPatient: PatientInfo = {
  age: "",
  sex: "",
  chiefComplaint: "",
  onset: "",
  riskFactors: [],
  memo: ""
};

const emptyVitals: VitalSigns = {
  bp: "",
  hr: "",
  rr: "",
  spo2: "",
  bt: ""
};

export function ClinicalDashboard() {
  const [patient, setPatient] = useState<PatientInfo>(emptyPatient);
  const [vitals, setVitals] = useState<VitalSigns>(emptyVitals);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [activeDiagnosisCode, setActiveDiagnosisCode] = useState<string>();

  const scores = useMemo(
    () => calculateDiagnosisScores(selectedFindingIds),
    [selectedFindingIds]
  );
  const topScores = useMemo(
    () => getTopDiagnosisScores(scores, selectedFindingIds.length, 6),
    [scores, selectedFindingIds.length]
  );
  const selectedScore =
    topScores.find((score) => score.diagnosis.code === activeDiagnosisCode) ??
    topScores[0];
  const activeCode = selectedScore?.diagnosis.code;

  const toggleFinding = (id: string) => {
    setSelectedFindingIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const resetAll = () => {
    setPatient(emptyPatient);
    setVitals(emptyVitals);
    setSelectedFindingIds([]);
    setActiveDiagnosisCode(undefined);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <PatientSnapshotPanel
          patient={patient}
          vitals={vitals}
          onPatientChange={setPatient}
          onVitalsChange={setVitals}
          onReset={resetAll}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(420px,0.92fr)_minmax(520px,1.08fr)]">
          <div className="space-y-4">
            <DiagnosisRanking
              scores={topScores}
              selectedFindingCount={selectedFindingIds.length}
              activeCode={activeCode}
              onSelect={setActiveDiagnosisCode}
            />
            <DiagnosisDetailPanel score={selectedScore} />
          </div>

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
        </div>
      </div>
    </AppShell>
  );
}
