# DECISIONS — Architecture Decision Log (ADR-lite)

## Template
- Date:
- Decision:
- Context:
- Alternatives:
- Why:
- Consequences:

## ADR-001 — Layered memory architecture
- Date: 2026-03-02
- Decision: Split memory into CORE / PRINCIPLES / DECISIONS / FACTS / BACKLOG / SESSION_LOG
- Context: Single memory.md becomes unwieldy; different content has different update cadence
- Alternatives: Single flat memory.md; wiki-style docs
- Why: Each layer has different volatility — FACTS change rarely, SESSION_LOG changes every session
- Consequences: Slightly more files to navigate; compensated by CLAUDE.md repo pointers

## ADR-003 — @ imports + rules/ layer added to CLAUDE.md
- Date: 2026-03-06
- Decision: Add `@` imports for CORE/FACTS/PRINCIPLES/INTEGRITY in CLAUDE.md; create `.claude/rules/communication-style.md`
- Context: CLAUDE.md only had pointer comments — files weren't auto-loaded at session start. No formal communication style rules existed.
- Alternatives: Keep pointer comments only; merge comm style into CLAUDE.md
- Why: `@` imports guarantee stable context is always present without prompting. Rules/ separation keeps CLAUDE.md under 150 lines and focused on agent contract.
- Consequences: Session context is richer from the start; comm style is now enforceable and reviewable.

## ADR-002 — Governance vs ops separation
- Date: 2026-03-02
- Decision: CLAUDE.md = agent contract; docs/N8N_OPS.md = operational runbook
- Context: CLAUDE.md was mixing agent behavior rules with Docker command reference
- Alternatives: Keep everything in CLAUDE.md
- Why: Different audiences and update triggers; runbook changes on infra changes, contract changes on behavior changes
- Consequences: Claude agents must know to check docs/ for commands
