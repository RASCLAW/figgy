#!/usr/bin/env bash
set -euo pipefail

# FIGGY health check (Docker + n8n + volume)
# Usage: ./scripts/figgy-health.sh
# Optional env:
#   N8N_URL=http://localhost:5678
#   VOLUME_NAME=n8n-project_n8n_data
#   CONTAINER_HINT=n8n

N8N_URL="${N8N_URL:-http://localhost:5678}"
VOLUME_NAME="${VOLUME_NAME:-n8n-project_n8n_data}"
CONTAINER_HINT="${CONTAINER_HINT:-n8n}"

fail() { echo "❌ $*" >&2; exit 1; }
ok()   { echo "✅ $*"; }
info() { echo "ℹ️  $*"; }

# --- Docker CLI ---
command -v docker >/dev/null 2>&1 || fail "docker not found in PATH"
docker info >/dev/null 2>&1 || fail "docker daemon not reachable (is Docker running in WSL2?)"
ok "Docker daemon reachable"

# --- Container ---
N8N_CONTAINER="$(docker ps --format '{{.Names}}' | grep -i "$CONTAINER_HINT" | head -n 1 || true)"
if [[ -z "${N8N_CONTAINER}" ]]; then
  info "Running containers:"
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
  fail "No running container matched CONTAINER_HINT='$CONTAINER_HINT' (set CONTAINER_HINT if your container name differs)"
fi
ok "Container running: ${N8N_CONTAINER}"

# --- Volume ---
if docker volume ls --format '{{.Name}}' | grep -Fxq "$VOLUME_NAME"; then
  ok "Volume exists: ${VOLUME_NAME}"
else
  info "Volumes containing 'n8n':"
  docker volume ls --format '{{.Name}}' | grep -i n8n || true
  fail "Volume missing: ${VOLUME_NAME} (this is where n8n state/workflows usually live)"
fi

# --- HTTP health ---
HEALTHZ="${N8N_URL%/}/healthz"
HTTP_CODE="$(curl -sS -o /tmp/figgy_healthz.out -w '%{http_code}' "$HEALTHZ" || true)"
BODY="$(cat /tmp/figgy_healthz.out 2>/dev/null || true)"

if [[ "$HTTP_CODE" == "200" ]] && echo "$BODY" | grep -qi '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  ok "n8n healthz OK @ ${HEALTHZ}"
else
  info "healthz response (code=${HTTP_CODE}): ${BODY}"
  fail "n8n health check failed (set N8N_URL if different, e.g. N8N_URL=http://localhost:5678)"
fi

echo
ok "FIGGY SMOKE TEST: PASS"
