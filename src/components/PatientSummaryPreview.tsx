import { FileText, ShieldAlert } from "lucide-react";
import type { FindingRule, PatientInfo, VitalSigns } from "@/types/clinical";

type PatientSummaryPreviewProps = {
  patient: PatientInfo;
  vitals: VitalSigns;
  selectedFindings: FindingRule[];
};

const fallback = "미기재";

export function PatientSummaryPreview({
  patient,
  vitals,
  selectedFindings
}: PatientSummaryPreviewProps) {
  const topFindings = selectedFindings.slice(0, 6);
  const vitalSummary = [
    vitals.bp ? `BP ${vitals.bp}` : "",
    vitals.hr ? `HR ${vitals.hr}` : "",
    vitals.rr ? `RR ${vitals.rr}` : "",
    vitals.spo2 ? `SpO2 ${vitals.spo2}%` : "",
    vitals.bt ? `BT ${vitals.bt}°C` : ""
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="rounded-lg border border-clinical-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" aria-hidden />
          <h2 className="text-base font-semibold text-clinical-ink">
            환자용 요약 미리보기
          </h2>
        </div>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
          mock
        </span>
      </div>

      <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm leading-6 text-red-800">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>
          이 문안은 진단이 아니며 의료진 검토와 승인 없이 환자 설명문으로
          사용하면 안 됩니다. AI가 진단을 대신하는 것이 아닙니다.
        </p>
      </div>

      <div className="space-y-5 text-sm leading-6 text-slate-700">
        <section>
          <h3 className="font-semibold text-clinical-ink">오늘 확인한 주요 증상</h3>
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-3">
            {patient.age || patient.sex
              ? `${patient.age || fallback}세 ${patient.sex || ""}`.trim()
              : "환자 정보 미기재"}
            {patient.chiefComplaint ? `, 주호소는 ${patient.chiefComplaint}` : ""}
            {patient.onset ? `이며 시작 시점은 ${patient.onset}` : ""}입니다.
            {vitalSummary ? ` 활력징후 기록: ${vitalSummary}.` : ""}
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-clinical-ink">
            현재 추가 확인이 필요한 이유
          </h3>
          <ul className="mt-2 space-y-2">
            {topFindings.length > 0 ? (
              topFindings.map((finding) => (
                <li key={finding.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  {finding.labelKo}
                </li>
              ))
            ) : (
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                선택된 임상 소견이 없어 위험질환 기본 체크가 필요합니다.
              </li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-clinical-ink">
            의료진이 설명할 수 있는 질문과 경고증상 예시
          </h3>
          <ul className="mt-2 space-y-2">
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              통증이 언제 시작되었고, 운동·호흡·자세·식사와 어떤 관련이 있는지
              다시 확인합니다.
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              호흡곤란, 실신, 저혈압, 저산소증, 새 ECG 변화처럼 위험을 높이는
              소견이 있는지 확인합니다.
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              필요한 검사는 의료진이 환자 상태와 최신 지침을 바탕으로 판단합니다.
            </li>
          </ul>
        </section>
      </div>
    </section>
  );
}
