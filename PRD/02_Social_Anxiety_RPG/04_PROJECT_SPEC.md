# 사회불안 노출치료 RPG — 프로젝트 스펙

> AI가 코드를 짤 때 지켜야 할 규칙과 절대 하면 안 되는 것.
> 이 문서를 AI에게 항상 함께 공유하세요.
> 한국 + 북미 멀티 마켓 구조 반영.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16+ App Router | SEO 최적화, RSC로 GPT 응답 서버 렌더링 |
| DB/백엔드 | Supabase (Postgres + Auth + Storage) | DB+인증 세트, RLS로 유저별 데이터 격리 |
| 배포 | Vercel | GitHub push → 자동 배포, 엣지 함수 지원 |
| 인증 | Supabase Auth (Google OAuth + Apple OAuth) | 글로벌 소셜 로그인, 한국+북미 모두 지원 |
| 스타일링 | Tailwind CSS + Shadcn/UI | 채팅 UI 빠른 구현, 컴포넌트 재사용 |
| 상태관리 | Zustand (전역) + useState (로컬) | 롤플레이 세션 상태 관리 |
| 데이터 페치 | TanStack Query v5 | 서버 데이터 캐싱 및 동기화 |
| AI 롤플레이 | OpenAI GPT-4o (@ai-sdk/openai) | NPC 응답 생성 품질 최우선, 이미 설치됨 |
| AI SDK | Vercel AI SDK (ai, @ai-sdk/react) | 스트리밍 응답, useChat hook |
| 결제 | Stripe | KRW + USD 멀티커런시, 구독 웹훅 지원 |
| i18n | next-intl | 한국어(ko)/영어(en) UI 전환, 이미 설치됨 |
| AI 음성 (Phase 2) | ElevenLabs Conversational AI | 한국어+영어 TTS 품질 최고 |
| 패키지 | pnpm | 빠른 설치, 모노레포 지원 |
| 타입 | TypeScript strict | any 타입 금지 |

---

## 프로젝트 구조

```
social-anxiety-rpg/
├── src/
│   ├── app/
│   │   ├── [locale]/               # next-intl 로케일 라우팅 (ko/en)
│   │   │   ├── page.tsx            # 랜딩 페이지 (SEO)
│   │   │   ├── scenarios/
│   │   │   │   ├── page.tsx        # 시나리오 목록 (카테고리별, locale 필터)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # 시나리오 상세 + 롤플레이 UI
│   │   │   │       └── result/page.tsx  # 세션 결과 + GAD-7 비교
│   │   │   └── dashboard/
│   │   │       └── page.tsx        # 진도 + 배지 + 주간 GAD-7 리포트
│   │   └── api/
│   │       ├── chat/route.ts       # GPT-4o NPC 응답 생성 (스트리밍)
│   │       ├── memory/route.ts     # 세션 메모리 추출 + 저장
│   │       └── payment/route.ts    # Stripe 웹훅 처리
│   ├── components/
│   │   ├── ui/                     # Shadcn (직접 수정 금지)
│   │   ├── features/
│   │   │   ├── roleplay/           # 채팅 UI, NPC 아바타, 턴 관리
│   │   │   ├── anxiety/            # GAD-7 측정 UI, 그래프
│   │   │   ├── progress/           # 레벨 트래커, 배지 팝업
│   │   │   ├── memory/             # 세션 메모리 브리핑 UI
│   │   │   └── subscription/       # 구독 플랜 카드, 결제 버튼
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/               # DB 클라이언트 (server/browser 분리)
│   │   ├── openai/                 # GPT-4o 클라이언트 + NPC 프롬프트 빌더
│   │   ├── memory/                 # 세션 메모리 추출 로직
│   │   ├── stripe/                 # 결제 유틸 (KRW/USD 분기)
│   │   └── gad7/                   # GAD-7 점수 계산 유틸
│   └── types/
│       └── index.ts                # 전체 타입 정의
├── messages/
│   ├── ko.json                     # 한국어 UI 문자열
│   └── en.json                     # 영어 UI 문자열 (Phase 1b에서 추가)
├── public/
├── .env.local                      # 환경변수 (절대 커밋 금지)
└── package.json
```

---

## 절대 하지 마 (DO NOT)

- [ ] API 키를 코드에 직접 쓰지 마 (.env.local 사용)
- [ ] `any` 타입 사용 금지 — `unknown` + 타입 가드 사용
- [ ] `ts-ignore` / `as any` 금지
- [ ] `src/components/ui/` 직접 수정 금지 (Shadcn 래퍼로 확장)
- [ ] `npm install` / `yarn add` 금지 — `pnpm add`만 사용
- [ ] `../../` 상대 경로 금지 — `@/` 앨리어스 사용
- [ ] OpenAI API 키를 클라이언트 컴포넌트에 노출하지 마 (서버 사이드만)
- [ ] ElevenLabs API 키를 클라이언트에 노출하지 마
- [ ] Supabase service role key를 클라이언트에 노출하지 마
- [ ] 목업/하드코딩 대화 데이터로 완성이라고 하지 마
- [ ] 실제 Stripe 운영 키를 테스트 환경에 사용하지 마
- [ ] CBT / 의료 진단 문구를 UI에 직접 사용하지 마 ("치료", "진단", "치료사" 표현 주의)
- [ ] 개인 식별 정보(이름, 연락처 등)를 messages 테이블에 저장하지 마
- [ ] 기존 Supabase 스키마를 임의로 변경하지 마 (마이그레이션 파일 작성 필수)
- [ ] KRW 가격과 USD 가격을 혼용하지 마 (locale 기반 분기 필수)

