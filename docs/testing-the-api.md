# Testing the API

Public **5,300-cite** benchmark with **five accuracy categories**. One combined suite (inputs + answer key) -- not separate exams.

**Blog / scoreboard:** [5,300-Citation Benchmark](https://lawdiver.com/blog/citediver-5300-citation-benchmark)

## Scoring categories

| Cat | Covers | Bar | How to score |
| --- | --- | --- | --- |
| **1** | Overruled / reversed authorities | **100%** | Confirm the cite **and** report overruling / negative treatment. Silent confirm fails. |
| **2** | Fabricated / identity traps | **99.7%** | Must not hard-confirm. Bar is 99.7% (not 100%): adversarial suites can invent rare traps that are uncommon in real briefs. |
| **3** | Clean cites to real cases | **99%** | Must not call a good cite bad (false Reject). |
| **4** | Mangled real cites | **90%** | Recover the intended case **and** flag the problem (candidate / correction). Bare decline without recovery fails. |
| **5** | No honest resolution | Unscored | e.g. bare `Id.` -- say so; no vanity percentage. |

Report **analyzed** and **correct** counts per category (exclude timeouts from the denominator). Publish Category 1-4 rates, not one blended percentage.

## Files

| File | Role |
| --- | --- |
| [5000citechecktest.md](./benchmarks/citecheck/5000citechecktest.md) / [.json](./benchmarks/citecheck/5000citechecktest.json) | Cites only (5,300) |
| [ANSWER-KEY](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md) / [.json](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json) | Graded answers (including overruled treatment requirements) |

Mistake-level analysis stays private (LawDiver internal). Public scoreboard: see the blog.

## Outputs

Identity verdicts (`valid`, `name_mismatch`, ...) plus **overruling / negative treatment** when a case resolves.

```bash
curl -s https://lawdiver.com/api/v1/citecheck/cite \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"citations":["Poole v. State, 846 So. 2d 370 (Ala. Crim. App. 2002)"]}'
```

[Getting started](./getting-started.md) · [Endpoints](./endpoints.md)
