# Testing the API

Public **5,300-cite** benchmark with **five accuracy categories**.

**Blog:** [5,300-Citation Benchmark](https://lawdiver.com/blog/citediver-5300-citation-benchmark)

## Scoring

| Cat | Covers | Bar |
| --- | --- | --- |
| **1** | Overruled / reversed authorities | **100%** |
| **2** | Fabricated / identity traps | **99.7%** |
| **3** | Clean cites to real cases | **99%** |
| **4** | Mangled real cites (recover + flag) | **90%** |
| **5** | No honest resolution | Unscored |

Report **analyzed** and **correct** counts per category. Cat 4 requires recovering the intended case, not only declining a bad string.

## Files

| File | Role |
| --- | --- |
| [5000citechecktest.md](./benchmarks/citecheck/5000citechecktest.md) / [.json](./benchmarks/citecheck/5000citechecktest.json) | Cites only |
| [ANSWER-KEY](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.md) / [.json](./benchmarks/citecheck/5000citechecktest-ANSWER-KEY.json) | Answers |

Mistake analysis stays private (LawDiver internal run artifacts). Public scoreboard: see the blog.

## Outputs

Identity verdicts (`valid`, `name_mismatch`, …) plus **overruling / negative treatment** when a case resolves.

```bash
curl -s https://lawdiver.com/api/v1/citecheck/cite \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"citations":["Poole v. State, 846 So. 2d 370 (Ala. Crim. App. 2002)"]}'
```

[Getting started](./getting-started.md) · [Endpoints](./endpoints.md)
