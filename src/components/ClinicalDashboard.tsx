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
import { ProblemRepresentationPanel } from "@/components/ProblemRepresentationPanel";
import {
  evaluateDiagnoses,
  getAutoVitalFindingStates,
  getEmergencyEvaluations,
  mergeFindingStates
} from "@/lib/scoring";
import type {
  FindingState,
  FindingStateMap,
  PatientInfo,
  VitalSigns
} from "@/types/clinical";

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
  const [manualFindingStates, setManualFindingStates] =
    useState<FindingStateMap>({});
  const [activeDiagnosisCode, setActiveDiagnosisCode] = useState<string>();

  const autoFindingStates = useMemo(
    () => getAutoVitalFindingStates(vitals),
    [vitals]
  );
  const effectiveFindingStates = useMemo(
    () => mergeFindingStates(manualFindingStates, autoFindingStates),
    [manualFindingStates, autoFindingStates]
  );
  const scores = useMemo(
    () => evaluateDiagnoses(effectiveFindingStates),
    [effectiveFindingStates]
  );
  const emergencyScores = useMemo(
    () => getEmergencyEvaluations(scores),
    [scores]
  );
  const topScores = useMemo(
    () => getTopDiagnosisScores(scores, effectiveFindingStates, 6),
    [scores, effectiveFindingStates]
  );
  const selectedScore =
    topScores.find((score) => score.diagnosis.code === activeDiagnosisCode) ??
    topScores[0];
  const activeCode = selectedScore?.diagnosis.code;

  const setFindingState = (id: string, state: FindingState) => {
    setManualFindingStates((current) => {
      const next = { ...current };
      if (state === "unknown") {
        next[id] = "unknown";
      } else {
        next[id] = state;
      }
      return next;
    });
  };

  const resetAll = () => {
    setPatient(emptyPatient);
    setVitals(emptyVitals);
    setManualFindingStates({});
    setActiveDiagnosisCode(undefined);
  };

  const selectedFindingCount = Object.values(effectiveFindingStates).filter(
    (state) => state === "present" || state === "absent"
  ).length;

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

        <ProblemRepresentationPanel
          patient={patient}
          vitals={vitals}
          findingStates={effectiveFindingStates}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(420px,0.92fr)_minmax(520px,1.08fr)]">
          <div className="space-y-4">
            <DiagnosisRanking
              scores={topScores}
              emergencyScores={emergencyScores}
              selectedFindingCount={selectedFindingCount}
              activeCode={activeCode}
              onSelect={setActiveDiagnosisCode}
            />
            <DiagnosisDetailPanel score={selectedScore} />
          </div>

          <ChecklistPanel
            findingStates={effectiveFindingStates}
            autoFindingStates={autoFindingStates}
            onSetFindingState={setFindingState}
            onClear={() => setManualFindingStates({})}
          />
        </div>
      </div>
    </AppShell>
  );
}
