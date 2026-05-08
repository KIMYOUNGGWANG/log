import Link from "next/link";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";
import { Shield, Bot, TrendingDown } from "lucide-react";

function detectLocale(acceptLang: string | null): "ko" | "en" {
  if (!acceptLang) return "ko";
  if (acceptLang.startsWith("ko")) return "ko";
  return "en";
}

export default async function Home() {
  const headerStore = await headers();
  const locale = detectLocale(headerStore.get("accept-language"));
  const isKo = locale === "ko";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight">
        {isKo ? (
          <>사회불안을 극복하는 <br className="hidden sm:block" />가장 안전한 연습 공간</>
        ) : (
          <>A Safe Space to Practice <br className="hidden sm:block" />Social Situations</>
        )}
      </h1>
      <p className="text-lg text-muted-foreground max-w-[600px]">
        {isKo
          ? "내일 회식이나 면접이 걱정되시나요? AI가 연기하는 상황 속에서 실전처럼 연습하고 두려움을 이겨내세요."
          : "Nervous about a meeting or interview? Practice with AI characters in realistic scenarios and overcome your fears."}
      </p>

      <div className="flex gap-4 pt-4">
        <Link href="/scenarios">
          <Button size="lg" className="font-semibold">
            {isKo ? "무료 시나리오 시작하기" : "Start Free Scenario"}
          </Button>
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5">
          <Shield className="text-blue-400" size={32} />
          <h3 className="font-semibold">{isKo ? "안전한 연습 공간" : "Safe Practice"}</h3>
          <p className="text-xs text-muted-foreground">
            {isKo ? "실패해도 현실 결과 없이 반복 연습" : "No real consequences — practice freely"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5">
          <Bot className="text-violet-400" size={32} />
          <h3 className="font-semibold">{isKo ? "AI NPC 대화" : "AI Characters"}</h3>
          <p className="text-xs text-muted-foreground">
            {isKo ? "GPT-4o가 연기하는 실감나는 상대방" : "GPT-4o powered realistic partners"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5">
          <TrendingDown className="text-green-400" size={32} />
          <h3 className="font-semibold">{isKo ? "개선 추적" : "Track Progress"}</h3>
          <p className="text-xs text-muted-foreground">
            {isKo ? "GAD-7 임상 척도로 불안도 변화 확인" : "GAD-7 clinical scale tracking"}
          </p>
        </div>
      </div>
    </div>
  );
}
