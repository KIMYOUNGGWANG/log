# VibeFlow (MVP) Design Document
**Date:** 2026-04-27
**Target:** 2026 Trend-based 'Come for the Tool, Stay for the Network' Strategy
**Core Concept:** Wellness-based Social Platform using 4 Happy Hormones (Dopamine, Serotonin, Endorphin, Oxytocin).

## 1. Architecture Overview
- **Strategy:** Single-player Hormone Tracker (Global) ➔ Spontaneous Local Matchmaking (Vancouver initially).
- **Tech Stack:** 
  - Client: Expo Router (React Native) for cross-platform (Web & App)
  - UI: NativeWind (Tailwind)
  - Backend: Firebase (Auth, Firestore, Cloud Storage)
  - Serverless: Firebase Cloud Functions
  - AI Engine: Google Gemini API (Dynamic text for Web, Fast Mapping for App)

## 2. Core UX & Flow
1. **Daily Check-in:** Swipe UI to input mood/weather. AI calculates hormone levels.
2. **Hormone Prescription:** AI generates personalized activity recommendations based on the lacking hormone.
3. **Vibe Radar (Matchmaking):** User selects "Do together". The app uses Geohash to find users within 5km doing the same activity. Temporary 3-hour chat room opens.
4. **Social Tracker:** Photo verification, Hormone Calendar (like GitHub contributions), and friend code sharing.

## 3. Data Models (Firestore)
- `users`: uid, nickname, location (GeoPoint), hormoneBalance, friends
- `activities`: id, title, targetHormone, isMultiplayer
- `checkIns`: userId, timestamp, mood, completedActivityId, proofImageUrl
- `vibeRooms`: activityId, location (Public POI GeoPoint), participants, expiresAt

## 4. Key APIs
- `POST /analyzeHormone`: Returns tailored activities based on user input and environment (Web/Native).
- `POST /findVibeMatch`: GeoQuery to find or create a local meetup room.

## 5. Security & Edge Cases
- **Safety:** IRL match locations are restricted to safe Public POIs (cafes, parks).
- **Cold Start:** If no match in 15 mins, fallback to "Solo Vibe" with a consolation badge.
- **Performance:** Use Geohash indexing for Firestore location queries. Fallback to hardcoded presets if Gemini API times out.
