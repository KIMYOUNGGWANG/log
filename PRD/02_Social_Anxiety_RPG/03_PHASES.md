# 사회불안 노출치료 RPG — Phase 분리 계획

> 한국 PMF 먼저 → 북미 확장 순서로 진행합니다.
> Phase별로 "진짜 동작하는 제품"을 배포합니다.

---

## Phase 1a: 한국 MVP (4~6주)

### 목표
한국 시장에서 첫 유료 구독자 50명 달성. 텍스트 롤플레이 → GAD-7 감소 → 구독 전환 루프 검증.

### 기능
- [ ] 한국어 시나리오 25개 제작 (카페·회식·면접·소개팅·전화)
- [ ] 무료 체험 5개 (비구독자 접근 가능)
- [ ] GPT-4o 기반 텍스트 롤플레이 (Server Action, 최대 15턴)
- [ ] GAD-7 간이 측정 — 세션 시작 전/후 (0~21점)
- [ ] 세션 메모리 AI — 이전 연습 패턴 기억 및 다음 세션 브리핑
- [ ] 주간 GAD-7 변화 그래프 (미니 리포트)
- [ ] 레벨 1~5 진도 트래커 + 배지 5종
- [ ] Stripe ₩12,900/월 구독 연동
- [ ] Google + Apple 소셜 로그인 (Supabase Auth)

### 데이터
- users, scenarios(locale=ko), sessions, messages, user_memories, Badge, UserBadge, subscriptions

### 인증
- Google OAuth + Apple OAuth (Supabase Auth)

### "진짜 제품" 체크리스트
- [ ] 실제 Supabase DB 연결 (목업 데이터 X)
- [ ] 실제 Stripe 연동 (테스트 키 → 운영 키)
- [ ] GPT-4o API 실제 호출 (mock X)
- [ ] Vercel 프로덕션 배포 (localhost X)
- [ ] 다른 사람이 URL로 접속해서 결제까지 완료 가능

### 성공 기준
- [ ] 유료 구독자 50명/월 (매출 ₩645,000)
- [ ] 무료 체험 → 구독 전환율 20%+
- [ ] 세션 완료율 70%+
- [ ] 2주 연속 사용자 GAD-7 평균 2점 이상 감소

### Phase 1a 시작 프롬프트
```
이 PRD를 읽고 Phase 1a (한국 MVP)를 구현해주세요.
@PRD/02_Social_Anxiety_RPG/01_PRD.md
@PRD/02_Social_Anxiety_RPG/02_DATA_MODEL.md
@PRD/02_Social_Anxiety_RPG/04_PROJECT_SPEC.md

Phase 1a 범위:
- 한국어 시나리오 UI (채팅 인터페이스, locale=ko)
- GPT-4o 기반 NPC 응답 생성 (Server Action)
- GAD-7 간이 측정 + 주간 그래프
- 세션 메모리 AI (messages 기반 패턴 추출 → user_memories 저장)
- 레벨업/배지 시스템
- Stripe ₩12,900/월 구독
- Google + Apple 소셜 로그인

반드시 지켜야 할 것:
- 04_PROJECT_SPEC.md의 "절대 하지 마" 목록 준수
- 실제 Supabase DB 연결 (목업 X)
- 실제 Stripe 연동
- any 타입 사용 금지
- pnpm만 사용
- OpenAI API 키는 서버 사이드만 (클라이언트 노출 금지)
- CBT/의료 진단 문구 UI 직접 사용 금지 ("치료", "진단" 표현 주의)
```

---

## Phase 1b: 북미 론칭 (4~6주, Phase 1a 이후)

### 전제 조건
- Phase 1a가 Vercel에 안정적으로 배포된 상태
- 한국 유료 구독자 50명 달성 (PMF 시그널)

### 목표
영어 버전 출시. 북미 유료 구독자 50명 달성.

### 기능
- [ ] next-intl en.json 추가 — 전체 UI 한국어/영어 전환
- [ ] 영어 시나리오 25개 신규 제작 (완전 현지화, 북미 문화 기반)
  - Level 1: Ordering coffee, Making a reservation call
  - Level 2: Speaking up in a meeting, Meeting a new neighbor
  - Level 3: Networking event intro, Job interview self-intro
  - Level 4: Team presentation + Q&A, Disagreeing with a colleague
  - Level 5: Asking for a raise, Setting boundaries
- [ ] 무료 체험 영어 5개 추가
- [ ] Stripe $9.99/월 구독 (USD, 별도 Price ID)
- [ ] 언어 자동 감지 (브라우저 locale → /en 또는 /ko 라우팅)
- [ ] 영어 NPC 프롬프트 — 북미 구어체 자연스러운 대화체

### 추가 데이터
- scenarios(locale=en) 25개 추가

