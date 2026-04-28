import * as functions from 'firebase-functions/v2';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// ─────────────────────────────────────────────────────────────
// T1: Storage Trigger — Process Mission Photo (Async, non-blocking)
// ─────────────────────────────────────────────────────────────
export const processMissionPhoto = onObjectFinalized(async (event) => {
  const filePath = event.data.name;
  if (!filePath || !filePath.startsWith('mission_proofs/')) return;

  // Extract metadata from path: mission_proofs/{groupId}/{missionId}_{ts}.jpg
  const parts = filePath.split('/');
  const groupId = parts[1];
  const fileName = parts[2];
  const missionId = fileName.split('_')[0];
  const uploaderId = event.data.metadata?.uploaderId ?? 'unknown';

  // Build a public or signed URL
  const bucket = storage.bucket(event.data.bucket);
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '2099-01-01',
  });

  // Generate AI caption via Gemini Vision
  let aiCaption = '오늘도 멋진 하루!';
  try {
    const apiKey = process.env.GEMINI_API_KEY ?? 'dummy_key';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const imageData = { inlineData: { mimeType: event.data.contentType ?? 'image/jpeg', data: '' } };
    const prompt = `You are a warm, gentle wellness diary writer. In 1 short Korean sentence (max 20 chars), write a poetic caption for someone who just completed a wellness mission. Mission ID: ${missionId}.`;
    const result = await model.generateContent([prompt, imageData]);
    aiCaption = result.response.text().trim().slice(0, 60) || aiCaption;
  } catch (err) {
    console.warn('Gemini caption failed, using default.', err);
  }

  // Save Polaroid document
  const polaroidRef = db.collection('Polaroids').doc();
  await polaroidRef.set({
    polaroidId: polaroidRef.id,
    groupId,
    missionId,
    uploaderId,
    photoUrl: url,
    aiCaption,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update petState — reward XP and restore happiness
  const groupRef = db.collection('Groups').doc(groupId);
  await groupRef.set({
    petState: {
      level: admin.firestore.FieldValue.increment(0) as any,
      currentEmotion: 'happy',
      dominantHormone: 'serotonin',
      lastFedAt: admin.firestore.FieldValue.serverTimestamp(),
      speechBubble: '미션 완료! 너무 행복해요 🐣',
      xp: admin.firestore.FieldValue.increment(10),
    },
  }, { merge: true });

  console.log(`Polaroid saved: ${polaroidRef.id} for group ${groupId}`);
});

// ─────────────────────────────────────────────────────────────
// T2: syncWidgetState — Fetch current petState for widget/app
// ─────────────────────────────────────────────────────────────
export const syncWidgetState = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login required.');
  const { groupId } = request.data;
  if (!groupId) throw new HttpsError('invalid-argument', 'groupId is required.');

  const snap = await db.collection('Groups').doc(groupId).get();
  if (!snap.exists) throw new HttpsError('not-found', 'Group not found.');

  const data = snap.data()!;
  // Compute emotion based on lastFedAt time delta
  const lastFedAt = data.petState?.lastFedAt?.toMillis?.() ?? 0;
  const daysSinceFed = (Date.now() - lastFedAt) / (1000 * 60 * 60 * 24);
  let currentEmotion = data.petState?.currentEmotion ?? 'happy';
  if (daysSinceFed >= 3) currentEmotion = 'sleepy';

  return {
    petState: {
      level: data.petState?.level ?? 1,
      xp: data.petState?.xp ?? 0,
      currentEmotion,
      dominantHormone: data.petState?.dominantHormone ?? 'dopamine',
      lastFedAt: data.petState?.lastFedAt ?? null,
      speechBubble: currentEmotion === 'sleepy'
        ? '보고 싶었어요... 🥺'
        : (data.petState?.speechBubble ?? '같이 있어서 좋아요!'),
    },
  };
});

// ─────────────────────────────────────────────────────────────
// Existing Functions (preserved)
// ─────────────────────────────────────────────────────────────
export const createGroup = onCall((request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in.');
  const creatorId = request.auth.uid;
  const groupType = request.data.groupType || 'couple';
  const inviteCode = 'VIBE-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  return { groupId: 'g_placeholder', inviteCode, creatorId, groupType };
});

export const analyzeHormone = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in.');
  const { mood, energyLevel, context } = request.data;
  const apiKey = process.env.GEMINI_API_KEY || 'dummy_key_for_build';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `A user feels: ${mood}, energy level: ${energyLevel}/5, context: ${context}. Prescribe exactly one primary hormone they need out of: [dopamine, serotonin, endorphin, oxytocin]. Return JSON.`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    throw new HttpsError('internal', 'AI Analysis failed.');
  }
});

export const sendMission = onCall((request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in.');
  const { receiverId, missionId, message } = request.data;
  console.log(`Mission ${missionId} sent from ${request.auth.uid} to ${receiverId}: ${message}`);
  return { success: true, timestamp: Date.now() };
});
