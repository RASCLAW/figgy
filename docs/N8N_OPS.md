# n8n Operations

This file preserves the n8n operational runbook for FIGGY. Guidance for Docker, import/export, volume rules, and workflow JSON validation.

## What FIGGY Is

FIGGY is RA's automation lab and portfolio engine. It is **not** a traditional software project — there is no build system, package manager, or test suite. The primary artifacts are n8n workflow JSON files that are imported into a self-hosted n8n instance running in Docker.

Central truth: everything is version-controlled here and deployed to n8n via import.

## n8n Operations

n8n runs at `http://localhost:5678` inside Docker. The container name is `duberymnl-automation-v2-n8n-1`.

**Start n8n:**
```bash
cd projects/figgy/projects/duberymnl-automation-v2
docker compose up -d
```

**Check n8n is running:**
```bash
curl -s http://localhost:5678/healthz
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

**Import a workflow into n8n:**
```bash
docker cp /path/to/workflow.json duberymnl-automation-v2-n8n-1:/tmp/workflow.json
docker exec duberymnl-automation-v2-n8n-1 n8n import:workflow --input=/tmp/workflow.json
```

**Export all workflows from n8n to inspect:**
```bash
docker exec duberymnl-automation-v2-n8n-1 n8n export:workflow --all
```

**Validate a workflow JSON before importing:**
```bash
python3 -c "import json; d=json.load(open('workflow.json')); print(f'Valid — {len(d[\"nodes\"])} nodes, {len(d[\"connections\"])} connections')"
```

## Workflow Export Process

Build in n8n UI → Export JSON → Save to `n8n-workflows/` → `git add` → `git commit` → `git push`

Exported JSONs must be clean and importable — verify node count and connections before committing.

## Architecture

### Docker / Infrastructure
- n8n runs on named Docker volume `n8n-project_n8n_data` mounted at `/home/node/.n8n`
- Volume is declared `external: true` in `docker-compose.yml` — it must exist before `docker compose up`
- **Never modify the volume mount path** without verifying it matches the n8n data directory
- Avoid n8n v2.9.4 (file writing bug); prefer stable releases

### Workflow Structure Pattern
All workflows follow: `Trigger → (optional) Normalize/Transform → Action`

Current workflow types:
- **Scheduled email briefings** (`n8n-workflows/Daily Email Briefings.json`): 4 independent pipelines (AI news, Crypto/Axie, Toddler, Consultant) each on their own cron schedule. Pattern: `ScheduleTrigger → RSSFeedRead → Code (format HTML) → Gmail`
- **Lead generation** (`duberymnl-leadgen.json`, `duberymnl-webhook-only.json`): Dual-trigger pattern (n8n Form + Webhook) → Normalize with Set node → Google Sheets append → Email confirmation. The 4 product models are: Sky Blue, Stealth, Fire, Gold

### Memory System
`memory/RA_CORE_v1.0.md` is the persistent identity and operational context for RA — read it when onboarding to a new session to understand priorities and active projects. `memory/SESSION_LOG.md` tracks milestone completions. `prompts/MEMORY_CONSOLIDATION_ENGINE.md` is a prompt template for distilling session insights.

## Key Rules

- **Backtick principle**: Multi-line JavaScript in n8n Code nodes must use backtick template literals, not concatenated strings
- **Auditability**: All automated decision logic (especially geo-fence/COD branching for DuberyMNL) must be deterministic and traceable — no silent failures
- **Session closeout**: After building anything, summarize what was built, where it was saved, and what the next logic gate is (update `SESSION_LOG.md`)
- The `projects/` directory is gitignored at the root — `projects/duberymnl-automation-v2` is a separate git repo

## Active Project: DuberyMNL Automation

Business context: COD (Cash on Delivery) e-commerce in Metro Manila (NCR). Key pending logic:
- **Geo-fence validation**: Validate submitted addresses against NCR (Metro Manila) using regex or lookup table. Route: NCR → COD branch; Non-NCR → standard shipping or rejection
- **Content engine**: Select product asset (Sky Blue / Stealth / Fire / Gold) → localized prompt → image generation → feed posting
