# Testing the API

Public **5,300-cite** benchmark with **four accuracy categories**. Files: [`docs/benchmarks/citecheck/`](./benchmarks/citecheck/).

**Blog:** [5,300-Citation Benchmark](https://lawdiver.com/blog/citediver-5300-citation-benchmark)

## Scoring

| Category | Covers | Bar |
| --- | --- | --- |
| **One** | Fabrications + overruled / negative treatment | **100%** |
| **Two** | Clean cites to real cases (not overruled) | **99%** |
| **Three** | Mangled real cites — identify, flag, suggest fix | **90%** |
| **Four** | No honest high-probability call | Unscored |

Cat2 miss = affirmatively rejecting a clean cite. Cat1 miss = false-confirming a fabrication, or confirming overruled law without reporting treatment.

## Files

| File | Role |
| --- | --- |
| [5000citechecktest.md](./benchmarks/citecheck/5000citechecktest.md) / [.json](./benchmarks/citecheck/5000citechecktest.json) | Cites only |
| [ANSWER-KEY.md](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md) / [.json](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json) | Answers |

## Outputs

Verdicts: `valid`, `likely_valid`, `name_mismatch`, `page_mismatch`, `implausible`, `not_in_corpus`, `unverified`, …

When a case resolves, also report **overruling / negative treatment**. Field names vary by product; LawDiver puts them on each candidate (`status`, `negative`, `basis`, …).

```bash
curl -s https://lawdiver.com/api/v1/citecheck/cite \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"citations":["Poole v. State, 846 So. 2d 370 (Ala. Crim. App. 2002)"]}'
```

[Getting started](./getting-started.md) · [Endpoints](./endpoints.md)
