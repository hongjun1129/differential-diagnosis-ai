"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AutoApplyPreviewModal } from "@/components/AutoApplyPreviewModal";
import { ChecklistPanel } from "@/components/ChecklistPanel";
import { DiagnosisDetailPanel } from "@/components/DiagnosisDetailPanel";
import {
  DEFAULT_TOP_DIAGNOSIS_COUNT,
  DiagnosisRanking,
  getTopDiagnosisScores
} from "@/components/DiagnosisRanking";
import { DoctorNoteCard } from "@/components/DoctorNoteCard";
import { TopPatientBar } from "@/components/TopPatientBar";
import { chestPainRules } from "@/data/chestPainRules";
import { getDiseaseShortlistForNote } from "@/data/diseaseRegistry";
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
  ClinicalExtractionResult,
  FindingState,
  FindingStateMap,
  PatientInfo,
  VitalSigns
} from "@/types/clinical";

const emptyPatient: PatientInfo = {
  name: "",
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

type PreviewResult = {
  patches: ChecklistPatch[];
  conflicts: ChecklistPatchConflict[];
  extraction?: ClinicalExtractionResult;
  apiError?: string;
  cached?: boolean;
};

type AnalyzeClinicalNoteResponse = {
  ok: boolean;
  cached?: boolean;
  error?: string;
  result?: ClinicalExtractionResult;
};

const checklistItemsForExtraction = chestPainRules.map((rule) => ({
  itemId: rule.id,
  labelKo: rule.labelKo,
  category: rule.category
}));

const sourcePriority = {
  test_parser: 6,
  lab_parser: 6,
  vital_parser: 6,
  rule_parser: 5,
  free_text_parser: 5,
  llm_extractor: 4,
  system: 2,
  manual: 1
} satisfies Record<ChecklistPatch["source"], number>;

function mergeExtractorPatches(
  rulePatches: ChecklistPatch[],
  llmPatches: ChecklistPatch[]
) {
  const byKey = new Map<string, ChecklistPatch>();
  for (const patch of [...rulePatches, ...llmPatches]) {
    const key = `${patch.itemId}:${patch.status}:${patch.evidenceText}`;
    const current = byKey.get(key);
    if (
      !current ||
      sourcePriority[patch.source] > sourcePriority[current.source] ||
      (sourcePriority[patch.source] === sourcePriority[current.source] &&
        patch.confidence > current.confidence)
    ) {
      byKey.set(key, patch);
    }
  }

  return [...byKey.values()];
}

export function ClinicalDashboard() {
  const [patient, setPatient] = useState<PatientInfo>(emptyPatient);
  const [vitals, setVitals] = useState<VitalSigns>(emptyVitals);
  const [manualFindingStates, setManualFindingStates] =
    useState<FindingStateMap>({});
  const [checklistState, setChecklistState] = useState<ChecklistStateMap>({});
  const [previewResult, setPreviewResult] = useState<PreviewResult>();
  const [isAnalyzingNote, setIsAnalyzingNote] = useState(false);
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
    () =>
      getTopDiagnosisScores(
        scores,
        effectiveFindingStates,
        DEFAULT_TOP_DIAGNOSIS_COUNT
      ),
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

  const analyzeFreeText = async () => {
    const freeText = patient.memo.trim();
    if (!freeText) return;

    setIsAnalyzingNote(true);
    const rulePatches = analyzer.analyze(freeText);
    let extraction: ClinicalExtractionResult | undefined;
    let apiError: string | undefined;
    let cached = false;

    try {
      const response = await fetch("/api/analyze-clinical-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeText,
          patientContext: {
            name: patient.name ?? "",
            age: patient.age,
            sex: patient.sex,
            chiefComplaint: patient.chiefComplaint,
            onset: patient.onset,
            riskFactors: patient.riskFactors,
            doctorNote: freeText,
            vitals
          },
          checklistItems: checklistItemsForExtraction,
          diseaseShortlist: getDiseaseShortlistForNote(freeText, 40)
        })
      });
      const payload =
        (await response.json().catch(() => undefined)) as
          | AnalyzeClinicalNoteResponse
          | undefined;

      if (response.ok && payload?.ok && payload.result) {
        extraction = payload.result;
        cached = Boolean(payload.cached);
      } else {
        apiError =
          payload?.error ??
          "LLM structured extraction is unavailable. Showing rule-based candidates only.";
      }
    } catch {
      apiError =
        "LLM structured extraction is unavailable. Showing rule-based candidates only.";
    } finally {
      setIsAnalyzingNote(false);
    }

    const mergedPatches = mergeExtractorPatches(
      rulePatches,
      extraction?.checklistPatches ?? []
    );
    setPreviewResult({
      ...resolveConflicts(mergedPatches),
      extraction,
      apiError,
      cached
    });
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
    <AppShell
      topBarContent={
        <TopPatientBar
          patient={patient}
          vitals={vitals}
          onPatientChange={setPatient}
          onVitalsChange={setVitals}
          onReset={resetAll}
        />
      }
    >
      <div className="dashboard-grid">
        <div className="dashboard-area-note">
          <DoctorNoteCard
            patient={patient}
            onChange={setPatient}
            onAnalyze={analyzeFreeText}
            isAnalyzing={isAnalyzingNote}
          />
        </div>

        <div className="dashboard-area-diagnoses">
          <DiagnosisRanking
            scores={scores}
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
          extraction={previewResult.extraction}
          apiError={previewResult.apiError}
          cached={previewResult.cached}
          checklistState={checklistState}
          onApply={applyPreviewPatches}
          onClose={() => setPreviewResult(undefined)}
        />
      ) : null}
    </AppShell>
  );
}
