# Testing the API

This section describes LawDiver’s **public cite-check benchmark packs**: the citation strings to send, and the graded answer keys to score against.

They live in this repository (the public API examples pack) under [`docs/benchmarks/citecheck/`](./benchmarks/citecheck/). The main LawDiver application repo is private — **these files are the public copy** of the test inputs and answers.

**Product write-up:** [How Well Does Your Cite Checker Stack Up? LawDiver's 5,300-Citation Benchmark](https://lawdiver.com/blog/citediver-5200-citation-benchmark) on the LawDiver blog.

## What these files are

| Pack | Size | Role |
| --- | ---: | --- |
| **CiteCheck 5,200** | 5,200 cites | Existence / identity traps across U.S. jurisdictions: perfect cites, Bluebook noise, mangles, close hallucinations, fabrications, statutes, specialty courts |
| **Overruled-100 (GoodLaw)** | 100 cites | Well-formed cites to **overruled** state and federal authorities — pass only if the checker confirms the cite **and** surfaces negative / overruled treatment |

Together that is a **5,300-citation** verification suite.

Each pack ships as:

- **Test** (cites only) — `.md` + `.json` — safe to run blind
- **Answer key** — `.md` + `.json` — stance, Accept / Partial / Reject bands, and (for Overruled-100) the GoodLaw requirement

## Files

### CiteCheck 5,200

| File | Contents |
| --- | --- |
| [benchmarks/citecheck/5000citechecktest.md](./benchmarks/citecheck/5000citechecktest.md) | Cite strings only |
| [benchmarks/citecheck/5000citechecktest.json](./benchmarks/citecheck/5000citechecktest.json) | Machine twin (`n`, `id`, `cite`) |
| [benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md) | Graded answers + why |
| [benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json) | Machine twin for scoring scripts |

### Overruled-100 (GoodLaw)

| File | Contents |
| --- | --- |
| [benchmarks/citecheck/overruled-100-citechecktest.md](./benchmarks/citecheck/overruled-100-citechecktest.md) | Cite strings only |
| [benchmarks/citecheck/overruled-100-citechecktest.json](./benchmarks/citecheck/overruled-100-citechecktest.json) | Machine twin |
| [benchmarks/citecheck/overruled-100-citechecktest-ANSWER-KEY.md](./benchmarks/citecheck/overruled-100-citechecktest-ANSWER-KEY.md) | Answers + GoodLaw requirement |
| [benchmarks/citecheck/overruled-100-citechecktest-ANSWER-KEY.json](./benchmarks/citecheck/overruled-100-citechecktest-ANSWER-KEY.json) | Machine twin |

## How to run them against CiteDiver

1. Get a developer API key ([getting started](./getting-started.md)).
2. Call `POST https://lawdiver.com/api/v1/citecheck/cite` with batches of cite strings from the test file (up to 50 per request).
3. Score each response against the matching answer-key row.

Minimal shape:

```bash
curl -s https://lawdiver.com/api/v1/citecheck/cite \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"citations":["Chevron U. S. A. Inc. v. Natural Resources Defense Council, Inc., 467 U.S. 837 (1984)"]}'
```

For Overruled-100, a pass requires:

- Verdict in the Accept band (`valid` / `likely_valid`), **and**
- `candidates[0].goodLaw.negative === true` (or status indicating overruled / negative treatment)

Confirming a well-formatted overruled case **without** a treatment flag is a fail. A cite checker without that function is worse than useless — it is dangerous.

## Scoring notes

- Different products implement different capabilities. Prefer **stance match** (must confirm / must decline / open) and **Reject rate** over a single vanity percentage.
- Locator-only checkers may soft-fail on pin/name-aware rows; the answer key lists Accept ∪ Partial for those cases.
- GoodLaw / treatment history is **orthogonal** to “does this cite resolve?” — Overruled-100 measures both.

Full methodology, difficulty mix, and invitation for third-party checkers: the [benchmark blog post](https://lawdiver.com/blog/citediver-5200-citation-benchmark).

## Related docs

- [Endpoints — cite check](./endpoints.md)
- [Recipes](./recipes.md)
- [Getting started](./getting-started.md)
- Product: [CiteDiver](https://lawdiver.com/products/citediver) · [Caselaw API](https://lawdiver.com/products/api)
