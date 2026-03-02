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
