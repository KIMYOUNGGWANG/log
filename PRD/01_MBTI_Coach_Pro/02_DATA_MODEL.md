# MBTI Coach Pro — 데이터 모델

> 앱에서 다루는 핵심 데이터의 구조입니다.

---

## 전체 구조

```
[User]
  ├── 1:N ──> [TestResult]   (MBTI/애착/에니어그램 테스트 답안)
  ├── 1:N ──> [Report]       (₩9,900 일회성 AI 리포트)
  ├── 1:N ──> [CourseEnroll] (₩29,900 90일 코스 등록)
  └── 1:N ──> [CompatReport] (2명 호환성 PDF)

[CourseEnroll]
  └── 1:N ──> [DailyMission] (매일 1분 체크인 기록)
```

---

## 엔티티 상세

### User
회원 계정. 소셜 로그인으로 가입.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (UUID, 자동 생성) | uuid-abc-123 | O |
| email | 이메일 주소 | user@kakao.com | O |
| provider | 로그인 방식 | kakao / google | O |
| mbti_type | 최근 MBTI 결과 | INFP | X |
| attachment_type | 애착유형 | anxious / secure / avoidant | X |
| enneagram_type | 에니어그램 번호 | 4 | X |
| created_at | 가입일 (자동) | 2026-05-03 | O |

### TestResult
테스트 응시 기록. 유저가 여러 번 테스트 가능.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-xyz | O |
| user_id | User 참조 | uuid-abc-123 | O |
| test_type | 테스트 종류 | mbti / attachment / enneagram | O |
| answers | 응답 배열 (JSON) | [1,2,1,3,...] | O |
| result_type | 계산된 결과 유형 | INFP | O |
| created_at | 응시 일시 | 2026-05-03T09:00:00 | O |

### Report
결제 후 생성되는 AI 리포트.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-rep | O |
| user_id | User 참조 | uuid-abc | O |
| test_result_id | 기반이 된 TestResult | uuid-xyz | O |
| content_json | AI 생성 리포트 내용 (JSON) | {"sections":[...]} | O |
| is_paid | 결제 완료 여부 | true | O |
| payment_id | Toss 결제 키 | toss_pay_xxx | X (무료 시 null) |
| created_at | 생성 일시 | 2026-05-03T09:05:00 | O |

### CourseEnroll
₩29,900 90일 코스 등록.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-enroll | O |
| user_id | User 참조 | uuid-abc | O |
| mbti_type | 등록 시점 MBTI 유형 | INFP | O |
| start_date | 코스 시작일 | 2026-05-03 | O |
| current_day | 현재 몇 일차 | 7 | O |
| is_active | 활성 여부 | true | O |
| payment_id | Toss 결제 키 | toss_pay_yyy | O |

### DailyMission
매일 1분 미션 완료 기록.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-mission | O |
| enroll_id | CourseEnroll 참조 | uuid-enroll | O |
| day_number | 몇 일차 미션 | 7 | O |
| user_input | 유저 입력 텍스트 | "오늘 회피했던 순간은..." | X |
| ai_response | AI 피드백 | "잘 하셨어요. 내일은..." | X |
| completed_at | 완료 일시 | 2026-05-03T08:30:00 | X (미완료 시 null) |

### CompatReport
2명 MBTI 호환성 PDF.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | UUID | uuid-compat | O |
| requester_id | 요청한 User | uuid-abc | O |
| my_mbti | 내 MBTI | INFP | O |
| target_mbti | 상대 MBTI | ENTJ | O |
| pdf_url | 생성된 PDF 스토리지 URL | supabase/storage/... | O |
| payment_id | Toss 결제 키 | toss_pay_zzz | O |
| created_at | 생성 일시 | 2026-05-03 | O |

---

## 왜 이 구조인가

- **TestResult 분리**: 유저가 여러 번 테스트를 다시 받을 수 있도록. 가장 최근 결과를 User에 캐시.
- **Report와 TestResult 연결**: 리포트가 어떤 테스트 결과 기반인지 추적 (환불 대응, 재생성).
- **CourseEnroll 분리**: 향후 코스 유형(30일, 60일 등)이 늘어도 구조 변경 없이 확장 가능.

---

## [NEEDS CLARIFICATION]

- [ ] content_json 리포트 섹션 구조 정의 필요 (AI 프롬프트 설계와 연동)
- [ ] DailyMission 미완료 시 다음날로 넘어가는 정책
