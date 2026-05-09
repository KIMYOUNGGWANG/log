/**
 * GAD-7 점수 계산 유틸리티
 * PRD: 3문항 빠른 체크 → 21점 환산 + 7문항 전체
 */

/** Quick Check (3문항) 원점수 0~9 → 21점 환산 */
export function scaleQuickScore(rawScore: number): number {
  return Math.round((rawScore * 21) / 9);
}

/** 점수 범위별 심각도 라벨 (한국어) */
export function getAnxietyLabelKo(score: number): string {
  if (score <= 4) return "최소 불안";
  if (score <= 9) return "경미한 불안";
  if (score <= 14) return "중간 불안";
  return "심한 불안";
}

/** 점수 범위별 심각도 라벨 (영어) */
export function getAnxietyLabelEn(score: number): string {
  if (score <= 4) return "Minimal anxiety";
  if (score <= 9) return "Mild anxiety";
  if (score <= 14) return "Moderate anxiety";
  return "Severe anxiety";
}

/** 점수 범위별 색상 */
export function getAnxietyColor(score: number): string {
  if (score <= 4) return "text-green-500";
  if (score <= 9) return "text-yellow-500";
  if (score <= 14) return "text-orange-500";
  return "text-red-500";
}

/** 세션 완료 점수 계산 (규칙 기반, 0~100) */
export function calculateSessionScore(
  turnsCount: number,
  maxTurns: number,
  anxietyBefore: number,
  anxietyAfter: number
): number {
  // 완료 비율 (40%)
  const completionRatio = Math.min(turnsCount / maxTurns, 1);
  const completionScore = completionRatio * 40;

  // 불안 감소 비율 (60%)
  const anxietyDrop = Math.max(anxietyBefore - anxietyAfter, 0);
  const maxPossibleDrop = Math.max(anxietyBefore, 1);
  const anxietyScore = Math.min((anxietyDrop / maxPossibleDrop) * 60, 60);

  return Math.round(completionScore + anxietyScore);
}
