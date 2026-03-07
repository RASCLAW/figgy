# FACTS — Current Known Truths

## Environment
- Windows + WSL2 (Ubuntu)
- Docker in WSL2
- n8n self-hosted in Docker
- Named volume: n8n-project_n8n_data (confirm if still current)

## Tooling
- FIGGY repo is canonical
- `scripts/figgy-health.sh` is the baseline system health check (Docker, n8n container, volume, /healthz)
- n8n workflow exports are version-controlled under `n8n-workflows/<project>/`

## MCP (Claude Code integrations)
- n8n MCP: configured in `~/.claude.json` (global, not in git)
  - Server: `n8n-mcp` via npx
  - N8N_BASE_URL: http://localhost:5678
  - N8N_API_KEY: stored in `~/.claude.json` (JWT token)
  - Requires: restart Claude Code session to activate new MCP

## FIGGY Structure (current)
- `context/current-priorities.md` — live focus file; update when priorities shift
- `templates/session-closeout.md` — session closeout checklist and log template
- `.claude/rules/communication-style.md` — persistent comm style rules
- `.claude/skills/` — skills directory; invoke with `/skill-name`

## Context Management (Claude Code)
- Avoid full-file reads on large JSONs (n8n workflow exports are 400+ lines). Use targeted tools instead:
  - `Grep` first to locate a node or field by name
  - `Read` with line range (e.g. lines 150-170) once location is known
- System reminders (auto-shown diffs after file changes) are outside Claude's control — context cost from those is unavoidable
- Proactive full-file reads are the controllable cost — grep/range-read by default
