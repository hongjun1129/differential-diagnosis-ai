# differential-diagnosis-ai

한국어 흉통 감별진단 체크리스트 보조 AI MVP입니다.

이 앱은 자율 진단 도구가 아니라 의사, 의대생, 전공의, 일차진료 의료진의 임상 추론을 구조화하는 교육용 프로토타입입니다. 치료 권고나 최종 진단 주장을 제공하지 않습니다.

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run typecheck
npm test
```

## 구조

- `app/page.tsx`: App Router 진입점
- `src/types/clinical.ts`: 임상 데이터 타입
- `src/data/diagnoses.ts`: 편집 가능한 진단 지식 파일
- `src/data/findingRules.ts`: 편집 가능한 소견별 가중치 규칙 파일
- `src/data/sampleCases.ts`: 샘플 환자 프리셋
- `src/lib/scoring.ts`: 선택 소견 기반 점수 계산 엔진
- `src/components/`: 대시보드 UI 컴포넌트
