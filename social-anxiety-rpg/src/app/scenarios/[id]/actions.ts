"use server";

import { createClient } from "@/lib/supabase/server";
import { extractAndSaveMemories } from "@/lib/memory/session-memory";

interface SaveSessionInput {
  scenarioId: string;
  preAnxiety: number;
  postAnxiety: number;
  preAnswers: number[];
  postAnswers: number[];
  messages: { role: string; content: string }[];
  mode: "text" | "voice";
}

export async function saveSessionV2(input: SaveSessionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

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

  // 4. Update user_progress (legacy compatibility)
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("scenario_id", input.scenarioId)
    .single();

  if (progress) {
    await supabase
      .from("user_progress")
      .update({ play_count: (progress.play_count || 0) + 1, is_cleared: true })
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

  // 5. Extract and save session memories (async, non-blocking)
  extractAndSaveMemories(user.id, session.id, input.messages).catch(
    (err) => console.error("[saveSession] Memory extraction failed:", err)
  );

  return { success: true, sessionId: session.id };
}
