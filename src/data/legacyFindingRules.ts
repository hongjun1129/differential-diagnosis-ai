import type {
  FindingCategory,
  FindingRule,
  FindingWeight
} from "@/types/clinical";

export type LegacyFindingRule = Omit<FindingRule, "weights" | "redFlagFor"> & {
  weights: Partial<Record<string, FindingWeight>>;
  redFlagFor?: string[];
};

const r = (
  id: string,
  labelKo: string,
  category: FindingCategory,
  weights: Partial<Record<string, FindingWeight>>,
  extras: Omit<LegacyFindingRule, "id" | "labelKo" | "category" | "weights"> = {}
): LegacyFindingRule => ({
  id,
  labelKo,
  category,
  weights,
  ...extras
});

const historyRules: LegacyFindingRule[] = [
  r("H01", "압박감, 조이는 느낌, 쥐어짜는 흉통", "history", {
    STEMI: 1,
    NSTEMI: 1,
    UA: 1,
    SA_CCD: 1,
    T2MI: 1,
    INOCA: 1,
    GERD: -1,
    COSTO: -1,
    STRAIN: -1
  }),
  r("H02", "운동, 계단, 스트레스 때 악화", "history", {
    SA_CCD: 2,
    STEMI: 1,
    NSTEMI: 1,
    UA: 1,
    T2MI: 1,
    INOCA: 1,
    AS: 1,
    HCM: 1,
    GERD: -1,
    PANIC: -1
  }),
  r("H03", "휴식 또는 nitroglycerin으로 완화", "history", {
    SA_CCD: 1,
    UA: 1,
    VSA: 1,
    ESPASM: 1
  }),
  r("H04", "새로 발생한 심한 흉통 또는 점점 심해지는 흉통", "history", {
    UA: 2,
    NSTEMI: 1,
    STEMI: 1,
    DIS: 1,
    PE: 1,
    SA_CCD: -1
  }),
  r("H05", "20분 이상 지속되는 안정 시 흉통", "history", {
    UA: 2,
    NSTEMI: 2,
    STEMI: 2,
    VSA: 1,
    DIS: 1,
    PE: 1
  }),
  r("H06", "야간 또는 새벽 안정 시 흉통", "history", {
    VSA: 2,
    UA: 1,
    GERD: 1,
    ESPASM: 1
  }),
  r("H07", "흡기나 기침 때 악화되는 흉막성 흉통", "history", {
    PE: 1,
    PNA: 1,
    PLEUR: 2,
    PTX: 1,
    PERI: 1,
    COSTO: 1,
    STRAIN: 1,
    STEMI: -1,
    SA_CCD: -1
  }),
  r("H08", "누우면 악화, 앞으로 숙이면 완화", "history", {
    PERI: 2,
    MYO: 1,
    GERD: 1,
    STEMI: -1,
    NSTEMI: -1
  }),
  r(
    "H09",
    "갑자기 시작한 찢어지는 흉통 또는 등통증",
    "history",
    {
      DIS: 2,
      IMH: 2,
      PAU: 2,
      TAA: 2,
      STEMI: 1,
      PE: 1,
      GERD: -1,
      COSTO: -1
    },
    { redFlagFor: ["DIS", "IMH", "PAU", "TAA"] }
  ),
  r("H10", "통증이 등, 견갑골 사이로 이동", "history", {
    DIS: 2,
    IMH: 2,
    PAU: 1,
    TAA: 1,
    PANC: 1
  }),
  r(
    "H11",
    "갑작스러운 한쪽 흉통과 호흡곤란",
    "history",
    {
      PTX: 2,
      TPTX: 1,
      PE: 1,
      PLEUR: 1,
      PNA: 1
    },
    { redFlagFor: ["PTX", "TPTX", "PE"] }
  ),
  r("H12", "호흡곤란이 흉통보다 두드러짐", "history", {
    PE: 2,
    AHF: 2,
    ASTH_COPD: 2,
    PNA: 1,
    PTX: 1,
    PH: 1,
    PANIC: 1,
    HVS: 1
  }),
  r("H13", "객혈", "history", { PE: 1, PNA: 1, LUNGCA: 1 }),
  r("H14", "발열, 기침, 객담", "history", {
    PNA: 2,
    PLEUR: 1,
    EMP: 1,
    MYO: 1,
    PERI: 1,
    STEMI: -1,
    NSTEMI: -1,
    UA: -1
  }),
  r("H15", "감기 또는 바이러스 감염 후 흉통", "history", {
    MYO: 2,
    PERI: 1,
    PNA: 1,
    COSTO: 1
  }),
  r(
    "H16",
    "심한 구토 또는 헛구역질 뒤 갑작스러운 흉통",
    "history",
    { BOER: 2, PMED: 1, GERD: 1, PUD: 1, PANC: 1 },
    { redFlagFor: ["BOER"] }
  ),
  r("H17", "식후, 와위, 야간에 악화되는 흉통과 신물 역류", "history", {
    GERD: 2,
    HH: 1,
    ESOPH: 1,
    PUD: 1,
    DYSPEP: 1,
    STEMI: -1,
    NSTEMI: -1,
    UA: -1
  }),
  r("H18", "연하곤란", "history", {
    ESPASM: 2,
    ESOPH: 1,
    GERD: 1,
    LUNGCA: 1,
    FCP: -1
  }),
  r("H19", "연하통", "history", { ESOPH: 2, BOER: 1, GERD: 1, FCP: -1 }),
  r("H20", "기름진 식사 후 상복부/명치 통증, 우측 어깨 방사", "history", {
    BILCOL: 2,
    CHOLE: 2,
    CHOLANG: 1,
    PANC: 1,
    STEMI: 1
  }),
  r("H21", "명치 통증이 등으로 방사되고 구토 동반", "history", {
    PANC: 2,
    PUD: 1,
    PERF_PUD: 1,
    CHOLE: 1,
    STEMI: 1
  }),
  r("H22", "국소 흉벽 압통, 누르면 같은 통증 재현", "history", {
    COSTO: 2,
    TIETZE: 1,
    STRAIN: 2,
    RIB: 1,
    XIPHO: 1,
    STEMI: -1,
    NSTEMI: -1,
    PE: -1,
    DIS: -1
  }),
  r("H23", "외상, 운동, 교통사고, CPR 이후 흉통", "history", {
    RIB: 2,
    STRAIN: 1,
    PTX: 1,
    TPTX: 1,
    PLEFF: 1
  }),
  r("H24", "피부 발진 전후 편측 띠 모양 통증", "history", {
    ZOSTER: 2,
    ICN: 1,
    TRAD: 1,
    COSTO: -1
  }),
  r("H25", "극심한 불안, 죽을 것 같은 공포, 심계항진", "history", {
    PANIC: 2,
    HVS: 1,
    ANX: 1,
    ARR: 1
  }),
  r("H26", "과호흡, 입주변 또는 손발 저림, 정상 산소포화도", "history", {
    HVS: 2,
    PANIC: 1,
    ANX: 1,
    PE: -1,
    PNA: -1,
    AHF: -1,
    PTX: -1
  }),
  r("H27", "3개월 이상 광범위 통증, 피로, 수면장애", "history", {
    FIBRO: 2,
    FCP: 1,
    STEMI: -1,
    NSTEMI: -1,
    PE: -1,
    DIS: -1
  }),
  r("H156", "실신 또는 전실신", "history", {
    ARR: 2,
    AS: 1,
    HCM: 1,
    PE: 1,
    DIS: 1,
    STEMI: 1,
    NSTEMI: 1
  }),
  r("H157", "오심 또는 구토", "history", {
    STEMI: 1,
    NSTEMI: 1,
    PANC: 1,
    CHOLE: 1,
    GERD: 1,
    PANIC: 1
  }),
  r("H158", "하지 부종", "history", {
    AHF: 2,
    PE: 1,
    PH: 1
  }),
  r("H159", "편측 하지 통증 또는 부종", "history", {
    PE: 2,
    PH: 1
  }),
  r("H160", "최근 수술, 장거리 이동 또는 부동", "history", {
    PE: 2,
    T2MI: 1,
    PNA: 1
  }),
  r("H161", "임신 또는 산욕기", "history", {
    PE: 2,
    DIS: 1,
    T2MI: 1
  }),
  r("H162", "흡연", "history", {
    STEMI: 1,
    NSTEMI: 1,
    SA_CCD: 1,
    VSA: 1,
    LUNGCA: 1
  }),
  r("H163", "고혈압", "history", {
    STEMI: 1,
    NSTEMI: 1,
    SA_CCD: 1,
    DIS: 1,
    TAA: 1,
    AHF: 1
  }),
  r("H164", "당뇨", "history", {
    STEMI: 1,
    NSTEMI: 1,
    SA_CCD: 1,
    INOCA: 1
  }),
  r("H165", "고지혈증", "history", {
    STEMI: 1,
    NSTEMI: 1,
    SA_CCD: 1
  }),
  r("H166", "관상동맥질환 또는 PCI/CABG 과거력", "history", {
    STEMI: 1,
    NSTEMI: 1,
    UA: 1,
    SA_CCD: 2,
    T2MI: 1
  }),
  r("H167", "대동맥질환 과거력", "history", {
    DIS: 1,
    IMH: 1,
    PAU: 1,
    TAA: 2
  }),
  r("H168", "혈전색전증 과거력", "history", {
    PE: 2,
    PH: 1
  }),
  r("H169", "가족력: 심근경색, 급사, 대동맥질환", "history", {
    STEMI: 1,
    NSTEMI: 1,
    SA_CCD: 1,
    DIS: 1,
    TAA: 1,
    HCM: 1,
    ARR: 1
  }),
  r("H170", "식은땀", "history", {
    STEMI: 1,
    NSTEMI: 1,
    UA: 1,
    PE: 1,
    DIS: 1,
    PANIC: 1
  })
];

