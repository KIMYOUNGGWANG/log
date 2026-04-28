# Feature Design: The Vibe Pet & Polaroid Gallery

## 1. Architecture Overview
**Components:**
- `VibeWidget` (iOS/Android Native): Lockscreen/Home widget syncing pet state.
- `VibePet Engine` (Firebase Functions): Backend engine calculating level, emotion, and dominant hormone based on inputs.
- `Polaroid Gallery` (Frontend): `GalleryScreen` displaying mission proofs chronologically.

**Data Flow:**
1. Widget/App fetches `PetState`.
2. User captures mission photo -> uploads to Storage.
3. Backend asynchronously generates AI diary via Gemini -> Updates `Polaroids` collection -> Upgrades `PetState`.
4. Silent Push triggers Widget/App UI refresh.

## 2. Key Interfaces & Contracts
**Firestore Schema:**
- `Groups` Collection:
  - `petState`: `{ level: number, currentEmotion: string, dominantHormone: string, lastFedAt: timestamp, speechBubble: string }`
- `Polaroids` Collection:
  - `{ polaroidId: string, groupId: string, missionId: string, photoUrl: string, aiCaption: string, createdAt: timestamp }`

**Backend Functions:**
- `syncWidgetState` (GET): Fetches current state.
- `submitMissionProof` (Storage Trigger): Asynchronously processes image -> calls Gemini -> updates DB.

## 3. Integration Points
- **Frontend (`vibeflow/src/screens`)**:
  - `DashboardScreen.tsx`: Replace static stats with VibePet Lottie/SVG.
  - `CalendarScreen.tsx` -> `GalleryScreen.tsx`: Replace old Calendar with Polaroid list.
  - `MissionInboxScreen.tsx`: Integrate `expo-image-picker` for camera access.
- **Backend (`vibeflow/functions`)**:
  - Rewrite `index.ts` to support Storage triggers and async Gemini calls.

## 4. Edge Cases & Error Handling (Blind Review Resolved)
- **Security**: Firebase Storage rules MUST strictly validate `request.auth.uid in get(/databases/(default)/documents/Groups/$(groupId)).data.members`.
- **Performance**: Gemini API calls are decoupled from the client upload. Users see immediate success, while AI captioning happens in the background via Storage `onFinalize` triggers.
- **Abandonment**: Pet enters "Sleep" mode after 3 days of inactivity to prevent guilt/stress.
