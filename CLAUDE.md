**Hackathon Project Instructions**

**Mission**
We are a team of 3 people, we're going to go ahead and build a working, ready-for-demo MVP in a 5-hour sprint. Our priorities are a compelling user journey at the core, reliability, clarity > feature count. Aim is to have the end-to-end flow done by the hour 3, so we can spend the last 2 hours polishing testing, and pishing.

**Project decisions**

- Product/target user: Student
- One sentence problem: Students often don't know how to use the time that they have, and cannot create accurate study plans and study materials by themselves
- Single must-work demo flow: Student uploads a subject area, test topic, time needed to study --> dedicated study plan + short practice quiz
- Stack: Whatever Claude thinks is best
- Frontend run/build commands: Just whatevers available in the workspace third party skills
- Backend run/test commands: Pstack + Custom Skills
- Approved AI model / endpoint for the app: Gemini API from my Gemini Pro subscription

**Team ownership**
- Frontend owner: frontend/ -- screens, components, styles, interactions, loading states, error states
- Backend owner: backend/ -- routes, model calls, logic for the app, input checking, and tests
- Integration owner: shared API contract, root config, merges, end-to-end testing, demo stability
- Do not edit files owned by another teammate without explicit coordination
- Ask the integration owner before changing root dependencies, shared types, ports, or deployment config
- Use separate branches or worktrees. NEVER have multiple agents modify the same working directory at once

**Build rules**
1. Main branch should be kept demo ready. Make small tested changes and integrate early
2. One complete vertical slice implemented before adding secondary features
3. Prefer existing dependenceies, straightforward code, minimal infrastructure
4. SKIP THE BULLSHIT. Do not add authentication, databases, payments, or stupidly complicated deployment unless the product truly needs it.
5. Preserve working features when changing UX or architecture. DO NOT rewrite unrelated code.
6. Do not commit, merge, force-push, or delete substantial work unless explicitly asked
7. YOU ARE NEVER ALLOWED TO CLAIM A FEATURE WORKS WITHOUT CHECKING IT. Report any checks to us that you cannot run.

**Frontend/backend contract**
- Once we select a product idea, the integration owner is going to create API_CONTRACT.md and the team will approve it before we jump into parallel development
- Follow the documented HTTP method, route, request fields/types, response fields/types, and error format exactly
- Front end is allowed to use mock responses that match the contract until the real backend is ready
- Backend must test endpoints independently of UI
- Coordinate contract changes; we will never ever silently rename fields or alter shapes
- Integrate the first real request early instead of waiting until both sides are finished

**AI and secrets**
- Our coding assistant is Claude Code. Use available design skills when helpful, not automatically on every task
- The app may call an OpenAI model through Amazon Bedrock only if the organizers enable and permit it. Do not assume that Claude Code's Bedrock credentials grant app-level model access. Worst case scenario, integration owner will buy a key.
- Keep model calls and credentials on the server side only. DO NOT EXPOSE SECRETS IN BROWSER CODE, LOGS, COMMITS, OR SCREENSHOTS
- Use environment variables and .env.example with placeholders only. Never commit real .env files.
- Do not introduce a second AI provider or paid external service without explicit team apporval
- Make AI dependent features easy to demo with clearly labeled mock/test responses if access is unavailable
- Superpowers (optional): You may recommend relevant Superpowers skills or workflows when they would meaningfully improve debugging, verification, or implementation quality. However, NEVER invoke Superpowers commands, skills, or workflows automatically. Explain the expected benefit and ask for explicit user approval before using one. Prioritize speed and avoid heavyweight planning processes during the five-hour hackathon.
- PStack (optional): You may recommend relevant PStack skills when they would materially improve debugging, architecture, integration, or verification. Never automatically invoke PStack workflows or subagents. Explain why a particular skill would help and allow a teammate to decide whether to run it manually. Avoid heavyweight multi-agent workflows during the five-hour sprint.

**How to work on a task**
1. Read relevant files and API_CONTRACT.md if it exists. Resspect file ownership.
2. For nontrivial changes, give a short plan and flag any contract or file-ownership issue.
3. Implment the smallest useful version, then run the appropriate checks delegated to the team member you are assigned.
4. Verify the affected user journey in the running app when possible.
5. Summarize: changed files, what works, tests run, remaining risks

**UX Standards** 
- Core actions should REMAIN 100% OBVIOUS: favor readable types, strong contrast, accessible labels, and responsive layouts
- Useful loading, empty, success, and error states should be included in the main flow
- Your goal is to get three polished, functional screens. That is a WAY bigger priority than many unfinished screens.
- Avoid unnecessary gimicky animations and visual redesigns when submission time is close.

**1 hour before submission**
- No more adding features unless a missing feature prevents the core demo
- Focus on fixing roadblocks, verifying demo path, preparing reliable sample outputs, and rehearsing a pitch (not confirmed if there is a pitch or just devpost submission)
- If a change risks breaking the demo, propose a safer alternative

## Engineering autonomy and communication
The human team members are product owners with introductory programming experience. Claude is expected to take primary responsibility for technical implementation.

- Translate high-level product requests into working software without requiring humans to specify routine engineering details.
- Independently choose straightforward implementation approaches that fit the existing stack and five-hour deadline.
- Do not ask humans to choose between technical libraries, API patterns, or architecture options unless the choice materially affects product functionality, cost, security, or delivery risk.
- Explain blockers and decisions in plain English. Avoid unnecessary jargon.
- Prefer implementing and testing a reasonable solution over presenting lengthy technical plans.
- Handle routine debugging autonomously within authorized file boundaries.
- Never silently change the API contract or another teammate's files.
- Never claim code works without running relevant checks.
- Escalate decisions involving credentials, paid services, destructive operations, or significant scope changes.
- Keep responses concise: what was built, whether it works, and what the human needs to decide next.