"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Steps advance on a timer while we wait for the server; the last one stays active until the response arrives.
const STEPS = ["📅 Planning your time", "✏️ Writing your practice quiz", "✨ Adding finishing touches"];

export function LoadingSteps({ topic }: { topic: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => Math.min(a + 1, STEPS.length - 1)), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="border-2 shadow-lg shadow-violet-200/60">
      <CardContent className="py-8" role="status" aria-live="polite">
        <div className="mx-auto mb-4 size-14 animate-spin rounded-full border-6 border-secondary border-t-primary" aria-hidden />
        <h2 className="text-center font-heading text-2xl">Building your plan for {topic}…</h2>
        <ol className="mx-auto mt-6 grid max-w-sm gap-3">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-4 py-3 font-medium",
                i < active && "border-green-300 bg-green-50 text-green-800",
                i === active && "border-primary bg-secondary",
                i > active && "text-muted-foreground",
              )}
            >
              <span className="flex-1">{s}</span>
              {i < active && <span aria-label="done">✅</span>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
