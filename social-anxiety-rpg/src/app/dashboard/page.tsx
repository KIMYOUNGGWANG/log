import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PushNotificationToggle } from "@/components/dashboard/PushNotificationToggle";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch from NEW sessions table first, fallback to legacy
  const { data: sessions } = await supabase
    .from("sessions")
    .select("anxiety_before, anxiety_after, created_at, mode")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fallback: legacy scenario_sessions
  const { data: legacySessions } = !sessions || sessions.length === 0
    ? await supabase
        .from("scenario_sessions")
        .select("pre_anxiety, post_anxiety, played_at")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(10)
    : { data: null };

  const displaySessions = sessions && sessions.length > 0
    ? sessions.map((s) => ({ before: s.anxiety_before, after: s.anxiety_after, date: s.created_at, mode: s.mode }))
    : (legacySessions || []).map((s) => ({ before: s.pre_anxiety, after: s.post_anxiety, date: s.played_at, mode: "text" }));

  // User progress
  const { count: clearedCount } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_cleared", true);

  // Subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const hasSubscription = !!sub;

  // Badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select(`earned_at, badges (name, description, emoji)`)
    .eq("user_id", user.id);

  // GAD-7 trend (weekly scores)
  const { data: gad7Trend } = await supabase
    .from("gad7_scores")
    .select("total_score, score_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Session memories
  const { data: memories } = await supabase
    .from("user_memories")
    .select("memory_type, content, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
          <p className="text-muted-foreground">나의 극복 진도와 획득한 배지를 확인하세요.</p>
          {hasSubscription && (
            <form className="mt-4 sm:mt-0" action="/api/create-portal-session" method="POST">
              <button type="submit" className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors">
                구독 관리 (플랜 변경 / 취소)
              </button>
            </form>
          )}
        </div>
      </div>

      <PushNotificationToggle />

      {/* Badges */}
      {userBadges && userBadges.length > 0 && (
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">획득한 배지</h2>
          <div className="flex flex-wrap gap-2">
            {userBadges.map((ub: Record<string, unknown>, i: number) => {
              const badge = ub.badges as { emoji: string; name: string } | null;
              return badge ? (
                <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm flex gap-2 items-center">
                  <span>{badge.emoji}</span>
                  <span>{badge.name}</span>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Session memories */}
      {memories && memories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🧠 AI 세션 메모리</CardTitle>
            <CardDescription>AI가 분석한 나의 연습 패턴</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {memories.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
                <span className="text-xs font-mono text-muted-foreground min-w-[60px]">
                  {m.memory_type === "pattern" ? "📊 패턴" : m.memory_type === "insight" ? "💡 인사이트" : "⭐ 선호"}
                </span>
                <span>{m.content}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <CardTitle>최근 연습 기록</CardTitle>
            <CardDescription>시나리오 연습 전/후 GAD-7 수치</CardDescription>
          </CardHeader>
          <CardContent className="h-48 overflow-y-auto text-sm text-muted-foreground space-y-2">
            {displaySessions.length > 0 ? (
              displaySessions.map((session, i) => (
                <div key={i} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span>{session.mode === "voice" ? "🎙️" : "💬"}</span>
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">전: {session.before}</span>
                    <span>→</span>
                    <span className="text-green-500 font-bold">후: {session.after ?? "-"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center">연습 기록이 없습니다.</div>
            )}
          </CardContent>
        </Card>

        {/* Level */}
        <Card>
          <CardHeader>
            <CardTitle>나의 극복 레벨</CardTitle>
            <CardDescription>클리어한 시나리오 수에 따라 레벨이 오릅니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-6xl mb-4">
              {clearedCount && clearedCount >= 10 ? "👑" : clearedCount && clearedCount >= 5 ? "🌟" : "🌱"}
            </div>
            <div className="text-2xl font-bold">
              Level {clearedCount ? Math.floor(clearedCount / 5) + 1 : 1}
            </div>
            <p className="text-muted-foreground mt-2">총 {clearedCount || 0}개의 시나리오 클리어</p>
          </CardContent>
        </Card>
      </div>

      {/* GAD-7 Trend */}
      {gad7Trend && gad7Trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📈 GAD-7 트렌드</CardTitle>
            <CardDescription>최근 측정한 불안도 변화</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {gad7Trend.slice(0, 14).reverse().map((g, i) => {
                const height = Math.max((g.total_score / 21) * 100, 5);
                const color = g.total_score <= 4 ? "bg-green-500" : g.total_score <= 9 ? "bg-yellow-500" : g.total_score <= 14 ? "bg-orange-500" : "bg-red-500";
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{g.total_score}</span>
                    <div className={`w-full rounded-t ${color}`} style={{ height: `${height}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>과거</span>
              <span>최근</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscribe CTA */}
      {!hasSubscription && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>모든 시나리오 해제하기</CardTitle>
            <CardDescription>월 ₩12,900으로 25개의 다양한 시나리오를 마음껏 연습하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <ul className="text-sm space-y-2 list-disc pl-4">
                <li>레벨 4, 5 고난이도 시나리오 오픈</li>
                <li>세션 메모리 AI 맞춤 피드백</li>
                <li>GAD-7 주간 트렌드 리포트</li>
              </ul>
              <form action="/api/checkout" method="POST">
                <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold shadow hover:bg-primary/90 transition w-full sm:w-auto">
                  구독 시작하기
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
