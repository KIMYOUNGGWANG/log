import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAnxietyLabelKo, getAnxietyLabelEn, getAnxietyColor } from "@/lib/gad7/scoring";

function detectLocale(acceptLang: string | null): "ko" | "en" {
  if (!acceptLang) return "ko";
  return acceptLang.startsWith("ko") ? "ko" : "en";
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const headerStore = await headers();
  const locale = detectLocale(headerStore.get("accept-language"));
  const isKo = locale === "ko";
  const getLabel = isKo ? getAnxietyLabelKo : getAnxietyLabelEn;

  // Fetch session
  let session;
  if (sessionId) {
    const { data } = await supabase.from("sessions").select("*").eq("id", sessionId).eq("user_id", user.id).single();
    session = data;
  }
  if (!session) {
    const { data } = await supabase.from("sessions").select("*").eq("user_id", user.id).eq("status", "completed").order("completed_at", { ascending: false }).limit(1).single();
    session = data;
  }
  if (!session) {
    const { data: legacy } = await supabase.from("scenario_sessions").select("*").eq("user_id", user.id).order("played_at", { ascending: false }).limit(1).single();
    if (legacy) session = { anxiety_before: legacy.pre_anxiety ?? 0, anxiety_after: legacy.post_anxiety ?? 0, score: legacy.score ?? 0, ai_feedback: null, turns_count: 0 };
  }
  if (!session) redirect("/scenarios");

  const pre = session.anxiety_before ?? 0;
  const post = session.anxiety_after ?? 0;
  const drop = pre - post;
  const improved = drop > 0;
  const score = session.score ?? 0;
  const feedback = session.ai_feedback;

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
          <CardTitle className="text-2xl">{isKo ? "연습 완료!" : "Session Complete!"}</CardTitle>
          <CardDescription>
            {improved
              ? (isKo ? "훌륭해요! 불안도가 감소했습니다." : "Great job! Your anxiety decreased.")
              : (isKo ? "끝까지 완료한 것 자체가 큰 성과입니다." : "Finishing the session is a great achievement.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-5xl font-black text-primary">{score}<span className="text-2xl">{isKo ? "점" : "pts"}</span></div>
          </div>

          {feedback && (
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground italic">&quot;{feedback}&quot;</div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 text-center">{isKo ? "불안도 변화 (GAD-7)" : "Anxiety Change (GAD-7)"}</h3>
            <div className="flex items-center justify-between px-4">
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">{isKo ? "시작 전" : "Before"}</span>
                <span className="text-2xl font-bold">{pre}</span>
                <span className="text-xs text-muted-foreground">/21</span>
              </div>
              <div className="flex-1 flex flex-col items-center px-4">
                <span className={`text-xl font-bold ${improved ? "text-green-500" : "text-muted-foreground"}`}>
                  {improved ? `−${drop}` : drop === 0 ? "±0" : `+${Math.abs(drop)}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {improved ? (isKo ? "감소 👏" : "Decreased 👏") : (isKo ? "유지" : "No change")}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">{isKo ? "종료 후" : "After"}</span>
                <span className={`text-2xl font-bold ${getAnxietyColor(post)}`}>{post}</span>
                <span className="text-xs text-muted-foreground">{getLabel(post)}</span>
              </div>
            </div>
          </div>

          {recentBadges && recentBadges.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-center">🏅 {isKo ? "획득한 배지" : "Badges Earned"}</h3>
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
          <Button variant="outline" className="w-full">{isKo ? "다른 시나리오" : "More Scenarios"}</Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full">{isKo ? "내 대시보드" : "Dashboard"}</Button>
        </Link>
      </div>
    </div>
  );
}
