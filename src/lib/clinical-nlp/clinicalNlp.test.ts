import { describe, expect, it } from "vitest";
import {
  resolveConflicts,
  RuleBasedClinicalTextAnalyzer
} from "@/lib/clinical-nlp";
import type { ChecklistPatch, ClinicalContext, ChecklistSource } from "@/types/clinical";

const analyzer = new RuleBasedClinicalTextAnalyzer();

function analyze(text: string) {
  return resolveConflicts(analyzer.analyze(text));
}

function findPatch(patches: ChecklistPatch[], itemId: string, status?: ChecklistPatch["status"]) {
  return patches.find((patch) => patch.itemId === itemId && (!status || patch.status === status));
}

function expectPatch(
  text: string,
  itemId: string,
  status: ChecklistPatch["status"],
  extras: { context?: ClinicalContext; source?: ChecklistSource } = {}
) {
  const { patches } = analyze(text);
  const patch = findPatch(patches, itemId, status);
  expect(patch, `${text} should include ${itemId} ${status}`).toBeTruthy();
  if (extras.context) expect(patch?.context).toBe(extras.context);
  if (extras.source) expect(patch?.source).toBe(extras.source);
  return patch;
}

describe("rule based clinical NLP parser", () => {
  it("detects dyspnea negation and assertion", () => {
    expectPatch("호흡곤란 없음", "H12", "absent");
    expectPatch("호흡곤란 동반", "H12", "present");
  });

  it("combines symptom and vital parsers", () => {
    const { patches } = analyze("숨이 차고 SpO2 91%");
    expect(findPatch(patches, "H12", "present")).toBeTruthy();
    expect(findPatch(patches, "V29", "present")).toBeTruthy();
  });

  it("extracts numeric vital red flags and vital findings", () => {
    const { patches } = analyze("BP 85/55, HR 124, RR 28, SpO2 91%, BT 38.2");
    expect(findPatch(patches, "V28", "present")).toBeTruthy();
    expect(findPatch(patches, "V30", "present")).toBeTruthy();
    expect(findPatch(patches, "V157", "present")).toBeTruthy();
    expect(findPatch(patches, "V29", "present")).toBeTruthy();
    expect(findPatch(patches, "V31", "present")).toBeTruthy();
  });

  it("detects ECG and cardiac biomarkers with negation", () => {
    expectPatch("ECG V2-V4 ST elevation", "E50", "present", { context: "test_result" });
    expectPatch("ST elevation 없음", "E50", "absent");
    expectPatch("troponin 상승", "L61", "present", { source: "lab_parser" });
    expectPatch("트로포닌 음성", "L61", "absent", { source: "lab_parser" });
  });

  it("detects aortic dissection symptom candidates", () => {
    expectPatch("갑자기 찢어지는 흉통, 등으로 이동", "H09", "present");
  });

  it("reports contradictory present and absent patches for the same item", () => {
    const { conflicts } = analyze("호흡곤란 없음. dyspnea 있음.");
    expect(conflicts.some((conflict) => conflict.itemId === "H12")).toBe(true);
  });

  it("separates family history and past history from current findings", () => {
    expectPatch("아버지 심근경색 병력", "H169", "present", {
      context: "family_history"
    });
    expectPatch("과거 PCI 시행", "H166", "present", {
      context: "past_history"
    });
  });

  it("keeps red flag hypotheses unconfirmed until clinician review", () => {
    const { patches } = analyze("대동맥 박리 의심");
    const dissection = patches.find((patch) => patch.itemId === "T93");
    expect(dissection?.status).toBe("unknown");
    expect(dissection?.context).toBe("hypothesis");
    expect(dissection?.requiresConfirmation).toBe(true);
  });

  it("treats CTA confirmation as test-result evidence", () => {
    expectPatch("CTA에서 dissection 확인", "T93", "present", {
      context: "test_result",
      source: "test_parser"
    });
  });

  it("detects infectious and pulmonary symptom phrases", () => {
    expectPatch("기침, 발열, 객담 동반", "H14", "present");
    expectPatch("기침이나 객담 없음", "H14", "absent");
  });

  it("detects GI rupture, chest wall, pleuritic, and D-dimer candidates", () => {
    expectPatch("심한 구토 후 갑작스러운 흉통", "H16", "present");
    expectPatch("누르면 같은 통증 재현", "H22", "present");
    expectPatch("흡기 시 악화되는 통증", "H07", "present");
    expectPatch("D-dimer 2300", "L67", "present", { source: "lab_parser" });
  });
});
