import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAnxietyLabelKo, getAnxietyColor } from "@/lib/gad7/scoring";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Fetch the latest completed session
  let session;
  if (sessionId) {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();
    session = data;
  }

  // Fallback: get most recent completed session
  if (!session) {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();
    session = data;
  }

  // Fallback to legacy table if no v2 sessions
  if (!session) {
    const { data: legacy } = await supabase
      .from("scenario_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(1)
      .single();

    if (legacy) {
      session = {
        anxiety_before: legacy.pre_anxiety ?? 0,
        anxiety_after: legacy.post_anxiety ?? 0,
        score: legacy.score ?? 0,
        ai_feedback: legacy.ai_feedback ?? null,
        turns_count: 0,
      };
    }
  }

  if (!session) redirect("/scenarios");

  const preAnxiety = session.anxiety_before ?? 0;
  const postAnxiety = session.anxiety_after ?? 0;
  const anxietyDrop = preAnxiety - postAnxiety;
  const score = session.score ?? 0;
  const feedback = session.ai_feedback;
  const improved = anxietyDrop > 0;

  // Check for new badges earned
  const { data: recentBadges } = await supabase
    .from("user_badges")
    .select("earned_at, badges(name, emoji)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(3);

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">{improved ? "🎉" : "💪"}</div>
          <CardTitle className="text-2xl">연습 완료!</CardTitle>
          <CardDescription>
            {improved
              ? "훌륭해요! 불안도가 감소했습니다."
              : "끝까지 완료한 것 자체가 큰 성과입니다."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-4">
          {/* Score */}
          <div className="text-center">
            <div className="text-5xl font-black text-primary">{score}<span className="text-2xl">점</span></div>
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground italic">
              &quot;{feedback}&quot;
            </div>
          )}

          {/* Anxiety Change */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 text-center">불안도 변화 (GAD-7)</h3>
            <div className="flex items-center justify-between px-4">
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">시작 전</span>
                <span className="text-2xl font-bold">{preAnxiety}</span>
                <span className="text-xs text-muted-foreground">/21</span>
              </div>
              <div className="flex-1 flex flex-col items-center px-4">
                <span className={`text-xl font-bold ${improved ? "text-green-500" : "text-muted-foreground"}`}>
                  {improved ? `−${anxietyDrop}` : anxietyDrop === 0 ? "±0" : `+${Math.abs(anxietyDrop)}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {improved ? "감소 👏" : anxietyDrop === 0 ? "유지" : ""}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">종료 후</span>
                <span className={`text-2xl font-bold ${getAnxietyColor(postAnxiety)}`}>{postAnxiety}</span>
                <span className="text-xs text-muted-foreground">{getAnxietyLabelKo(postAnxiety)}</span>
              </div>
            </div>
          </div>

          {/* New Badges */}
          {recentBadges && recentBadges.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-center">🏅 획득한 배지</h3>
              <div className="flex justify-center gap-3">
                {recentBadges.map((ub: Record<string, unknown>, i: number) => {
                  const badge = ub.badges as { emoji: string; name: string } | null;
                  return badge ? (
                    <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-primary/10">
                      <span className="text-2xl">{badge.emoji}</span>
                      <span className="text-xs font-medium">{badge.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/scenarios" className="flex-1">
          <Button variant="outline" className="w-full">다른 시나리오</Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full">내 대시보드</Button>
        </Link>
      </div>
    </div>
  );
}
