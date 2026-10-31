"use client";

import { AlertCircle, ArrowRight, Clock, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StudyPlanResponse } from "@/lib/types";
import { chunkyOutline, chunkyPrimary, colorFor, screenCard } from "./fun";

interface Props {
  plan: StudyPlanResponse;
  doneTasks: Set<string>;
  onToggleTask: (key: string) => void;
  onStartQuiz: () => void;
  onStartOver: () => void;
}

export function StudyPlanView({ plan, doneTasks, onToggleTask, onStartQuiz, onStartOver }: Props) {
  const blockTotal = plan.studyPlan.reduce((s, b) => s + b.minutes, 0) || 1;
  const taskCount = plan.studyPlan.reduce((s, b) => s + b.tasks.length, 0);
  const doneCount = doneTasks.size;
  const allDone = taskCount > 0 && doneCount === taskCount;

  return (
    <Card className={screenCard}>
      <CardContent className="flex flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9">
        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="h-7 w-fit px-3 text-sm">
            {plan.subjectArea}
          </Badge>
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            <span className="highlighter">{plan.topic}</span>
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Your {plan.minutes}-minute game plan, with {plan.quiz.length} practice{" "}
            {plan.quiz.length === 1 ? "question" : "questions"} at the end.
          </p>
        </header>

        {plan.studyPlan.length === 0 ? (
          <Alert variant="destructive" className="border-2 border-destructive/40">
            <AlertCircle aria-hidden />
            <AlertDescription>No study blocks were generated. Try again with a more specific topic.</AlertDescription>
          </Alert>
        ) : (
          <>
            <section aria-labelledby="split-heading" className="flex flex-col gap-3">
              <h3 id="split-heading" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                How your time is split
              </h3>
              <div className="flex h-4 gap-1 overflow-hidden rounded-full" aria-hidden>
                {plan.studyPlan.map((b, i) => (
                  <div
                    key={i}
                    className={cn("rounded-full", colorFor(i).bar)}
                    style={{ width: `${(b.minutes / blockTotal) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {plan.studyPlan.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={cn("size-3 rounded-full", colorFor(i).bar)} aria-hidden />
                    {b.title}
                    <span className="font-semibold">{b.minutes} min</span>
                  </li>
                ))}
              </ul>
            </section>

            {taskCount > 0 && (
              <div
                className="flex flex-col gap-2 rounded-xl bg-secondary px-4 py-3 text-secondary-foreground"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center justify-between gap-3 font-medium">
                  <span>
                    {doneCount} of {taskCount} tasks done
                  </span>
                  {allDone && <span className="font-heading">Ready for the quiz!</span>}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-card" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(doneCount / taskCount) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <ol className="flex flex-col gap-4">
              {plan.studyPlan.map((block, i) => {
                const c = colorFor(i);
                return (
                  <li key={i} className="rounded-2xl border-2 bg-card p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn("grid size-10 shrink-0 place-items-center rounded-xl font-heading text-lg", c.tile)}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-heading text-xl font-medium">
                            <span className="sr-only">Step {i + 1}: </span>
                            {block.title}
                          </h3>
                          <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                            <Clock className="size-4" aria-hidden />
                            {block.minutes} min
                          </span>
                        </div>
                        <p className="leading-relaxed text-pretty">{block.focus}</p>
                      </div>
                    </div>
                    {block.tasks.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-2" aria-label={`Tasks for ${block.title}`}>
                        {block.tasks.map((t, j) => {
                          const key = `${i}-${j}`;
                          const done = doneTasks.has(key);
                          return (
                            <li key={j}>
                              <label
                                className={cn(
                                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 transition-colors hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                                  done && "border-primary/40 bg-secondary hover:bg-secondary",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="size-5 shrink-0 accent-primary"
                                  checked={done}
                                  onChange={() => onToggleTask(key)}
                                />
                                <span className={cn("leading-snug", done && "text-muted-foreground line-through")}>
                                  {t}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col-reverse gap-3 border-t-2 bg-muted/50 px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
        <Button variant="outline" className={cn(chunkyOutline, "w-full sm:w-auto")} onClick={onStartOver}>
          <RotateCcw aria-hidden />
          New plan
        </Button>
        <Button
          className={cn(chunkyPrimary, "w-full sm:w-auto")}
          onClick={onStartQuiz}
          disabled={plan.quiz.length === 0}
        >
          Start the quiz
          <ArrowRight aria-hidden />
        </Button>
      </CardFooter>
    </Card>
  );
}
