"use client";

import { useChat } from "@ai-sdk/react";
import { UIMessage, DefaultChatTransport } from "ai";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { saveSessionV2 } from "./actions";
import dynamic from "next/dynamic";
import { MessageSquare, Mic } from "lucide-react";
import { GAD7QuickCheck } from "@/components/features/anxiety/GAD7QuickCheck";

const VoiceCallClient = dynamic(
  () => import("@/components/voice/VoiceCallClient"),
  { ssr: false }
);

interface Scenario {
  id: string;
  title: string;
  category: string;
  system_prompt: string;
  description: string;
  level: number;
  locale: string;
  npc_name: string | null;
  npc_personality: string | null;
  opening_line: string | null;
  max_turns: number;
}

interface ScenarioClientProps {
  scenario: Scenario;
  user: { id: string } | null;
  hasVoicePlan?: boolean;
  voiceMinutesUsed?: number;
  voiceMinutesCap?: number;
  memoryContext?: string;
  locale?: string;
}

type PracticeMode = "text" | "voice";
type Phase = "modeSelect" | "gad7Pre" | "memoryBrief" | "chat" | "voice" | "gad7Post";

export default function ScenarioClient({
  scenario,
  user,
  hasVoicePlan = false,
  voiceMinutesUsed = 0,
  voiceMinutesCap = 120,
  memoryContext = "",
  locale = "ko",
}: ScenarioClientProps) {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("modeSelect");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("text");
  const [preScore, setPreScore] = useState(0);
  const [preAnswers, setPreAnswers] = useState<number[]>([]);
  const [postScore, setPostScore] = useState(0);
  const [postAnswers, setPostAnswers] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const remainingMinutes = voiceMinutesCap - voiceMinutesUsed;
  const isKo = locale === "ko";

  // Build system prompt with NPC character + memory context
  const systemPrompt = useMemo(() => {
    const base = scenario.system_prompt ||
      `당신은 ${scenario.npc_name || "가상의 인물"}입니다. ${scenario.npc_personality || ""}
현재 상황: ${scenario.title}

규칙:
1. ${isKo ? "한국어" : "영어"}로 자연스럽게 대화하세요.
2. 상황에 맞는 현실적인 반응을 보여주세요.
3. 유저를 비난하거나 극단적으로 불친절하게 굴지 마세요.
4. 대사는 1~3문장 이내로 간결하게 유지하세요.
5. 유저가 어색하거나 회피적인 답변을 해도 자연스럽게 이어가세요.`;

    return base + memoryContext;
  }, [scenario, memoryContext, isKo]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          scenarioContext: {
            title: scenario.title,
            npcRole: scenario.category,
            systemPrompt,
          },
        },
      }),
    [scenario.title, scenario.category, systemPrompt]
  );

  const { messages, sendMessage } = useChat({ transport });

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendMessage({ text: inputVal });
    setInputVal("");
  };

  const handleModeSelect = (mode: PracticeMode) => {
    setPracticeMode(mode);
    setPhase("gad7Pre");
  };

  const handlePreGAD7Complete = (score: number, answers: number[]) => {
    setPreScore(score);
    setPreAnswers(answers);
    if (memoryContext) {
      setPhase("memoryBrief");
    } else {
      setPhase(practiceMode === "voice" ? "voice" : "chat");
    }
  };

  const handlePostGAD7Complete = async (score: number, answers: number[]) => {
    setPostScore(score);
    setPostAnswers(answers);

    if (user) {
      setIsSaving(true);
      try {
        const chatMessages = messages.map((m: UIMessage) => ({
          role: m.role,
          content: m.parts?.filter((p: unknown) => (p as { type: string }).type === "text").map((p: unknown) => (p as { text: string }).text).join("\n") || "",
        }));

        await saveSessionV2({
          scenarioId: scenario.id,
          preAnxiety: preScore,
          postAnxiety: score,
          preAnswers,
          postAnswers: answers,
          messages: chatMessages,
          mode: practiceMode,
        });
      } catch (e) {
        console.error(e);
      }
    }
    router.push("/dashboard");
  };

  const handleVoiceCallEnd = async () => {
    setPhase("gad7Post");
  };

  // ── Phase: Mode Selection ─────────────────────────────────────
  if (phase === "modeSelect") {
    return (
      <div className="max-w-lg mx-auto mt-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">{scenario.title}</h1>
          {scenario.npc_name && (
            <p className="text-sm text-violet-400 mt-1">NPC: {scenario.npc_name}</p>
          )}
          <p className="text-muted-foreground mt-2 text-sm">{scenario.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleModeSelect("text")}
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <MessageSquare className="text-blue-400" size={26} />
            </div>
            <div>
              <p className="font-semibold text-white text-center">
                {isKo ? "텍스트 훈련" : "Text Practice"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {isKo ? "채팅으로 NPC와 대화" : "Chat with AI character"}
              </p>
              <p className="text-xs text-blue-400 font-medium mt-2 text-center">
                {isKo ? "무제한 이용 가능" : "Unlimited access"}
              </p>
            </div>
          </button>

          <button
            onClick={() => handleModeSelect("voice")}
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
              <Mic className="text-violet-400" size={26} />
            </div>
            <div>
              <p className="font-semibold text-white text-center">
                {isKo ? "음성 훈련" : "Voice Practice"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {isKo ? "실제로 말하며 연습" : "Speak out loud"}
              </p>
              {hasVoicePlan ? (
                <p className="text-xs text-violet-400 font-medium mt-2 text-center">
                  {isKo ? `잔여 ${remainingMinutes}분` : `${remainingMinutes} min left`}
                </p>
              ) : (
                <p className="text-xs text-violet-400 font-medium mt-2 text-center">
                  {isKo ? "3분 무료 체험 가능" : "3 min free trial"}
                </p>
              )}
            </div>
          </button>
        </div>

        {!hasVoicePlan && (
          <div className="mt-6 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 text-center">
            <p className="text-sm text-violet-300">
              {isKo
                ? "🎙️ Voice Pro 플랜으로 업그레이드하면 월 120분 음성 훈련이 가능합니다."
                : "🎙️ Upgrade to Voice Pro for 120 min of voice practice per month."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
              onClick={() =>
                fetch("/api/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ planType: "voice" }),
                })
                  .then((r) => r.json())
                  .then((d) => d.url && (window.location.href = d.url))
              }
            >
              {isKo ? "Voice Pro 구독하기 (₩24,900/월)" : "Subscribe Voice Pro ($24.99/mo)"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Phase: GAD-7 Pre ──────────────────────────────────────────
  if (phase === "gad7Pre") {
    return (
      <GAD7QuickCheck
        mode="pre"
        locale={locale}
        onComplete={handlePreGAD7Complete}
      />
    );
  }

  // ── Phase: Memory Briefing ────────────────────────────────────
  if (phase === "memoryBrief") {
    return (
      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
          <h3 className="font-bold text-lg text-blue-400">
            🧠 {isKo ? "AI 메모리 브리핑" : "AI Memory Briefing"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isKo
              ? "이전 연습에서 AI가 관찰한 패턴입니다:"
              : "Patterns observed from your previous sessions:"}
          </p>
          <div className="text-sm whitespace-pre-wrap text-foreground/80">
            {memoryContext}
          </div>
          <Button
            className="w-full"
            onClick={() => setPhase(practiceMode === "voice" ? "voice" : "chat")}
          >
            {practiceMode === "voice"
              ? (isKo ? "🎙️ 음성 훈련 시작" : "🎙️ Start Voice Practice")
              : (isKo ? "💬 텍스트 훈련 시작" : "💬 Start Text Practice")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Phase: GAD-7 Post ─────────────────────────────────────────
  if (phase === "gad7Post") {
    return (
      <GAD7QuickCheck
        mode="post"
        locale={locale}
        onComplete={handlePostGAD7Complete}
      />
    );
  }

  // ── Phase: Voice Call ─────────────────────────────────────────
  if (phase === "voice") {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setPhase("modeSelect")} className="text-muted-foreground">
            ← {isKo ? "돌아가기" : "Go back"}
          </Button>
          {hasVoicePlan && (
            <span className="text-xs text-violet-400 font-medium">
              {isKo ? `잔여 ${remainingMinutes}분` : `${remainingMinutes} min left`}
            </span>
          )}
        </div>
        <VoiceCallClient
          scenarioTitle={scenario.title}
          npcRole={scenario.category}
          systemPrompt={systemPrompt}
          scenarioId={scenario.id}
          isFreeTrialMode={!hasVoicePlan}
          onCallEnd={() => handleVoiceCallEnd()}
        />
      </div>
    );
  }

  // ── Phase: Text Chat ──────────────────────────────────────────
  return (
    <div className="flex flex-col h-[75vh] max-w-2xl mx-auto border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className="bg-muted p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="font-semibold">{scenario.title}</h2>
          <p className="text-xs text-muted-foreground">
            {isKo ? "언제든 우측 상단의 종료 버튼을 누를 수 있습니다." : "You can end the session anytime."}
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setPhase("gad7Post")}>
          {isKo ? "연습 종료" : "End Session"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            {scenario.opening_line || scenario.description || (isKo ? "가볍게 인사를 건네며 연습을 시작해 보세요." : "Start by saying hello.")}
          </div>
        )}
        {messages.map((m: UIMessage) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {m.parts?.filter((p: unknown) => (p as { type: string }).type === "text").map((p: unknown) => (p as { text: string }).text).join("\n")}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-background border-t">
        <form onSubmit={handleInputSubmit} className="flex gap-2">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={isKo ? "메시지를 입력하세요..." : "Type a message..."}
            className="flex-1"
          />
          <Button type="submit">{isKo ? "전송" : "Send"}</Button>
        </form>
      </div>
    </div>
  );
}
