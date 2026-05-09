import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { ChatRequestBody } from "@/types";

export async function POST(req: Request) {
  const body: ChatRequestBody = await req.json();
  const { messages, scenarioContext } = body;

  const systemMessage =
    scenarioContext?.systemPrompt ||
    `당신은 가상의 인물입니다.
현재 상황: 일반 대화

규칙:
1. 한국어로 자연스럽게 대화하세요.
2. 상황에 맞는 현실적인 반응을 보여주세요.
3. 유저를 비난하거나 극단적으로 불친절하게 굴지 마세요.
4. 대사는 1~3문장 이내로 간결하게 유지하세요.
5. 유저가 어색하거나 회피적인 답변을 해도 자연스럽게 이어가세요.`;

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemMessage,
    messages,
    maxOutputTokens: 300,
  });

  return result.toTextStreamResponse();
}
