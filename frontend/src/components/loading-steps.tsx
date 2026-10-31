"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, ListChecks, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { screenCard } from "./fun";

// Steps advance on a timer while we wait for the server; the last one stays active until the response arrives.
const STEPS = [
  { label: "Splitting up your time", Icon: CalendarClock },
  { label: "Writing your practice quiz", Icon: ListChecks },
  { label: "Adding finishing touches", Icon: Sparkles },
];

export function LoadingSteps({ topic }: { topic: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => Math.min(a + 1, STEPS.length - 1)), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className={screenCard}>
      <CardContent className="px-6 py-10 sm:px-10" role="status" aria-live="polite">
        <Loader2 className="mx-auto size-10 animate-spin text-primary" aria-hidden />
        <h2 className="mt-4 text-center font-heading text-2xl text-balance sm:text-3xl">
          Building your plan for <span className="highlighter">{topic}</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">This usually takes a few seconds.</p>
        <ol className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
          {STEPS.map(({ label, Icon }, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 px-4 py-3 font-medium transition-colors",
                  done && "border-primary/40 bg-secondary text-secondary-foreground",
                  current && "border-primary bg-card",
                  !done && !current && "text-muted-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="flex-1">{label}</span>
                {done && (
                  <>
                    <Check className="size-5 text-primary" aria-hidden />
                    <span className="sr-only">done</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