const vitalPhysicalRules: LegacyFindingRule[] = [
  r(
    "V28",
    "저혈압 또는 쇼크",
    "vital",
    {
      STEMI: 1,
      NSTEMI: 1,
      PE: 2,
      TPTX: 2,
      PERI: 2,
      DIS: 2,
      TAA: 2,
      BOER: 1,
      PNA: 1,
      CHOLANG: 1,
      PANC: 1
    },
    { redFlagFor: ["STEMI", "PE", "TPTX", "PERI", "DIS", "TAA"] }
  ),
  r(
    "V29",
    "산소포화도 저하",
    "vital",
    {
      PE: 2,
      PNA: 2,
      PTX: 1,
      TPTX: 2,
      AHF: 2,
      ASTH_COPD: 2,
      PH: 1,
      HVS: -2
    },
    { redFlagFor: ["PE", "PNA", "TPTX", "AHF"] }
  ),
  r("V30", "빈맥", "vital", {
    PE: 1,
    ARR: 2,
    STEMI: 1,
    NSTEMI: 1,
    T2MI: 1,
    PNA: 1,
    PANC: 1,
    CHOLANG: 1,
    PANIC: 1,
    HVS: 1
  }),
  r("V31", "발열", "vital", {
    PNA: 2,
    EMP: 2,
    MYO: 1,
    PERI: 1,
    CHOLE: 1,
    CHOLANG: 2,
    PANC: 1,
    BOER: 1,
    STEMI: -1,
    NSTEMI: -1,
    UA: -1
  }),
  r("V156", "서맥", "vital", {
    ARR: 2,
    STEMI: 1,
    T2MI: 1
  }),
  r("V157", "빈호흡", "vital", {
    PE: 2,
    PNA: 2,
    PTX: 1,
    TPTX: 2,
    AHF: 1,
    ASTH_COPD: 1,
    HVS: 1
  }),
  r(
    "P32",
    "한쪽 호흡음 감소",
    "physical",
    { PTX: 2, TPTX: 2, PLEFF: 1, PNA: 1, EMP: 1 },
    { redFlagFor: ["PTX", "TPTX"] }
  ),
  r("P33", "천명음", "physical", { ASTH_COPD: 2, AHF: 1 }),
  r("P34", "폐수포음, 기좌호흡, 하지부종", "physical", {
    AHF: 2,
    PNA: 1,
    AS: 1,
    HCM: 1,
    PH: 1,
    PE: 1
  }),
  r(
    "P35",
    "경정맥 팽대",
    "physical",
    { PERI: 2, TPTX: 2, PE: 1, PH: 1, AHF: 1 },
    { redFlagFor: ["PERI", "TPTX"] }
  ),
  r("P36", "심낭 마찰음", "physical", { PERI: 2, MYO: 1 }),
  r(
    "P37",
    "이완기 잡음 또는 대동맥판 역류 의심",
    "physical",
    { DIS: 2, TAA: 1 },
    { redFlagFor: ["DIS"] }
  ),
  r("P38", "구출성 수축기 잡음, 경동맥 방사", "physical", {
    AS: 2,
    HCM: 1,
    AHF: 1
  }),
  r("P39", "Valsalva에서 커지는 수축기 잡음", "physical", {
    HCM: 2,
    AS: -1
  }),
  r("P40", "mid-systolic click 또는 late systolic murmur", "physical", {
    MVP: 2
  }),
  r(
    "P41",
    "양팔 혈압 차이 또는 맥박 결손",
    "physical",
    { DIS: 2, IMH: 2, PAU: 1, TAA: 1 },
    { redFlagFor: ["DIS", "IMH"] }
  ),
  r(
    "P42",
    "신경학적 결손, 실신, 사지허혈 동반 흉통",
    "physical",
    { DIS: 2, IMH: 2, PE: 1, STEMI: 1, ARR: 1 },
    { redFlagFor: ["DIS", "IMH", "PE"] }
  ),
  r("P43", "Murphy sign 또는 우상복부 압통", "physical", {
    CHOLE: 2,
    BILCOL: 1,
    CHOLANG: 1,
    PANC: 1
  }),
  r("P44", "황달", "physical", { CHOLANG: 2, CHOLE: 1, PANC: 1 }, { redFlagFor: ["CHOLANG"] }),
  r("P45", "편측 피부분절 수포성 발진", "physical", {
    ZOSTER: 2,
    ICN: -1,
    TRAD: -1
  }),
  r("P46", "어깨 ROM 제한 또는 impingement test 양성", "physical", {
    SHOULDER: 2,
    CRAD: 1,
    COSTO: -1
  }),
  r("P47", "Spurling test 양성, 상지 방사통 또는 감각저하", "physical", {
    CRAD: 2,
    SHOULDER: 1
  }),
  r("P48", "피부분절을 따른 띠 모양 감각 이상", "physical", {
    TRAD: 2,
    ICN: 2,
    ZOSTER: 1
  }),
  r("P49", "검상돌기 압박으로 통증 재현", "physical", {
    XIPHO: 2,
    STEMI: -1,
    NSTEMI: -1,
    UA: -1
  })
];

