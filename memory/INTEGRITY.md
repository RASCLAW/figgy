# FIGGY Operational Integrity

> Concrete operational rules for the FIGGY system.
> For abstract guardrails, see PRINCIPLES.md.

## 1. The WSL Native Anchor
- Environment: WSL2 (Ubuntu) only. No Windows-side file operations.
- Use Linux absolute paths exclusively. Docker runs natively in WSL.
- Never delete Docker volumes or containers without explicit user confirmation.

## 2. Automation Strategy (WAT-aligned)
- Claude coordinates; deterministic scripts execute. Never conflate the two.
- Check `tools/` before writing new scripts. Reuse first, build only when nothing exists.
- n8n is the primary orchestrator. Complex logic → `tools/`; idempotency → Unique Keys.
- Intermediate/temp files go in `.tmp/` (regenerable, not versioned).
- Credentials/secrets belong in Docker env variables — never hardcoded in scripts or workflows.

## 3. Web Design Standards
- Always invoke `/frontend-design` before any frontend code. No exceptions.
- Bind dev servers to `0.0.0.0` for WSL-to-browser access from the Windows host.
- Minimum 2 screenshot comparison rounds before marking UI work complete.
- Full rules: `.claude/skills/frontend-design/SKILL.md`

## 4. Memory & Continuity
- Log all session milestones in SESSION_LOG.md first.
- Promote durable learnings to FACTS / DECISIONS / PRINCIPLES only when justified.
- All major architectural changes produce an ADR entry in DECISIONS.md.

## 5. Self-Improvement Loop
When something breaks:
1. Read the full error — don't retry blindly
2. Fix the tool or workflow
3. Verify the fix works
4. Update the relevant doc (runbook, workflow, or memory file)
5. Continue with a stronger system
