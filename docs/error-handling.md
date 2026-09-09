# Errors, did-you-mean, retries, and rate limits

## Stable error codes

Branch on `error.code` (stable). Messages may be reworded.

| Code | HTTP | What to do |
| --- | --- | --- |
| `missing_api_key` | 401 | Send `Authorization: Bearer …` |
| `invalid_api_key` | 401 | Check key; revoke/recreate if needed |
| `account_suspended` | 403 | Contact support |
| `rate_limited` | 429 | Sleep `Retry-After` seconds, then retry |
| `invalid_request` | 400 | Fix fields listed in `error.details` |
| `not_found` | 404 | Wrong id / other account’s job / missing resource |
| `gone` | 410 | Path retired — read any replacement hint |
| `unsupported_media_type` | 415 | Upload PDF or Word only |
| `payload_too_large` | 413 | Shrink the document (limit 40 MB) |
| `service_unavailable` | 503 | Back off and retry |
| `internal_error` | 500 | Retry with backoff; quote `requestId` |

Always log **`requestId`**. It keys the ledger row and log line for support.

## Did-you-mean is not an error

For `POST /cases/retrieve`, ambiguous queries return **HTTP 200** with:

```json
{ "status": "did_you_mean", "candidates": [ /* up to 3 */ ] }
```

Do **not** route this through your generic error handler. Present candidates (or apply an explicit product policy), then call the same endpoint again with `caseId`.

Similarly, cite-check `likely_valid` means “candidates, no silent pick.”

## Corpus caveats

`not_found` on cite check or retrieve may include `corpusCaveat` while the corpus is still loading. That is a corpus coverage statement, not automatic proof a citation is fabricated.

## Idempotent retries

Use `Idempotency-Key` when a timeout leaves you unsure whether `POST /search`, `POST /citecheck/cite`, or `POST /cases/retrieve` landed:

```http
Idempotency-Key: search-<uuid>
```

Rules:

- One key per distinct logical request
- Reuse after timeout → stored response + `replayed: true`
- Reuse with a **different** body → still returns the **original** answer (dangerous)
- First call must have sent the key — you cannot attach one after the fact
- PDF and most other routes ignore the header — cache bytes yourself

## Rate limits

- Per-minute, per-account budget on authenticated routes
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- On 429: honor `Retry-After`
- Treat published limits as a floor (per-replica windows); always prefer header-driven backoff
- Confirm via `GET /usage` → `yourPricing.rateLimitPerMinute`
- Ask for a higher ceiling if needed

## Suggested client policy

1. On network timeout for idempotent POSTs → retry with the **same** idempotency key (max 2–3 attempts, exponential backoff).
2. On `429` / `503` → honor `Retry-After` or exponential backoff.
3. On `400` / `401` / `403` / `404` / `410` / `413` / `415` → do not blind-retry; fix the request.
4. On `500` → limited retry + include `requestId` in logs/alerts.
5. Never infinite-poll document jobs — cap attempts (examples use ~120 × 5s).