const ecgRules: LegacyFindingRule[] = [
  r(
    "E50",
    "인접 유도 ST elevation과 reciprocal change",
    "ecg",
    { STEMI: 2, VSA: 1, TTS: 1, MYO: 1, PERI: -1 },
    { redFlagFor: ["STEMI"] }
  ),
  r("E51", "ST elevation이 일시적이고 흉통 소실 후 정상화", "ecg", {
    VSA: 2,
    STEMI: 1,
    UA: 1
  }),
  r("E52", "ST depression 또는 dynamic T-wave inversion", "ecg", {
    NSTEMI: 2,
    UA: 2,
    SA_CCD: 1,
    T2MI: 1,
    VSA: 1,
    PE: 1,
    TTS: 1,
    MYO: 1
  }),
  r("E53", "Wellens pattern 의심", "ecg", {
    UA: 2,
    NSTEMI: 1,
    SA_CCD: 1
  }),
  r("E54", "diffuse concave ST elevation과 PR depression", "ecg", {
    PERI: 2,
    MYO: 2,
    STEMI: -1,
    VSA: -1
  }),
  r("E55", "low voltage와 electrical alternans", "ecg", {
    PERI: 2,
    AHF: 1
  }),
  r("E56", "S1Q3T3, 우축편위, RBBB, anterior T inversion 등 우심부담 패턴", "ecg", {
    PE: 1,
    PH: 1
  }),
  r("E57", "빠른 부정맥: SVT/AF with RVR/VT", "ecg", {
    ARR: 2,
    T2MI: 1,
    AHF: 1,
    STEMI: 1,
    NSTEMI: 1,
    PANIC: -1,
    HVS: -1
  }),
  r("E58", "서맥 또는 고도 방실차단과 흉통", "ecg", {
    STEMI: 2,
    ARR: 2,
    T2MI: 1
  }),
  r("E59", "LVH/strain pattern", "ecg", {
    HCM: 1,
    AS: 1,
    SA_CCD: 1,
    AHF: 1
  }),
  r("E60", "ECG 완전 정상, 반복 ECG 변화 없음", "ecg", {
    STEMI: -2,
    NSTEMI: -1,
    UA: -1,
    PERI: -1
  }),
  r(
    "E156",
    "new LBBB 또는 새 좌각차단",
    "ecg",
    {
      STEMI: 2,
      NSTEMI: 1,
      T2MI: 1
    },
    { redFlagFor: ["STEMI"] }
  ),
];

