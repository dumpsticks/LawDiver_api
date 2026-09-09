# Recipes — end-to-end LawDiver API patterns

Runnable code lives under [`typescript/examples`](../typescript/examples) and [`python/examples`](../python/examples). This page explains the patterns.

---

## Recipe A — Practitioner search in one state + federal

Use `one_state_plus_federal` when you want what a lawyer in that state actually cites: state courts, the regional circuit, and the U.S. Supreme Court.

```json
{
  "query": "landlord security deposit ordinary wear and tear",
  "jurisdiction": { "type": "one_state_plus_federal", "state": "FL" },
  "limit": 10,
  "filters": { "dateFrom": "2010-01-01" }
}
```

---

## Recipe B — Agent search (card + excerpts + good-law)

One round-trip for tool-using models. Keep `limit` small when `opinionText` is on.

```json
{
  "query": "can a landlord withhold a deposit for ordinary wear and tear",
  "jurisdiction": { "type": "one_state_plus_federal", "state": "FL" },
  "limit": 5,
  "include": {
    "caseCard": true,
    "opinionText": true,
    "goodLawReport": true
  },
  "opinionTextMaxChars": 10000
}
```

Surface `goodLaw.negative` loudly. Treat `goodLaw.unknown` as unknown — never as a clean bill of health.

See: `05-agent-search` examples.

---

## Recipe C — Cite-check a list before filing

```json
{ "citations": ["570 U.S. 744", "999 F.3d 1"] }
```

UI guidance:

- `valid` → show `correctedCitation`
- `name_mismatch` → warn: real reporter, wrong caption (hallucination shape)
- `likely_valid` → show candidates; require human pick
- `not_found` → show `corpusCaveat` if present; do not auto-label “fake”
- `error` → show failure for that row (do not omit)

---

## Recipe D — Cite-check an entire brief

1. `POST /citecheck/document` with multipart `file`
2. Poll `GET /citecheck/jobs/:id` every ~5s (match `pollAfterSeconds`)
3. Stop on `completed` / `failed` or attempt ceiling
4. Read `counts` / `citations` only after `completed`
5. Download `GET /citecheck/jobs/:id/report` as PDF

See: `04-document-cite-check` examples.

---

## Recipe E — Retrieve with did-you-mean round trip

```text
POST /cases/retrieve { "query": "Smith v. Jones" }
  → status: did_you_mean + candidates[]

POST /cases/retrieve { "query": "Smith v. Jones", "caseId": "<chosen>" }
  → status: ok + case.pdfUrl
```

Auto-picking `candidates[0]` is a product decision — it can silently deliver the wrong case.

See: `03-retrieve` examples.

---

## Recipe F — Safe retry after timeout

```text
key = "search-" + uuid()
attempt POST /search with Idempotency-Key: key
on timeout → retry with SAME key (do not change body)
```

Never reuse the key for a different query.

---

## Recipe G — Download and cache a PDF

```bash
curl -L "https://lawdiver.com/api/v1/cases/2812209/pdf" \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -o windsor.pdf
```

Re-fetch when currency of good-law/analysis matters; otherwise cache bytes for retries.

---

## Recipe H — Distinguish network vs credentials

1. `GET /api/v1` → proves network
2. `GET /api/v1/usage` → proves key

See: `06-usage` examples.

---

## Recipe I — Treatment graph lite

1. Search or retrieve to obtain `caseId`
2. `GET /cases/:id/good-law` for negative citations
3. `GET /cases/:id/cited-by?limit=25&offset=0` for forward citations

See: `07-good-law-cited-by` examples.
