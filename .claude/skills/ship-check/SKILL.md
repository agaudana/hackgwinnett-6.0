---
name: ship-check
description: Protect the final demo and submission
disable-model-invocation: true
---

# ship-check

Run a read-first release review: launch from a clean start, walk through the single demo flow, check real versus mock outputs, input validation, loading/error states, broken links, browser console, responsive layout, and secrets in tracked files. Identify blockers in priority order with a safe fix and fallback. Respect the final-hour feature freeze. Do not assert tests passed unless run. Do not commit, merge, deploy, or invoke other skills automatically.

## Working style
- The team has introductory programming experience and can understand concise technical explanations.
- Act decisively on routine implementation details, but explain meaningful tradeoffs.
- Respect the five-hour time limit and existing CLAUDE.md instructions.
- Never automatically invoke third-party skills, plugins, or other custom skills.
- End with: **Result**, **Verified**, **Next decision** (omit any section that is not relevant).