const labRules: LegacyFindingRule[] = [
  r(
    "L61",
    "hs-troponin 상승 단독",
    "lab",
    {
      NSTEMI: 1,
      STEMI: 1,
      T2MI: 1,
      MYO: 1,
      PERI: 1,
      TTS: 1,
      PE: 1,
      AHF: 1,
      UA: -1
    },
    { sourceNote: "Troponin 상승은 심근 손상을 뜻하며, 그 자체만으로 심근경색을 의미하지 않습니다." }
  ),
  r(
    "L62",
    "hs-troponin 상승/하강과 허혈성 증상 또는 ECG",
    "lab",
    { NSTEMI: 2, STEMI: 2, T2MI: 1, UA: -2, MYO: -1, PERI: -1 },
    { redFlagFor: ["STEMI", "NSTEMI"] }
  ),
  r("L63", "hs-troponin 변화와 빈혈, 저산소증, 패혈증, 빈맥 등 trigger", "lab", {
    T2MI: 2,
    NSTEMI: 1,
    AHF: 1,
    ARR: 1,
    PNA: 1
  }),
  r("L64", "serial hs-troponin 음성, 저위험 흉통, 반복 ECG 변화 없음", "lab", {
    NSTEMI: -2,
    STEMI: -2,
    MYO: -1,
    TTS: -1,
    UA: -1
  }),
  r("L65", "BNP/NT-proBNP 상승", "lab", {
    AHF: 2,
    PE: 1,
    PH: 1,
    TTS: 1,
    AS: 1,
    HCM: 1
  }),
  r("L66", "BNP/NT-proBNP 정상, 심부전 소견 낮음", "lab", { AHF: -1 }),
  r("L67", "D-dimer 상승", "lab", {
    PE: 1,
    DIS: 1,
    IMH: 1,
    PAU: 1,
    PNA: 1
  }),
  r("L68", "저/중간 PE 사전확률과 D-dimer 음성", "lab", { PE: -2 }),
  r("L69", "높은 PE 사전확률과 D-dimer 음성", "lab", { PE: -1 }),
  r("L70", "WBC/CRP 상승", "lab", {
    PNA: 1,
    EMP: 1,
    PERI: 1,
    MYO: 1,
    CHOLE: 1,
    CHOLANG: 1,
    PANC: 1,
    BOER: 1
  }),
  r("L71", "Procalcitonin 상승", "lab", {
    PNA: 1,
    EMP: 1,
    CHOLANG: 1,
    BOER: 1
  }),
  r("L72", "Lipase 또는 amylase 정상상한 3배 이상", "lab", {
    PANC: 2,
    CHOLE: 1
  }),
  r("L73", "Lipase 정상, 전형 통증/영상 소견 없음", "lab", { PANC: -2 }),
  r("L74", "Bilirubin/ALP/GGT 상승, 담즙정체 패턴", "lab", {
    CHOLANG: 2,
    CHOLE: 1,
    PANC: 1
  }),
  r("L75", "H. pylori 양성", "lab", { PUD: 1, DYSPEP: 1 })
];

