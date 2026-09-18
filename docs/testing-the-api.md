# Testing the API

This section is LawDiverâ€™s **public cite-check benchmark**: one combined suite of **5,300** citation strings, plus the graded answer key.

Files live under [`docs/benchmarks/citecheck/`](./benchmarks/citecheck/). The main LawDiver application repo is private â€” **this is the public copy** of the test and answers.

**Product write-up:** [How Well Does Your Cite Checker Stack Up? LawDiver's 5,300-Citation Benchmark](https://lawdiver.com/blog/citediver-5300-citation-benchmark)

## What the test covers (one suite)

The suite checks **both**:

1. **Citation identity / existence** â€” perfect cites, Bluebook noise, mangles, close hallucinations, fabrications, statutes, specialty courts across U.S. jurisdictions.
2. **Overruled / negative treatment** â€” 100 well-formed cites to overruled state and federal authorities mixed into the same shuffled list (family `overruled`). Pass only if the checker confirms the locator **and** surfaces GoodLaw negative/overruled treatment.

It is **not** two separate exams. Download and run the combined files below.

## Files

| File | Contents |
| --- | --- |
| [benchmarks/citecheck/5000citechecktest.md](./benchmarks/citecheck/5000citechecktest.md) | **5,300** cite strings only |
| [benchmarks/citecheck/5000citechecktest.json](./benchmarks/citecheck/5000citechecktest.json) | Machine twin (`n`, `id`, `cite`) |
| [benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md) | Graded answers + why |
| [benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json) | Machine twin for scoring scripts |

Folder overview: [benchmarks/citecheck/README.md](./benchmarks/citecheck/README.md).

## Possible outputs

`POST https://lawdiver.com/api/v1/citecheck/cite` returns a **verdict** per unit and optional **candidates** (with GoodLaw).

### Verdict vocabulary

| Verdict | Meaning |
| --- | --- |
| `valid` | Locator + caption (+ year/court when asserted) match a real authority |
| `likely_valid` | Soft confirm (antique reporter, whitespace variant, etc.) |
| `name_mismatch` | Locator real; asserted caption is not that case |
| `page_mismatch` | Volume/reporter/parties OK; first page wrong |
| `implausible` | Impossible volume / series / reporter shape |
| `not_in_corpus` / `not_covered` | No match / authority class not covered |
| `unverified` / `error` | Cannot decide |

### GoodLaw on candidates

```json
"goodLaw": {
  "status": "overruled",
  "negative": true,
  "unknown": false,
  "negativeTreatmentCount": 1,
  "basis": "â€¦"
}
```

| Field | Meaning |
| --- | --- |
| `negative` | Warn the user â€” questioned or worse |
| `status` | e.g. `overruled`, other negative statuses, or unknown |
| `unknown: true` | Not determined â€” **not** a clean bill of health |

For `overruled` rows in the answer key, a pass requires an Accept verdict **and** `goodLaw.negative === true` (or an overruled/negative status). Confirming without a treatment flag fails that row.

### Scoring bands

| Band | Meaning |
| --- | --- |
| **Accept** | Verdict in the rowâ€™s Accept list (+ GoodLaw when required) |
| **Partial** | Listed Partial â€” defensible for a limited checker |
| **Reject** | Affirmatively wrong |
| **Stance** | `must_confirm` / `must_decline` / `open` class match |

Full methodology: the [benchmark blog post](https://lawdiver.com/blog/citediver-5300-citation-benchmark).

## How to run against CiteDiver

1. Get a developer API key ([getting started](./getting-started.md)).
2. Batch cite strings from `5000citechecktest.json` into `POST /api/v1/citecheck/cite` (up to 50 per request).
3. Score each response against the matching answer-key row.

```bash
curl -s https://lawdiver.com/api/v1/citecheck/cite \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"citations":["Poole v. State, 846 So. 2d 370 (Ala. Crim. App. 2002)"]}'
```

## Related docs

- [Endpoints](./endpoints.md)
- [Recipes](./recipes.md)
- [Getting started](./getting-started.md)
- [CiteDiver](https://lawdiver.com/products/citediver) Â· [Caselaw API](https://lawdiver.com/products/api)
