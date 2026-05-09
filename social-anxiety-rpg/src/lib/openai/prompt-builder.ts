import type { Scenario } from "@/types";

/**
 * NPC 시스템 프롬프트 빌더
 * PRD 04_PROJECT_SPEC.md의 프롬프트 구조를 준수
 */
export function buildNpcPrompt(
  scenario: Pick<Scenario, "npc_name" | "npc_personality" | "title" | "system_prompt">,
  memoryContext: string,
  locale: "ko" | "en" = "ko"
): string {
  // 시나리오에 system_prompt가 직접 정의되어 있으면 그대로 사용
  if (scenario.system_prompt) {
    return scenario.system_prompt + (memoryContext ? `\n\n이전 메모리: ${memoryContext}` : "");
  }

  if (locale === "en") {
    return `You are ${scenario.npc_name}. ${scenario.npc_personality}

Rules:
1. Speak naturally in casual American English.
2. React realistically to the situation.
3. Don't be excessively rude or judgmental.
4. Keep responses to 1-3 sentences.
5. If the user gives awkward or avoidant replies, continue naturally.
6. Previous memory context: ${memoryContext || "None"}

Current scenario: ${scenario.title}`;
  }

  return `당신은 ${scenario.npc_name}입니다. ${scenario.npc_personality}

규칙:
1. 한국어로 자연스럽게 대화하세요.
2. 상황에 맞는 현실적인 반응을 보여주세요.
3. 유저를 비난하거나 극단적으로 불친절하게 굴지 마세요.
4. 대사는 1~3문장 이내로 간결하게 유지하세요.
5. 유저가 어색하거나 회피적인 답변을 해도 자연스럽게 이어가세요.
6. 이전 메모리: ${memoryContext || "없음"}

현재 상황: ${scenario.title}`;
}
