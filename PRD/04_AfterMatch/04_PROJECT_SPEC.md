# AfterMatch — 프로젝트 스펙

> AI가 코드를 짤 때 지켜야 할 규칙.
> 이 문서를 AI에게 항상 함께 공유하세요.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 App Router | 빠른 MVP, SEO 최적화 |
| DB/백엔드 | Supabase (Postgres + Auth + Storage) | DB+인증+파일저장 세트 |
| 배포 | Vercel | GitHub push → 자동 배포 |
| 인증 | Supabase Auth (Kakao OAuth + Google OAuth) | 한국 유저 카카오 1클릭 가입 |
| 스타일링 | Tailwind CSS 4 + Shadcn/UI | 카드 UI, 슬라이더, 체크리스트 빠른 구현 |
| 결제 | Toss Payments | 한국 구독 결제, 웹훅 안정적 |
| AI 요약/분석 | OpenAI GPT-4o API | 다음 데이트 요약 + 패턴 분석 |
| 음성 전사 (Phase 2) | OpenAI Whisper API | 음성 덤프 텍스트 변환 |
| 음성 녹음 (Phase 2) | Web Speech API (브라우저 내장) | 별도 SDK 없이 마이크 접근 |
| 패키지 | pnpm | 빠른 설치 |
| 타입 | TypeScript strict | any 타입 금지 |

---

## 프로젝트 구조

```
aftermatch/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # 랜딩 페이지 (SEO)
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # 데이트 라인업 보드
│   │   ├── person/
│   │   │   ├── new/page.tsx              # 상대방 등록
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # 상대방 상세 + 기록 목록
│   │   │       └── entry/new/page.tsx    # 새 디브리핑 작성
│   │   ├── insights/
│   │   │   └── page.tsx                  # AI 패턴 분석 (Phase 2)
│   │   └── api/
│   │       ├── summary/route.ts          # GPT-4o 다음 데이트 요약
│   │       ├── insight/route.ts          # GPT-4o 패턴 분석 (Phase 2)
│   │       └── payment/route.ts          # Toss 웹훅 처리
│   ├── components/
│   │   ├── ui/                           # Shadcn (직접 수정 금지)
│   │   ├── features/
│   │   │   ├── person/                   # 상대방 카드, 등록 폼
│   │   │   ├── entry/                    # 디브리핑 폼, 플래그 체크리스트
│   │   │   ├── summary/                  # AI 요약 카드
│   │   │   ├── insight/                  # 패턴 분석 카드 (Phase 2)
│   │   │   └── subscription/             # 구독 플랜 UI, 잠금 화면
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/                     # DB 클라이언트
│   │   ├── openai/                       # GPT-4o + Whisper 클라이언트
│   │   └── toss/                         # 결제 유틸
│   ├── constants/
│   │   └── flags.ts                      # 레드/그린 플래그 마스터 목록
│   └── types/
│       └── index.ts                      # 전체 타입 정의
├── public/
├── .env.local                            # 환경변수 (절대 커밋 금지)
└── package.json
```

---

## 절대 하지 마 (DO NOT)

- [ ] API 키를 코드에 직접 쓰지 마 (.env.local 사용)
- [ ] `any` 타입 사용 금지 — `unknown` + 타입 가드 사용
- [ ] `ts-ignore` / `as any` 금지
- [ ] `src/components/ui/` 직접 수정 금지 (Shadcn 래퍼 사용)
- [ ] `npm install` / `yarn add` 금지 — `pnpm add`만 사용
- [ ] 목업/하드코딩 AI 요약으로 완성이라고 하지 마
- [ ] 실제 Toss 운영 키를 테스트 환경에 사용하지 마
- [ ] `../../` 상대 경로 금지 — `@/` 앨리어스 사용
- [ ] OpenAI API 키를 클라이언트 컴포넌트에 노출하지 마 (서버 사이드만)
- [ ] 상대방 닉네임 외 개인 식별 정보(전화번호, SNS 계정 등) DB에 저장하지 마
- [ ] 다른 유저의 DatePerson / DateEntry에 접근하지 마 (RLS 필수)
- [ ] AI 요약에 상대방을 판단하거나 비하하는 표현 생성 금지 (프롬프트 가이드라인 포함)

---

## 항상 해 (ALWAYS DO)

- [ ] 변경하기 전에 계획을 먼저 보여줘
- [ ] 환경변수는 .env.local에 저장
- [ ] 에러 발생 시 사용자에게 친절한 한국어 메시지 표시
- [ ] 모바일(375px) 반응형 — 디브리핑 폼은 한 손 조작 최적화
- [ ] Supabase 쿼리는 항상 `const { data, error } = await supabase...` 패턴
- [ ] **모든 테이블에 RLS 활성화** — 반드시 `user_id = auth.uid()` 정책 적용
- [ ] Server Component에서 `createServerClient`, Client Component에서 `createBrowserClient`
- [ ] 결제 웹훅은 Toss 서명 검증 후 처리
- [ ] 무료 제한 초과 시 "구독 후 무제한 이용 가능" 친절한 업셀 UI 표시

---

## AI 요약 프롬프트 구조

### pre_date_summary (다음 데이트 전 요약)
```
당신은 친절한 연애 메모 AI입니다. 다음 만남 전 사용자에게 지난 데이트 핵심을 요약해드립니다.

상대방: {person.nickname}
지난 만남 기록:
{date_entries_json}

규칙:
1. 100~150자 이내 한국어로 작성하세요.
2. 에너지 점수, 레드플래그, 그린플래그를 자연스럽게 언급하세요.
3. 상대방을 판단하거나 비하하지 마세요.
4. 오늘 만남에 도움이 될 구체적 팁 1개를 포함하세요.
5. "오늘 ___을 물어보면 좋을 것 같아요" 형식으로 마무리하세요.
```

### pattern (AI 패턴 분석)
```
당신은 연애 패턴 분석 AI입니다. 사용자의 데이트 기록에서 반복되는 패턴을 발견해주세요.

전체 데이트 기록:
{all_date_entries_json}

규칙:
1. 200자 이내 한국어로 작성하세요.
2. 관찰된 패턴을 구체적으로 서술하세요 ("항상", "자주" 등 빈도 언급).
3. 특정 상대방을 지칭하지 말고 패턴만 언급하세요.
4. 도움이 되는 자기 인식 질문 1개로 마무리하세요.
5. 상대방을 비하하거나 판단하는 표현 금지.
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
| `OPENAI_API_KEY` | GPT-4o + Whisper API 키 | platform.openai.com |
| `TOSS_SECRET_KEY` | Toss 결제 비밀 키 | developers.tosspayments.com |
| `TOSS_CLIENT_KEY` | Toss 결제 공개 키 | developers.tosspayments.com |

> .env.local 파일에 저장. 절대 GitHub에 커밋하지 마세요.

---

## [NEEDS CLARIFICATION]

- [ ] 레드/그린 플래그 마스터 목록 최종 확정 — `src/constants/flags.ts`에 정의할 40~50개 목록
- [ ] pre_date_summary 트리거 방식 — 유저가 "다음 만남 있음" 버튼 클릭 시 생성 vs 자동 주기 생성
- [ ] 무료 제한 정확한 기준 — "1명 3회" vs 다른 방식
- [ ] Supabase Storage 사용 여부 (Phase 2 음성 덤프 파일 저장 시 필요)
