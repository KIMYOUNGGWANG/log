# 사회불안 노출치료 RPG — 데이터 모델

> 이 문서는 앱에서 다루는 핵심 데이터의 구조를 정의합니다.
> 개발자가 아니어도 이해할 수 있는 "개념적 ERD"입니다.
> 한국 + 북미 멀티 마켓 구조 반영.

---

## 전체 구조

```
[users] --1:N--> [sessions] --1:N--> [messages]
                     |
                     └--1:1--> [cognitive_logs]  (Phase 2)

[users] --1:N--> [user_memories]
[users] --1:1--> [subscriptions]

[scenarios] --1:N--> [sessions]
```

---

## 엔티티 상세

### users (사용자)
앱을 사용하는 사람. 소셜 로그인으로 가입하며 언어(한국/영어)를 가집니다.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (UUID, 자동 생성) | uuid-abc-123 | O |
| email | 이메일 주소 | user@gmail.com | O |
| locale | 언어/지역 설정 | ko, en | O |
| display_name | 표시 이름 | 김영광, Alex Kim | X |
| avatar_url | 프로필 사진 URL | https://lh3.googleusercontent.com/... | X |
| current_level | 현재 달성 레벨 (1~5) | 2 | O |
| subscription_status | 구독 상태 | free, active, cancelled | O |
| created_at | 가입 날짜 (자동) | 2026-05-08 | O |

#### 관계
- users 1명이 여러 개의 sessions를 가질 수 있음
- users 1명이 여러 개의 user_memories를 가짐
- users 1명이 최대 1개의 subscriptions를 가짐

---

### scenarios (시나리오)
AI와 함께 연습하는 상황 카드. 한국어 25개 + 영어 25개 별도 운영.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | uuid-scn-001 | O |
| locale | 시나리오 언어 | ko, en | O |
| category | 상황 분류 | cafe, networking, interview, date, phone | O |
| title | 시나리오 제목 | "카페 주문하기", "Ordering Coffee" | O |
| description | 간단한 설명 | "카운터에서 바리스타에게 주문" | O |
| level | 난이도 (1~5) | 1 | O |
| npc_name | AI 캐릭터 이름 | "민준 (카페 직원)", "Jamie (Barista)" | O |
| npc_personality | AI NPC 역할 지침 (시스템 프롬프트) | "You are a barista at a busy cafe..." | O |
| opening_line | AI의 첫 대사 | "안녕하세요, 주문 도와드릴까요?" | O |
| max_turns | 최대 대화 턴 수 | 15 | O |
| is_free | 무료 공개 여부 | true, false | O |
| order_index | 노출 순서 | 1 | O |
| created_at | 등록 날짜 | 2026-05-08 | O |

#### 관계
- scenarios 1개에 여러 개의 sessions가 연결됨 (같은 시나리오를 반복 연습 가능)

---

### sessions (롤플레이 세션)
유저가 한 번 연습한 기록. 시작부터 끝까지의 대화 묶음.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | uuid-ses-001 | O |
| user_id | 사용자 참조 | uuid-abc-123 | O |
| scenario_id | 시나리오 참조 | uuid-scn-001 | O |
| anxiety_before | 시작 전 GAD-7 점수 (0~21) | 14 | O |
| anxiety_after | 종료 후 GAD-7 점수 (0~21) | 8 | X |
| turns_count | 대화 턴 수 | 12 | O |
| status | 세션 상태 | in_progress, completed, abandoned | O |
| score | 완료 점수 (0~100, 규칙 기반) | 78 | X |
| ai_feedback | AI 종료 피드백 텍스트 | "오늘 회피 없이 끝까지 완료!" | X |
| created_at | 시작 날짜 (자동) | 2026-05-08T09:00:00 | O |
| completed_at | 완료 날짜 | 2026-05-08T09:15:00 | X |

#### 관계
- sessions 1개에 여러 개의 messages가 포함됨
- sessions 1개에 최대 1개의 cognitive_logs가 연결됨 (Phase 2)

---

### messages (대화 메시지)
세션 내의 한 줄 한 줄 대화 기록. 세션 메모리 AI의 원천 데이터.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | uuid-msg-001 | O |
| session_id | 세션 참조 | uuid-ses-001 | O |
| role | 발화자 | user, assistant | O |
| content | 대화 내용 | "아메리카노 한 잔 주세요." | O |
| turn_number | 몇 번째 턴 | 3 | O |
| created_at | 작성 시각 | 2026-05-08T09:03:00 | O |

---

### user_memories (세션 메모리)
AI가 유저의 반복 패턴을 학습해 저장하는 인사이트 메모. 다음 세션 시작 시 AI에게 주입.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | uuid-mem-001 | O |
| user_id | 사용자 참조 | uuid-abc-123 | O |
| memory_type | 메모리 종류 | pattern, insight, preference | O |
| content | 메모리 내용 | "질문을 먼저 받을 때 당황하는 경향이 있음" | O |
| source_session_id | 파생된 세션 | uuid-ses-001 | X |
| updated_at | 마지막 갱신 | 2026-05-08 | O |

