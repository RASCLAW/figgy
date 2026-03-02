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

## ADR-002 — Governance vs ops separation
- Date: 2026-03-02
- Decision: CLAUDE.md = agent contract; docs/N8N_OPS.md = operational runbook
- Context: CLAUDE.md was mixing agent behavior rules with Docker command reference
- Alternatives: Keep everything in CLAUDE.md
- Why: Different audiences and update triggers; runbook changes on infra changes, contract changes on behavior changes
- Consequences: Claude agents must know to check docs/ for commands
