import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractAndSaveMemories, getMemoryContext } from "@/lib/memory/session-memory";

/**
 * POST /api/memory — 세션 종료 시 메모리 추출 및 저장
 * PRD: 세션 메모리 AI 전용 엔드포인트
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, messages } = await req.json() as {
      sessionId: string;
      messages: Array<{ role: string; content: string }>;
    };

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json({ error: "Missing sessionId or messages" }, { status: 400 });
    }

    await extractAndSaveMemories(user.id, sessionId, messages);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[memory API]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/memory — 현재 유저의 메모리 컨텍스트 조회
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await getMemoryContext(user.id);

    return NextResponse.json({ context });
  } catch (err: unknown) {
    console.error("[memory API GET]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
