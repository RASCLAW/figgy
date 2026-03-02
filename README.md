# FIGGY

## What this is
FIGGY is RA's Docker-first automation workspace and source-of-truth repo for building reliable, auditable automation systems (notably n8n workflows), with portfolio-grade documentation.

## Key goals
- System integrity: avoid breaking working state
- Auditability: versioned memory + decisions
- Repeatability: documented setup and smoke tests

## Structure (high level)
- `.claude/` — Claude Code local settings and permissions
- `memory/` — versioned memory and system truth
- `projects/` — client/project workstreams
- `docs/` — SOPs and smoke tests
- `n8n-workflows/` — workflow exports (when used)

## How to use this repo
1. Keep durable truths in `memory/`
2. Record decisions in `memory/DECISIONS.md`
3. Run `docs/SMOKE_TEST.md` after significant changes
