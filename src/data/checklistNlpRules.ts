import type { ChecklistNlpConceptType, ChecklistNlpRule, ClinicalContext } from "@/types/clinical";

type RuleInput = {
  itemId: string;
  labelKo: string;
  labelEn?: string;
  conceptType: ChecklistNlpConceptType;
  conceptId: string;
  patterns?: RegExp[];
  synonyms?: string[];
  negatable?: boolean;
  defaultContext?: ClinicalContext;
  redFlag?: boolean;
  autoApplyThreshold?: number;
  previewThreshold?: number;
};

const rx = (source: string) => new RegExp(source, "i");

const rule = ({
  patterns = [],
  synonyms = [],
  negatable = true,
  defaultContext = "current_symptom",
  autoApplyThreshold = 0.86,
  previewThreshold = 0.65,
  ...input
}: RuleInput): ChecklistNlpRule => ({
  ...input,
  patterns,
  synonyms,
  negatable,
  defaultContext,
  autoApplyThreshold,
  previewThreshold
});

export const checklistNlpRules: ChecklistNlpRule[] = [
  rule({
    itemId: "H01",
    labelKo: "압박감, 조이는 느낌, 쥐어짜는 흉통",
    labelEn: "pressure-like chest pain",
    conceptType: "symptom",
    conceptId: "symptom.pressure_like_chest_pain",
    patterns: [rx("(압박|조이|쥐어짜|무거운).{0,8}(흉통|가슴\\s*통증|chest pain|CP)")],
    synonyms: ["압박감", "조이는 흉통", "쥐어짜는 흉통", "pressure-like chest pain"]
  }),
  rule({
    itemId: "H02",
    labelKo: "운동, 계단, 스트레스 때 악화",
    labelEn: "exertional worsening",
    conceptType: "symptom",
    conceptId: "symptom.exertional_chest_pain",
    patterns: [rx("(운동|계단|스트레스|exertion|exercise|stairs).{0,10}(악화|유발|심해)")],
    synonyms: ["운동 시 악화", "계단에서 악화", "exertional chest pain"]
  }),
  rule({
    itemId: "H03",
    labelKo: "휴식 또는 nitroglycerin으로 완화",
    labelEn: "relieved by rest or nitroglycerin",
    conceptType: "symptom",
    conceptId: "symptom.relief_by_rest_or_nitro",
    patterns: [rx("(휴식|안정|nitro|nitroglycerin|NTG|니트로).{0,10}(완화|호전|좋아)")],
    synonyms: ["휴식으로 완화", "nitroglycerin 완화", "NTG 호전"]
  }),
  rule({
    itemId: "H07",
    labelKo: "흡기나 기침 때 악화되는 흉막성 흉통",
    labelEn: "pleuritic chest pain",
    conceptType: "symptom",
    conceptId: "symptom.pleuritic_chest_pain",
    patterns: [rx("(흡기|숨\\s*쉴|기침|pleuritic).{0,12}(악화|통증|흉통)")],
    synonyms: ["흡기 시 악화", "기침 때 악화", "pleuritic pain"]
  }),
  rule({
    itemId: "H09",
    labelKo: "갑자기 시작한 찢어지는 흉통 또는 등통증",
    labelEn: "sudden tearing chest pain",
    conceptType: "symptom",
    conceptId: "symptom.tearing_chest_pain",
    patterns: [rx("(갑자기|돌연|sudden).{0,12}(찢어|tearing|ripping|흉통|가슴)"), rx("(찢어|tearing|ripping).{0,10}(흉통|가슴|등)")],
    synonyms: ["갑자기 찢어지는 흉통", "tearing chest pain"],
    redFlag: true
  }),
  rule({
    itemId: "H10",
    labelKo: "통증이 등, 견갑골 사이로 이동",
    labelEn: "back or interscapular radiation",
    conceptType: "symptom",
    conceptId: "symptom.back_radiation",
    patterns: [rx("(등|견갑골|interscapular|back).{0,12}(방사|이동|radiat)")],
    synonyms: ["등으로 방사", "견갑골 사이 방사", "back radiation"]
  }),
  rule({
    itemId: "H12",
    labelKo: "호흡곤란이 흉통보다 두드러짐",
    labelEn: "dyspnea",
    conceptType: "symptom",
    conceptId: "symptom.dyspnea",
    patterns: [rx("호흡\\s*곤란|숨\\s*(참|이\\s*참|이\\s*차|차고)|dyspnea|\\bSOB\\b|shortness\\s*of\\s*breath")],
    synonyms: ["호흡곤란", "숨참", "숨이 참", "숨이 차", "dyspnea", "SOB"]
  }),
  rule({
    itemId: "H13",
    labelKo: "객혈",
    labelEn: "hemoptysis",
    conceptType: "symptom",
    conceptId: "symptom.hemoptysis",
    patterns: [rx("객혈|hemoptysis|haemoptysis")],
    synonyms: ["객혈", "hemoptysis"]
  }),
  rule({
    itemId: "H14",
    labelKo: "발열, 기침, 객담",
    labelEn: "fever cough sputum",
    conceptType: "symptom",
    conceptId: "symptom.fever_cough_sputum",
    patterns: [rx("기침|객담|가래|cough|sputum|phlegm"), rx("발열|fever")],
    synonyms: ["기침", "객담", "가래", "cough", "sputum"]
  }),
  rule({
    itemId: "H156",
    labelKo: "실신 또는 전실신",
    labelEn: "syncope or presyncope",
    conceptType: "symptom",
    conceptId: "symptom.syncope",
    patterns: [rx("전?실신|syncope|presyncope|near\\s*syncope")],
    synonyms: ["실신", "전실신", "syncope"]
  }),
  rule({
    itemId: "H170",
    labelKo: "식은땀",
    labelEn: "diaphoresis",
    conceptType: "symptom",
    conceptId: "symptom.diaphoresis",
    patterns: [rx("식은\\s*땀|diaphoresis|cold\\s*sweat")],
    synonyms: ["식은땀", "diaphoresis"]
  }),
  rule({
    itemId: "H157",
    labelKo: "오심 또는 구토",
    labelEn: "nausea or vomiting",
    conceptType: "symptom",
    conceptId: "symptom.nausea_vomiting",
    patterns: [rx("오심|구토|nausea|vomiting|emesis")],
    synonyms: ["오심", "구토", "nausea", "vomiting"]
  }),
  rule({
    itemId: "H16",
    labelKo: "심한 구토 또는 헛구역질 뒤 갑작스러운 흉통",
    labelEn: "post-emesis chest pain",
    conceptType: "symptom",
    conceptId: "red_flag.boerhaave",
    patterns: [rx("(심한\\s*)?(구토|헛구역질|retching|vomiting).{0,16}(후|뒤).{0,16}(갑작|흉통|가슴)")],
    synonyms: ["구토 후 갑작스러운 흉통", "post-emesis chest pain"],
    redFlag: true
  }),
  rule({
    itemId: "H22",
    labelKo: "국소 흉벽 압통, 누르면 같은 통증 재현",
    labelEn: "reproducible chest wall tenderness",
    conceptType: "physical",
    conceptId: "physical.chest_wall_tenderness",
    patterns: [rx("(흉벽\\s*압통|누르면|압박).{0,14}(같은\\s*)?(통증|재현|아픔)|reproducible.{0,12}(pain|tenderness)")],
    synonyms: ["흉벽 압통", "누르면 같은 통증 재현", "reproducible tenderness"]
  }),
  rule({
    itemId: "H17",
    labelKo: "식후, 와위, 야간에 악화되는 흉통과 신물 역류",
    labelEn: "reflux-like burning chest pain",
    conceptType: "symptom",
    conceptId: "symptom.reflux_like_chest_pain",
    patterns: [rx("(타는\\s*듯|작열|식후|제산제|신물|역류|heartburn|burning).{0,18}(흉통|통증|완화|악화|reflux)?")],
    synonyms: ["타는 듯한 통증", "식후 악화", "제산제 반응", "heartburn"]
  }),
  rule({
    itemId: "H25",
    labelKo: "극심한 불안, 죽을 것 같은 공포, 심계항진",
    labelEn: "panic-like symptoms",
    conceptType: "symptom",
    conceptId: "symptom.panic_features",
    patterns: [rx("불안|공황|죽을\\s*것|panic|anxiety")],
    synonyms: ["불안", "공황", "panic"]
  }),
  rule({
    itemId: "H158",
    labelKo: "하지 부종",
    labelEn: "leg edema",
    conceptType: "symptom",
    conceptId: "symptom.leg_edema",
    patterns: [rx("하지\\s*부종|다리\\s*부종|leg\\s*edema")],
    synonyms: ["하지 부종", "leg edema"]
  }),
  rule({
    itemId: "H159",
    labelKo: "편측 하지 통증 또는 부종",
    labelEn: "unilateral leg pain or swelling",
    conceptType: "symptom",
    conceptId: "symptom.unilateral_leg_swelling",
    patterns: [rx("(편측|한쪽|unilateral).{0,10}(하지|다리|leg).{0,10}(통증|부종|swelling|pain)")],
    synonyms: ["편측 하지 부종", "unilateral leg swelling"]
  }),
  rule({
    itemId: "H160",
    labelKo: "최근 수술, 장거리 이동 또는 부동",
    labelEn: "recent surgery travel immobilization",
    conceptType: "risk_factor",
    conceptId: "risk_factor.immobility_surgery_travel",
    patterns: [rx("(최근\\s*)?(수술|장거리|비행|이동|부동|immobil|surgery|long\\s*flight)")],
    synonyms: ["최근 수술", "장거리 비행", "부동"],
    defaultContext: "risk_factor"
  }),
  rule({
    itemId: "H161",
    labelKo: "임신 또는 산욕기",
    labelEn: "pregnancy or postpartum",
    conceptType: "risk_factor",
    conceptId: "risk_factor.pregnancy_postpartum",
    patterns: [rx("임신|산욕기|postpartum|pregnan")],
    synonyms: ["임신", "산욕기", "postpartum"],
    defaultContext: "risk_factor"
  }),
  rule({
    itemId: "H162",
    labelKo: "흡연",
    labelEn: "smoking",
    conceptType: "risk_factor",
    conceptId: "risk_factor.smoking",
    patterns: [rx("흡연|smok")],
    synonyms: ["흡연", "smoking"],
    defaultContext: "risk_factor"
  }),
  rule({
    itemId: "H163",
    labelKo: "고혈압",
    labelEn: "hypertension",
    conceptType: "risk_factor",
    conceptId: "risk_factor.hypertension",
    patterns: [rx("고혈압|HTN|hypertension")],
    synonyms: ["고혈압", "HTN"],
    defaultContext: "risk_factor"
  }),
  rule({
    itemId: "H164",
    labelKo: "당뇨",
    labelEn: "diabetes",
    conceptType: "risk_factor",
    conceptId: "risk_factor.diabetes",
    patterns: [rx("당뇨|DM|diabetes")],
    synonyms: ["당뇨", "DM"],
    defaultContext: "risk_factor"
  }),
  rule({
    itemId: "H165",
    labelKo: "고지혈증",
    labelEn: "dyslipidemia",
    conceptType: "risk_factor",
    conceptId: "risk_factor.dyslipidemia",
    patterns: [rx("고지혈증|이상지질혈증|dyslipidemia|hyperlipidemia|HLD")],
    synonyms: ["고지혈증", "HLD"],
    defaultContext: "risk_factor"
  }),
  rule({
    itemId: "H166",
    labelKo: "관상동맥질환 또는 PCI/CABG 과거력",
    labelEn: "CAD PCI CABG history",
    conceptType: "history",
    conceptId: "history.cad_pci_cabg",
    patterns: [rx("관상동맥|CAD|PCI|CABG|스텐트")],
    synonyms: ["관상동맥질환", "PCI", "CABG", "스텐트"],
    defaultContext: "past_history"
  }),
  rule({
    itemId: "H167",
    labelKo: "대동맥질환 과거력",
    labelEn: "aortic disease history",
    conceptType: "history",
    conceptId: "history.aortic_disease",
    patterns: [rx("대동맥.{0,8}(질환|박리|류|수술)|aortic\\s*(disease|dissection|aneurysm)")],
    synonyms: ["대동맥질환", "aortic disease"],
    defaultContext: "past_history",
    redFlag: true
  }),
  rule({
    itemId: "H168",
    labelKo: "혈전색전증 과거력",
    labelEn: "VTE history",
    conceptType: "history",
    conceptId: "history.vte",
    patterns: [rx("혈전색전|폐색전|DVT|VTE|PE\\s*과거")],
    synonyms: ["혈전색전증", "VTE", "DVT"],
    defaultContext: "past_history"
  }),
  rule({
    itemId: "H169",
    labelKo: "가족력: 심근경색, 급사, 대동맥질환",
    labelEn: "family history of MI sudden death or aortic disease",
    conceptType: "history",
    conceptId: "family_history.cardiovascular",
    patterns: [rx("(가족력|아버지|어머니|부친|모친|형제|자매|family history|FHx).{0,18}(심근경색|급사|대동맥|MI|sudden)")],
    synonyms: ["아버지 심근경색", "가족력 심근경색", "family history MI"],
    defaultContext: "family_history"
  }),
  rule({
    itemId: "P41",
    labelKo: "양팔 혈압 차이 또는 맥박 결손",
    labelEn: "bilateral arm blood pressure difference",
    conceptType: "physical",
    conceptId: "physical.bilateral_bp_difference",
    patterns: [rx("양팔.{0,10}(혈압\\s*차|맥박\\s*차|pulse\\s*deficit)|blood\\s*pressure\\s*difference")],
    synonyms: ["양팔 혈압 차", "맥박 결손"],
    redFlag: true
  }),
  rule({
    itemId: "P37",
    labelKo: "이완기 잡음 또는 대동맥판 역류 의심",
    labelEn: "new murmur",
    conceptType: "physical",
    conceptId: "physical.new_murmur",
    patterns: [rx("새\\s*심잡음|잡음|murmur")],
    synonyms: ["새 심잡음", "murmur"]
  }),
  rule({
    itemId: "P35",
    labelKo: "경정맥 팽대",
    labelEn: "JVD",
    conceptType: "physical",
    conceptId: "physical.jvd",
    patterns: [rx("경정맥\\s*팽대|JVD")],
    synonyms: ["경정맥 팽대", "JVD"],
    redFlag: true
  }),
  rule({
    itemId: "P32",
    labelKo: "한쪽 호흡음 감소",
    labelEn: "unilateral decreased breath sounds",
    conceptType: "physical",
    conceptId: "physical.unilateral_decreased_breath_sound",
    patterns: [rx("(한쪽|편측).{0,10}(호흡음|breath sound).{0,10}(감소|없)")],
    synonyms: ["한쪽 호흡음 감소", "unilateral breath sound decreased"],
    redFlag: true
  }),
  rule({
    itemId: "V28",
    labelKo: "저혈압 또는 쇼크",
    labelEn: "hypotension or shock",
    conceptType: "vital",
    conceptId: "vital.hypotension_or_shock",
    patterns: [rx("저혈압|쇼크|hypotension|shock")],
    synonyms: ["저혈압", "쇼크", "hypotension"],
    defaultContext: "test_result",
    redFlag: true
  }),
  rule({
    itemId: "V30",
    labelKo: "빈맥",
    labelEn: "tachycardia",
    conceptType: "vital",
    conceptId: "vital.tachycardia",
    patterns: [rx("빈맥|tachycardia")],
    synonyms: ["빈맥", "tachycardia"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "V156",
    labelKo: "서맥",
    labelEn: "bradycardia",
    conceptType: "vital",
    conceptId: "vital.bradycardia",
    patterns: [rx("서맥|bradycardia")],
    synonyms: ["서맥", "bradycardia"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "V157",
    labelKo: "빈호흡",
    labelEn: "tachypnea",
    conceptType: "vital",
    conceptId: "vital.tachypnea",
    patterns: [rx("빈호흡|tachypnea")],
    synonyms: ["빈호흡", "tachypnea"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "V29",
    labelKo: "산소포화도 저하",
    labelEn: "hypoxemia",
    conceptType: "vital",
    conceptId: "vital.hypoxemia",
    patterns: [rx("저산소|hypoxemia|hypoxia")],
    synonyms: ["저산소증", "hypoxemia"],
    defaultContext: "test_result",
    redFlag: true
  }),
  rule({
    itemId: "V31",
    labelKo: "발열",
    labelEn: "fever",
    conceptType: "vital",
    conceptId: "vital.fever",
    patterns: [rx("발열|fever")],
    synonyms: ["발열", "fever"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "E50",
    labelKo: "인접 유도 ST elevation과 reciprocal change",
    labelEn: "ST elevation",
    conceptType: "ecg",
    conceptId: "ecg.st_elevation",
    patterns: [rx("ST\\s*(상승|elevation|분절\\s*상승)|\\bSTE\\b|STEMI")],
    synonyms: ["ST 상승", "ST elevation", "STE", "STEMI"],
    defaultContext: "test_result",
    redFlag: true
  }),
  rule({
    itemId: "E52",
    labelKo: "ST depression 또는 dynamic T-wave inversion",
    labelEn: "ST depression or T-wave inversion",
    conceptType: "ecg",
    conceptId: "ecg.st_depression_t_wave_inversion",
    patterns: [rx("ST\\s*(depression|하강)|T\\s*wave\\s*inversion|T파\\s*역전|T\\s*inversion")],
    synonyms: ["ST depression", "T wave inversion", "T파 역전"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "E156",
    labelKo: "new LBBB 또는 새 좌각차단",
    labelEn: "new LBBB",
    conceptType: "ecg",
    conceptId: "ecg.new_lbbb",
    patterns: [rx("(new|새|신규).{0,8}(LBBB|좌각차단)|new\\s*LBBB")],
    synonyms: ["new LBBB", "새 좌각차단"],
    defaultContext: "test_result",
    redFlag: true
  }),
  rule({
    itemId: "L61",
    labelKo: "hs-troponin 상승 단독",
    labelEn: "troponin elevated",
    conceptType: "lab",
    conceptId: "lab.troponin_elevated",
    patterns: [rx("(troponin|트로포닌|TnI|TnT).{0,16}(상승|양성|증가|high|elevated|positive|음성|negative|정상)")],
    synonyms: ["troponin", "트로포닌", "TnI", "TnT"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "L67",
    labelKo: "D-dimer 상승",
    labelEn: "D-dimer elevated",
    conceptType: "lab",
    conceptId: "lab.d_dimer_elevated",
    patterns: [rx("(D-?dimer|d\\s*dimer|디다이머).{0,16}(상승|양성|증가|elevated|positive|음성|negative|정상|\\d{3,})")],
    synonyms: ["D-dimer", "d dimer", "디다이머"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "L70",
    labelKo: "WBC/CRP 상승",
    labelEn: "WBC or CRP elevated",
    conceptType: "lab",
    conceptId: "lab.inflammatory_marker_elevated",
    patterns: [rx("(WBC|CRP|백혈구|염증수치).{0,16}(상승|증가|high|elevated|positive)")],
    synonyms: ["WBC 상승", "CRP 상승"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "T105",
    labelKo: "CXR/CT에서 폐 침윤",
    labelEn: "consolidation or pneumonia imaging",
    conceptType: "imaging",
    conceptId: "imaging.consolidation",
    patterns: [rx("(CXR|흉부\\s*X선|CT).{0,18}(consolidation|침윤|pneumonia|폐렴)")],
    synonyms: ["CXR consolidation", "pneumonia finding"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "T102",
    labelKo: "CXR에서 기흉",
    labelEn: "pneumothorax imaging",
    conceptType: "imaging",
    conceptId: "imaging.pneumothorax",
    patterns: [rx("(CXR|흉부\\s*X선|CT).{0,18}(pneumothorax|기흉)|pneumothorax")],
    synonyms: ["CXR pneumothorax", "pneumothorax", "기흉"],
    defaultContext: "test_result",
    redFlag: true
  }),
  rule({
    itemId: "T156",
    labelKo: "CXR에서 widened mediastinum",
    labelEn: "widened mediastinum",
    conceptType: "imaging",
    conceptId: "imaging.widened_mediastinum",
    patterns: [rx("widened\\s*mediastinum|종격동\\s*확대")],
    synonyms: ["widened mediastinum", "종격동 확대"],
    defaultContext: "test_result",
    redFlag: true
  }),
  rule({
    itemId: "T93",
    labelKo: "CTA/TEE/MRI에서 intimal flap, true/false lumen",
    labelEn: "aortic dissection imaging",
    conceptType: "imaging",
    conceptId: "red_flag.aortic_dissection",
    patterns: [rx("(CTA|TEE|MRI|CT).{0,18}(dissection|대동맥\\s*박리|intimal\\s*flap|flap)|대동맥\\s*박리|aortic\\s*dissection")],
    synonyms: ["대동맥 박리", "aortic dissection", "dissection"],
    defaultContext: "hypothesis",
    redFlag: true
  }),
  rule({
    itemId: "T98",
    labelKo: "CTPA에서 폐동맥 색전",
    labelEn: "pulmonary embolism imaging",
    conceptType: "imaging",
    conceptId: "red_flag.pulmonary_embolism",
    patterns: [rx("(CTPA|CT|영상).{0,18}(PE|폐색전|pulmonary\\s*embol)|폐색전증|pulmonary\\s*embolism")],
    synonyms: ["폐색전증", "pulmonary embolism", "PE"],
    defaultContext: "hypothesis",
    redFlag: true
  }),
  rule({
    itemId: "T104",
    labelKo: "긴장성 기흉 영상 또는 임상 소견, mediastinal shift",
    labelEn: "tension pneumothorax",
    conceptType: "imaging",
    conceptId: "red_flag.tension_pneumothorax",
    patterns: [rx("긴장성\\s*기흉|tension\\s*pneumothorax|mediastinal\\s*shift")],
    synonyms: ["긴장성 기흉", "tension pneumothorax"],
    defaultContext: "hypothesis",
    redFlag: true
  }),
  rule({
    itemId: "C87",
    labelKo: "Echo에서 tamponade physiology",
    labelEn: "cardiac tamponade",
    conceptType: "imaging",
    conceptId: "red_flag.cardiac_tamponade",
    patterns: [rx("cardiac\\s*tamponade|심장\\s*압전|tamponade")],
    synonyms: ["심장압전", "cardiac tamponade"],
    defaultContext: "hypothesis",
    redFlag: true
  }),
  rule({
    itemId: "AK-035",
    labelKo: "young female ACS",
    labelEn: "SCAD risk context",
    conceptType: "risk_factor",
    conceptId: "risk_factor.scad_context",
    patterns: [rx("SCAD|자발성\\s*관상동맥\\s*박리|spontaneous\\s*coronary\\s*artery\\s*dissection|산후.{0,12}ACS|postpartum.{0,12}ACS")],
    synonyms: ["SCAD", "자발성 관상동맥 박리", "postpartum ACS"],
    defaultContext: "risk_factor",
    redFlag: true
  }),
  rule({
    itemId: "AK-142",
    labelKo: "stimulant use",
    labelEn: "stimulant-associated ischemia",
    conceptType: "risk_factor",
    conceptId: "risk_factor.stimulant_ischemia",
    patterns: [rx("cocaine|amphetamine|stimulant|코카인|암페타민|자극제")],
    synonyms: ["cocaine", "amphetamine", "stimulant", "자극제"],
    defaultContext: "risk_factor"
  }),
  rule({
    itemId: "AK-214",
    labelKo: "MI + nonobstructive coronaries",
    labelEn: "MINOCA",
    conceptType: "imaging",
    conceptId: "diagnosis.minoca",
    patterns: [rx("MINOCA|non[-\\s]?obstructive\\s*coronar|비폐쇄성\\s*관상동맥")],
    synonyms: ["MINOCA", "nonobstructive coronaries", "비폐쇄성 관상동맥"],
    defaultContext: "test_result"
  }),
  rule({
    itemId: "AK-059",
    labelKo: "vomiting before pain",
    labelEn: "Boerhaave trigger",
    conceptType: "symptom",
    conceptId: "red_flag.boerhaave_trigger",
    patterns: [rx("(구토|헛구역질|retching|vomiting).{0,16}(후|뒤|before).{0,16}(흉통|가슴|pain)")],
    synonyms: ["구토 후 흉통", "vomiting before pain", "Boerhaave"],
    redFlag: true
  }),
  rule({
    itemId: "AK-145",
    labelKo: "Wells/PERC/D-dimer",
    labelEn: "PE score criteria",
    conceptType: "lab",
    conceptId: "score.pe_wells_perc",
    patterns: [rx("Wells|Geneva|PERC|D-?dimer|디다이머")],
    synonyms: ["Wells", "Geneva", "PERC", "D-dimer", "디다이머"],
    defaultContext: "test_result",
    redFlag: true
  })
];

export const checklistNlpRuleByItemId = new Map(
  checklistNlpRules.map((item) => [item.itemId, item])
);
