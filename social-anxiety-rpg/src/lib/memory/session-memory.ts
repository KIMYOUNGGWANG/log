import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";

/**
 * 세션 종료 시 대화 패턴을 분석하여 user_memories에 저장
 */
export async function extractAndSaveMemories(
  userId: string,
  sessionId: string,
  messages: { role: string; content: string }[]
) {
  const supabase = await createClient();

  // GPT-4o로 패턴 분석
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const { text } = await generateText({
    model: openai("gpt-4o"),
    maxOutputTokens: 500,
    system: `You are a CBT-informed conversation analyst. Analyze the following roleplay conversation and extract exactly 2-3 insights in JSON array format.
Each insight must have:
- "type": one of "pattern", "insight", or "preference"  
- "content": a concise observation (1 sentence, in the same language as the conversation)

Focus on:
- Recurring anxiety patterns (avoidance, hesitation, topic changes)
- Effective strategies the user employed
- User preferences (conversation style, comfort areas)

Respond ONLY with a valid JSON array. No markdown, no explanation.`,
    prompt: conversationText,
  });

  // Parse memories
  let memories: { type: string; content: string }[];
  try {
    memories = JSON.parse(text);
    if (!Array.isArray(memories)) throw new Error("Not an array");
  } catch {
    console.error("[memory] Failed to parse AI response:", text);
    return;
  }

  // 기존 메모리 개수 확인 (최대 20개 유지)
  const { count } = await supabase
    .from("user_memories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const currentCount = count ?? 0;
  const incoming = memories.length;

  // FIFO: 초과분 삭제
  if (currentCount + incoming > 20) {
    const deleteCount = currentCount + incoming - 20;
    const { data: oldest } = await supabase
      .from("user_memories")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: true })
      .limit(deleteCount);

    if (oldest && oldest.length > 0) {
      await supabase
        .from("user_memories")
        .delete()
        .in("id", oldest.map((m) => m.id));
    }
  }

  // 새 메모리 저장
  const inserts = memories.map((m) => ({
    user_id: userId,
    memory_type: m.type,
    content: m.content,
    source_session_id: sessionId,
  }));

  const { error } = await supabase.from("user_memories").insert(inserts);
  if (error) {
    console.error("[memory] Insert failed:", error);
  }
}

/**
 * 세션 시작 시 최근 메모리를 조회하여 AI 시스템 프롬프트에 주입할 문자열 반환
 */
export async function getMemoryContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: memories } = await supabase
    .from("user_memories")
    .select("memory_type, content")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (!memories || memories.length === 0) return "";

  const lines = memories.map(
    (m) => `- [${m.memory_type}] ${m.content}`
  );

  return `\n\n[이전 연습에서 관찰된 패턴]\n${lines.join("\n")}\n이 정보를 참고하여 유저에게 맞춤 대화를 진행하세요.`;
}