#### memory_type 정의
- **pattern**: 반복되는 불안 패턴 ("initiating conversation 어려움")
- **insight**: 효과적인 전략 ("숨 고르기 후 시작하면 성과 좋음")
- **preference**: 유저 선호 ("짧은 세션 선호, 카페 카테고리 최다 플레이")

---

### cognitive_logs (인지 재구성 기록) — Phase 2 활성화
롤플레이 후 CBT 사고 재구성 워크시트 결과 저장.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | uuid-cog-001 | O |
| session_id | 세션 참조 | uuid-ses-001 | O |
| user_id | 사용자 참조 | uuid-abc-123 | O |
| automatic_thought | 자동적 부정 사고 | "내가 말하면 다들 이상하게 볼 거야" | O |
| evidence_for | 근거 (찬성) | "지난 회의에서 말했더니 조용했음" | X |
| evidence_against | 근거 (반박) | "팀장이 고맙다고 했음" | X |
| balanced_thought | 균형 잡힌 대안 사고 | "이상하게 볼 수도 있지만 대부분은 신경 안 씀" | O |
| created_at | 작성 날짜 | 2026-05-08 | O |

---

### subscriptions (구독 정보)
Stripe를 통한 결제 상태. 한국(KRW) / 북미(USD) 멀티커런시 지원.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | uuid-sub-001 | O |
| user_id | 사용자 참조 | uuid-abc-123 | O |
| stripe_subscription_id | Stripe 구독 ID | sub_1234567890 | O |
| stripe_customer_id | Stripe 고객 ID | cus_1234567890 | O |
| tier | 구독 티어 | basic, voice | O |
| amount | 금액 (정수) | 12900, 999 (cents) | O |
| currency | 통화 | KRW, USD | O |
| status | 결제 상태 | active, cancelled, past_due | O |
| current_period_end | 현재 구독 만료일 | 2026-06-08 | O |
| created_at | 구독 시작일 | 2026-05-08 | O |

---

### Badge / UserBadge (배지 시스템)

**Badge** — 배지 정의 (정적 테이블, 관리자 설정)

| 필드 | 설명 | 예시 |
|------|------|------|
| id | UUID | uuid-badge |
| name | 배지 이름 | "카페 마스터", "Cafe Champion" |
| description | 달성 조건 | "카페 카테고리 모든 시나리오 클리어" |
| condition_type | 조건 유형 | category_clear, level_up, streak |
| condition_value | 조건 값 (JSON) | `{"category":"cafe"}` |
| locale | 표시 언어 | ko, en |
| icon_url | 배지 아이콘 | /badges/cafe-master.svg |

**UserBadge** — 유저가 획득한 배지

| 필드 | 설명 |
|------|------|
| id | UUID |
| user_id | User 참조 |
| badge_id | Badge 참조 |
| earned_at | 획득 일시 |

---

## 왜 이 구조인가

리서치 결과 반영:

- **세션 메모리 필수**: 2026년 북미 사용자 기본 기대치로 격상됨. messages 테이블에서 AI가 패턴 추출 → user_memories에 저장. 다음 세션 시작 시 AI 컨텍스트에 주입해 연속성 구현
- **GAD-7을 sessions에 직접 포함**: 별도 anxiety_records 테이블은 조회 복잡도 증가. 세션당 1회 측정 원칙이므로 sessions 컬럼으로 단순화
- **messages 별도 분리**: sessions.turns_json(JSON blob) 대신 messages 정규화 테이블로 분리. 세션 메모리 AI가 최근 N개 대화만 조회하기 쉬움
- **locale 분리**: scenarios와 users 모두 locale 필드 보유. 한국 유저에게는 ko 시나리오만, 영어 유저에게는 en 시나리오만 노출
- **cognitive_logs 분리**: Phase 2 기능이므로 sessions와 1:1로 연결하되 Phase 1에서는 비활성화
- **확장성**: 음성 세션(Phase 2)은 sessions에 `mode: text|voice` 컬럼 추가로 수용. 일본어(Phase 3)는 scenarios.locale에 'ja' 추가만으로 지원

---

## [NEEDS CLARIFICATION]

- [ ] user_memories 최대 보존 개수 — 전체 누적 vs 최근 20개만 유지
- [ ] 구독 취소 후 sessions·messages 보존 기간 (CCPA 규정 검토 필요)
- [ ] GAD-7 간이 버전 (3문항) 점수 → 21점 환산 방식
- [ ] score 계산 알고리즘 — 완료 여부 + 턴 수 규칙 기반 vs GPT-4o 평가
