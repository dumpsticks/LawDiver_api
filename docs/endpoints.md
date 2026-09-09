# LawDiver API v1 — endpoint catalog

Canonical field-level reference: [https://lawdiver.com/docs/api](https://lawdiver.com/docs/api)  
Base: `https://lawdiver.com/api/v1`

Every JSON response includes `requestId`. Most also include `usage`. PDFs carry usage in `X-LawTools-*` headers instead.

---

## Discovery

### `GET /`

No API key. Returns the public surface and current pricing policy.

```bash
curl https://lawdiver.com/api/v1
```

---

## Case search

### `POST /search`

Searches the caselaw corpus. **Jurisdiction is required.**

**Key body fields**

| Field | Required | Notes |
| --- | --- | --- |
| `query` | yes | Citation, case name, or issue description |
| `jurisdiction` | yes | See jurisdiction table below |
| `searchType` | no | `auto` (default), `citation`, `case_name`, `keyword`, `semantic`, `hybrid` |
| `limit` | no | 1–200, default 10; capped by account `maxCasesPerSearch` |
| `filters.dateFrom` / `dateTo` | no | `YYYY-MM-DD` |
| `filters.includeUnpublished` | no | Unpublished excluded by default |
| `filters.publishedOnly` | no | Further restrict to published |
| `filters.goodLawOnly` | no | Hide negative treatment (off by default — bad law is flagged, not hidden) |
| `include.caseCard` | no | AI analysis card when available |
| `include.opinionText` | no | Full or excerpted opinion text |
| `include.goodLawReport` | no | Expand negative-treatment evidence (**on by default**) |
| `opinionTextMaxChars` | no | Default 10000, clamp 500–50000 |

**Jurisdiction `type` values**

| `type` | Extra fields |
| --- | --- |
| `all_states` | — |
| `all_states_and_federal` | — |
| `all_federal` | — |
| `one_state` | `state` (USPS, e.g. `"FL"`) |
| `one_state_plus_federal` | `state` |
| `federal_circuit` | `circuit` (`"1"`–`"11"`, `"dc"`, `"federal"`) |
| `federal_district` | `districtState` |
| `us_supreme_court` | — |

Supports `Idempotency-Key`.

Prefer `GET /jurisdictions` over hard-coding state/circuit lists.

---

## Jurisdictions

### `GET /jurisdictions`

Authoritative types, circuit ids, USPS codes, and example payloads.

---

## Cite check — citation(s)

### `POST /citecheck/cite`

Send exactly one of:

- `citation` — string
- `citations` — string array, max 50

Beyond 50, use the document endpoint.

**Verdicts:** `valid` · `name_mismatch` · `likely_valid` · `not_found` · `error`

Supports `Idempotency-Key`.

---

## Cite check — document (async)

### `POST /citecheck/document`

`multipart/form-data` with `file` field. Accepts PDF, `.docx`, `.doc` up to 40 MB.

Returns immediately with `jobId`, `status`, `statusUrl`, `reportUrl`, `pollAfterSeconds`.

### `GET /citecheck/jobs/:id`

Poll every 2–5 seconds until `completed` or `failed`. Completed payloads include per-citation findings (`citations`) and `counts`.

### `GET /citecheck/jobs/:id/report`

`application/pdf` report. Jobs are scoped to your account.

---

## Citation resolve

### `POST /citations/resolve`

Body: `{ "query": "410 U.S. 113" }` (2–500 chars). Up to five candidates; no PDF delivery.

---

## Case retrieval

### `POST /cases/retrieve`

Body:

- `query` (required) — citation or case name
- `caseId` (optional) — answer a prior did-you-mean (opinion id)

**Statuses (all HTTP 200):** `ok` · `did_you_mean` · `not_found`

Supports `Idempotency-Key`.

---

## Case metadata

### `GET /cases/:id`

Metadata only. `:id` may be **opinion id or cluster id**.

---

## Case batch

### `POST /cases/batch`

Body: `{ "caseIds": ["…", "…"] }` up to 50. Returns `cases` + `notFound`.

---

## Good-law detail

### `GET /cases/:id/good-law`

Status plus `negativeCitations`.

---

## Cited by

### `GET /cases/:id/cited-by?limit=25&offset=0`

`limit` 1–100 (default 25), `offset` default 0.

---

## Case PDF

### `GET /cases/:id/pdf`

Opinion PDF with processing/analysis appendix. `:id` must be an **opinion id**.

Usage travels in headers (`X-Request-Id`, `X-LawTools-Operation`, `X-LawTools-Charge-Units`, …). Re-rendered each time — cache on your side. Does **not** honor `Idempotency-Key`.

---

## Usage

### `GET /usage?days=30`

`days` 1–365, default 30. Returns consumer info, `byOperation`, and `yourPricing` (limits + reserved price labels). While free, costs may be zero.

---

## Retired routes

`POST /requests` and `GET /requests/:id` return `gone` (410). Use retrieval and cite-check instead.

---

## Envelope shape (JSON)

**Success**

```json
{
  "results": [],
  "usage": {
    "operation": "case_search",
    "quantity": 7,
    "costMillicents": 0,
    "costCents": 0,
    "breakdown": { "cases": 7 }
  },
  "requestId": "req_Ab3xK9pQ"
}
```

**Error**

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Invalid search request.",
    "details": [{ "field": "jurisdiction.state", "message": "…" }]
  },
  "usage": null,
  "requestId": "req_Ab3xK9pQ"
}
```

Branch on `error.code`, not the message string.