const cardiacImagingRules: LegacyFindingRule[] = [
  r("C76", "관상동맥 조영술에서 culprit occlusion 또는 thrombus", "cardiac_imaging", {
    STEMI: 2,
    NSTEMI: 2,
    UA: 1,
    TTS: -1,
    MYO: -1
  }),
  r("C77", "CCTA/조영술에서 obstructive CAD 확인", "cardiac_imaging", {
    SA_CCD: 2,
    UA: 1,
    NSTEMI: 1,
    STEMI: 1,
    INOCA: -1
  }),
  r("C78", "CCTA/조영술에서 obstructive CAD 없음", "cardiac_imaging", {
    INOCA: 1,
    TTS: 1,
    MYO: 1,
    VSA: 1,
    SA_CCD: -1,
    STEMI: -1,
    NSTEMI: -1
  }),
  r("C79", "운동부하 또는 스트레스 영상에서 재현성 허혈", "cardiac_imaging", {
    SA_CCD: 2,
    INOCA: 1,
    AS: 1,
    HCM: 1
  }),
  r("C80", "관상동맥 기능검사에서 CFR 감소 또는 IMR 증가", "cardiac_imaging", {
    INOCA: 2,
    GERD: -1,
    COSTO: -1
  }),
  r("C81", "acetylcholine/ergonovine 유발검사에서 관상동맥 연축", "cardiac_imaging", {
    VSA: 2,
    INOCA: 1
  }),
  r("C82", "Echo에서 관상동맥 영역과 일치하는 regional wall motion abnormality", "cardiac_imaging", {
    STEMI: 2,
    NSTEMI: 2,
    T2MI: 1,
    TTS: 1,
    MYO: 1
  }),
  r("C83", "Echo/ventriculography에서 단일 관상동맥 영역을 넘는 apical ballooning", "cardiac_imaging", {
    TTS: 2,
    STEMI: -1,
    NSTEMI: -1
  }),
  r("C84", "CMR에서 subendocardial/transmural LGE와 관상동맥 영역 패턴", "cardiac_imaging", {
    STEMI: 2,
    NSTEMI: 2,
    MYO: -1,
    TTS: -1
  }),
  r("C85", "CMR에서 subepicardial 또는 mid-wall LGE, edema myocarditis pattern", "cardiac_imaging", {
    MYO: 2,
    STEMI: -1,
    NSTEMI: -1
  }),
  r("C86", "CMR/Echo에서 심낭 염증 또는 삼출", "cardiac_imaging", {
    PERI: 2,
    MYO: 1,
    STEMI: -1,
    NSTEMI: -1
  }),
  r(
    "C87",
    "Echo에서 tamponade physiology",
    "cardiac_imaging",
    { PERI: 2 },
    { redFlagFor: ["PERI"] }
  ),
  r("C88", "Echo에서 LVH와 LVOT obstruction", "cardiac_imaging", {
    HCM: 2,
    AS: 1
  }),
  r("C89", "Echo에서 severe aortic stenosis", "cardiac_imaging", {
    AS: 2,
    AHF: 1,
    SA_CCD: 1,
    HCM: -1
  }),
  r("C90", "Echo에서 mitral valve prolapse", "cardiac_imaging", {
    MVP: 2,
    ARR: 1,
    AHF: 1
  }),
  r("C91", "Echo에서 LV systolic dysfunction과 pulmonary congestion", "cardiac_imaging", {
    AHF: 2,
    STEMI: 1,
    NSTEMI: 1,
    MYO: 1,
    TTS: 1,
    HCM: 1
  }),
  r("C92", "Echo 정상, 구조적 심장 이상 없음", "cardiac_imaging", {
    AS: -2,
    HCM: -2,
    MVP: -2,
    PERI: -2,
    AHF: -1
  })
];

