# AI 신경계 조절 코치 — 프로젝트 스펙

> AI가 코드를 짤 때 지켜야 할 규칙.
> 이 문서를 AI에게 항상 함께 공유하세요.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 App Router | RSC로 AI 처방 서버 렌더링, SEO |
| DB/백엔드 | Supabase (Postgres + Auth + Storage) | DB+인증 세트, 무료 티어로 시작 |
| 배포 | Vercel | GitHub push → 자동 배포 |
| 인증 | Supabase Auth (Kakao OAuth + Google OAuth) | 한국 유저 카카오 1클릭 가입 |
| 스타일링 | Tailwind CSS 4 + Shadcn/UI | 슬라이더, 그래프, 타이머 UI 빠른 구현 |
| 결제 | Toss Payments | 한국 구독 결제, 웹훅 안정적 |
| AI 처방 | OpenAI GPT-4o API | 체크인 데이터 기반 루틴 처방 |
| 그래프 | Recharts 또는 Chart.js | 주간 스트레스 트렌드 시각화 |
| 모바일 (Phase 2) | React Native + Expo | HealthKit 연동, iOS/Android 동시 지원 |
| 패키지 | pnpm | 빠른 설치 |
| 타입 | TypeScript strict | any 타입 금지 |

---

## 프로젝트 구조

```
neuro-coach/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 랜딩 페이지 (SEO)
│   │   ├── checkin/
│   │   │   └── page.tsx                # 매일 체크인 UI
│   │   ├── routine/
│   │   │   ├── breathing/page.tsx      # 호흡 애니메이션 가이드
│   │   │   ├── meditation/page.tsx     # 명상 TTS 가이드
│   │   │   └── cold-water/page.tsx     # 냉온수 타이머
│   │   ├── course/
│   │   │   └── [day]/page.tsx          # 14일 코스 일차별 화면
│   │   ├── dashboard/
│   │   │   └── page.tsx                # 주간 그래프 + 진도
│   │   └── api/
│   │       ├── recommend/route.ts      # GPT-4o 루틴 처방
│   │       └── payment/route.ts        # Toss 웹훅 처리
│   ├── components/
│   │   ├── ui/                         # Shadcn (직접 수정 금지)
│   │   ├── features/
│   │   │   ├── checkin/                # 슬라이더 체크인 폼
│   │   │   ├── routines/               # 호흡/명상/냉온수 컴포넌트
│   │   │   ├── course/                 # 14일 코스 카드
│   │   │   ├── dashboard/              # 스트레스 그래프
│   │   │   └── subscription/           # 구독 플랜 UI
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/                   # DB 클라이언트
│   │   ├── openai/                     # GPT-4o 클라이언트 + 처방 프롬프트 빌더
│   │   └── toss/                       # 결제 유틸
│   └── types/
│       └── index.ts                    # 전체 타입 정의
├── public/
│   └── routines/                       # 루틴 가이드 이미지/SVG
├── .env.local                          # 환경변수 (절대 커밋 금지)
└── package.json
```

---

## 절대 하지 마 (DO NOT)

- [ ] API 키를 코드에 직접 쓰지 마 (.env.local 사용)
- [ ] `any` 타입 사용 금지 — `unknown` + 타입 가드 사용
- [ ] `ts-ignore` / `as any` 금지
- [ ] `src/components/ui/` 직접 수정 금지 (Shadcn 래퍼 사용)
- [ ] `npm install` / `yarn add` 금지 — `pnpm add`만 사용
- [ ] 목업/하드코딩 AI 처방 데이터로 완성이라고 하지 마
- [ ] 실제 Toss 운영 키를 테스트 환경에 사용하지 마
- [ ] `../../` 상대 경로 금지 — `@/` 앨리어스 사용
- [ ] OpenAI API 키를 클라이언트 컴포넌트에 노출하지 마 (서버 사이드만)
- [ ] "진단", "치료", "의료" 표현을 UI에 직접 사용하지 마 (법적 리스크)
- [ ] 냉온수 루틴에 의학적 금기 면책 문구 없이 표시하지 마

---

## 항상 해 (ALWAYS DO)

- [ ] 변경하기 전에 계획을 먼저 보여줘
- [ ] 환경변수는 .env.local에 저장
- [ ] 에러 발생 시 사용자에게 친절한 한국어 메시지 표시
- [ ] 모바일(375px) 반응형 — 루틴 화면은 전체화면(fullscreen) 우선 설계
- [ ] Supabase 쿼리는 항상 `const { data, error } = await supabase...` 패턴
- [ ] Server Component에서 `createServerClient`, Client Component에서 `createBrowserClient`
- [ ] 결제 웹훅은 Toss 서명 검증 후 처리
- [ ] GPT-4o 처방 생성 시 max_tokens 500 이하로 제한 (비용 관리)
- [ ] 체크인 데이터가 없을 경우 기본 처방 ("먼저 체크인을 완료해 주세요") 표시

---

## AI 처방 프롬프트 구조

```
당신은 신경계 회복 AI 코치입니다. 사용자의 오늘 상태를 분석하고 최적의 루틴을 처방하세요.

사용자 상태:
- 스트레스: {stress_level}/10
- 수면 품질: {sleep_quality}/5
- 에너지: {energy_level}/5
- 메모: {notes}

규칙:
1. 처방은 JSON 형식으로만 응답하세요.
2. 루틴은 2~3개 추천하세요.
3. 각 루틴에 reason(한 줄 이유)을 포함하세요.
4. ai_message는 100자 이내 한국어로 작성하세요.
5. "진단", "치료", "의료" 표현을 사용하지 마세요.

응답 형식:
{
  "recommended_routines": [
    {"type": "breathing", "subtype": "box_breathing", "duration": 240, "reason": "교감신경 과활성 완화에 효과적"},
    {"type": "cold_water", "duration": 60, "reason": "부교감신경 활성화 촉진"}
  ],
  "ai_message": "오늘 스트레스가 높네요. 박스 브리딩으로 먼저 마음을 가라앉혀 보세요."
}
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
| `TOSS_SECRET_KEY` | Toss 결제 비밀 키 | developers.tosspayments.com |
| `TOSS_CLIENT_KEY` | Toss 결제 공개 키 | developers.tosspayments.com |

> .env.local 파일에 저장. 절대 GitHub에 커밋하지 마세요.

---

## [NEEDS CLARIFICATION]

- [ ] OpenAI API 월 한도 설정 — 사용자당 일일 1회 처방 × 구독자 수 예산 상한
- [ ] 구독 가격 최종 결정 — $19.9(달러) vs ₩28,000(원화) — Toss 결제 기준 원화 필요
- [ ] Supabase 프로젝트 지역 — ap-northeast-2 (도쿄) 권장
