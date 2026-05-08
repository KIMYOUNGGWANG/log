import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChallengePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch my challenges
  const { data: myChallenges } = await supabase
    .from("group_challenges")
    .select("*, scenarios(title)")
    .eq("creator_id", user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">그룹 챌린지</h1>
        <p className="text-muted-foreground mt-2">친구와 함께 사회불안 극복 훈련을 해보세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>새 챌린지 만들기</CardTitle>
            <CardDescription>친구를 초대하여 함께 같은 시나리오를 클리어하고 점수를 비교하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/challenge/create" method="POST" className="space-y-4">
              <Button type="submit" className="w-full">
                친구 초대 링크 생성
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>전문 CBT 상담사 예약</CardTitle>
            <CardDescription>AI 롤플레이로 부족하다면 전문 상담사와의 화상 코칭을 받아보세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">
              상담 일정 알아보기 (준비 중)
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">내 챌린지 현황</h2>
        {myChallenges && myChallenges.length > 0 ? (
          <div className="space-y-4">
            {myChallenges.map((c: any) => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle>{c.scenarios?.title}</CardTitle>
                  <CardDescription>초대 코드: {c.invite_code}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">진행 중인 챌린지가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
