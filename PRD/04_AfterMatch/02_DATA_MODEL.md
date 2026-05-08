# AfterMatch — 데이터 모델

> 앱에서 다루는 핵심 데이터의 구조입니다.

---

## 전체 구조

```
[User]
  ├── 1:N ──> [DatePerson]    (데이트 상대방)
  ├── 1:N ──> [AIInsight]     (AI 패턴 분석 결과)
  └── 1:1 ──> [Subscription]  (구독 상태)

[DatePerson]
  └── 1:N ──> [DateEntry]     (각 날짜별 데이트 기록)
```

---

## 엔티티 상세

### User
회원 계정. 소셜 로그인으로 가입.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (UUID) | uuid-abc | O |
| email | 이메일 주소 | user@kakao.com | O |
| provider | 로그인 방식 | kakao / google | O |
| created_at | 가입일 | 2026-05-03 | O |

### DatePerson
데이트 상대방. 유저가 직접 등록 및 관리.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-person | O |
| user_id | User 참조 | uuid-abc | O |
| nickname | 상대방 별명 (유저 정의, 실명 비권장) | "민준씨" | O |
| platform | 만난 경로 | tinder / hinge / bumble / blind_date / irl / other | X |
| status | 진행 상태 | active / archived | O |
| interest_score | 현재 진정성 점수 (1~10, 유저 자체 평가) | 7 | X |
| first_met_at | 첫 만남 날짜 | 2026-04-20 | X |
| last_date_at | 마지막 만남 날짜 (DateEntry에서 자동 업데이트) | 2026-05-01 | X |
| created_at | 등록 일시 | 2026-05-03T10:00:00 | O |

### DateEntry
개별 데이트 후 기록하는 디브리핑 일기.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-entry | O |
| person_id | DatePerson 참조 | uuid-person | O |
| user_id | User 참조 (쿼리 편의) | uuid-abc | O |
| date_number | 해당 상대와 몇 번째 만남 | 2 | O |
| happened_at | 만남 일시 | 2026-05-01T19:00:00 | O |
| energy_after | 만남 후 에너지 (1~10) | 6 | O |
| mood_notes | 자유 평가 텍스트 | "대화가 잘 통했지만 연락이 조금 느린 편" | X |
| red_flags | 레드플래그 목록 (JSON 배열) | ["대화 독점", "약속 지각"] | X |
| green_flags | 그린플래그 목록 (JSON 배열) | ["유머 있음", "배려심 있음"] | X |
| would_meet_again | 다음 만남 의향 | true | X |
| created_at | 기록 일시 | 2026-05-01T22:30:00 | O |

### AIInsight
GPT-4o가 생성하는 분석 인사이트. 두 가지 타입.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-insight | O |
| user_id | User 참조 | uuid-abc | O |
| insight_type | 인사이트 종류 | pattern / pre_date_summary | O |
| related_person_id | DatePerson 참조 (pre_date_summary 타입 시) | uuid-person | X |
| content | AI 인사이트 본문 | "당신은 에너지 7 이하인 상대는 3번째 만남에서..." | O |
| trigger_entry_count | 분석 기반이 된 DateEntry 수 | 7 | O |
| created_at | 생성 일시 | 2026-05-03T09:00:00 | O |

### Subscription
구독 상태 관리. User와 1:1.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-sub | O |
| user_id | User 참조 | uuid-abc | O |
| status | 구독 상태 | active / cancelled / expired | O |
| payment_id | Toss 결제 키 | toss_pay_xxx | O |
| started_at | 구독 시작일 | 2026-05-01 | O |
| expires_at | 만료일 | 2026-06-01 | O |

---

## 무료 제한 로직

```
비구독자:
  - DatePerson 1명까지 등록 가능
  - 해당 상대 DateEntry 3개까지 작성 가능
  - pre_date_summary: 1회 미리보기 (이후 블러 처리)
  - pattern 인사이트: 잠김

구독자:
  - DatePerson 무제한
  - DateEntry 무제한
  - 모든 AIInsight 접근
```

---

## 왜 이 구조인가

- **DatePerson 분리**: 같은 상대와 여러 번 만나는 패턴 추적. 상대별 에너지 트렌드, 레드플래그 누적 분석 가능.
- **user_id 중복 저장**: DateEntry에 user_id를 직접 저장해 `DatePerson`을 JOIN 없이 본인 데이터 RLS 적용 가능.
- **AIInsight 별도 테이블**: 생성 비용(GPT-4o 토큰)이 높아 캐시 필수. 동일 트리거에 재호출 방지.
- **red_flags / green_flags JSON 배열**: 사전 정의 플래그를 선택하는 방식. 새 플래그 추가 시 DB 스키마 변경 없이 앱 레벨에서 처리 가능.

---

## [NEEDS CLARIFICATION]

- [ ] 레드/그린 플래그 마스터 목록 — 30~50개 사전 정의 필요 (앱 레벨 상수 또는 별도 Flag 테이블)
- [ ] pre_date_summary 생성 트리거 — "다음 만남 날짜"를 유저가 입력하는지 vs 마지막 기록 후 N일 자동
- [ ] 삭제 정책 — DatePerson 삭제 시 하위 DateEntry 캐스케이드 삭제 여부
