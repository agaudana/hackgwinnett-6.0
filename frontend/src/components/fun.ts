// Shared styling so all three screens look like one app.

// Chunky "pressable" button look; merged onto shadcn <Button> via className.
export const chunky =
  "h-12 gap-2 rounded-xl border-b-4 px-5 font-heading text-lg tracking-wide active:translate-y-0.5 active:border-b-2 [&_svg:not([class*='size-'])]:size-5";
export const chunkyPrimary = `${chunky} border-primary-strong bg-primary text-primary-foreground hover:bg-primary/90`;
export const chunkyOutline = `${chunky} border-2 border-b-4 border-border bg-card text-foreground hover:bg-muted`;

// Card shell shared by every screen.
export const screenCard = "gap-0 border-2 py-0 shadow-sm";

// One look per study block, reused by the time bar and the block cards (full class names so Tailwind keeps them).
export const blockColors = [
  { bar: "bg-primary", tile: "bg-primary text-primary-foreground" },
  { bar: "bg-highlight", tile: "bg-highlight text-highlight-foreground" },
  { bar: "bg-foreground", tile: "bg-foreground text-background" },
];

export const colorFor = (i: number) => blockColors[i % blockColors.length];
