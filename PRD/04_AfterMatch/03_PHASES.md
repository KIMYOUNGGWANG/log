# AfterMatch — Phase 분리 계획

> 가장 빠른 MVP. 2~3주 안에 결제 발생 목표.
> Phase별로 "진짜 동작하는 제품"을 배포합니다.

---

## Phase 1: MVP (2~3주)

### 목표
첫 결제 발생 검증. 데이트 직후 기록하는 하빗 형성. 가장 단순한 구현으로 PMF 확인.

### 기능
- [ ] 데이트 라인업 보드 (DatePerson 카드 목록)
  - 상대방 닉네임 + 만난 플랫폼 + 마지막 날짜 + 에너지 아이콘
- [ ] 데이트 디브리핑 일기 (DateEntry 작성)
  - 에너지 슬라이더 (1~10)
  - 레드플래그 체크리스트 (사전 정의 20개)
  - 그린플래그 체크리스트 (사전 정의 20개)
  - 자유 메모 (optional)
- [ ] 다음 데이트 전 자동 요약 (GPT-4o)
  - 유저가 "다음 만남 예정" 표시 시 생성
  - 전 데이트 에너지 + 레드/그린플래그 요약 카드
- [ ] 무료 제한: DatePerson 1명 + DateEntry 3개까지
- [ ] Toss Payments ₩9,900/월 구독 연동
- [ ] 카카오/구글 소셜 로그인 (Supabase Auth)

### 데이터
- User, DatePerson, DateEntry, AIInsight(pre_date_summary), Subscription

### "진짜 제품" 체크리스트
- [ ] 실제 Supabase DB 연결 (목업 데이터 X)
- [ ] 실제 Toss Payments 연동 (테스트 키 → 운영 키)
- [ ] GPT-4o 요약 API 실제 호출 (mock X)
- [ ] Vercel 프로덕션 배포 (localhost X)
- [ ] 다른 사람이 URL로 접속해서 결제까지 완료 가능

### 성공 기준
- 유료 구독자 50명/월 (MRR ₩495,000)
- 무료 3회 → 유료 전환율 25%+
- 기록 작성 평균 5분 이하

### Phase 1 시작 프롬프트
```
이 PRD를 읽고 Phase 1을 구현해주세요.
@PRD/04_AfterMatch/01_PRD.md
@PRD/04_AfterMatch/02_DATA_MODEL.md
@PRD/04_AfterMatch/04_PROJECT_SPEC.md

Phase 1 범위:
- 데이트 라인업 보드 (DatePerson 관리)
- 데이트 디브리핑 일기 (DateEntry 작성 — 슬라이더 + 체크리스트 + 메모)
- 다음 데이트 전 GPT-4o 자동 요약
- 무료 제한 로직 (1명 3회)
- Toss Payments ₩9,900/월 구독
- Supabase Auth 소셜 로그인

반드시 지켜야 할 것:
- 04_PROJECT_SPEC.md의 "절대 하지 마" 목록 준수
- 실제 Supabase DB 연결 (목업 X)
- 상대방 닉네임 외 개인정보 수집 금지
- any 타입 사용 금지
- pnpm만 사용
```

---

## Phase 2: 확장 (3~4주)

### 전제 조건
- Phase 1이 Vercel에 안정적으로 배포된 상태
- 유료 구독자 50명 달성

### 목표
AI 패턴 분석으로 핵심 가치 완성. 푸시 알림으로 리텐션 강화.

### 기능
- [ ] AI 패턴 분석 (DateEntry 3회+ 누적 시 자동 트리거)
  - "당신은 에너지 7 이하인 상대는 3번째 만남에서 항상 종료를 선택했습니다"
  - 월 1회 인사이트 업데이트
- [ ] 감정 음성 덤프
  - 브라우저 마이크 녹음 (Web Speech API)
  - OpenAI Whisper 전사 → GPT-4o 요약 → DateEntry 자동 채움
- [ ] 데이트 후 Web Push 알림 ("어떠셨나요? 기록해두세요")
  - 유저가 "오늘 만남 있음" 표시 시, 만남 예정 시간 +2시간 후 알림
- [ ] 데이트 진행 단계 트래커 (마지막 연락 날짜 + D-day 카운터)

### 추가 데이터
- VoiceMemo (음성 녹음 원본 URL + 전사 텍스트, Supabase Storage)

---

## Phase 3: 글로벌 (4~5주)

### 전제 조건
- Phase 1+2 안정 운영
- 유료 구독자 200명+ / MRR ₩2,000,000+

### 목표
글로벌 사용자 확보 + 데이트 코치 연결로 ARPU 상승.

### 기능
- [ ] 영어 버전 (/en 경로, i18n)
- [ ] 데이트 코치 업셀 (1회 코칭 세션 결제 링크, Calendly 연동)
- [ ] 카카오톡 공유 — "내 데이트 패턴" 카드 이미지 생성 (바이럴)

---

## Phase 로드맵 요약

| Phase | 핵심 기능 | 상태 |
|-------|----------|------|
| Phase 1 (MVP, 2~3주) | 라인업 + 디브리핑 일기 + AI 요약 + ₩9,900/월 | 시작 전 |
| Phase 2 (확장, 3~4주) | AI 패턴 분석 + 음성 덤프 + 푸시 알림 | Phase 1 완료 후 |
| Phase 3 (글로벌, 4~5주) | 영어 버전 + 코치 업셀 + 카카오 공유 | 구독 200명 후 |
