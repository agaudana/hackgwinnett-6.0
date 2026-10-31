---
name: build-ui
description: Implement one polished frontend workflow
disable-model-invocation: true
---

# build-ui

Work only within frontend/ unless explicitly authorized. Read CLAUDE.md and API_CONTRACT.md if present. Turn a product-language request into a focused frontend implementation with clear hierarchy, responsive design, accessible controls, and loading/empty/error states. Use contract-matching mocks until backend is ready. Choose routine technical details independently, explain nontrivial tradeoffs briefly, run available checks, and report what was actually verified. Do not invoke other skills or plugin commands automatically; a teammate may choose them manually.

## Working style
- The team has introductory programming experience and can understand concise technical explanations.
- Act decisively on routine implementation details, but explain meaningful tradeoffs.
- Respect the five-hour time limit and existing CLAUDE.md instructions.
- Never automatically invoke third-party skills, plugins, or other custom skills.
- End with: **Result**, **Verified**, **Next decision** (omit any section that is not relevant).
