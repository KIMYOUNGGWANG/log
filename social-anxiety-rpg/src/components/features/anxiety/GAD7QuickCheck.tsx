"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GAD7QuickCheckProps {
  mode: "pre" | "post";
  onComplete: (totalScore: number, answers: number[]) => void;
  locale?: string;
}

const QUESTIONS_KO = [
  "초조하거나 불안하거나 조마조마한 느낌",
  "걱정을 멈추거나 조절할 수가 없음",
  "여러 가지 것들에 대해 지나치게 걱정함",
];

const QUESTIONS_EN = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
];

const ANSWERS_KO = ["전혀 없음", "며칠", "절반 이상", "거의 매일"];
const ANSWERS_EN = ["Not at all", "Several days", "More than half", "Nearly every day"];

/**
 * GAD-7 Quick Check (3문항)
 * 각 문항 0~3점 → 합산 0~9 → 21점 환산: Math.round(score * 21 / 9)
 */
export function GAD7QuickCheck({ mode, onComplete, locale = "ko" }: GAD7QuickCheckProps) {
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);

  const questions = locale === "en" ? QUESTIONS_EN : QUESTIONS_KO;
  const answerLabels = locale === "en" ? ANSWERS_EN : ANSWERS_KO;

  const isComplete = answers.every((a) => a !== null);
  const rawScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0);
  const scaledScore = Math.round(rawScore * 21 / 9);

  const handleSelect = (qIndex: number, value: number) => {
    const next = [...answers];
    next[qIndex] = value;
    setAnswers(next);
  };

  const title = mode === "pre"
    ? (locale === "en" ? "How anxious are you feeling?" : "현재 불안도를 체크해주세요")
    : (locale === "en" ? "How are you feeling now?" : "연습 후 불안도를 다시 체크해주세요");

  const subtitle = mode === "pre"
    ? (locale === "en" ? "Based on the last 2 weeks, rate each statement" : "지난 2주간의 상태를 기준으로 답해주세요")
    : (locale === "en" ? "Compare with how you felt before the session" : "처음과 비교해서 얼마나 달라졌는지 확인해 보세요");

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <p className="text-sm font-medium">{qi + 1}. {q}</p>
              <div className="grid grid-cols-2 gap-2">
                {answerLabels.map((label, ai) => (
                  <button
                    key={ai}
                    type="button"
                    onClick={() => handleSelect(qi, ai)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                      answers[qi] === ai
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 border-border hover:bg-muted"
                    }`}
                  >
                    {label} ({ai})
                  </button>
                ))}
              </div>
            </div>
          ))}

          {isComplete && (
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                {locale === "en" ? "Quick Score" : "빠른 체크 점수"}
              </p>
              <p className="text-2xl font-bold text-primary">{scaledScore}/21</p>
              <p className="text-xs text-muted-foreground mt-1">
                {scaledScore <= 4 && (locale === "en" ? "Minimal anxiety" : "최소 불안")}
                {scaledScore >= 5 && scaledScore <= 9 && (locale === "en" ? "Mild anxiety" : "경미한 불안")}
                {scaledScore >= 10 && scaledScore <= 14 && (locale === "en" ? "Moderate anxiety" : "중간 불안")}
                {scaledScore >= 15 && (locale === "en" ? "Severe anxiety" : "심한 불안")}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-lg h-12"
            disabled={!isComplete}
            onClick={() => onComplete(scaledScore, answers as number[])}
          >
            {mode === "pre"
              ? (locale === "en" ? "Start Practice" : "연습 시작하기")
              : (locale === "en" ? "View Results" : "결과 보기")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
