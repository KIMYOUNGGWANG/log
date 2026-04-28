# VibeFlow API Contracts (MVP)

## 1. POST /api/checkin
**Description:** 유저의 상태(기분, 수면 등)를 입력받아 AI(Gemini)를 통해 현재 부족한 호르몬과 추천 웰니스 미션을 반환합니다.
- **Request Body:**
  ```json
  {
    "userId": "string",
    "mood": "string",
    "energyLevel": "number (1-5)",
    "context": "string (e.g. 비오는 날, 혼자 있음)"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "primaryHormone": "serotonin",
    "message": "비가 오는 날이네요. 따뜻한 차와 함께 독서하며 세로토닌을 채워보세요.",
    "recommendedMissions": [
      {
        "missionId": "m_123",
        "title": "짧게라도 책 읽기",
        "type": "serotonin",
        "imageUrl": "..."
      }
    ]
  }
  ```

## 2. POST /api/groups/invite
**Description:** 커플/가족/친구 그룹을 생성하고 초대 링크(코드)를 발급합니다.
- **Request Body:**
  ```json
  {
    "creatorId": "string",
    "groupType": "couple | family | friends"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "groupId": "g_456",
    "inviteCode": "VIBE-XYZ"
  }
  ```

## 3. POST /api/missions/send
**Description:** 특정 그룹 멤버(애인/친구)에게 함께 할 웰니스 미션을 전송합니다. (푸시 알림 트리거)
- **Request Body:**
  ```json
  {
    "senderId": "string",
    "groupId": "string",
    "missionId": "string",
    "message": "우리 이번 주말에 이거 같이 하자!"
  }
  ```

## 4. POST /api/missions/complete
**Description:** 미션을 수행하고 인증샷을 업로드하여 해당 호르몬 점수를 획득합니다.
- **Request Body:**
  ```json
  {
    "userId": "string",
    "missionId": "string",
    "proofImageUrl": "string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "earnedHormone": "serotonin",
    "points": 10,
    "groupStatusUpdated": true
  }
  ```
