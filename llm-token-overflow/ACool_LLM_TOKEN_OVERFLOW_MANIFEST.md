# ACool LLM Token Overflow Manifest

## Purpose

This system keeps ACool / VYTAL / COSMO work moving without burning one model's context window or message limits.

Instead of making one chat carry the whole company, every model gets a small role, a small prompt, and a clean handoff file.

## Model Routing

| Model / Tool | Best Use |
|---|---|
| ChatGPT / GPT-5.5 Thinking | Strategy, architecture, final partner-ready copy, risk review, prompt compression |
| Codex CLI / Codex App | Code edits, repo diffs, docs scaffolds, tests, commits after review |
| Gemini CLI | Wide repo inspection, codebase summarization, file inventory, first-pass audits |
| Claude Code | Deep refactors, bug fixes, architecture implementation, task loops |
| Ollama / local models | Cheap local summarization, filename classification, rough drafts, private scratch summaries |

## Token Overflow Rule

Never paste the whole project into any model.

Use this pattern:

1. Send the model only the relevant files.
2. Ask it to produce a short result.
3. Ask it to update HANDOFF_NOW.md.
4. Move the result back into the repo.
5. Start the next model with PROJECT_BRIEF.md + HANDOFF_NOW.md, not the entire conversation.
