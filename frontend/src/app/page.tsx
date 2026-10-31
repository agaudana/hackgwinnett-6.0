"use client";

import { useState } from "react";
import { LoadingSteps } from "@/components/loading-steps";
import { QuizView } from "@/components/quiz-view";
import { StudyForm } from "@/components/study-form";
import { StudyPlanView } from "@/components/study-plan-view";
import { Badge } from "@/components/ui/badge";
import { ApiError, USE_MOCK, createStudyPlan } from "@/lib/api";
import type { StudyPlanRequest, StudyPlanResponse } from "@/lib/types";

type Screen = "form" | "plan" | "quiz";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [lastRequest, setLastRequest] = useState<StudyPlanRequest | undefined>();
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  // Kept here so ticked tasks survive switching between the plan and the quiz.
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());

  async function handleSubmit(req: StudyPlanRequest) {
    setLoading(true);
    setError(null);
    setLastRequest(req);
    try {
      setPlan(await createStudyPlan(req));
      setDoneTasks(new Set());
      setScreen("plan");
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
    setScreen("form");
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-violet-100 via-background to-pink-50">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-16">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-2xl shadow-md" aria-hidden>🚀</span>
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-semibold text-primary">StudySprint</h1>
            <p className="text-muted-foreground">Turn the time you have into a plan that works.</p>
          </div>
          {USE_MOCK && (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900" title="Responses are sample data, not AI-generated">
              Demo mode: sample data
            </Badge>
          )}
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
              onStartQuiz={() => setScreen("quiz")}
              onStartOver={startOver}
            />
          )}
          {screen === "quiz" && plan && (
            <QuizView quiz={plan.quiz} onBackToPlan={() => setScreen("plan")} onStartOver={startOver} />
          )}
        </main>
      </div>
    </div>
  );
}
