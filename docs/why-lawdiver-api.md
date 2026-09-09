# Why the LawDiver API is awesome for builders

If you are shipping legal research features, cite hygiene, or grounded legal AI, most “caselaw APIs” fall into one of three traps: thin scrapes, silent citation rewriting, or search that ignores how lawyers actually scope authority. LawDiver’s API is designed to avoid those traps.

## 1. Same verified corpus as the product

Every search, cite check, and PDF comes from the corpus that powers CaseDiver on [lawdiver.com](https://lawdiver.com) — **10M+** federal and state opinions, structured metadata, and a large citation graph. Your integration and the public site stay aligned.

## 2. Cite checking that refuses to lie

Silent auto-correction is dangerous: rewriting a brief’s citation to a case the author never read is worse than flagging ambiguity.

LawDiver returns explicit verdicts:

| Verdict | Meaning |
| --- | --- |
| `valid` | Resolves cleanly; `correctedCitation` carries proper Bluebook form |
| `name_mismatch` | Reporter cite is real, but names/year/court as written do not match — classic hallucination shape |
| `likely_valid` | Candidates only; **no automatic pick** |
| `not_found` | Nothing matched — may include `corpusCaveat` while the corpus is still loading |
| `error` | This row failed to check (reported, not omitted) |

Present candidates to a human (or an explicit product policy). Do not treat `not_found` alone as proof of fabrication.

## 3. Jurisdiction-first search

`POST /search` **requires** a jurisdiction object. That matches practice: Florida counsel rarely wants an unscoped national crawl. Eight scopes cover state-only, state+federal, circuits, districts, Supreme Court, and “everything” when you truly need it. Call `GET /jurisdictions` instead of hard-coding codes.

## 4. One call for agent loops

Turn on:

```json
{
  "include": {
    "caseCard": true,
    "opinionText": true,
    "goodLawReport": true
  },
  "opinionTextMaxChars": 10000,
  "limit": 5
}
```

A tool-using model gets summary/holdings (when analyzed), opinion excerpts or full short opinions, and negative-treatment evidence — without a second retrieval round-trip. Keep `limit` small when opinion text is on.

## 5. Document-scale cite check

Upload a PDF/DOCX brief (`multipart/form-data`), receive a job id, poll until complete, download a report PDF with tallies, Bluebook forms, and first-page exhibits. Jobs are account-scoped — another account’s job id returns `not_found`.

## 6. Did-you-mean is a feature, not an error

Ambiguous retrieve queries return **HTTP 200** with `status: "did_you_mean"` and up to three candidates. Your error handler should not swallow them. Answer on the **same** endpoint by resubmitting with `caseId`.

## 7. Production-minded HTTP

- Bearer auth (or `X-API-Key`)
- Stable `error.code` values
- `requestId` on every response for support
- `Idempotency-Key` on search, cite-check-cite, and retrieve
- Rate-limit headers + `Retry-After`
- Usage ledger even while pricing is free

## 8. Free to build against during rollout

You can integrate, load-test carefully within limits, and measure volume via `GET /usage` without designing around per-action charges yet. When pricing changes, the discovery document and official docs state the policy — history is not rewritten.

## 9. Fits modern stacks

- **TypeScript / Node** backends and Next.js API routes
- **Python** research notebooks, Django/FastAPI services, data pipelines
- **Any language** via cURL-equivalent HTTP
- Complements LawDiver **MCP** for agent environments

## When to choose LawDiver over rolling your own

| Build yourself | Use LawDiver API |
| --- | --- |
| Maintain opinion ingest + PDF rendering | Call `/cases/:id/pdf` |
| Parse Bluebook edge cases | `/citecheck/cite` |
| Track negative treatment | `goodLaw` + `/good-law` |
| Scope search like a practitioner | jurisdiction object + `/jurisdictions` |
| Cite-check whole briefs | `/citecheck/document` |

## Next

- [Getting started](./getting-started.md)
- [Endpoints](./endpoints.md)
- [Recipes](./recipes.md)
- Official docs: [https://lawdiver.com/docs/api](https://lawdiver.com/docs/api)
