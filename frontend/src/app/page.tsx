"use client";

import { useRef, useState } from "react";
import { Timer } from "lucide-react";
import { FlowSteps, type Screen } from "@/components/flow-steps";
import { LoadingSteps } from "@/components/loading-steps";
import { QuizView } from "@/components/quiz-view";
import { StudyForm } from "@/components/study-form";
import { StudyPlanView } from "@/components/study-plan-view";
import { Badge } from "@/components/ui/badge";
import { ApiError, USE_MOCK, createStudyPlan } from "@/lib/api";
import type { StudyPlanRequest, StudyPlanResponse } from "@/lib/types";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [lastRequest, setLastRequest] = useState<StudyPlanRequest | undefined>();
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  // Kept here so ticked tasks survive switching between the plan and the quiz.
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());
  const topRef = useRef<HTMLDivElement>(null);

  function go(next: Screen) {
    setScreen(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(req: StudyPlanRequest) {
    setLoading(true);
    setError(null);
    setLastRequest(req);
    try {
      setPlan(await createStudyPlan(req));
      setDoneTasks(new Set());
      go("plan");
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError("INTERNAL_ERROR", "Something went wrong. Please try again.");
      setError({ message: err.message, field: err.field });
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(key: string) {
    setDoneTasks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function startOver() {
    setPlan(null);
    setError(null);
    go("form");
  }

  return (
    <div className="min-h-dvh bg-background" ref={topRef}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-6 pb-16 sm:pt-10">
        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden>
              <Timer className="size-6" />
            </span>
            <div className="flex-1">
              <h1 className="font-heading text-2xl leading-tight font-semibold">StudySprint</h1>
              <p className="text-sm text-muted-foreground">Turn the time you have into a plan that works.</p>
            </div>
            {USE_MOCK && (
              <Badge
                variant="outline"
                className="h-7 border-highlight-foreground/30 bg-highlight px-3 text-sm text-highlight-foreground"
                title="Responses are sample data, not AI-generated"
              >
                Demo mode: sample data
              </Badge>
            )}
          </div>
          <FlowSteps current={screen} />
        </header>

        <main>
          {screen === "form" &&
            (loading ? (
              <LoadingSteps topic={lastRequest?.topic ?? "your topic"} />
            ) : (
              <StudyForm serverError={error} initial={lastRequest} onSubmit={handleSubmit} />
            ))}
          {screen === "plan" && plan && (
            <StudyPlanView
              plan={plan}
              doneTasks={doneTasks}
              onToggleTask={toggleTask}
              onStartQuiz={() => go("quiz")}
              onStartOver={startOver}
            />
          )}
          {screen === "quiz" && plan && (
            <QuizView quiz={plan.quiz} onBackToPlan={() => go("plan")} onStartOver={startOver} />
          )}
        </main>
      </div>
    </div>
  );
}
