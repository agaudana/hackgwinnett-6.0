import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Screen = "form" | "plan" | "quiz";

const STEPS: { id: Screen; label: string }[] = [
  { id: "form", label: "Your topic" },
  { id: "plan", label: "Study plan" },
  { id: "quiz", label: "Practice quiz" },
];

export function FlowSteps({ current }: { current: Screen }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-2">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border-2 font-heading text-sm",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-card text-primary",
                  !done && !active && "border-border text-muted-foreground",
                )}
                aria-hidden
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  active ? "text-foreground" : "sr-only text-muted-foreground sm:not-sr-only",
                )}
                aria-current={active ? "step" : undefined}
              >
                {step.label}
                {done && <span className="sr-only"> (completed)</span>}
              </span>
              {i < STEPS.length - 1 && (
                <span className={cn("h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
