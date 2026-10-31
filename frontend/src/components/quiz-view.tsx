"use client";

import { useState } from "react";
import { ArrowLeft, Check, Lightbulb, RotateCcw, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";
import { chunkyOutline, chunkyPrimary, screenCard } from "./fun";

interface Props {
  quiz: QuizQuestion[];
  onBackToPlan: () => void;
  onStartOver: () => void;
}

const LETTERS = "ABCDEFGH";

function resultLine(score: number, total: number) {
  if (score === total) return "Perfect score. You're ready for this test!";
  if (score >= total / 2) return "Nice work! Re-read the explanations for the ones you missed.";
  return "Good start. Review the explanations, then give it another go.";
}

export function QuizView({ quiz, onBackToPlan, onStartOver }: Props) {
  // answers[i] = chosen option index, or undefined if not answered yet. Each answer locks once chosen.
  const [answers, setAnswers] = useState<(number | undefined)[]>(() => quiz.map(() => undefined));

  const answeredCount = answers.filter((a) => a !== undefined).length;
  const finished = quiz.length > 0 && answeredCount === quiz.length;
  const score = quiz.reduce((s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0), 0);

  function choose(qi: number, oi: number) {
    setAnswers((prev) => (prev[qi] !== undefined ? prev : prev.map((a, i) => (i === qi ? oi : a))));
  }

  function retry() {
    setAnswers(quiz.map(() => undefined));
  }

  return (
    <Card className={screenCard}>
      <CardContent className="flex flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9">
        <header className="flex flex-col gap-3">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Practice <span className="highlighter">quiz</span>
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Pick an answer to see if you got it right, plus a quick explanation.
          </p>

          <div className="flex items-center gap-3" aria-live="polite">
            <div className="flex gap-1.5" aria-hidden>
              {quiz.map((q, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 w-6 rounded-full bg-border",
                    answers[i] !== undefined && (answers[i] === q.answerIndex ? "bg-primary" : "bg-destructive"),
                  )}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {answeredCount} of {quiz.length} answered
            </p>
          </div>
        </header>

        {finished && (
          <div
            role="status"
            className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-secondary p-4 text-secondary-foreground sm:p-5"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-highlight text-highlight-foreground">
              <Trophy className="size-6" aria-hidden />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-2xl text-foreground">
                {score} / {quiz.length} correct
              </p>
              <p className="leading-relaxed">{resultLine(score, quiz.length)}</p>
            </div>
          </div>
        )}

        {quiz.length === 0 ? (
          <p className="rounded-xl bg-muted px-4 py-3 text-muted-foreground">
            No quiz questions came back for this plan. Head back and try a new plan.
          </p>
        ) : (
          <ol className="flex flex-col gap-8">
            {quiz.map((q, qi) => {
              const picked = answers[qi];
              const locked = picked !== undefined;
              const gotIt = picked === q.answerIndex;
              return (
                <li key={qi} className="flex flex-col gap-3">
                  <fieldset className="flex flex-col gap-3">
                    <legend className="mb-3 font-heading text-xl leading-snug font-medium text-pretty">
                      <span className="text-primary">Q{qi + 1}.</span> {q.question}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => {
                        const chosen = picked === oi;
                        const correct = locked && oi === q.answerIndex;
                        const wrong = locked && chosen && !correct;
                        return (
                          <label
                            key={oi}
                            className={cn(
                              "flex min-h-12 items-center gap-3 rounded-xl border-2 border-b-4 bg-card px-3 py-3 font-medium transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                              !locked && "cursor-pointer hover:border-primary/50 hover:bg-muted",
                              correct && "border-primary bg-secondary text-secondary-foreground",
                              wrong && "border-destructive bg-destructive/10",
                              locked && !correct && !wrong && "opacity-60",
                            )}
                          >
                            <input
                              type="radio"
                              name={`q${qi}`}
                              className="sr-only"
                              checked={chosen}
                              disabled={locked && !chosen}
                              onChange={() => choose(qi, oi)}
                            />
                            <span
                              className={cn(
                                "grid size-8 shrink-0 place-items-center rounded-lg bg-muted font-heading text-foreground",
                                correct && "bg-primary text-primary-foreground",
                                wrong && "bg-destructive text-primary-foreground",
                              )}
                              aria-hidden
                            >
                              {correct ? <Check className="size-4" /> : wrong ? <X className="size-4" /> : LETTERS[oi]}
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                            {correct && <span className="sr-only">(correct answer)</span>}
                            {wrong && <span className="sr-only">(your answer, incorrect)</span>}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  {locked && (
                    <div
                      className="flex gap-3 rounded-xl bg-muted px-4 py-3 animate-in fade-in slide-in-from-top-1"
                      aria-live="polite"
                    >
                      <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                      <p className="leading-relaxed">
                        <span className={cn("font-semibold", gotIt ? "text-primary-strong" : "text-destructive")}>
                          {gotIt ? "Correct! " : `Not quite. The answer is ${LETTERS[q.answerIndex]}. `}
                        </span>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>

      <CardFooter className="flex flex-col-reverse gap-3 border-t-2 bg-muted/50 px-5 py-5 sm:flex-row sm:justify-between sm:px-8">
        <Button variant="outline" className={cn(chunkyOutline, "w-full sm:w-auto")} onClick={onBackToPlan}>
          <ArrowLeft aria-hidden />
          Back to plan
        </Button>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button variant="outline" className={cn(chunkyOutline, "w-full sm:w-auto")} onClick={onStartOver}>
            New plan
          </Button>
          {finished && (
            <Button className={cn(chunkyPrimary, "w-full sm:w-auto")} onClick={retry}>
              <RotateCcw aria-hidden />
              Try again
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
