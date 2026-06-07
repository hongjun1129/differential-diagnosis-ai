"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AutoApplyPreviewModal } from "@/components/AutoApplyPreviewModal";
import { ChecklistPanel } from "@/components/ChecklistPanel";
import { DiagnosisDetailPanel } from "@/components/DiagnosisDetailPanel";
import {
  DiagnosisRanking,
  getTopDiagnosisScores
} from "@/components/DiagnosisRanking";
import { DoctorNoteCard } from "@/components/DoctorNoteCard";
import { PatientSnapshotPanel } from "@/components/PatientSnapshotPanel";
import { ProblemRepresentationPanel } from "@/components/ProblemRepresentationPanel";
import {
  resolveConflicts,
  RuleBasedClinicalTextAnalyzer
} from "@/lib/clinical-nlp";
import {
  evaluateDiagnoses,
  getAutoVitalFindingStates,
  getEmergencyEvaluations,
  mergeFindingStates
} from "@/lib/scoring";
import type {
  ChecklistPatch,
  ChecklistPatchConflict,
  ChecklistStateMap,
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
  const [checklistState, setChecklistState] = useState<ChecklistStateMap>({});
  const [previewResult, setPreviewResult] = useState<{
    patches: ChecklistPatch[];
    conflicts: ChecklistPatchConflict[];
  }>();
  const [activeDiagnosisCode, setActiveDiagnosisCode] = useState<string>();
  const analyzer = useMemo(() => new RuleBasedClinicalTextAnalyzer(), []);

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
    scores.find((score) => score.diagnosis.code === activeDiagnosisCode) ??
    topScores[0];
  const activeCode = selectedScore?.diagnosis.code;

  const setFindingState = (id: string, state: FindingState) => {
    const updatedAt = new Date().toISOString();
    setManualFindingStates((current) => {
      const next = { ...current };
      if (state === "unknown") {
        next[id] = "unknown";
      } else {
        next[id] = state;
      }
      return next;
    });
    setChecklistState((current) => ({
      ...current,
      [id]: {
        status: state,
        source: "manual",
        updatedAt,
        manuallyOverridden: true
      }
    }));
  };

  const resetAll = () => {
    setPatient(emptyPatient);
    setVitals(emptyVitals);
    setManualFindingStates({});
    setChecklistState({});
    setPreviewResult(undefined);
    setActiveDiagnosisCode(undefined);
  };

  const analyzeFreeText = () => {
    const patches = analyzer.analyze(patient.memo);
    setPreviewResult(resolveConflicts(patches));
  };

  const applyPreviewPatches = (patches: ChecklistPatch[]) => {
    const applicablePatches = patches.filter((patch) => {
      const current = checklistState[patch.itemId];
      return current?.source !== "manual" && !current?.manuallyOverridden;
    });
    const updatedAt = new Date().toISOString();

    setManualFindingStates((current) => {
      const next = { ...current };
      for (const patch of applicablePatches) {
        next[patch.itemId] = patch.status;
      }
      return next;
    });
    setChecklistState((current) => {
      const next = { ...current };
      for (const patch of applicablePatches) {
        next[patch.itemId] = {
          status: patch.status,
          source: patch.source,
          evidenceText: patch.evidenceText,
          confidence: patch.confidence,
          context: patch.context,
          updatedAt,
          manuallyOverridden: false
        };
      }
      return next;
    });
    setPreviewResult(undefined);
  };

  const selectedFindingCount = Object.values(effectiveFindingStates).filter(
    (state) => state === "present" || state === "absent"
  ).length;

  return (
    <AppShell>
      <div className="dashboard-grid">
        <div className="dashboard-area-patient">
          <PatientSnapshotPanel
            patient={patient}
            vitals={vitals}
            onPatientChange={setPatient}
            onVitalsChange={setVitals}
            onReset={resetAll}
          />
        </div>

        <div className="dashboard-area-note dashboard-note-stack">
          <DoctorNoteCard
            patient={patient}
            onChange={setPatient}
            onAnalyze={analyzeFreeText}
          />

          <ProblemRepresentationPanel
            patient={patient}
            vitals={vitals}
            findingStates={effectiveFindingStates}
            checklistState={checklistState}
          />
        </div>

        <div className="dashboard-area-diagnoses">
          <DiagnosisRanking
            scores={topScores}
            emergencyScores={emergencyScores}
            selectedFindingCount={selectedFindingCount}
            activeCode={activeCode}
            onSelect={setActiveDiagnosisCode}
          />
        </div>

        <div className="dashboard-area-detail">
          <DiagnosisDetailPanel score={selectedScore} />
        </div>

        <div className="dashboard-area-checklist">
          <ChecklistPanel
            findingStates={effectiveFindingStates}
            autoFindingStates={autoFindingStates}
            checklistState={checklistState}
            onSetFindingState={setFindingState}
            onClear={() => {
              setManualFindingStates({});
              setChecklistState({});
            }}
          />
        </div>
      </div>

      {previewResult ? (
        <AutoApplyPreviewModal
          patches={previewResult.patches}
          conflicts={previewResult.conflicts}
          checklistState={checklistState}
          onApply={applyPreviewPatches}
          onClose={() => setPreviewResult(undefined)}
        />
      ) : null}
    </AppShell>
  );
}
