"use server";

import { createClient } from "@/lib/supabase/server";
import { extractAndSaveMemories } from "@/lib/memory/session-memory";
import { calculateSessionScore } from "@/lib/gad7/scoring";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { SaveSessionInput, SaveSessionResult } from "@/types";

export async function saveSessionV2(input: SaveSessionInput): Promise<SaveSessionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch scenario for max_turns
  const { data: scenario } = await supabase
    .from("scenarios")
    .select("max_turns")
    .eq("id", input.scenarioId)
    .single();

  const maxTurns = scenario?.max_turns ?? 15;

  // Calculate score
  const score = calculateSessionScore(
    input.messages.length,
    maxTurns,
    input.preAnxiety,
    input.postAnxiety
  );

  // Generate AI feedback (non-blocking but awaited for session save)
  let aiFeedback: string | null = null;
  try {
    const lastMessages = input.messages.slice(-6);
    const conversationSnippet = lastMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // Detect locale from scenario
    const { data: scenarioData } = await supabase
      .from("scenarios")
      .select("locale")
      .eq("id", input.scenarioId)
      .single();
    const isEnglish = scenarioData?.locale === "en";

    const systemPrompt = isEnglish
      ? `You are a social anxiety practice coach. Write 1-2 sentences of encouraging feedback about the user's roleplay.
Rules:
- Do NOT use words like "therapy", "diagnosis", "therapist"
- Praise specific actions the user took
- Write in English`
      : `당신은 사회불안 연습 코치입니다. 유저의 롤플레이 대화를 보고 1~2문장의 격려 피드백을 작성하세요.
규칙:
- "치료", "진단", "치료사" 단어 사용 금지
- 구체적인 행동을 칭찬하세요
- 한국어로 작성`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      maxOutputTokens: 150,
      system: systemPrompt,
      prompt: `Anxiety: ${input.preAnxiety} → ${input.postAnxiety}\n\nConversation:\n${conversationSnippet}`,
    });
    aiFeedback = text;
  } catch (err) {
    console.error("[saveSession] AI feedback failed:", err);
  }

  // 1. Create session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      scenario_id: input.scenarioId,
      anxiety_before: input.preAnxiety,
      anxiety_after: input.postAnxiety,
      turns_count: input.messages.length,
      status: "completed",
      score,
      ai_feedback: aiFeedback,
      mode: input.mode,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("[saveSession] Session insert failed:", sessionError);
    throw new Error("Failed to save session");
  }

  // 2. Save individual messages
  if (input.messages.length > 0) {
    const messageRows = input.messages.map((m, i) => ({
      session_id: session.id,
      role: m.role,
      content: m.content,
      turn_number: i + 1,
    }));

    const { error: msgError } = await supabase
      .from("messages")
      .insert(messageRows);

    if (msgError) {
      console.error("[saveSession] Messages insert failed:", msgError);
    }
  }

  // 3. Save GAD-7 scores (pre + post)
  await supabase.from("gad7_scores").insert([
    {
      user_id: user.id,
      score_type: "quick",
      total_score: input.preAnxiety,
      answers: input.preAnswers,
      session_id: session.id,
    },
    {
      user_id: user.id,
      score_type: "quick",
      total_score: input.postAnxiety,
      answers: input.postAnswers,
      session_id: session.id,
    },
  ]);

  // 4. Update user_progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("id, play_count")
    .eq("user_id", user.id)
    .eq("scenario_id", input.scenarioId)
    .single();

  if (progress) {
    await supabase
      .from("user_progress")
      .update({ play_count: (progress.play_count ?? 0) + 1, is_cleared: true })
      .eq("id", progress.id);
  } else {
    await supabase
      .from("user_progress")
      .insert({
        user_id: user.id,
        scenario_id: input.scenarioId,
        play_count: 1,
        is_cleared: true,
      });
  }

  // 5. Extract session memories (async, non-blocking)
  extractAndSaveMemories(user.id, session.id, input.messages).catch(
    (err) => console.error("[saveSession] Memory extraction failed:", err)
  );

  return { success: true, sessionId: session.id };
}
