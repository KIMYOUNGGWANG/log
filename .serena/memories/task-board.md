# Task Board — Social Anxiety RPG (Phase 1 MVP)

## 요구사항 요약
CBT 노출치료 기반의 "사회불안 노출치료 RPG" MVP 버전을 구축합니다. 텍스트 롤플레이(GPT-4o), 불안도 측정 슬라이더 및 주간 그래프, 레벨업/배지 시스템, 카카오/구글 로그인(Supabase Auth), 그리고 Stripe 구독 결제를 연동합니다.

## 가정 및 제약사항
1. 모든 DB는 실제 Supabase를 사용합니다 (목업 사용 금지).
2. 결제는 실제 Stripe API를 사용합니다.
3. 앱은 모바일 반응형(375px) 중심으로 설계합니다.
4. 패키지 매니저는 pnpm만 사용하고 any 타입은 금지합니다.
5. 음성 AI는 Phase 1 범위 밖이므로 제외합니다.

## 태스크 분해

| # | Task | Priority | Files | Status |
|---|------|----------|-------|--------|
| T1 | 프로젝트 및 프레임워크 초기 설정 | P0 | `package.json`, `next.config.js` 등 | ✅ |
| T2 | Supabase 데이터베이스 스키마 및 Auth 설정 | P0 | `src/lib/supabase/*` | ✅ |
| T3 | 시나리오 목록 뷰 및 5개 무료 체험 잠금 해제 | P1 | `src/app/scenarios/page.tsx` | ✅ |
| T4 | GPT-4o 연동 및 채팅 롤플레이 UI 구현 | P1 | `src/app/api/chat/route.ts`, `src/app/scenarios/[id]/page.tsx` | ✅ |
| T5 | 세션 전/후 불안도 측정 및 주간 그래프 대시보드 | P1 | `src/app/dashboard/page.tsx`, `features/anxiety/*` | ✅ |
| T6 | 진도 추적(레벨 1~3) 및 배지 시스템 | P2 | `features/progress/*` | ✅ |
| T7 | Stripe ₩12,900/월 구독 연동 및 결제 웹훅 | P1 | `src/app/api/payment/route.ts`, `features/subscription/*` | ✅ |
