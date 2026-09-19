# Testing the API

This section is LawDiver’s **public cite-check benchmark**: one combined suite of **5,300** citation strings, plus the graded answer key — scored in **four accuracy categories**.

Files: [`docs/benchmarks/citecheck/`](./benchmarks/citecheck/). The main app repo is private; **this is the public copy**.

**Product write-up:** [How Well Does Your Cite Checker Stack Up? LawDiver's 5,300-Citation Benchmark](https://lawdiver.com/blog/citediver-5300-citation-benchmark)

## Four-category scoring (lead with this)

| Category | What it covers | Required bar |
| --- | --- | --- |
| **One** | Fabrications + **overruled** / negative-treatment authorities | **100%** Accept |
| **Two** | Proper cites to real cases that are not overruled | **99%** Accept |
| **Three** | Real cases, not overruled, but **mangled** cites (Bluebook / transcription / near-miss) — identify case, report problem, suggest form | **90%** Accept ∪ Partial |
| **Four** | Too incomplete / ambiguous for a high-probability call | **Unscored** — honest unresolved |

Category One is the most important: missing a fabrication or staying silent on an overruled case is dangerous. Category Two protects trust (false alarms on clean cites waste time). Category Three is the hardest differentiator — recovering mangled form among many plausible resolutions. Category Four must not be forced into a vanity percentage.

Full rationale and CiteDiver numbers: the [benchmark blog post](https://lawdiver.com/blog/citediver-5300-citation-benchmark).

## Files (one combined suite)

| File | Contents |
| --- | --- |
| [benchmarks/citecheck/5000citechecktest.md](./benchmarks/citecheck/5000citechecktest.md) | **5,300** cite strings only |
| [benchmarks/citecheck/5000citechecktest.json](./benchmarks/citecheck/5000citechecktest.json) | Machine twin |
| [benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md) | Graded answers |
| [benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json) | Machine twin |

## Possible outputs

`POST https://lawdiver.com/api/v1/citecheck/cite` returns a **verdict** per unit and optional **candidates**.

### Verdicts

| Verdict | Meaning |
| --- | --- |
| `valid` | Locator + caption (+ year/court when asserted) match a real authority |
| `likely_valid` | Soft confirm |
| `name_mismatch` | Locator real; asserted caption is not that case |
| `page_mismatch` | Volume/reporter/parties OK; first page wrong |
| `implausible` | Impossible volume / series / shape |
| `not_in_corpus` / `not_covered` | No match / class not covered |
| `unverified` / `error` | Cannot decide |

### Overruling / negative treatment

When a case resolves, the product must also indicate whether the authority has been **overruled** or carries other **negative treatment**. Confirming the locator while omitting that signal fails Category One.

LawDiver exposes treatment on each candidate, for example:

```json
{
  "status": "overruled",
  "negative": true,
  "unknown": false,
  "basis": "…"
}
```

`unknown` means not determined — not a clean bill of health. Other checkers should expose an equivalent signal under whatever field names they use.

### Scoring bands

| Band | Meaning |
| --- | --- |
| **Accept** | Verdict in the row’s Accept list (+ treatment surfaced when the row requires overruling detection) |
| **Partial** | Listed Partial — counts toward Category Three’s 90% bar |
| **Reject** | Affirmatively wrong |
| **Unresolved** | Category Four / honest cannot-decide |

## How to run

1. Developer API key — [getting started](./getting-started.md).
2. Batch cites from `5000citechecktest.json` into `POST /api/v1/citecheck/cite` (up to 50 / request).
3. Score with the answer key **and** report Category One–Three rates.

```bash
curl -s https://lawdiver.com/api/v1/citecheck/cite \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"citations":["Poole v. State, 846 So. 2d 370 (Ala. Crim. App. 2002)"]}'
```

## Related

- [Endpoints](./endpoints.md) · [Recipes](./recipes.md) · [Getting started](./getting-started.md)
- [CiteDiver](https://lawdiver.com/products/citediver) · [Caselaw API](https://lawdiver.com/products/api)
