# Why the LawDiver Caselaw API

If you are shipping legal research features, cite hygiene, or grounded legal AI, most “caselaw APIs” fall into one of three traps: thin scrapes, silent citation rewriting, or search that ignores how lawyers actually scope authority. LawDiver’s [public API](https://lawdiver.com/products/api) is designed to avoid those traps — the same retrieval and citation stack that powers [CaseDiver](https://lawdiver.com/casediver), exposed as versioned REST.

Long-form narrative: [The caselaw API legal AI builders have been waiting for](https://lawdiver.com/blog/caselaw-api-for-legal-ai-builders). Field reference: [lawdiver.com/docs/api](https://lawdiver.com/docs/api).

---

## Why builders choose LawDiver

### Same verified corpus as the product

Every search, cite check, and PDF comes from the corpus that powers lawdiver.com — **~10 million** federal and state opinions, structured metadata, and a large citation graph (tens of millions of resolved opinion-to-opinion edges). Your integration and the public site stay aligned. Harvest is continuous across 200+ court sites and government sources — not a quarterly dump.

**Public records, not a commercial feed.** There is no Westlaw or Lexis license underneath, and no clause that forbids your product from competing with ours. That is why an API like this can exist for legal AI builders at all.

### Cite checking that refuses to lie

Silent auto-correction is dangerous: rewriting a brief’s citation to a case the author never read is worse than flagging ambiguity.

LawDiver asks the determinate question — does this cite name a real case **in a corpus we hold**, what is the correct Bluebook form, and is it still good law? — and returns explicit verdicts:

| Verdict | Meaning |
| --- | --- |
| `valid` | Exact reporter-key match **and** name/year/court as written agree; `correctedCitation` carries proper Bluebook form |
| `name_mismatch` | Reporter cite is real, but names/year/court as written do not match — **classic hallucination shape** |
| `likely_valid` | Candidates only; **no automatic pick** |
| `not_found` | Nothing matched — may include `corpusCaveat` (not proof of fabrication) |
| `unverified` | No source can honestly answer (e.g. some statute probes) |
| `error` | This row failed to check (reported, not omitted; not billed) |

Present candidates to a human (or an explicit product policy). Confidence reaches **1.0 only** for reporter-key matches — no fuzzy 0.97 standing in for certainty.

### Legal search with engine-level control

`POST /search` **requires** jurisdiction — Florida counsel rarely wants an unscoped national crawl. Eight scopes cover state-only, state+federal, circuits, districts, Supreme Court, and “everything” when you truly need it. Call `GET /jurisdictions` instead of hard-coding codes.

Four engines + a router that plans (citation, name, keyword/boolean with `/s` `/p` `w/n`, semantic, hybrid, or `auto`). Pinning is honest: drop an engine for want of input rather than return a mysterious empty set.

### One call for agent loops

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

A tool-using model gets summary/holdings (when analyzed), opinion excerpts or full short opinions, and negative-treatment evidence — without a second retrieval round-trip. Search is billed **per case returned**; empty sets are free. Keep `limit` small when opinion text is on.

### Document-scale cite check

Upload a PDF/DOCX brief (`multipart/form-data`), receive a job id, poll until complete, download a report PDF with tallies, Bluebook forms, and first-page exhibits. Short forms bind to earlier full cites. Jobs are account-scoped — another account’s job id returns `not_found`.

### Did-you-mean is a feature, not an error

Ambiguous retrieve queries return **HTTP 200** with `status: "did_you_mean"` and up to three candidates. Your error handler should not swallow them. Answer on the **same** endpoint by resubmitting with `caseId`.

### Production-minded HTTP

- Bearer auth (or `X-API-Key`)
- Stable `error.code` values
- `requestId` on every response for support
- `Idempotency-Key` on search, cite-check-cite, and retrieve
- Rate-limit headers + `Retry-After`
- Usage ledger even while pricing is free
- Additive-only public shapes — fields get added, never renamed out from under you

### Free to build against during rollout

Integrate and measure volume via `GET /usage` without designing around per-action charges yet. The unauthenticated discovery document at `https://lawdiver.com/api/v1` shows endpoints and pricing **before** you create a key. When pricing changes, discovery and official docs state the policy — history is not rewritten.

---

## When to choose LawDiver over rolling your own

| Build yourself | Use LawDiver API |
| --- | --- |
| Maintain opinion ingest + PDF rendering | Call `/cases/:id/pdf` |
| Parse Bluebook edge cases + short forms | `/citecheck/cite` + `/citecheck/document` |
| Track negative treatment | `goodLaw` + `/good-law` |
| Scope search like a practitioner | jurisdiction object + `/jurisdictions` |
| Detect hallucinated cites (real reporter, wrong caption) | `name_mismatch` verdict |
| Boolean + semantic + fusion retrieval | `POST /search` with `auto` / `hybrid` / pin |

---

## Fits modern stacks

- **TypeScript / Node** backends and Next.js API routes (primary examples in this repo)
- **Python** research notebooks, Django/FastAPI services, data pipelines
- **Any language** via plain REST / cURL
- Complements LawDiver **MCP** — same key, same usage meter

---

## Next

- [About LawDiver & the API](./about-lawdiver.md)
- [Getting started](./getting-started.md)
- [Endpoints](./endpoints.md)
- [Recipes](./recipes.md)
- Product: [lawdiver.com/products/api](https://lawdiver.com/products/api)
- Docs: [lawdiver.com/docs/api](https://lawdiver.com/docs/api)
