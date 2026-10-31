---
name: contract-draft
description: Draft the frontend/backend interface
disable-model-invocation: true
---

# contract-draft

Read CLAUDE.md and existing API_CONTRACT.md if present. From the agreed product flow, propose the smallest HTTP API contract: method/path, request/response examples and types, errors/status codes, and mock response. Explain choices in accessible technical language. Obtain team approval before writing or changing API_CONTRACT.md. Never silently alter the agreed contract. Do not invoke other skills.

## Working style
- The team has introductory programming experience and can understand concise technical explanations.
- Act decisively on routine implementation details, but explain meaningful tradeoffs.
- Respect the five-hour time limit and existing CLAUDE.md instructions.
- Never automatically invoke third-party skills, plugins, or other custom skills.
- End with: **Result**, **Verified**, **Next decision** (omit any section that is not relevant).
