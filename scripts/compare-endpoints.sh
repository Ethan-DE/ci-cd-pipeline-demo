#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <source-url> <target-url>" >&2
  exit 2
fi

source_url="${1%/}"
target_url="${2%/}"

for path in / /health /ready; do
  source_body="$(curl -fsS "${source_url}${path}")"
  target_body="$(curl -fsS "${target_url}${path}")"

  if [[ "${source_body}" != "${target_body}" ]]; then
    echo "mismatch on ${path}" >&2
    echo "source: ${source_body}" >&2
    echo "target: ${target_body}" >&2
    exit 1
  fi

done

echo "source and target responses match"
