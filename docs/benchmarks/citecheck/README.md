# Cite-check benchmark (combined 5,350)

Public **test inputs** and **answer key** for one cite-check suite. The combined file is the prior 5,300 plus 50 CLR-gap cites (`CLR-001` through `CLR-050`) appended on 2026-09-29. Those 50 are real cites absent from the August 2026 CourtListener bulk download. Score them as category 3 (clean real cites). A product that only loaded the bulk file fails them.

Scored in **six accuracy categories**:

| Cat | Covers | Bar |
| --- | --- | --- |
| 1 | Overruled / reversed | 100% |
| 2 | Fabricated / identity traps | 99.7% |
| 3 | Clean real cites | 99% |
| 4 | Mangled — Bluebook / form (easier) | 95% |
| 5 | Mangled — hard problems (recover + flag) | 80% |
| 6 | Unresolved | unscored |

See **[Testing the API](../testing-the-api.md)** and:

**[How Well Does Your Cite Checker Stack Up? LawDiver's 5,300-Citation Benchmark](https://lawdiver.com/blog/citediver-5300-citation-benchmark)**

| File | Role |
| --- | --- |
| `5000citechecktest.md` / `.json` | **5,350** cites only |
| `5000citechecktest-ANSWER-KEY.md` / `.json` | Graded answers (including overruled treatment requirements) |
| `clr-gap-50-citechecktest.md` / `.json` | The 50 CLR-gap cites alone |
| `clr-gap-50-citechecktest-ANSWER-KEY.md` / `.json` | Answer key for those 50 |

Report analyzed and correct counts per category. Keep Categories 4 and 5 separate. Mistake-level run artifacts are not published here.
