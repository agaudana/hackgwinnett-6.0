"use client";

import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Difficulty, StudyPlanRequest } from "@/lib/types";
import { chunkyPrimary } from "./fun";

interface Props {
  serverError: { message: string; field?: string } | null;
  initial?: StudyPlanRequest;
  onSubmit: (req: StudyPlanRequest) => void;
}

type FieldErrors = Partial<Record<"subjectArea" | "topic" | "minutes", string>>;

const TIME_CHOICES = [15, 30, 45, 60, 90];
const LEVELS: { value: Difficulty; label: string; emoji: string }[] = [
  { value: "beginner", label: "Beginner", emoji: "🌱" },
  { value: "intermediate", label: "Intermediate", emoji: "🌿" },
  { value: "advanced", label: "Advanced", emoji: "🌳" },
];

// Same rules as API_CONTRACT.md so students get instant feedback.
function validate(subjectArea: string, topic: string, minutes: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!subjectArea.trim()) errors.subjectArea = "Enter a subject, like Biology or Algebra.";
  if (!topic.trim()) errors.topic = "Enter the topic your test covers.";
  const n = Number(minutes);
  if (!Number.isInteger(n) || n < 15 || n > 180) errors.minutes = "Choose a whole number between 15 and 180 minutes.";
  return errors;
}

// Radio input styled as a tappable chip; the real input stays for keyboard + screen readers.
const chip =
  "flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-b-4 bg-card px-3 py-2.5 font-semibold transition-colors hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:text-secondary-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50";

export function StudyForm({ serverError, initial, onSubmit }: Props) {
  const [subjectArea, setSubjectArea] = useState(initial?.subjectArea ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [minutes, setMinutes] = useState(String(initial?.minutes ?? 45));
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "beginner");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(subjectArea, topic, minutes);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({ subjectArea: subjectArea.trim(), topic: topic.trim(), minutes: Number(minutes), difficulty });
  }

  const fieldError = (name: keyof FieldErrors) =>
    errors[name] ?? (serverError?.field === name ? serverError.message : undefined);

  const errorText = (name: keyof FieldErrors) =>
    fieldError(name) && (
      <p id={`${name}-err`} className="text-sm font-medium text-destructive">
        {fieldError(name)}
      </p>
    );

  return (
    <Card className="border-2 shadow-lg shadow-violet-200/60">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">
          <h2>What are we studying today? 📚</h2>
        </CardTitle>
        <CardDescription className="text-base">
          Tell us your test topic and how much time you have. We&apos;ll build your game plan and a practice quiz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <Label htmlFor="subjectArea" className="text-base">Subject</Label>
              <Input
                id="subjectArea"
                className="h-12 rounded-xl border-2 text-base"
                value={subjectArea}
                onChange={(e) => setSubjectArea(e.target.value)}
                placeholder="e.g. Biology"
                aria-invalid={!!fieldError("subjectArea")}
                aria-describedby="subjectArea-err"
              />
              {errorText("subjectArea")}
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="topic" className="text-base">Test topic</Label>
              <Input
                id="topic"
                className="h-12 rounded-xl border-2 text-base"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Cell respiration"
                aria-invalid={!!fieldError("topic")}
                aria-describedby="topic-err"
              />
              {errorText("topic")}
            </div>
          </div>

          <fieldset className="grid gap-2" aria-describedby="minutes-err">
            <legend className="mb-2 text-base font-medium">⏱️ How much time do you have?</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {TIME_CHOICES.map((m) => (
                <label key={m} className={chip}>
                  <input
                    type="radio"
                    name="minutes-choice"
                    className="sr-only"
                    checked={minutes === String(m)}
                    onChange={() => setMinutes(String(m))}
                  />
                  {m} min
                </label>
              ))}
              <Input
                id="minutes"
                type="number"
                min={15}
                max={180}
                aria-label="Custom minutes"
                placeholder="Other"
                className={cn(
                  "h-auto rounded-xl border-2 border-b-4 text-center text-base font-semibold",
                  !TIME_CHOICES.includes(Number(minutes)) && minutes !== "" && "border-primary bg-secondary",
                )}
                value={TIME_CHOICES.includes(Number(minutes)) ? "" : minutes}
                onChange={(e) => setMinutes(e.target.value)}
                aria-invalid={!!fieldError("minutes")}
              />
            </div>
            {errorText("minutes")}
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-base font-medium">How confident are you with this topic?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {LEVELS.map((l) => (
                <label key={l.value} className={chip}>
                  <input
                    type="radio"
                    name="difficulty"
                    className="sr-only"
                    checked={difficulty === l.value}
                    onChange={() => setDifficulty(l.value)}
                  />
                  <span aria-hidden>{l.emoji}</span> {l.label}
                </label>
              ))}
            </div>
          </fieldset>

          {serverError && !serverError.field && (
            <Alert variant="destructive" role="alert" className="border-2">
              <AlertDescription className="font-medium">😕 {serverError.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className={cn(chunkyPrimary, "h-14 w-full text-xl")}>
            Let&apos;s go! 🚀
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
