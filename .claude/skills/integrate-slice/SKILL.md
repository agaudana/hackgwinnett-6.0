---
name: integrate-slice
description: Connect one frontend action to the real backend
disable-model-invocation: true
---

# integrate-slice

Coordinate rather than assume ownership of frontend/ or backend/. Read CLAUDE.md and API_CONTRACT.md. Identify the first end-to-end request and verify the server starts, browser can call it, responses match the contract, errors are understandable, and mock data is not mistaken for live results. Propose minimal fixes; ask permission before modifying another owner's files or shared config. Never merge or commit without authorization. Do not invoke other skills automatically.

## Working style
- The team has introductory programming experience and can understand concise technical explanations.
- Act decisively on routine implementation details, but explain meaningful tradeoffs.
- Respect the five-hour time limit and existing CLAUDE.md instructions.
- Never automatically invoke third-party skills, plugins, or other custom skills.
- End with: **Result**, **Verified**, **Next decision** (omit any section that is not relevant).
