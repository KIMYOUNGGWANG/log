# API Contracts: Vibe Pet & Polaroid System

## 1. Firebase Storage Trigger: `processMissionPhoto`
- **Method:** `onObjectFinalized` (Firebase Storage Trigger)
- **Path:** `/mission_proofs/{groupId}/{missionId}_{timestamp}.jpg`
- **Trigger Payload:** `ObjectMetadata` (contains image path and custom metadata like `uploaderId`).
- **Logic:**
  1. Detect new upload.
  2. Call Gemini Vision API with the image to generate `aiCaption`.
  3. Create document in `Polaroids` collection.
  4. Update `petState` in `Groups/{groupId}`.
  5. (Optional) Send FCM Push notification.
- **Error Handling:** If Gemini fails, save Polaroid with a default caption.

## 2. Widget State API: `syncWidgetState`
- **Method:** `onCall` (Callable Function)
- **Request Schema:** `{ groupId: string }`
- **Response Schema:** 
  ```json
  {
    "petState": {
      "level": 1,
      "currentEmotion": "happy",
      "dominantHormone": "dopamine",
      "speechBubble": "Feeling great!"
    }
  }
  ```
- **Auth:** Requires valid Firebase Auth token and membership in `groupId`.
