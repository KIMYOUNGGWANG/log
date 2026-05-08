# AI 신경계 조절 코치 — 데이터 모델

> 앱에서 다루는 핵심 데이터의 구조입니다.

---

## 전체 구조

```
[User]
  ├── 1:N ──> [StressCheckIn]       (일일 체크인)
  ├── 1:N ──> [RoutineSession]      (루틴 수행 기록)
  ├── 1:N ──> [AIRecommendation]    (AI 루틴 처방)
  ├── 1:1 ──> [UserCourseProgress]  (14일 코스 진도)
  └── 1:1 ──> [Subscription]        (구독 상태)

[CourseDay]  (정적 콘텐츠 테이블 — 관리자 작성)
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
| timezone | 타임존 (알림 시간 기준) | Asia/Seoul | O |
| created_at | 가입일 | 2026-05-03 | O |

### StressCheckIn
매일 아침 1분 체크인 기록.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-chk | O |
| user_id | User 참조 | uuid-abc | O |
| stress_level | 스트레스 수준 (1~10) | 8 | O |
| sleep_quality | 수면 품질 (1~5) | 2 | O |
| energy_level | 에너지 수준 (1~5) | 3 | O |
| notes | 자유 메모 | "어제 야근 했음" | X |
| checked_at | 체크인 일시 | 2026-05-03T07:15:00 | O |

### AIRecommendation
체크인 데이터 기반 GPT-4o 루틴 처방.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-rec | O |
| user_id | User 참조 | uuid-abc | O |
| check_in_id | StressCheckIn 참조 | uuid-chk | O |
| recommended_routines | 추천 루틴 배열 (JSON) | [{"type":"breathing","duration":240,"reason":"교감신경 과활성 완화"}] | O |
| ai_message | AI 코치 오늘의 한 마디 | "오늘은 박스 브리딩 4분 먼저 하세요. 수면 부족이 코르티솔을 높이고 있습니다." | O |
| created_at | 처방 생성 일시 | 2026-05-03T07:16:00 | O |

### RoutineSession
유저가 수행한 개별 루틴 기록.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-rout | O |
| user_id | User 참조 | uuid-abc | O |
| routine_type | 루틴 종류 | breathing / meditation / cold_water | O |
| routine_subtype | 세부 종류 | box_breathing / 4-7-8 / cold_shower | X |
| duration_sec | 수행 시간 (초) | 240 | O |
| is_completed | 완료 여부 | true | O |
| completed_at | 완료 일시 | 2026-05-03T07:20:00 | X |

### CourseDay
14일 신경계 회복 코스 콘텐츠 (관리자가 작성하는 정적 테이블).

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-cd | O |
| day_number | 1~14 일차 | 3 | O |
| title | 오늘의 코치 제목 | "번아웃의 3단계 패턴 알기" | O |
| theme | 주제 키워드 | burnout_awareness / safety / rest | O |
| content_markdown | 코치 본문 (Markdown) | "번아웃은 갑자기 오지 않습니다..." | O |
| routines_json | 오늘 권장 루틴 [{type, duration, guide_text}] | [{"type":"breathing","duration":300,"guide_text":"..."}] | O |
| reflection_prompt | 오늘의 질문 (선택) | "오늘 가장 에너지를 빼앗는 것은?" | X |

### UserCourseProgress
14일 코스 진도 추적. User와 1:1.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-cp | O |
| user_id | User 참조 | uuid-abc | O |
| current_day | 현재 진행 일차 (1~14) | 3 | O |
| started_at | 코스 시작일 | 2026-05-01 | O |
| last_active_at | 마지막 활동 일시 | 2026-05-03T07:25:00 | O |
| completed_days | 완료한 일차 배열 (JSON) | [1, 2, 3] | O |

### Subscription
구독 상태 관리. User와 1:1.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-sub | O |
| user_id | User 참조 | uuid-abc | O |
| status | 구독 상태 | active / cancelled / expired | O |
| payment_id | Toss 결제 키 | toss_pay_xxx | O |
| amount | 결제 금액 (원) | 28000 | O |
| started_at | 구독 시작일 | 2026-05-01 | O |
| expires_at | 만료일 | 2026-06-01 | O |

---

## 왜 이 구조인가

- **AIRecommendation 별도 저장**: 처방 내용을 캐시해 동일 체크인으로 AI를 재호출하지 않음. GPT-4o 비용 절감.
- **RoutineSession 분리**: 어떤 루틴을 실제로 했는지 추적. "추천받았지만 안 한" 데이터가 핵심 인사이트.
- **CourseDay 정적 테이블**: 14일 콘텐츠는 DB에서 관리자가 직접 수정 가능. 코드 배포 없이 콘텐츠 업데이트.
- **completed_days JSON 배열**: 14일 중 건너뛴 날이 있어도 순서 추적 가능.

---

## [NEEDS CLARIFICATION]

- [ ] recommended_routines JSON 스키마 확정 — type, duration, reason 외 추가 필드 여부
- [ ] 14일 코스 재시작 정책 — completed_days 리셋 시 UserCourseProgress 새 레코드 생성 vs 덮어쓰기
- [ ] StressCheckIn 하루 1회 제한 여부 — 오후 추가 체크인 허용 여부
