# PRINCIPLES — Guardrails

## System Integrity
- Never break a working system to chase elegance.
- Changes should be incremental and reversible.

## Auditability
- Prefer versioned files over hidden state.
- Record decisions with rationale.

## AI Usage
- Propose diffs before editing memory.
- If uncertain, ask or default to least destructive action.

## Operational Hygiene
- Always run a smoke test before structural changes (health check → then build).
- Scripts are infrastructure: convert repeatable process into executable files.
