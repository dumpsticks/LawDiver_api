#!/usr/bin/env bash
# LawDiver API — cURL cookbook
# Language-agnostic HTTP recipes. Requires bash + curl.
# Docs: https://lawdiver.com/docs/api
#
# Usage:
#   export LAWDIVER_API_KEY=lt_live_xxxxxxxxxxxxxxxxxxxx
#   bash curl/examples.sh
#   bash curl/examples.sh search
#   bash curl/examples.sh cite
#   bash curl/examples.sh retrieve
#   bash curl/examples.sh usage
#   bash curl/examples.sh pdf
#   bash curl/examples.sh jurisdictions

set -euo pipefail

BASE="${LAWDIVER_API_BASE:-https://lawdiver.com/api/v1}"
KEY="${LAWDIVER_API_KEY:-${LAWTOOLS_API_KEY:-}}"

need_key() {
  if [[ -z "${KEY}" ]]; then
    echo "Set LAWDIVER_API_KEY (or LAWTOOLS_API_KEY) first." >&2
    echo "Create a key at https://lawdiver.com/account/api-keys" >&2
    exit 1
  fi
}

auth=(-H "Authorization: Bearer ${KEY}")

cmd_discovery() {
  echo "== GET / (discovery, no key) =="
  curl -sS "${BASE}"
  echo
}

cmd_usage() {
  need_key
  echo "== GET /usage =="
  curl -sS "${auth[@]}" "${BASE}/usage?days=30"
  echo
}

cmd_jurisdictions() {
  need_key
  echo "== GET /jurisdictions =="
  curl -sS "${auth[@]}" "${BASE}/jurisdictions"
  echo
}

cmd_search() {
  need_key
  echo "== POST /search =="
  curl -sS -X POST "${BASE}/search" \
    "${auth[@]}" \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: curl-search-$(date +%s)" \
    -d '{
      "query": "qualified immunity excessive force",
      "jurisdiction": { "type": "federal_circuit", "circuit": "11" },
      "limit": 5,
      "filters": { "dateFrom": "2015-01-01" }
    }'
  echo
}

cmd_agent_search() {
  need_key
  echo "== POST /search (agent-shaped includes) =="
  curl -sS -X POST "${BASE}/search" \
    "${auth[@]}" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "can a landlord withhold a deposit for ordinary wear and tear",
      "jurisdiction": { "type": "one_state_plus_federal", "state": "FL" },
      "limit": 5,
      "include": { "caseCard": true, "opinionText": true, "goodLawReport": true },
      "opinionTextMaxChars": 10000
    }'
  echo
}

cmd_cite() {
  need_key
  echo "== POST /citecheck/cite =="
  curl -sS -X POST "${BASE}/citecheck/cite" \
    "${auth[@]}" \
    -H "Content-Type: application/json" \
    -d '{"citations":["570 U.S. 744","999 F.3d 1"]}'
  echo
}

cmd_retrieve() {
  need_key
  echo "== POST /cases/retrieve =="
  curl -sS -X POST "${BASE}/cases/retrieve" \
    "${auth[@]}" \
    -H "Content-Type: application/json" \
    -d '{"query":"410 U.S. 113"}'
  echo
}

cmd_resolve() {
  need_key
  echo "== POST /citations/resolve =="
  curl -sS -X POST "${BASE}/citations/resolve" \
    "${auth[@]}" \
    -H "Content-Type: application/json" \
    -d '{"query":"410 U.S. 113"}'
  echo
}

cmd_good_law() {
  need_key
  local id="${1:-2812209}"
  echo "== GET /cases/${id}/good-law =="
  curl -sS "${auth[@]}" "${BASE}/cases/${id}/good-law"
  echo
}

cmd_cited_by() {
  need_key
  local id="${1:-2812209}"
  echo "== GET /cases/${id}/cited-by =="
  curl -sS "${auth[@]}" "${BASE}/cases/${id}/cited-by?limit=10&offset=0"
  echo
}

cmd_pdf() {
  need_key
  local id="${1:-2812209}"
  local out="${2:-case-${id}.pdf}"
  echo "== GET /cases/${id}/pdf → ${out} =="
  curl -sS -L "${auth[@]}" "${BASE}/cases/${id}/pdf" -o "${out}"
  echo "wrote ${out}"
}

cmd_document() {
  need_key
  local file="${1:-}"
  if [[ -z "${file}" || ! -f "${file}" ]]; then
    echo "Usage: $0 document path/to/brief.pdf" >&2
    exit 1
  fi
  echo "== POST /citecheck/document =="
  curl -sS -X POST "${BASE}/citecheck/document" \
    "${auth[@]}" \
    -F "file=@${file}"
  echo
  echo "Poll GET /citecheck/jobs/:id then GET .../report"
}

cmd_all() {
  cmd_discovery
  cmd_usage
  cmd_search
  cmd_cite
  cmd_retrieve
}

case "${1:-all}" in
  discovery) cmd_discovery ;;
  usage) cmd_usage ;;
  jurisdictions) cmd_jurisdictions ;;
  search) cmd_search ;;
  agent) cmd_agent_search ;;
  cite) cmd_cite ;;
  retrieve) cmd_retrieve ;;
  resolve) cmd_resolve ;;
  good-law) cmd_good_law "${2:-}" ;;
  cited-by) cmd_cited_by "${2:-}" ;;
  pdf) cmd_pdf "${2:-}" "${3:-}" ;;
  document) cmd_document "${2:-}" ;;
  all) cmd_all ;;
  *)
    echo "Unknown command: $1" >&2
    echo "Commands: all discovery usage jurisdictions search agent cite retrieve resolve good-law cited-by pdf document" >&2
    exit 1
    ;;
esac
