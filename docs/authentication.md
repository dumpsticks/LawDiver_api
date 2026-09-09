# Authentication

Base URL: `https://lawdiver.com/api/v1`

## Which routes need a key?

| Route | Auth |
| --- | --- |
| `GET /api/v1` (discovery) | **None** — lists endpoints and pricing policy |
| All other `/api/v1/*` routes | **Required** |

## Headers

Preferred (Bearer — what gateways and HTTP clients already understand):

```http
Authorization: Bearer lt_live_xxxxxxxxxxxxxxxxxxxx
```

Also accepted:

```http
X-API-Key: lt_live_xxxxxxxxxxxxxxxxxxxx
```

JSON bodies also need:

```http
Content-Type: application/json
```

Except multipart document upload (`POST /citecheck/document`), where the client must set the multipart boundary (let `fetch` / `httpx` / `curl -F` do it — do not manually set `Content-Type: application/json`).

## Obtaining and rotating keys

1. Sign up and verify email on [lawdiver.com](https://lawdiver.com).
2. Create keys at [Account → API keys](https://lawdiver.com/account/api-keys).
3. Copy the key at creation time — it cannot be re-displayed (only a hash is stored).
4. Revoke compromised or lost keys immediately; create a replacement.
5. Revocation applies on the **next** request.

## Environment variables used by this repo

| Variable | Purpose |
| --- | --- |
| `LAWDIVER_API_KEY` | Preferred for samples in this repository |
| `LAWTOOLS_API_KEY` | Alias matching official LawDiver docs |
| `LAWDIVER_API_BASE` | Optional override (default `https://lawdiver.com/api/v1`) |

Sample clients check `LAWDIVER_API_KEY` first, then `LAWTOOLS_API_KEY`.

## Security checklist

- [ ] Key lives only in server env / secret manager
- [ ] Front ends call **your** API, which calls LawDiver
- [ ] `.env` is gitignored
- [ ] CI uses encrypted secrets, not plaintext workflow files
- [ ] Logs never print full keys
- [ ] Separate keys per environment (dev/stage/prod) when possible

## Account states you may see

| `error.code` | HTTP | Meaning |
| --- | --- | --- |
| `missing_api_key` | 401 | No key presented |
| `invalid_api_key` | 401 | Unknown, revoked, or expired (not distinguished on purpose) |
| `account_suspended` | 403 | Account exists but may not call the API |

## Idempotency (related header)

On `POST /search`, `POST /citecheck/cite`, and `POST /cases/retrieve`:

```http
Idempotency-Key: my-request-2026-08-13-001
```

Replaying the same key for the same account returns the stored response with `replayed: true` without re-running work. Keys bind to the **first response**, not the body — never reuse a key for a different query.

## Rate-limit headers

Authenticated responses may include:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
Retry-After: 12
```

`Retry-After` appears on `429`. Confirm your ceiling via `GET /usage` → `yourPricing.rateLimitPerMinute`.
