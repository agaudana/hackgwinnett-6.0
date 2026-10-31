"use client";

import { useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Difficulty, StudyPlanRequest } from "@/lib/types";
import { chunkyPrimary, screenCard } from "./fun";

interface Props {
  serverError: { message: string; field?: string } | null;
  initial?: StudyPlanRequest;
  onSubmit: (req: StudyPlanRequest) => void;
}

type FieldName = "subjectArea" | "topic" | "minutes";
type FieldErrors = Partial<Record<FieldName, string>>;

const TIME_CHOICES = [15, 30, 45, 60, 90];
const LEVELS: { value: Difficulty; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "Just starting out" },
  { value: "intermediate", label: "Intermediate", hint: "I know the basics" },
  { value: "advanced", label: "Advanced", hint: "Ready for a challenge" },
];

// Same rules as API_CONTRACT.md so students get instant feedback.
function validate(subjectArea: string, topic: string, minutes: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!subjectArea.trim()) errors.subjectArea = "Enter a subject, like Biology or Algebra.";
  if (!topic.trim()) errors.topic = "Enter the topic your test covers.";
  const n = Number(minutes);
  if (minutes.trim() === "" || !Number.isInteger(n) || n < 15 || n > 180)
    errors.minutes = "Pick a time, or enter a whole number from 15 to 180 minutes.";
  return errors;
}

// Radio input styled as a tappable chip; the real input stays for keyboard + screen readers.
const chip =
  "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-b-4 bg-card px-3 py-2 text-center font-semibold transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:text-secondary-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50";

export function StudyForm({ serverError, initial, onSubmit }: Props) {
  const [subjectArea, setSubjectArea] = useState(initial?.subjectArea ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [minutes, setMinutes] = useState(String(initial?.minutes ?? 45));
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "beginner");
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const isPreset = TIME_CHOICES.includes(Number(minutes)) && minutes.trim() !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(subjectArea, topic, minutes);
    setErrors(found);
    const first = (Object.keys(found) as FieldName[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(first === "minutes" ? "#minutes" : `#${first}`)?.focus();
      return;
    }
    onSubmit({ subjectArea: subjectArea.trim(), topic: topic.trim(), minutes: Number(minutes), difficulty });
  }

  function clearError(name: FieldName) {
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  const fieldError = (name: FieldName) =>
    errors[name] ?? (serverError?.field === name ? serverError.message : undefined);

  const errorText = (name: FieldName) =>
    fieldError(name) ? (
      <p id={`${name}-err`} className="flex items-center gap-1.5 text-sm font-medium text-destructive">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        {fieldError(name)}
      </p>
    ) : null;

  return (
    <Card className={screenCard}>
      <CardContent className="px-5 py-7 sm:px-8 sm:py-9">
        <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
          What are we studying <span className="highlighter">today</span>?
        </h2>
        <p className="mt-2 leading-relaxed text-pretty text-muted-foreground">
          Tell us your test topic and how much time you have. We&apos;ll build your game plan and a practice quiz.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="subjectArea" className="text-base">
                Subject
              </Label>
              <Input
                id="subjectArea"
                autoComplete="off"
                className="h-12 rounded-xl border-2 px-4 text-base md:text-base"
                value={subjectArea}
                onChange={(e) => {
                  setSubjectArea(e.target.value);
                  clearError("subjectArea");
                }}
                placeholder="e.g. Biology"
                aria-invalid={!!fieldError("subjectArea")}
                aria-describedby={fieldError("subjectArea") ? "subjectArea-err" : undefined}
              />
              {errorText("subjectArea")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic" className="text-base">
                Test topic
              </Label>
              <Input
                id="topic"
                autoComplete="off"
                className="h-12 rounded-xl border-2 px-4 text-base md:text-base"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  clearError("topic");
                }}
                placeholder="e.g. Cell respiration"
                aria-invalid={!!fieldError("topic")}
                aria-describedby={fieldError("topic") ? "topic-err" : undefined}
              />
              {errorText("topic")}
            </div>
          </div>

          <fieldset className="flex flex-col gap-3" aria-describedby={fieldError("minutes") ? "minutes-err" : undefined}>
            <legend className="mb-3 flex items-center gap-2 text-base font-medium">
              <Clock className="size-5 text-primary" aria-hidden />
              How much time do you have?
            </legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {TIME_CHOICES.map((m) => (
                <label key={m} className={chip}>
                  <input
                    type="radio"
                    name="minutes-choice"
                    className="sr-only"
                    checked={minutes === String(m)}
                    onChange={() => {
                      setMinutes(String(m));
                      clearError("minutes");
                    }}
                  />
                  {m} min
                </label>
              ))}
              <Input
                id="minutes"
                type="number"
                inputMode="numeric"
                min={15}
                max={180}
                step={1}
                aria-label="Custom minutes, 15 to 180"
                placeholder="Other"
                className={cn(
                  "h-auto min-h-12 rounded-xl border-2 border-b-4 text-center text-base font-semibold md:text-base",
                  !isPreset && minutes !== "" && "border-primary bg-secondary",
                )}
                value={isPreset ? "" : minutes}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  clearError("minutes");
                }}
                aria-invalid={!!fieldError("minutes")}
              />
            </div>
            {errorText("minutes")}
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-base font-medium">How comfortable are you with this topic?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {LEVELS.map((l) => (
                <label key={l.value} className={cn(chip, "flex-col gap-0.5 py-3")}>
                  <input
                    type="radio"
                    name="difficulty"
                    className="sr-only"
                    checked={difficulty === l.value}
                    onChange={() => setDifficulty(l.value)}
                  />
                  <span>{l.label}</span>
                  <span className="text-sm font-normal text-muted-foreground">{l.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {serverError && !serverError.field && (
            <Alert variant="destructive" role="alert" className="border-2 border-destructive/40">
              <AlertCircle aria-hidden />
              <AlertTitle>We couldn&apos;t build your plan</AlertTitle>
              <AlertDescription>{serverError.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className={cn(chunkyPrimary, "h-14 w-full text-xl")}>
            Let&apos;s go!
            <ArrowRight aria-hidden />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
