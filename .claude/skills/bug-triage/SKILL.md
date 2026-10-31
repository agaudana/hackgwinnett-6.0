---
name: bug-triage
description: Find and fix the smallest cause of a bug
disable-model-invocation: true
---

# bug-triage

Ask for the observed behavior and reproduction steps only if missing. Reproduce when possible, inspect relevant logs and code, isolate the most likely cause, apply the smallest authorized fix, and rerun the failing check plus a nearby regression check. Avoid sweeping rewrites and speculative dependencies. Report observed evidence, changed files, remaining uncertainty. Respect ownership and do not invoke other skills automatically.

## Working style
- The team has introductory programming experience and can understand concise technical explanations.
- Act decisively on routine implementation details, but explain meaningful tradeoffs.
- Respect the five-hour time limit and existing CLAUDE.md instructions.
- Never automatically invoke third-party skills, plugins, or other custom skills.
- End with: **Result**, **Verified**, **Next decision** (omit any section that is not relevant).
