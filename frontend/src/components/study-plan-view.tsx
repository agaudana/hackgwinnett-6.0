"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StudyPlanResponse } from "@/lib/types";
import { chunkyOutline, chunkyPrimary, colorFor } from "./fun";

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

  return (
    <Card className="border-2 shadow-lg shadow-violet-200/60">
      <CardHeader>
        <Badge variant="secondary" className="w-fit text-sm">{plan.subjectArea}</Badge>
        <CardTitle className="font-heading text-3xl">
          <h2>{plan.topic} 🎯</h2>
        </CardTitle>
        <CardDescription className="text-base">
          Your {plan.minutes}-minute game plan · {plan.quiz.length} quiz questions waiting at the end
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {plan.studyPlan.length === 0 ? (
          <Alert variant="destructive">
            <AlertDescription>No study blocks were generated. Try again with a more specific topic.</AlertDescription>
          </Alert>
        ) : (
          <>
            <section aria-label="How your time is split">
              <div className="flex h-5 overflow-hidden rounded-full border-2 border-border">
                {plan.studyPlan.map((b, i) => (
                  <div
                    key={i}
                    className={colorFor(i).bar}
                    style={{ width: `${(b.minutes / blockTotal) * 100}%` }}
                    title={`${b.title}: ${b.minutes} min`}
                  />
                ))}
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {plan.studyPlan.map((b, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className={cn("size-3 rounded-full", colorFor(i).bar)} aria-hidden />
                    {b.title} <span className="font-semibold">{b.minutes}m</span>
                  </li>
                ))}
              </ul>
            </section>

            {taskCount > 0 && (
              <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 font-medium text-secondary-foreground">
                <span aria-hidden>⭐</span>
                <span className="flex-1">{doneCount} of {taskCount} tasks done</span>
                {doneCount === taskCount && <span>Ready for the quiz! 🧠</span>}
              </div>
            )}

            <ol className="grid gap-4">
              {plan.studyPlan.map((block, i) => {
                const c = colorFor(i);
                return (
                  <li key={i} className={cn("rounded-2xl border-2 p-4", c.ring, c.soft)}>
                    <div className="flex items-center gap-3">
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl font-heading text-lg text-white", c.bar)}>
                        {i + 1}
                      </span>
                      <h3 className="flex-1 font-heading text-xl">{block.title}</h3>
                      <Badge variant="outline" className={cn("bg-card text-sm font-bold", c.text)}>⏱️ {block.minutes} min</Badge>
                    </div>
                    <p className="mt-3">{block.focus}</p>
                    <ul className="mt-3 grid gap-2">
                      {block.tasks.map((t, j) => {
                        const key = `${i}-${j}`;
                        const done = doneTasks.has(key);
                        return (
                          <li key={j}>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-card px-3 py-2">
                              <input
                                type="checkbox"
                                className="size-5 accent-primary"
                                checked={done}
                                onChange={() => onToggleTask(key)}
                              />
                              <span className={cn(done && "text-muted-foreground line-through")}>{t}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-end gap-3 bg-transparent">
        <Button variant="outline" className={chunkyOutline} onClick={onStartOver}>New plan</Button>
        <Button className={chunkyPrimary} onClick={onStartQuiz} disabled={plan.quiz.length === 0}>
          Quiz me! 🧠
        </Button>
      </CardFooter>
    </Card>
  );
}
