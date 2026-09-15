#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1:3000}"

curl -fsS "${base_url}/health" >/dev/null
curl -fsS "${base_url}/ready" >/dev/null
curl -fsS "${base_url}/metrics" | grep -q 'status_api_build_info'

echo "smoke checks passed for ${base_url}"
