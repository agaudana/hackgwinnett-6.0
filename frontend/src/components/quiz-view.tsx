"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";
import { chunkyOutline, chunkyPrimary } from "./fun";

interface Props {
  quiz: QuizQuestion[];
  onBackToPlan: () => void;
  onStartOver: () => void;
}

const LETTERS = "ABCDEFGH";

function resultFor(score: number, total: number) {
  if (score === total) return { emoji: "🏆", line: "Perfect score — you’re ready!" };
  if (score >= total / 2) return { emoji: "🎉", line: "Nice work! Review the misses below, then try again." };
  return { emoji: "💪", line: "Good start! Read the explanations below and give it another go." };
}

export function QuizView({ quiz, onBackToPlan, onStartOver }: Props) {
  // answers[i] = chosen option index, or undefined if not answered yet
  const [answers, setAnswers] = useState<(number | undefined)[]>(() => quiz.map(() => undefined));
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = answers.filter((a) => a !== undefined).length;
  const score = quiz.reduce((s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0), 0);
  const result = resultFor(score, quiz.length);

  function choose(qi: number, oi: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  }

  function retry() {
    setAnswers(quiz.map(() => undefined));
    setSubmitted(false);
  }

  return (
    <Card className="border-2 shadow-lg shadow-violet-200/60">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">
          <h2>Practice quiz 🧠</h2>
        </CardTitle>
        {submitted ? (
          <div role="status" className="mt-2 flex items-center gap-4 rounded-2xl border-2 border-primary bg-secondary p-4">
            <span className="text-5xl" aria-hidden>{result.emoji}</span>
            <div>
              <p className="font-heading text-2xl">
                {score} / {quiz.length} correct
              </p>
              <p className="text-lg" aria-hidden>
                {quiz.map((_, i) => (i < score ? "⭐" : "☆")).join(" ")}
              </p>
              <p className="text-secondary-foreground">{result.line}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden>
              {quiz.map((_, i) => (
                <span key={i} className={cn("size-3 rounded-full", answers[i] !== undefined ? "bg-primary" : "bg-border")} />
              ))}
            </div>
            <p className="text-muted-foreground">{answeredCount} of {quiz.length} answered</p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ol className="grid gap-6">
          {quiz.map((q, qi) => (
            <li key={qi}>
              <fieldset>
                <legend className="mb-3 font-heading text-xl">
                  <span className="text-primary">Q{qi + 1}.</span> {q.question}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    const chosen = answers[qi] === oi;
                    const correct = submitted && oi === q.answerIndex;
                    const wrong = submitted && chosen && !correct;
                    return (
                      <label
                        key={oi}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-b-4 bg-card px-3 py-3 font-medium transition-colors hover:bg-secondary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                          chosen && "border-primary bg-secondary",
                          correct && "border-green-600 bg-green-50 hover:bg-green-50",
                          wrong && "border-red-600 bg-red-50 hover:bg-red-50",
                          submitted && "cursor-default",
                        )}
                      >
                        <input
                          type="radio"
                          name={`q${qi}`}
                          className="sr-only"
                          checked={chosen}
                          disabled={submitted}
                          onChange={() => choose(qi, oi)}
                        />
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-lg bg-muted font-heading",
                            chosen && "bg-primary text-primary-foreground",
                            correct && "bg-green-600 text-white",
                            wrong && "bg-red-600 text-white",
                          )}
                          aria-hidden
                        >
                          {LETTERS[oi]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {correct && <span className="text-sm font-bold text-green-800">✓ Correct</span>}
                        {wrong && <span className="text-sm font-bold text-red-800">✗ Your pick</span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {submitted && (
                <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-muted-foreground">
                  <span aria-hidden>💡 </span>{q.explanation}
                </p>
              )}
            </li>
          ))}
        </ol>
      </CardContent>

      <CardFooter className="flex flex-wrap justify-end gap-3 bg-transparent">
        <Button variant="outline" className={chunkyOutline} onClick={onBackToPlan}>Back to plan</Button>
        {submitted ? (
          <>
            <Button variant="outline" className={chunkyOutline} onClick={onStartOver}>New plan</Button>
            <Button className={chunkyPrimary} onClick={retry}>Try again 🔁</Button>
          </>
        ) : (
          <Button className={chunkyPrimary} onClick={() => setSubmitted(true)} disabled={answeredCount < quiz.length}>
            Check answers ✅
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
