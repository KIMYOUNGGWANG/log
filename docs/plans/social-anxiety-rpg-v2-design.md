# Social Anxiety RPG v2 — 설계 문서

> 생성일: 2026-05-08
> 접근법: 기존 코드 점진적 수정 (A)
> 시장: 한국 + 북미 동시 (B)
> GAD-7: 세션 3문항 + 주간 7문항 (C)

---

## 1. 아키텍처 변경 개요

### 유지 (재사용)
- Next.js 15 App Router + Tailwind 4 + Shadcn/UI
- Supabase (Postgres + Auth + Storage)
- Stripe 결제 (text + voice 플랜)
- GPT-4o 텍스트 롤플레이 (`/api/chat`)
- ElevenLabs 음성 롤플레이 (`/api/realtime-session`)
- Web Push 알림
- 배지 시스템

### 수정 (리팩토링)
1. **데이터 모델 마이그레이션**
   - `scenario_sessions` → `sessions` (GAD-7 점수 0~21, mode 컬럼 추가)
   - `turns_json` blob → `messages` 정규화 테이블
   - `scenarios` 테이블에 `locale`, `npc_name`, `npc_personality`, `opening_line`, `max_turns` 추가
   - 새 `user_memories` 테이블 생성

2. **i18n 구조 (`next-intl`)**
   - `/[locale]/` 동적 세그먼트 (ko, en)
   - `messages/ko.json`, `messages/en.json` 번역 파일
   - 자동 locale 감지 (Accept-Language 기반)

3. **GAD-7 측정 시스템**
   - 매 세션: 3문항 빠른 체크 (GAD-2 + 1문항) → 21점 환산
   - 주 1회: 7문항 전체 GAD-7 (대시보드에서)
   - `gad7_scores` 테이블 (세션 독립 측정 이력)

4. **세션 메모리 AI**
   - 세션 종료 시 GPT-4o로 패턴 추출 → `user_memories` 저장
   - 다음 세션 시작 시 최근 5개 메모리를 시스템 프롬프트에 주입
   - memory_type: pattern, insight, preference

5. **인증 변경**
   - Google OAuth 유지
   - Apple OAuth 추가 (Supabase Auth)
   - 카카오 제거

6. **멀티커런시 Stripe**
   - KRW ₩12,900 / USD $9.99 가격 분리
   - locale 기반 자동 통화 선택

---

## 2. 새 데이터 모델 (Supabase SQL)

### scenarios 테이블 변경
```sql
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'ko';
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS npc_name TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS npc_personality TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS opening_line TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS max_turns INTEGER DEFAULT 15;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
```

### sessions 테이블 (scenario_sessions 대체)
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  scenario_id UUID NOT NULL REFERENCES scenarios(id),
  anxiety_before INTEGER NOT NULL CHECK (anxiety_before BETWEEN 0 AND 21),
  anxiety_after INTEGER CHECK (anxiety_after BETWEEN 0 AND 21),
  turns_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  ai_feedback TEXT,
  mode TEXT DEFAULT 'text' CHECK (mode IN ('text', 'voice')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### messages 테이블 (정규화)
```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_messages_session ON messages(session_id);
```

### user_memories 테이블
```sql
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  memory_type TEXT NOT NULL CHECK (memory_type IN ('pattern', 'insight', 'preference')),
  content TEXT NOT NULL,
  source_session_id UUID REFERENCES sessions(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_user_memories_user ON user_memories(user_id);
```

### gad7_scores 테이블
```sql
CREATE TABLE IF NOT EXISTS gad7_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  score_type TEXT NOT NULL CHECK (score_type IN ('quick', 'full')),
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 21),
  answers JSONB NOT NULL,
  session_id UUID REFERENCES sessions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_gad7_user ON gad7_scores(user_id, created_at);
```

---

## 3. i18n 구조

```
src/
├── i18n/
│   ├── routing.ts       # locale 라우팅 설정
│   └── request.ts       # 서버 사이드 locale 감지
├── messages/
│   ├── ko.json          # 한국어 UI 텍스트
│   └── en.json          # 영어 UI 텍스트
├── app/
│   └── [locale]/        # 모든 페이지가 locale 하위로
│       ├── page.tsx
│       ├── scenarios/
│       ├── dashboard/
│       └── layout.tsx
```

---

## 4. 세션 메모리 AI 흐름

```
세션 종료
  → messages 테이블에 전체 대화 저장
  → GPT-4o에 대화 분석 요청 (system prompt: "패턴/인사이트 추출")
  → user_memories에 저장 (최대 20개 유지, FIFO)

다음 세션 시작
  → user_memories에서 최근 5개 조회
  → NPC 시스템 프롬프트에 주입:
    "이 유저의 이전 연습 패턴: [메모리 내용]"
  → AI가 맞춤 대화 시작
```

---

## 5. GAD-7 Quick Check (3문항) 설계

매 세션 전/후:
1. "지난 2주간, 초조하거나 불안하거나 조마조마한 느낌이 얼마나 자주 있었나요?" (GAD-7 Q1)
2. "걱정을 멈추거나 조절할 수가 없었나요?" (GAD-7 Q2)
3. "여러 가지 것들에 대해 지나치게 걱정했나요?" (GAD-7 Q3)

각 0~3점 (전혀 없음/며칠/절반 이상/거의 매일)
Quick Score: 합산 0~9 → 21점 환산: `Math.round(score * 21 / 9)`

주간 Full GAD-7 (7문항): 대시보드에서 주 1회 팝업

---

## 6. 한국+북미 시나리오 시드 계획

- **한국어 25개**: PRD 4.1절 기반 (카페/전화/직장/소개팅/회식/면접/발표/갈등/고난이도)
- **영어 25개**: PRD 4.2절 기반 (cafe/phone/workplace/social/networking/interview/presentation/conflict/advanced)
- `scenarios.locale`으로 분리, 유저 locale에 맞는 시나리오만 노출
- 무료 5개씩 (KO 5개 + EN 5개 = 10개 `is_free: true`)
