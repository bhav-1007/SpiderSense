# SpiderSense — AI Agent Configuration

This repository was built alongside **Google Antigravity (AGY)**, an advanced agentic coding assistant. During development, the agent utilized a local customization framework to ensure aesthetic consistency, high code quality, and maintainable architecture.

## How AI Was Used
* **Architecture & Backend:** The agent built the entire Express/Socket.io backend, implemented the MongoDB schemas, and integrated the Google Generative AI (Gemini) API for the AI-driven auto-assignment engine.
* **Frontend Design:** Driven by the custom `.agent/skills/frontend-design.md` skill, the agent applied modern, dark-themed styling utilizing Framer Motion for micro-animations and smooth transitions.
* **Complex Workflows:** The agent automated complex refactoring, such as ripping out the manual dispatch scoring heuristic and replacing it with a live LLM integration, complete with fallback logic.

## Agent Instruction Files
The primary agent instructions and workflows used to guide the AI during this project can be found in the `.agent/` directory.

### Core Skill Configuration
* [**`.agent/skills/frontend-design.md`**](./.agent/skills/frontend-design.md) — The central directive guiding the agent's styling choices (glassmorphism, Framer Motion integration, dark mode colors).

### Workflow Customizations
The `.agent/workflows/` directory contains specific iterative workflows the agent used to improve the interface:
* [`.agent/workflows/animate.md`](./.agent/workflows/animate.md) — Instructions for adding purposeful animations.
* [`.agent/workflows/audit.md`](./.agent/workflows/audit.md) — Directives for auditing interface quality and performance.
* [`.agent/workflows/harden.md`](./.agent/workflows/harden.md) — Rules for improving resilience and error handling.
* *(See the full list of workflow instructions in the [`.agent/workflows/`](./.agent/workflows/) directory).*