---

## 항상 해 (ALWAYS DO)

- [ ] 변경하기 전에 계획을 먼저 보여줘
- [ ] 환경변수는 .env.local에 저장
- [ ] Supabase 쿼리는 항상 `const { data, error } = await supabase...` 패턴
- [ ] Server Component에서 `createServerClient`, Client Component에서 `createBrowserClient`
- [ ] RLS 정책 항상 ON — 유저는 자신의 데이터만 접근 가능
- [ ] 결제 웹훅은 Stripe 서명 검증 후 처리
- [ ] GPT-4o 호출 시 max_tokens 제한 설정 (비용 관리)
- [ ] 세션 중 GPT 오류 발생 시 친절한 에러 메시지 표시 (대화 유실 방지)
- [ ] 모바일(375px)에서 사용 가능한 반응형 채팅 UI
- [ ] i18n 문자열은 messages/ko.json · messages/en.json에서만 관리 (하드코딩 금지)
- [ ] 에러 발생 시 locale에 맞는 언어로 메시지 표시 (한국어 유저→한국어, 영어 유저→영어)

---

## NPC 프롬프트 구조

GPT-4o에게 전달하는 시스템 프롬프트 형식:

```
[한국어 시나리오]
당신은 {npc_name}입니다. {npc_personality}

규칙:
1. 한국어로 자연스럽게 대화하세요.
2. 상황에 맞는 현실적인 반응을 보여주세요.
3. 유저를 비난하거나 극단적으로 불친절하게 굴지 마세요.
4. 대사는 1~3문장 이내로 간결하게 유지하세요.
5. 유저가 어색하거나 회피적인 답변을 해도 자연스럽게 이어가세요.
6. 이전 메모리: {user_memory_context}

현재 상황: {scenario.title}
```

```
[English Scenario]
You are {npc_name}. {npc_personality}

Rules:
1. Speak naturally in casual American English.
2. React realistically to the situation.
3. Don't be excessively rude or judgmental.
4. Keep responses to 1-3 sentences.
5. If the user gives awkward or avoidant replies, continue naturally.
6. Previous memory context: {user_memory_context}

Current scenario: {scenario.title}
```

---

## 세션 메모리 AI 동작 방식

```
1. 세션 종료 시:
   - messages 테이블의 해당 세션 대화 전체 조회
   - GPT-4o에게 "이 대화에서 유저의 불안 패턴/강점/선호를 3줄 이내로 요약" 요청
   - 결과를 user_memories 테이블에 upsert (memory_type: pattern/insight)

2. 다음 세션 시작 시:
   - user_memories에서 최근 5개 메모리 조회
   - NPC 시스템 프롬프트의 {user_memory_context}에 주입
   - 세션 시작 화면에 "지난번 기억" 브리핑 표시 (1줄)
```

---

## 테스트 방법

```bash
# 로컬 실행
pnpm dev

# 타입 체크
pnpm typecheck

# 빌드 확인
pnpm build

# 린트
pnpm lint
```

---

## 배포 방법

1. GitHub 저장소에 push
2. Vercel 프로젝트 연결 (`vercel.com` → Import Repository)
3. 환경변수 Vercel Dashboard에 입력
4. `main` 브랜치 push → 자동 배포

---

## 환경변수

| 변수명 | 설명 | 어디서 발급 |
|--------|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | supabase.com → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | supabase.com → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 키 (서버 전용) | supabase.com → Settings → API |
| `OPENAI_API_KEY` | GPT-4o API 키 | platform.openai.com |
| `STRIPE_SECRET_KEY` | Stripe 결제 비밀 키 | dashboard.stripe.com |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 공개 키 | dashboard.stripe.com |
| `STRIPE_WEBHOOK_SECRET` | Stripe 웹훅 시크릿 | dashboard.stripe.com |
| `STRIPE_PRICE_ID_KR_BASIC` | ₩12,900/월 구독 Price ID | dashboard.stripe.com |
| `STRIPE_PRICE_ID_US_BASIC` | $9.99/월 구독 Price ID | dashboard.stripe.com |
| `ELEVENLABS_API_KEY` | ElevenLabs API 키 (Phase 2) | elevenlabs.io |

> .env.local 파일에 저장. 절대 GitHub에 커밋하지 마세요.

---

## [NEEDS CLARIFICATION]

- [ ] OpenAI API 월 한도 설정 — 시나리오당 max_tokens 및 월 예산 상한 결정
- [ ] GAD-7 간이 버전 (3문항) — 전체 7문항 vs 빠른 3문항 선택
- [ ] 세션 메모리 최대 보존 개수 — 최근 5개 vs 20개
- [ ] ElevenLabs 음성 플랜 요금제 선택 (Phase 2) — Creator $22/월 vs Enterprise
- [ ] Supabase 프로젝트 지역 — 한국 유저 ap-northeast-1(도쿄) vs 북미 us-east-1 (멀티 리전 여부)
- [ ] CCPA 준수 — 북미 유저 데이터 삭제 요청 처리 플로우 구현 여부
