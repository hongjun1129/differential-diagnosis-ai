import type { VitalSigns } from "@/types/clinical";

export type VitalStatus = "empty" | "normal" | "abnormal" | "invalid";
export type VitalSeverity = "normal" | "warning" | "danger";
export type VitalFlag =
  | "hypotension"
  | "hypertension"
  | "severe_bp"
  | "tachycardia"
  | "bradycardia"
  | "tachypnea"
  | "hypoxemia"
  | "fever";

export type VitalEvaluation = {
  status: VitalStatus;
  severity?: VitalSeverity;
  reason?: string;
  value?: number;
  systolic?: number;
  diastolic?: number;
  flags: VitalFlag[];
};

export type VitalSignEvaluations = Record<keyof VitalSigns, VitalEvaluation>;

function emptyEvaluation(): VitalEvaluation {
  return { status: "empty", flags: [] };
}

function invalidEvaluation(reason: string): VitalEvaluation {
  return { status: "invalid", severity: "warning", reason, flags: [] };
}

function normalEvaluation(reason = "정상 범위", value?: number): VitalEvaluation {
  return { status: "normal", severity: "normal", reason, value, flags: [] };
}

function abnormalEvaluation({
  reason,
  severity = "warning",
  value,
  systolic,
  diastolic,
  flags
}: Omit<VitalEvaluation, "status"> & { flags: VitalFlag[] }): VitalEvaluation {
  return {
    status: "abnormal",
    severity,
    reason,
    value,
    systolic,
    diastolic,
    flags
  };
}

export function parseFirstNumber(value: string): number | undefined {
  for (const match of value.matchAll(/-?\d+(?:\.\d+)?/g)) {
    const index = match.index ?? 0;
    const previous = value[index - 1];
    if (previous && /[A-Za-z가-힣]/.test(previous)) continue;

    const parsed = Number(match[0]);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function parseBloodPressure(value: string): {
  systolic?: number;
  diastolic?: number;
} {
  const numbers = [...value.matchAll(/-?\d+(?:\.\d+)?/g)]
    .map((match) => Number(match[0]))
    .filter(Number.isFinite);

  if (numbers.length === 0) return {};
  if (numbers.length === 1) return { systolic: numbers[0] };
  return { systolic: numbers[0], diastolic: numbers[1] };
}

function evaluateBloodPressure(value: string): VitalEvaluation {
  if (!value.trim()) return emptyEvaluation();

  const { systolic, diastolic } = parseBloodPressure(value);
  if (systolic === undefined) return invalidEvaluation("BP 해석 불가");

  const flags: VitalFlag[] = [];
  if (systolic < 90) flags.push("hypotension");
  if (systolic >= 140 || (diastolic !== undefined && diastolic >= 90)) {
    flags.push("hypertension");
  }
  if (systolic >= 180 || (diastolic !== undefined && diastolic >= 120)) {
    flags.push("severe_bp");
  }

  if (flags.length === 0) {
    return {
      ...normalEvaluation("정상 범위"),
      systolic,
      diastolic
    };
  }

  const reason = flags.includes("severe_bp")
    ? "severe BP"
    : flags.includes("hypotension")
      ? "저혈압"
      : "고혈압";

  return abnormalEvaluation({
    reason,
    severity: flags.includes("severe_bp") || flags.includes("hypotension")
      ? "danger"
      : "warning",
    systolic,
    diastolic,
    flags
  });
}

function evaluateHeartRate(value: string): VitalEvaluation {
  if (!value.trim()) return emptyEvaluation();

  const hr = parseFirstNumber(value);
  if (hr === undefined) return invalidEvaluation("HR 해석 불가");
  if (hr >= 100) {
    return abnormalEvaluation({
      reason: "빈맥",
      value: hr,
      flags: ["tachycardia"]
    });
  }
  if (hr < 50) {
    return abnormalEvaluation({
      reason: "서맥",
      value: hr,
      flags: ["bradycardia"]
    });
  }
  return normalEvaluation("정상 범위", hr);
}

function evaluateRespiratoryRate(value: string): VitalEvaluation {
  if (!value.trim()) return emptyEvaluation();

  const rr = parseFirstNumber(value);
  if (rr === undefined) return invalidEvaluation("RR 해석 불가");
  if (rr >= 22) {
    return abnormalEvaluation({
      reason: "빈호흡",
      value: rr,
      flags: ["tachypnea"]
    });
  }
  return normalEvaluation("정상 범위", rr);
}

function evaluateOxygenSaturation(value: string): VitalEvaluation {
  if (!value.trim()) return emptyEvaluation();

  const spo2 = parseFirstNumber(value);
  if (spo2 === undefined) return invalidEvaluation("SpO2 해석 불가");
  if (spo2 < 94) {
    return abnormalEvaluation({
      reason: "저산소",
      severity: "danger",
      value: spo2,
      flags: ["hypoxemia"]
    });
  }
  return normalEvaluation("정상 범위", spo2);
}

function evaluateBodyTemperature(value: string): VitalEvaluation {
  if (!value.trim()) return emptyEvaluation();

  const bt = parseFirstNumber(value);
  if (bt === undefined) return invalidEvaluation("BT 해석 불가");
  if (bt >= 38) {
    return abnormalEvaluation({
      reason: "발열",
      value: bt,
      flags: ["fever"]
    });
  }
  return normalEvaluation("정상 범위", bt);
}

export function evaluateVitalSigns(vitals: VitalSigns): VitalSignEvaluations {
  return {
    bp: evaluateBloodPressure(vitals.bp),
    hr: evaluateHeartRate(vitals.hr),
    rr: evaluateRespiratoryRate(vitals.rr),
    spo2: evaluateOxygenSaturation(vitals.spo2),
    bt: evaluateBodyTemperature(vitals.bt)
  };
}
