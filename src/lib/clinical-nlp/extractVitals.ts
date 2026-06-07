import type { ChecklistPatch } from "@/types/clinical";

function numberFrom(value: string | undefined) {
  if (!value) return undefined;
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function patch(
  itemId: string,
  evidenceText: string,
  confidence: number,
  reason: string,
  isRedFlag = false
): ChecklistPatch {
  return {
    itemId,
    status: "present",
    source: "vital_parser",
    evidenceText,
    confidence,
    context: "test_result",
    reason,
    isRedFlag,
    requiresConfirmation: isRedFlag
  };
}

function pushUnique(patches: ChecklistPatch[], next: ChecklistPatch) {
  if (!patches.some((patchItem) => patchItem.itemId === next.itemId)) {
    patches.push(next);
  }
}

export function extractVitals(text: string): ChecklistPatch[] {
  const patches: ChecklistPatch[] = [];

  const bpRegexes = [
    /\bBP\s*:?\s*(\d{2,3})\s*\/\s*(\d{2,3})/gi,
    /혈압\s*:?\s*(\d{2,3})\s*\/\s*(\d{2,3})/gi,
    /(\d{2,3})\s*\/\s*(\d{2,3})\s*mmHg/gi,
    /\bSBP\s*:?\s*(\d{2,3})/gi
  ];

  for (const regex of bpRegexes) {
    for (const match of text.matchAll(regex)) {
      const sbp = Number(match[1]);
      if (sbp < 90) {
        pushUnique(
          patches,
          patch("V28", match[0], 0.95, "SBP < 90 기준의 저혈압/쇼크 후보입니다.", true)
        );
      }
    }
  }

  for (const match of text.matchAll(/\b(?:HR|PR|pulse)\s*:?\s*(\d{2,3})|(?:맥박|심박수)\s*:?\s*(\d{2,3})/gi)) {
    const hr = numberFrom(match[1] ?? match[2]);
    if (hr === undefined) continue;
    if (hr >= 100) pushUnique(patches, patch("V30", match[0], 0.94, "HR >= 100 기준의 빈맥 후보입니다."));
    if (hr < 50) pushUnique(patches, patch("V156", match[0], 0.94, "HR < 50 기준의 서맥 후보입니다."));
  }

  for (const match of text.matchAll(/\bRR\s*:?\s*(\d{1,3})|호흡수\s*:?\s*(\d{1,3})/gi)) {
    const rr = numberFrom(match[1] ?? match[2]);
    if (rr !== undefined && rr >= 22) {
      pushUnique(patches, patch("V157", match[0], 0.94, "RR >= 22 기준의 빈호흡 후보입니다."));
    }
  }

  for (const match of text.matchAll(/\bSpO2\s*:?\s*(\d{2,3})%?|\bO2\s*sat\s*:?\s*(\d{2,3})%?|산소포화도\s*:?\s*(\d{2,3})%?/gi)) {
    const spo2 = numberFrom(match[1] ?? match[2] ?? match[3]);
    if (spo2 !== undefined && spo2 < 94) {
      pushUnique(
        patches,
        patch("V29", match[0], 0.95, "SpO2 < 94 기준의 저산소증 후보입니다.", true)
      );
    }
  }

  for (const match of text.matchAll(/\b(?:BT|Temp|T)\s*:?\s*(\d{2}(?:\.\d)?)|체온\s*:?\s*(\d{2}(?:\.\d)?)/gi)) {
    const bt = numberFrom(match[1] ?? match[2]);
    if (bt !== undefined && bt >= 38) {
      pushUnique(patches, patch("V31", match[0], 0.94, "BT >= 38.0 기준의 발열 후보입니다."));
    }
  }

  return patches;
}
