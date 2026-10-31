---
name: build-api
description: Implement and test backend functionality
disable-model-invocation: true
---

# build-api

Work only within backend/ unless explicitly authorized. Read CLAUDE.md and API_CONTRACT.md. Implement the minimum route(s) needed for the main user journey, validate input, use consistent error responses, and keep model calls and credentials server-side. Never assume Bedrock model or OpenAI access; use only verified, approved credentials. Test endpoints directly and report actual results. Flag contract changes for integration-owner approval. Do not invoke other skills automatically.

## Working style
- The team has introductory programming experience and can understand concise technical explanations.
- Act decisively on routine implementation details, but explain meaningful tradeoffs.
- Respect the five-hour time limit and existing CLAUDE.md instructions.
- Never automatically invoke third-party skills, plugins, or other custom skills.
- End with: **Result**, **Verified**, **Next decision** (omit any section that is not relevant).