### "진짜 제품" 체크리스트
- [ ] 영어 UI 전체 번역 완료 (기계 번역 X, 자연스러운 영어)
- [ ] $9.99 USD Stripe 결제 실제 동작
- [ ] 한국어 유저와 영어 유저 데이터 완전 분리 (시나리오 locale 필터)
- [ ] 영어 NPC 대화 퀄리티 원어민 검수

### 성공 기준
- [ ] 북미 유료 구독자 50명/월 (매출 $499.50)
- [ ] 30일 리텐션 10%+ (업계 평균 3.3% 대비 3배)
- [ ] r/socialanxiety 커뮤니티 오가닉 언급 5건 이상

### Phase 1b 시작 프롬프트
```
이 PRD를 읽고 Phase 1b (북미 영어 버전 론칭)를 구현해주세요.
@PRD/02_Social_Anxiety_RPG/01_PRD.md
@PRD/02_Social_Anxiety_RPG/02_DATA_MODEL.md
@PRD/02_Social_Anxiety_RPG/04_PROJECT_SPEC.md

Phase 1b 범위:
- next-intl en.json 추가 (전체 UI 영어화)
- 영어 시나리오 25개 (scenarios.locale='en')
- $9.99/월 Stripe USD 구독 연동
- 언어 자동 감지 + /en 라우팅
- 영어 NPC 프롬프트 (미국 구어체)

Phase 1a 기능은 건드리지 말고 영어 레이어만 추가할 것.
한국어 유저에게는 locale=ko 시나리오만, 영어 유저에게는 locale=en만 표시.
```

---

## Phase 2: 확장 (4~6주, Phase 1a+1b 이후)

### 전제 조건
- Phase 1a + 1b가 안정적으로 운영 중
- 한국 + 북미 합산 구독자 150명+

### 목표
인지 재구성 모듈 + 음성 티어 추가로 리텐션 상승 및 객단가 향상.

### 기능
- [ ] 인지 재구성 모듈 — 롤플레이 후 CBT 자동 사고 패턴 분석 + 재구성 워크시트 (한/영)
- [ ] 음성 롤플레이 티어 추가
  - 한국: ₩24,900/월, 북미: $24.99/월
  - ElevenLabs Conversational AI 연동
  - 월 120분 캡 (초과 시 분당 추가 결제 안내)
- [ ] 시나리오 팩 일회성 구매
  - 한국: ₩9,900/팩 (회식 마스터팩, 면접 완전정복팩)
  - 북미: $9.99/pack (Networking Master Pack, Presentation Pack)
- [ ] 매일 연습 알림 (Web Push Notifications, 한/영)
- [ ] 주간 리포트 고도화 (GAD-7 트렌드 + 세션 패턴 시각화)
- [ ] 구독 취소/플랜 변경/재구독 플로우 완성

### 추가 데이터
- cognitive_logs 활성화
- ScenarioPack + UserPurchase (팩 구매 이력)

### 통합 테스트
- Phase 1a 한국어 롤플레이 플로우 정상 동작 확인
- Phase 1b 영어 롤플레이 플로우 정상 동작 확인

---

## Phase 3: 고도화 (5~6주, Phase 2 이후)

### 전제 조건
- Phase 1+2 안정 운영
- 한국+북미 합산 구독자 300명+ / MRR $5,000+

### 목표
코치 연결 업셀 + 일본어 시장 진출.

### 기능
- [ ] CBT 코치/치료사 연결 업셀 — 인앱 1:1 세션 예약 ($49/세션 또는 $99/월 코칭 티어)
- [ ] 일본어 버전 (/ja 경로, next-intl ja.json)
  - 일본 직장문화 시나리오 별도 제작 (오무스비, 거래처 방문 등)
- [ ] 2인 그룹 챌린지 모드 (친구와 같은 시나리오 완료 후 비교)
- [ ] 임상 검증 연구 파트너십 (대학병원 or CBT 연구소)

### 추가 데이터
- CoachSession (코치 세션 예약 기록)
- GroupChallenge (그룹 챌린지 기록)

### 주의사항
- 일본어 TTS 품질 검토 (ElevenLabs 일본어 지원 수준 확인)
- 코치 연결 플랫폼 법적 검토 (의료법 해당 여부)

---

## Phase 로드맵 요약

| Phase | 핵심 기능 | 대상 | 상태 |
|-------|----------|------|------|
| Phase 1a (MVP, 4~6주) | 한국어 롤플레이 + GAD-7 + 세션 메모리 + ₩12,900 구독 | 한국 | 시작 전 |
| Phase 1b (영어 론칭, 4~6주) | 영어 시나리오 완전 현지화 + $9.99 USD 구독 | 북미 | Phase 1a 완료 후 |
| Phase 2 (확장, 4~6주) | 인지 재구성 + 음성 롤플레이 + 시나리오 팩 | 한국+북미 | Phase 1b 완료 후 |
| Phase 3 (고도화, 5~6주) | 코치 연결 + 일본어 + 그룹 챌린지 | 전 글로벌 | Phase 2 완료 후 |
