import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ResultPage() {
  // In a real implementation, this would fetch the session data from Supabase using the ID
  // For the MVP, we are rendering a static UI to demonstrate the flow
  const score = 85;
  const preAnxiety = 8;
  const postAnxiety = 4;
  const anxietyDrop = preAnxiety - postAnxiety;

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">세션 완료!</CardTitle>
          <CardDescription>훌륭하게 상황을 대처했습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6 text-center">
          <div className="text-6xl font-black text-primary">
            {score}점
          </div>
          <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            &quot;처음엔 주저하셨지만, 명확하게 원하는 바를 전달하셨어요. 대화의 흐름도 자연스러웠습니다!&quot;
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-4 text-left">불안도 변화</h3>
            <div className="flex items-center justify-between px-4">
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">시작 전</span>
                <span className="text-2xl font-bold">{preAnxiety}점</span>
              </div>
              <div className="flex-1 flex flex-col items-center px-4 text-green-500 font-bold">
                <span>-{anxietyDrop}점</span>
                <span className="text-xs">감소</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">종료 후</span>
                <span className="text-2xl font-bold text-primary">{postAnxiety}점</span>
              </div>
            </div>
          </div>
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