const thoracicImagingRules: LegacyFindingRule[] = [
  r(
    "T93",
    "CTA/TEE/MRI에서 intimal flap, true/false lumen",
    "thoracic_imaging",
    { DIS: 2, IMH: -1, PAU: -1, TAA: 1 },
    { redFlagFor: ["DIS"] }
  ),
  r("T94", "CTA/MRI에서 대동맥 벽내혈종", "thoracic_imaging", {
    IMH: 2,
    DIS: 1
  }),
  r("T95", "CTA/MRI에서 관통성 대동맥 궤양", "thoracic_imaging", {
    PAU: 2,
    IMH: 1
  }),
  r(
    "T96",
    "CTA에서 대동맥류 급성 확장, 누출, 파열 의심",
    "thoracic_imaging",
    { TAA: 2, DIS: 1, IMH: 1, PAU: 1 },
    { redFlagFor: ["TAA"] }
  ),
  r("T97", "고품질 대동맥 CTA 정상", "thoracic_imaging", {
    DIS: -2,
    IMH: -2,
    PAU: -2,
    TAA: -2
  }),
  r(
    "T98",
    "CTPA에서 폐동맥 색전",
    "thoracic_imaging",
    { PE: 2, PH: 1 },
    { redFlagFor: ["PE"] }
  ),
  r("T99", "적절한 CTPA 음성", "thoracic_imaging", { PE: -2 }),
  r("T100", "하지 압박초음파에서 DVT", "thoracic_imaging", {
    PE: 2,
    PH: 1
  }),
  r("T101", "V/Q scan high probability", "thoracic_imaging", {
    PE: 2,
    PH: 1
  }),
  r("T102", "CXR에서 기흉", "thoracic_imaging", {
    PTX: 2,
    TPTX: 1
  }),
  r("T103", "Lung ultrasound에서 lung sliding 소실 또는 lung point", "thoracic_imaging", {
    PTX: 2,
    TPTX: 1
  }),
  r(
    "T104",
    "긴장성 기흉 영상 또는 임상 소견, mediastinal shift",
    "thoracic_imaging",
    { TPTX: 2, PTX: 1, PE: -1 },
    { redFlagFor: ["TPTX"] }
  ),
  r("T105", "CXR/CT에서 폐 침윤", "thoracic_imaging", {
    PNA: 2,
    PLEUR: 1,
    EMP: 1,
    LUNGCA: 1
  }),
  r(
    "T156",
    "CXR에서 widened mediastinum",
    "thoracic_imaging",
    {
      DIS: 2,
      IMH: 1,
      PAU: 1,
      TAA: 1
    },
    { redFlagFor: ["DIS", "IMH", "TAA"] }
  ),
  r("T106", "CXR 정상, 감염 증상 없음", "thoracic_imaging", {
    PNA: -1,
    EMP: -1,
    PLEFF: -1,
    PTX: -1
  }),
  r("T107", "CXR/US/CT에서 흉수", "thoracic_imaging", {
    PLEFF: 2,
    EMP: 1,
    PNA: 1,
    AHF: 1,
    LUNGCA: 1,
    PE: 1
  }),
  r("T108", "흉수 loculation, pleural thickening, pleural enhancement", "thoracic_imaging", {
    EMP: 2,
    LUNGCA: 1,
    PNA: 1
  }),
  r("T109", "CT chest에서 종괴, 림프절 비대, 악성 의심", "thoracic_imaging", {
    LUNGCA: 2,
    PLEFF: 1,
    PNA: -1
  }),
  r("T110", "CT chest에서 pneumomediastinum", "thoracic_imaging", {
    PMED: 2,
    BOER: 1,
    PTX: 1,
    ASTH_COPD: 1
  }),
  r("T111", "심초음파에서 RV dilation 또는 strain", "thoracic_imaging", {
    PE: 1,
    PH: 1,
    AHF: 1
  }),
  r("T112", "Right heart catheterization에서 PH 기준 충족", "thoracic_imaging", {
    PH: 2,
    PE: 1,
    AHF: 1
  }),
  r("T113", "Spirometry에서 가변적 기류제한 또는 기관지확장제 반응", "thoracic_imaging", {
    ASTH_COPD: 2
  }),
  r("T114", "Post-bronchodilator FEV1/FVC < 0.7", "thoracic_imaging", {
    ASTH_COPD: 2
  }),
  r("T115", "ABG에서 저산소증 또는 환기부전", "thoracic_imaging", {
    PE: 1,
    PNA: 1,
    PTX: 1,
    TPTX: 1,
    AHF: 1,
    ASTH_COPD: 2,
    HVS: -2
  })
];

