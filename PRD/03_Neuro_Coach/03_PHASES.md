# AI 신경계 조절 코치 — Phase 분리 계획

> 웹 MVP로 먼저 PMF 검증 후 모바일/웨어러블로 확장합니다.
> Phase별로 "진짜 동작하는 제품"을 배포합니다.

---

## Phase 1: MVP (3~4주)

### 목표
첫 결제 발생 검증. "체크인 → AI 처방 → 루틴 실행 → 14일 코스" 핵심 루프 완성.

### 기능
- [ ] 매일 아침 체크인 UI (스트레스/수면/에너지 슬라이더, 1분 완료)
- [ ] GPT-4o 기반 AI 루틴 처방 (Server Action, 체크인 데이터 기반)
- [ ] 3종 가이드 루틴
  - 4-7-8 호흡 / 박스 브리딩 — SVG 애니메이션 가이드
  - 5분 명상 — Web Speech API TTS 또는 텍스트 가이드
  - 냉온수 타이머 — 단계별 온도 전환 안내
- [ ] 14일 신경계 회복 코스 (일차별 코치 메시지 + 숙제)
- [ ] 주간 스트레스 트렌드 그래프 (7일)
- [ ] Toss Payments ₩28,000/월 구독 연동
- [ ] 카카오/구글 소셜 로그인 (Supabase Auth)
- [ ] 무료 체험: 체크인 1회 + AI 처방 미리보기 (루틴 흐림 처리)

### 데이터
- User, StressCheckIn, AIRecommendation, RoutineSession, CourseDay, UserCourseProgress, Subscription

### "진짜 제품" 체크리스트
- [ ] 실제 Supabase DB 연결 (목업 데이터 X)
- [ ] 실제 Toss Payments 연동 (테스트 키 → 운영 키)
- [ ] GPT-4o API 실제 호출 (mock X)
- [ ] 14일 코스 콘텐츠 14개 모두 작성 완료
- [ ] Vercel 프로덕션 배포 (localhost X)

### 성공 기준
- 유료 구독자 100명/월 (MRR $1,990)
- 14일 코스 완주율 40%+
- 연속 7일 체크인 비율 50%+

### Phase 1 시작 프롬프트
```
이 PRD를 읽고 Phase 1을 구현해주세요.
@PRD/03_Neuro_Coach/01_PRD.md
@PRD/03_Neuro_Coach/02_DATA_MODEL.md
@PRD/03_Neuro_Coach/04_PROJECT_SPEC.md

Phase 1 범위:
- 매일 체크인 UI (스트레스/수면/에너지 슬라이더)
- GPT-4o 기반 AI 루틴 처방 (Server Action)
- 3종 가이드 루틴 (호흡 애니메이션, 명상 TTS, 냉온수 타이머)
- 14일 신경계 회복 코스
- 주간 스트레스 트렌드 그래프
- Toss Payments ₩28,000/월 구독
- Supabase Auth 소셜 로그인

반드시 지켜야 할 것:
- 04_PROJECT_SPEC.md의 "절대 하지 마" 목록 준수
- 실제 Supabase DB 연결 (목업 X)
- GPT-4o API 키는 서버 사이드만 (클라이언트 노출 금지)
- any 타입 사용 금지
- pnpm만 사용
```

---

## Phase 2: 모바일 + 웨어러블 (5~7주)

### 전제 조건
- Phase 1이 Vercel에 안정적으로 배포된 상태
- 유료 구독자 100명 달성

### 목표
HRV 실측 데이터로 AI 처방 정확도 향상. 모바일 일상 루틴 접근성 개선.

### 기능
- [ ] React Native + Expo 앱 출시 (iOS 우선)
- [ ] Apple HealthKit 연동 (심박수/HRV/수면 자동 수집)
- [ ] Google Fit 연동 (Android)
- [ ] HRV 데이터를 체크인에 자동 반영 (수동 입력 불필요)
- [ ] 오리 링 / 가민 API 연동 (옵션)
- [ ] 웹/앱 데이터 동기화 (동일 계정 공유)
- [ ] 아침 알림 (정해진 시간에 체크인 푸시)

### 추가 데이터
- HRVRecord (웨어러블에서 수집한 HRV 원시 데이터)

---

## Phase 3: 글로벌 + B2B (6~8주)

### 전제 조건
- Phase 1+2 안정 운영
- 유료 구독자 300명+ / MRR $5,000+

### 목표
영어권 글로벌 출시 + B2B 기업 복지 채널 확보.

### 기능
- [ ] 영어 버전 (/en 경로, i18n)
- [ ] B2B 기업 번아웃 대시보드
  - 팀 평균 스트레스 익명 집계
  - HR팀용 월간 그룹 리포트
  - 팀 라이선스 $8/인/월
- [ ] 구독 취소 후 리텐션 플로우 (일시정지 옵션 제공)

### 추가 데이터
- Team, TeamMember (B2B 팀 관리)

---

## Phase 로드맵 요약

| Phase | 핵심 기능 | 상태 |
|-------|----------|------|
| Phase 1 (MVP, 3~4주) | 체크인 + AI 처방 + 14일 코스 + ₩28,000/월 | 시작 전 |
| Phase 2 (모바일+웨어러블, 5~7주) | React Native + HealthKit HRV 연동 | Phase 1 완료 후 |
| Phase 3 (글로벌+B2B, 6~8주) | 영어 버전 + 기업 번아웃 대시보드 | 구독 300명 후 |
