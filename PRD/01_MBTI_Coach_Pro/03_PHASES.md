# MBTI Coach Pro — Phase 분리 계획

> 한 번에 다 만들면 복잡해져서 품질이 떨어집니다.
> Phase별로 나눠서 각각 "진짜 동작하는 제품"을 만듭니다.

---

## Phase 1: MVP (3~4주)

### 목표
첫 결제 발생 검증. "MBTI 테스트 → AI 리포트 → 결제" 핵심 루프 완성.

### 기능
- [ ] MBTI 28문항 테스트 UI (프론트엔드 로직으로 유형 계산)
- [ ] 애착유형 + 에니어그램 보조 테스트 (각 10문항)
- [ ] 유형 조합 기반 AI 리포트 생성 (GPT-4o, 서버 사이드)
- [ ] 리포트 미리보기 (전체의 20%만 무료 공개)
- [ ] Toss Payments ₩9,900 일회성 결제 연동
- [ ] 결제 후 전체 리포트 unlock + PDF 다운로드
- [ ] 카카오/구글 소셜 로그인 (Supabase Auth)
- [ ] OG 이미지 동적 생성 + 카카오/인스타 공유 버튼

### 데이터
- User, TestResult, Report

### 인증
- Supabase Auth + Kakao OAuth + Google OAuth

### "진짜 제품" 체크리스트
- [ ] 실제 Supabase DB 연결 (목업 데이터 X)
- [ ] 실제 Toss Payments 연동 (테스트 키 → 운영 키)
- [ ] Vercel에 프로덕션 배포 (localhost X)
- [ ] 다른 사람이 URL로 접속해서 결제까지 완료 가능

### Phase 1 시작 프롬프트
```
이 PRD를 읽고 Phase 1을 구현해주세요.
@PRD/01_MBTI_Coach_Pro/01_PRD.md
@PRD/01_MBTI_Coach_Pro/02_DATA_MODEL.md
@PRD/01_MBTI_Coach_Pro/04_PROJECT_SPEC.md

Phase 1 범위:
- MBTI/애착/에니어그램 테스트 UI
- GPT-4o 기반 AI 리포트 생성
- Toss Payments ₩9,900 결제 연동
- Supabase Auth 소셜 로그인
- 리포트 공유 기능

반드시 지켜야 할 것:
- 04_PROJECT_SPEC.md의 "절대 하지 마" 목록 준수
- 실제 Supabase DB 연결 (목업 X)
- 실제 Toss Payments 연동
- any 타입 사용 금지
- pnpm만 사용
```

---

## Phase 2: 확장 (5~7주)

### 전제 조건
- Phase 1이 Vercel에 안정적으로 배포된 상태
- 리포트 판매 100건 달성 (PMF 시그널)

### 목표
월 구독 수익 확보. 90일 코스로 리텐션 구조 만들기.

### 기능
- [ ] 16 MBTI 유형별 90일 미션 콘텐츠 (GPT-4o 자동 생성 후 검수)
- [ ] ₩29,900 코스 결제 연동
- [ ] 코스 홈 화면 (오늘의 미션 + 진도 바)
- [ ] 매일 1분 체크인 UI (텍스트 입력 → AI 피드백)
- [ ] 브라우저 알림 허용 요청 (Web Push)

### 추가 데이터
- CourseEnroll, DailyMission

### 통합 테스트
- Phase 1 테스트 → 리포트 → 결제 흐름이 여전히 정상 동작하는지 확인

---

## Phase 3: 고도화 (4~5주)

### 전제 조건
- Phase 1 + 2 안정 운영 중
- 코스 가입자 50명 이상

### 목표
바이럴 계수 향상 + 글로벌 시장 진출.

### 기능
- [ ] 호환성 PDF 생성 (2인 MBTI 조합 AI 분석 + PDF)
- [ ] Web Push 알림 (매일 아침 미션 리마인더)
- [ ] 영어 버전 론치 (i18n, /en 경로)

### 추가 데이터
- CompatReport

### 주의사항
- PDF 생성 라이브러리 비용 검토 (Puppeteer vs React-PDF)
- 영어 버전은 SEO 키워드 리서치 별도 필요

---

## Phase 로드맵 요약

| Phase | 핵심 기능 | 상태 |
|-------|----------|------|
| Phase 1 (MVP, 3~4주) | 테스트 + AI 리포트 + ₩9,900 결제 | 시작 전 |
| Phase 2 (확장, 5~7주) | 90일 코스 + ₩29,900 구독 | Phase 1 완료 후 |
| Phase 3 (고도화, 4~5주) | 호환성 PDF + 영어 글로벌 | Phase 2 완료 후 |