const giTestRules: LegacyFindingRule[] = [
  r("G116", "EGD에서 erosive esophagitis 또는 Barrett 식도", "gi_test", {
    GERD: 2,
    ESOPH: 2,
    HH: 1,
    FCP: -2
  }),
  r("G117", "24h pH/impedance에서 병적 acid exposure", "gi_test", {
    GERD: 2,
    HH: 1,
    FCP: -2
  }),
  r("G118", "PPI trial에 명확한 호전", "gi_test", {
    GERD: 1,
    ESOPH: 1,
    PUD: 1,
    FCP: -1
  }),
  r("G119", "EGD/barium swallow에서 식도열공탈장", "gi_test", {
    HH: 2,
    GERD: 1
  }),
  r("G120", "HRM에서 distal esophageal spasm 기준 충족", "gi_test", {
    ESPASM: 2,
    FCP: -2
  }),
  r("G121", "HRM 정상, reflux/endoscopy 정상, 만성 retrosternal pain", "gi_test", {
    FCP: 2,
    ESPASM: -2,
    GERD: -2,
    ESOPH: -2
  }),
  r(
    "G122",
    "Water-soluble esophagram 또는 CT esophagography에서 누출",
    "gi_test",
    { BOER: 2, PMED: 1, PLEFF: 1, EMP: 1 },
    { redFlagFor: ["BOER"] }
  ),
  r("G123", "CT chest에서 mediastinal air/fluid와 pleural effusion, 구토 후 발생", "gi_test", {
    BOER: 2,
    PMED: 1,
    EMP: 1
  }),
  r("G124", "고품질 CT/조영검사에서 식도 누출 없음", "gi_test", {
    BOER: -2
  }),
  r("G125", "EGD에서 위 또는 십이지장 궤양", "gi_test", {
    PUD: 2,
    DYSPEP: 1
  }),
  r(
    "G126",
    "CT/CXR에서 free air, 복막자극 동반",
    "gi_test",
    { PERF_PUD: 2, BOER: 1, PUD: -1 },
    { redFlagFor: ["PERF_PUD"] }
  ),
  r("G127", "상부위장관 내시경 정상, H. pylori 음성, 위험징후 없음", "gi_test", {
    PUD: -1,
    DYSPEP: 1,
    FCP: 1
  }),
  r("G128", "RUQ ultrasound에서 담석", "gi_test", {
    BILCOL: 2,
    CHOLE: 1,
    PANC: 1
  }),
  r("G129", "RUQ ultrasound에서 담낭벽 비후, 담낭주위액, sonographic Murphy sign", "gi_test", {
    CHOLE: 2,
    BILCOL: 1,
    CHOLANG: 1
  }),
  r("G130", "HIDA scan에서 cystic duct obstruction", "gi_test", {
    CHOLE: 2
  }),
  r(
    "G131",
    "CBD dilatation 또는 CBD stone",
    "gi_test",
    { CHOLANG: 2, CHOLE: 1, PANC: 1 },
    { redFlagFor: ["CHOLANG"] }
  ),
  r(
    "G132",
    "Tokyo cholangitis 요소: 발열/염증, 담즙정체, 담도확장/원인",
    "gi_test",
    { CHOLANG: 2, CHOLE: 1, PANC: 1 },
    { redFlagFor: ["CHOLANG"] }
  ),
  r("G133", "Lipase/amylase 3배 이상과 전형 상복부 통증", "gi_test", {
    PANC: 2,
    CHOLE: 1,
    PUD: -1
  }),
  r("G134", "CT/MRI에서 췌장 염증", "gi_test", {
    PANC: 2,
    CHOLE: 1
  }),
  r("G135", "RUQ US 정상, LFT 정상, Murphy 음성", "gi_test", {
    CHOLE: -2,
    CHOLANG: -2,
    BILCOL: -1
  }),
  r("G136", "Lipase 정상과 CT 정상", "gi_test", {
    PANC: -2
  })
];

