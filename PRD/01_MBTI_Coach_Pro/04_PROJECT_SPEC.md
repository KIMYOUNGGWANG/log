# MBTI Coach Pro — 프로젝트 스펙

> AI가 코드를 짤 때 지켜야 할 규칙.
> 이 문서를 AI에게 항상 함께 공유하세요.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 App Router | SEO 최적화 (SSR/SSG), RSC로 AI 리포트 서버 렌더링 |
| DB/백엔드 | Supabase (Postgres + Auth + Storage) | DB+인증+파일저장 세트, 무료 티어로 시작 |
| 배포 | Vercel | GitHub push → 자동 배포, Next.js 최적화 |
| 인증 | Supabase Auth (Kakao OAuth + Google OAuth) | 한국 유저 카카오 1클릭 가입 |
| 스타일링 | Tailwind CSS 4 + Shadcn/UI | 컴포넌트 재사용, AI 코딩 호환성 최고 |
| 결제 | Toss Payments | 한국 개인 사업자 사용 가능, 웹훅 안정적 |
| AI | OpenAI GPT-4o API | 리포트 생성 품질 최우선 |
| 패키지 | pnpm | 빠른 설치, 모노레포 대비 |
| 타입 | TypeScript strict | any 타입 금지 |

---

## 프로젝트 구조

```
mbti-coach-pro/
├── src/
│   ├── app/
│   │   ├── page.tsx           # 랜딩 페이지 (SEO)
│   │   ├── test/
│   │   │   └── page.tsx       # 테스트 UI
│   │   ├── result/
│   │   │   └── [id]/page.tsx  # 결과 + 리포트 미리보기
│   │   └── api/
│   │       ├── report/route.ts    # GPT-4o 리포트 생성
│   │       └── payment/route.ts   # Toss 웹훅 처리
│   ├── components/
│   │   ├── ui/                # Shadcn (직접 수정 금지)
│   │   ├── features/
│   │   │   ├── test/          # 테스트 관련 컴포넌트
│   │   │   └── report/        # 리포트 관련 컴포넌트
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/          # DB 클라이언트
│   │   ├── openai/            # GPT 클라이언트
│   │   └── toss/              # 결제 유틸
│   └── types/
│       └── index.ts           # 전체 타입 정의
├── public/
├── .env.local                 # 환경변수 (절대 커밋 금지)
└── package.json
```

---

## 절대 하지 마 (DO NOT)

> AI에게 코드를 시킬 때 이 목록을 반드시 함께 공유하세요.

- [ ] API 키를 코드에 직접 쓰지 마 (.env.local 사용)
- [ ] `any` 타입 사용 금지 — `unknown` + 타입 가드 사용
- [ ] `ts-ignore` / `as any` 금지
- [ ] `src/components/ui/` 직접 수정 금지 (Shadcn 래퍼 사용)
- [ ] `npm install` / `yarn add` 금지 — `pnpm add`만 사용
- [ ] 목업/하드코딩 데이터로 완성이라고 하지 마
- [ ] 실제 Toss 운영 키를 테스트 환경에 사용하지 마
- [ ] `../../` 상대 경로 금지 — `@/` 앨리어스 사용
- [ ] "MBTI" 상표 관련 법적 리스크 코멘트 없이 마케팅 문구 삽입 금지
- [ ] OpenAI API 키를 클라이언트 컴포넌트에 노출하지 마 (서버 사이드만)

---

## 항상 해 (ALWAYS DO)

- [ ] 변경하기 전에 계획을 먼저 보여줘
- [ ] 환경변수는 .env.local에 저장
- [ ] 에러 발생 시 사용자에게 친절한 한국어 메시지 표시
- [ ] 모바일(375px)에서도 사용 가능한 반응형 디자인
- [ ] Supabase 쿼리는 항상 `const { data, error } = await supabase...` 패턴
- [ ] Server Component에서 `createServerClient`, Client Component에서 `createBrowserClient`
- [ ] 결제 웹훅은 Toss 서명 검증 후 처리

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

- [ ] Toss Payments 사업자 등록 번호 준비 여부
- [ ] OpenAI API 사용량 한도 설정 (리포트 생성 비용 관리)
- [ ] Supabase 프로젝트 지역 설정 (한국 유저 → ap-northeast-2 권장)
