// Shared playful styling so all three screens look like one app.

// Chunky "pressable" button look; merged onto shadcn <Button> via className.
export const chunky =
  "h-12 rounded-xl border-b-4 px-5 font-heading text-lg tracking-wide active:translate-y-0.5 active:border-b-2";
export const chunkyPrimary = `${chunky} border-violet-800 bg-primary hover:bg-violet-600`;
export const chunkyOutline = `${chunky} border-2 border-b-4 border-border bg-card text-foreground hover:bg-secondary`;

// One color per study block, reused by the time bar and the block cards (full class names so Tailwind keeps them).
export const blockColors = [
  { bar: "bg-violet-500", soft: "bg-violet-50", ring: "border-violet-300", text: "text-violet-700" },
  { bar: "bg-pink-500", soft: "bg-pink-50", ring: "border-pink-300", text: "text-pink-700" },
  { bar: "bg-amber-400", soft: "bg-amber-50", ring: "border-amber-300", text: "text-amber-800" },
  { bar: "bg-teal-500", soft: "bg-teal-50", ring: "border-teal-300", text: "text-teal-700" },
  { bar: "bg-sky-500", soft: "bg-sky-50", ring: "border-sky-300", text: "text-sky-700" },
];

export const colorFor = (i: number) => blockColors[i % blockColors.length];
