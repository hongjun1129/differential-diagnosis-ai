import type { PatientInfo, SampleCase, VitalSigns } from "@/types/clinical";

export const emptyPatient: PatientInfo = {
  age: "",
  sex: "",
  chiefComplaint: "",
  onset: "",
  riskFactors: [],
  memo: ""
};

export const emptyVitals: VitalSigns = {
  bp: "",
  hr: "",
  rr: "",
  spo2: "",
  bt: ""
};

export const sampleCases: SampleCase[] = [
  {
    id: "acs-like",
    labelKo: "ACS 유사",
    patient: {
      age: "62",
      sex: "남성",
      chiefComplaint: "30분 이상 지속되는 압박감 흉통",
      onset: "오늘 오전 활동 중 시작",
      riskFactors: ["고혈압", "흡연력", "당뇨"],
      memo: "운동 시 악화되고 안정 후에도 완전히 사라지지 않음."
    },
    vitals: {
      bp: "148/92",
      hr: "104",
      rr: "20",
      spo2: "96",
      bt: "36.8"
    },
    selectedFindingIds: ["H01", "H02", "H05", "E52", "L62"]
  },
  {
    id: "pe-like",
    labelKo: "PE 유사",
    patient: {
      age: "44",
      sex: "여성",
      chiefComplaint: "갑작스러운 호흡곤란과 흉막성 흉통",
      onset: "1시간 전 갑자기 시작",
      riskFactors: ["최근 장거리 이동", "경구피임약"],
      memo: "흉통보다 숨찬 느낌이 더 두드러짐."
    },
    vitals: {
      bp: "118/74",
      hr: "122",
      rr: "28",
      spo2: "89",
      bt: "37.2"
    },
    selectedFindingIds: ["H07", "H11", "H12", "V29", "V30", "L67"]
  },
  {
    id: "aortic-like",
    labelKo: "대동맥 유사",
    patient: {
      age: "69",
      sex: "남성",
      chiefComplaint: "갑작스러운 찢어지는 흉통과 등 통증",
      onset: "30분 전 휴식 중 시작",
      riskFactors: ["고혈압", "대동맥질환 가족력"],
      memo: "양팔 혈압 차이가 있고 일시적 어지러움을 호소함."
    },
    vitals: {
      bp: "92/60",
      hr: "112",
      rr: "22",
      spo2: "95",
      bt: "36.6"
    },
    selectedFindingIds: ["H09", "H10", "V28", "P41", "P42"]
  },
  {
    id: "gerd-like",
    labelKo: "GERD 유사",
    patient: {
      age: "36",
      sex: "여성",
      chiefComplaint: "식후와 누우면 심해지는 흉골 뒤 작열감",
      onset: "2주 전부터 반복",
      riskFactors: ["야식", "카페인"],
      memo: "신물 역류가 있고 PPI 복용 후 호전되었다고 함."
    },
    vitals: {
      bp: "112/70",
      hr: "78",
      rr: "16",
      spo2: "99",
      bt: "36.5"
    },
    selectedFindingIds: ["H17", "G118", "G117"]
  },
  {
    id: "msk-like",
    labelKo: "흉벽 통증 유사",
    patient: {
      age: "29",
      sex: "남성",
      chiefComplaint: "누르면 재현되는 왼쪽 앞가슴 통증",
      onset: "어제 운동 후 시작",
      riskFactors: [],
      memo: "국소 압통이 뚜렷하고 호흡곤란은 없음."
    },
    vitals: {
      bp: "124/76",
      hr: "72",
      rr: "15",
      spo2: "99",
      bt: "36.4"
    },
    selectedFindingIds: ["H22", "M137", "M139"]
  }
];