const mskPsychRules: LegacyFindingRule[] = [
  r("M137", "흉벽 압박으로 동일 통증 재현", "msk_neuro_skin", {
    COSTO: 2,
    STRAIN: 2,
    TIETZE: 1,
    RIB: 1,
    XIPHO: 1,
    STEMI: -1,
    NSTEMI: -1,
    PE: -1,
    DIS: -1
  }),
  r("M138", "늑연골 부위 국소 부종", "msk_neuro_skin", {
    TIETZE: 2,
    COSTO: 1
  }),
  r("M139", "최근 운동, 무거운 물건, 기침 후 근육통", "msk_neuro_skin", {
    STRAIN: 2,
    COSTO: 1,
    RIB: 1,
    PNA: 1
  }),
  r("M140", "Rib X-ray/CT/US에서 늑골골절", "msk_neuro_skin", {
    RIB: 2,
    PTX: 1,
    PLEFF: 1
  }),
  r("M141", "늑골 X-ray 정상", "msk_neuro_skin", {
    RIB: -1,
    STRAIN: 1,
    COSTO: 1
  }),
  r("M142", "Cervical MRI에서 nerve root compression", "msk_neuro_skin", {
    CRAD: 2,
    STEMI: -1
  }),
  r("M143", "Thoracic MRI에서 nerve root lesion", "msk_neuro_skin", {
    TRAD: 2,
    ICN: 1
  }),
  r("M144", "EMG/NCS에서 radiculopathy", "msk_neuro_skin", {
    CRAD: 2,
    TRAD: 2
  }),
  r("M145", "늑간신경 분포 allodynia 또는 burning pain", "msk_neuro_skin", {
    ICN: 2,
    ZOSTER: 1,
    TRAD: 1
  }),
  r("M146", "편측 dermatomal vesicular rash", "msk_neuro_skin", {
    ZOSTER: 2,
    ICN: -1,
    TRAD: -1
  }),
  r("M147", "VZV PCR 양성", "msk_neuro_skin", {
    ZOSTER: 2
  }),
  r("M148", "어깨 X-ray/US/MRI에서 회전근개 또는 관절 이상", "msk_neuro_skin", {
    SHOULDER: 2,
    CRAD: -1
  }),
  r("M149", "검상돌기 압박으로 통증 재현, 영상 구조 이상 없음", "msk_neuro_skin", {
    XIPHO: 2,
    STEMI: -1
  }),
  r("M150", "WPI/SSS가 2016 fibromyalgia criteria 충족, 3개월 이상", "msk_neuro_skin", {
    FIBRO: 2,
    STEMI: -1,
    NSTEMI: -1,
    PE: -1
  }),
  r("PS151", "갑작스러운 공포/불편감이 수분 내 최고조와 4개 이상 공황 증상", "psych_functional", {
    PANIC: 2,
    HVS: 1,
    ANX: 1,
    ARR: 1
  }),
  r("PS152", "반복 정상 심장/폐 평가와 스트레스 관련 흉부 압박감", "psych_functional", {
    ANX: 2,
    PANIC: 1,
    HVS: 1,
    STEMI: -1,
    NSTEMI: -1,
    PE: -1
  }),
  r("PS153", "정상 SpO2, 정상 CXR, ECG 위험소견 없음과 과호흡/저림", "psych_functional", {
    HVS: 2,
    PANIC: 1,
    PE: -1,
    PNA: -1,
    AHF: -1
  }),
  r("PS154", "산소포화도 저하가 있는 과호흡", "psych_functional", {
    HVS: -2,
    PE: 1,
    PNA: 1,
    AHF: 1,
    ASTH_COPD: 1
  }),
  r("PS155", "Rome IV 기능성 흉통 조건: 만성 retrosternal pain과 GERD/EoE/운동질환/구조질환 배제", "psych_functional", {
    FCP: 2,
    GERD: -2,
    ESPASM: -2,
    ESOPH: -2,
    PUD: -1
  })
];

export const legacyFindingRules: LegacyFindingRule[] = [
  ...historyRules,
  ...vitalPhysicalRules,
  ...ecgRules,
  ...labRules,
  ...cardiacImagingRules,
  ...thoracicImagingRules,
  ...giTestRules,
  ...mskPsychRules
];
