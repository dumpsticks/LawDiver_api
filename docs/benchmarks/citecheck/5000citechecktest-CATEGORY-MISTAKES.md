# CiteCheck 5,300 — Category mistakes and suggested fixes

Generated 2026-09-19T21:16:47.340Z from run `2026-09-18T23:27:03.792Z`.

## Scoreboard (renumbered)

| Cat | Name | Bar | Analyzed | Correct | Accuracy | Timeouts excluded |
|---|---|---|---:|---:|---:|---:|
| 1 | Overruled / reversed | 100% | 187 | 187 | **100.0%** | 0 |
| 2 | Fabricated | 100% | 2401 | 2397 | **99.8%** | 54 |
| 3 | Clean real cites | 99% | 2167 | 2161 | **99.7%** | 24 |
| 4 | Mangled real cites | 90% | 349 | 317 | **90.8%** | 71 |
| 5 | Unresolved | — | 47 | — | unscored | — |

### Why Cat 4 looked “too easy” before

Old scoring counted any answer-key **Accept** as success. For many mangle rows, Accept is only a correct *decline* (`not_in_corpus` / `name_mismatch`) **without** recovering the intended case. Cat 4 now requires **recovery**: a candidate or corrected cite **plus** a problem flag (Bluebook-only noise still counts as a confirm). That is why Cat 4 (~91%) sits below Cats 1–3, as expected for the hardest category. 71 timeouts were excluded from the denominator.

---

## Category 1 — Overruled / reversed

Mistakes: **0** (187 / 187 correct).

_None._



### Suggested fixes

1. Always return overruling / negative-treatment status on every resolved candidate — never a silent confirm.
2. Treat treatment `unknown` as incomplete, not as good law.
3. Keep identity verdict and treatment as separate API fields so callers can require both.

---

## Category 2 — Fabricated

Mistakes: **4** (2397 / 2401 correct).

False hard-confirms: `valid` when the caption does not belong to that locator (neighbor-page / identity traps).

| # | Id | Family | Observed | Accept | Cite |
|---|---|---|---|---|---|
| 1 | BANK-WY-06 | real_neighbor_page | valid | name_mismatch | Vaughn v. State, 962 P.2d 153 (1998) |
| 2 | BANK-SD-07 | real_neighbor_page | valid | name_mismatch | Permann v. South Dakota Department of Labor, Unemployment Insurance Division, 411 N.W.2d 108 (1987) |
| 3 | BANK-LA-06 | real_neighbor_page | valid | name_mismatch | State Ex Rel. Glover v. State, 660 So. 2d 1187 (1995) |
| 4 | JUR-0003-H1 | close_hallucination | likely_valid | name_mismatch | Halcyon Data Systems v. Delacroix, 606 U.S. 185 (2) |

#### BANK-WY-06
- **Cite:** Vaughn v. State, 962 P.2d 153 (1998)
- **Family / stance:** real_neighbor_page / must_decline
- **Observed:** `valid` (band `reject`)
- **Accept:** `name_mismatch`
- **Resolved as:** Hodgins v. State
- **Corrected:** Hodgins v. State, 962 P.2d 153 (Wyo. 1998)
- **Why (key):** 962 P.2d 153 is Hodgins v. State (1998), not Vaughn v. State. (Caption of one case pasted onto a real, different case in the same volume.)
- **API explanation:** This citation resolves to a case in the corpus. The cite is highly likely correct, but is at slight variance from Bluebook form. Preferred form: Hodgins v. State, 962 P.2d 153 (Wyo. 1998) No negative treatment was found in the citation graph.
#### BANK-SD-07
- **Cite:** Permann v. South Dakota Department of Labor, Unemployment Insurance Division, 411 N.W.2d 108 (1987)
- **Family / stance:** real_neighbor_page / must_decline
- **Observed:** `valid` (band `reject`)
- **Accept:** `name_mismatch`
- **Resolved as:** Lee v. South Dakota Department of Health
- **Corrected:** Lee v. South Dakota Department of Health, 411 N.W.2d 108 (S.D. 1987)
- **Why (key):** 411 N.W.2d 108 is Lee v. South Dakota Department of Health (1987), not Permann v. South Dakota Department of Labor, Unemployment Insurance Division. (Caption of one case pasted onto a real, different case in the same volume.)
- **API explanation:** This citation resolves to a case in the corpus. The cite is highly likely correct, but is at slight variance from Bluebook form. Preferred form: Lee v. South Dakota Department of Health, 411 N.W.2d 108 (S.D. 1987) Good-law status has not yet been determined for this case; no negative treatment found.
#### BANK-LA-06
- **Cite:** State Ex Rel. Glover v. State, 660 So. 2d 1187 (1995)
- **Family / stance:** real_neighbor_page / must_decline
- **Observed:** `valid` (band `reject`)
- **Accept:** `name_mismatch`
- **Resolved as:** Hyland v. State
- **Corrected:** Hyland v. State, 660 So. 2d 1187 (Fla. Dist. Ct. App. 1995)
- **Why (key):** 660 So. 2d 1187 is Adams v. State (1995), not State Ex Rel. Glover v. State. (Caption of one case pasted onto a real, different case in the same volume.)
- **API explanation:** This citation resolves to a case in the corpus. The cite is highly likely correct, but is at slight variance from Bluebook form. Preferred form: Hyland v. State, 660 So. 2d 1187 (Fla. Dist. Ct. App. 1995) Good-law status has not yet been determined for this case; no negative treatment found.
#### JUR-0003-H1
- **Cite:** Halcyon Data Systems v. Delacroix, 606 U.S. 185 (2)
- **Family / stance:** close_hallucination / must_decline
- **Observed:** `likely_valid` (band `other`)
- **Accept:** `name_mismatch`
- **Resolved as:** Esteras v. United States
- **Why (key):** Locator real; caption false → name_mismatch. (Invented parties on a real occupied locator.)
- **API explanation:** The reporter key matches a corpus record that also carries a different first page in the same reporter volume. That is internally inconsistent, so this is treated as a possible match rather than proof.

### Suggested fixes

1. **Caption gate:** if parties are asserted and do not match the resolved opinion (after normalization), emit `name_mismatch` — never `valid`.
2. **Neighbor-page traps:** an occupied locator for a *different* case must not upgrade to `valid` because the Bluebook string “looks close.”
3. Prefer `name_mismatch` + corrected caption over confirming the locator alone.
4. Add permanent regressions for every `real_neighbor_page` / `close_hallucination` row whose Accept is `name_mismatch`.

---

## Category 3 — Clean real cites

Mistakes: **6** hard Rejects (2161 / 2167 correct).

| # | Id | Family | Observed | Accept | Cite |
|---|---|---|---|---|---|
| 1 | JUR-2038-P | perfect | not_in_corpus | valid | Rud v. Haleem, 48 Pa. D. & C.5th 218 (1-38-481) |
| 2 | JUR-2036-P | perfect | not_in_corpus | valid | Commonwealth v. Farris, 48 Pa. D. & C.5th 326 (1-38-3309) |
| 3 | JUR-1664-P | perfect | not_in_corpus | valid | Lizik v. Lizik, 3 Pa. D. & C.5th 484 (1-14-17990) |
| 4 | JUR-1568-P | perfect | not_in_corpus | valid | J.J. v. M.C., 37 Pa. D. & C.5th 272 (1-8-6802) |
| 5 | JUR-2039-P | perfect | not_in_corpus | valid | Myers v. RB & AK Properties, 44 Pa. D. & C.5th 430 (1-38-14170) |
| 6 | JUR-2214-P | perfect | not_in_corpus | valid | Commonwealth v. McConnell, 35 Pa. D. & C.2d 541 (1-50-17230) |

#### JUR-2038-P
- **Cite:** Rud v. Haleem, 48 Pa. D. & C.5th 218 (1-38-481)
- **Family / stance:** perfect / must_confirm
- **Observed:** `not_in_corpus` (band `reject`)
- **Accept:** `valid`
- **Why (key):** Real case 48 Pa. D. & C.5th 218. (Fully correct caption + locator + court/year.)
- **API explanation:** No case in the corpus carries this citation, and no case with a similar name or nearby page was found.
#### JUR-2036-P
- **Cite:** Commonwealth v. Farris, 48 Pa. D. & C.5th 326 (1-38-3309)
- **Family / stance:** perfect / must_confirm
- **Observed:** `not_in_corpus` (band `reject`)
- **Accept:** `valid`
- **Why (key):** Real case 48 Pa. D. & C.5th 326. (Fully correct caption + locator + court/year.)
- **API explanation:** No case in the corpus carries this citation, and no case with a similar name or nearby page was found.
#### JUR-1664-P
- **Cite:** Lizik v. Lizik, 3 Pa. D. & C.5th 484 (1-14-17990)
- **Family / stance:** perfect / must_confirm
- **Observed:** `not_in_corpus` (band `reject`)
- **Accept:** `valid`
- **Why (key):** Real case 3 Pa. D. & C.5th 484. (Fully correct caption + locator + court/year.)
- **API explanation:** No case in the corpus carries this citation, and no case with a similar name or nearby page was found.
#### JUR-1568-P
- **Cite:** J.J. v. M.C., 37 Pa. D. & C.5th 272 (1-8-6802)
- **Family / stance:** perfect / must_confirm
- **Observed:** `not_in_corpus` (band `reject`)
- **Accept:** `valid`
- **Why (key):** Real case 37 Pa. D. & C.5th 272. (Fully correct caption + locator + court/year.)
- **API explanation:** The reporter citation did not resolve to any case in the corpus, and no sufficiently close case-name match was found to suggest an alternative. An unrecognized or fabricated reporter series is not treated as a soft name match.
#### JUR-2039-P
- **Cite:** Myers v. RB & AK Properties, 44 Pa. D. & C.5th 430 (1-38-14170)
- **Family / stance:** perfect / must_confirm
- **Observed:** `not_in_corpus` (band `reject`)
- **Accept:** `valid`
- **Why (key):** Real case 44 Pa. D. & C.5th 430. (Fully correct caption + locator + court/year.)
- **API explanation:** No case in the corpus carries this citation, and no case with a similar name or nearby page was found.
#### JUR-2214-P
- **Cite:** Commonwealth v. McConnell, 35 Pa. D. & C.2d 541 (1-50-17230)
- **Family / stance:** perfect / must_confirm
- **Observed:** `not_in_corpus` (band `reject`)
- **Accept:** `valid`
- **Why (key):** Real case 35 Pa. D. & C.2d 541. (Fully correct caption + locator + court/year.)
- **API explanation:** No case in the corpus carries this citation, and no case with a similar name or nearby page was found.

### Suggested fixes

1. Close coverage gaps (`not_in_corpus` on real exotic reporters such as Pa. D. & C.).
2. Prefer `likely_valid` + candidates over hard reject when a fuzzy / known-citation match exists.
3. Track Reject-band clean cites as trust regressions.

---

## Category 4 — Mangled (recovery misses)

Mistakes: **32** of 349 analyzed (71 timeouts not scored).

| # | Id | Family | Observed | Accept | Cite |
|---|---|---|---|---|---|
| 1 | ANAT-A351 | severe_mangle | implausible | implausible | Ballard v. Uribe, 564 Cal. 3d 41 (Cal. 1986) |
| 2 | ANAT-A349 | severe_mangle | not_covered | not_covered | Waffle House, Inc. v. Williams, 3l3 S.W.3d 796 (Tex. 2010) |
| 3 | ANAT-A343 | severe_mangle | not_covered | not_covered | Geiserman v. MacDonald, 893 F.2d (5th Cir. 1990) |
| 4 | ANAT-A334 | severe_mangle | implausible | implausible | Dalton v. Educ. Testing Serv., 6634 N.E.2d 289 (N.Y. App. Div. 1995) |
| 5 | ANAT-A316 | severe_mangle | not_covered | not_covered | Yusuf v. Vassar Coll., 35 F.3d (2d Cir. 1994) |
| 6 | SEED-UT-N1-M1 | mild_mangle | not_in_corpus | page_mismatch, not_in_corpus, name_mismatch | Hill v. Hill, 232 Utah Adv. Rep. 61 (Utah 1994) |
| 7 | ANAT-A322 | severe_mangle | implausible | implausible | Feltmeier v. Feltmeier, 7984 N.E.2d 75 (Ill. 2003) |
| 8 | ANAT-A347 | severe_mangle | implausible | implausible | Kamen v. Am. Tel. & Tel. Co., 1006 F.2d 791 (2d Cir. 1986) |
| 9 | ANAT-A346 | severe_mangle | not_covered | not_covered | Mobil Oil Corp. v. Ellender, 96B S.W.2d 9l7 (Tex. 1998) |
| 10 | ANAT-A299 | severe_mangle | implausible | implausible | Bowden v. Ward, 913 S.W.3d 27 (Tenn. 2000) |
| 11 | BANK-OH-09 | transposed_volume | not_in_corpus | likely_valid, not_in_corpus, not_covered | State v. Thompkins, 87 Ohio St. 3d 380 (1997) |
| 12 | BANK-WV-09 | transposed_volume | not_in_corpus | likely_valid, not_in_corpus, not_covered | In Re Cecil T., 822 W. Va. 89 (2011) |
| 13 | ANAT-A308 | severe_mangle | implausible | implausible | Forrest v. Jewish Guild for the Blind, 295 N.Y.3d 3 (N.Y. 2004) |
| 14 | BANK-IA-08 | transposed_volume | not_in_corpus | likely_valid, not_in_corpus, not_covered | In Re P.L., 877 N.W.2d 33 (2010) |
| 15 | SEED-MS-N1-M1 | mild_mangle | not_in_corpus | page_mismatch, not_in_corpus, name_mismatch | Ex Parte Newton, 895 So. 2d 815 (Miss. 2004) |
| 16 | ANAT-A311 | severe_mangle | implausible | implausible | English v. Fischer, 6604 S.W.2d 521 (Tex. 1983) |
| 17 | BANK-RI-08 | transposed_volume | not_in_corpus | likely_valid, not_in_corpus, not_covered | Accent Store Design, Inc. v. Marathon House, Inc., 476 A.2d 1223 (1996) |
| 18 | SEED-MN-N1-M1 | mild_mangle | not_in_corpus | page_mismatch, not_in_corpus, name_mismatch | Parranto Bros., 425 N.W.2d 558 (Minn. 1988) |
| 19 | TRICK-046 | mild_mangle | not_covered | not_covered, unverified, error, likely_valid | Id. at 681. |
| 20 | ANAT-A333 | severe_mangle | not_covered | not_covered | Wheeler v. Green, 157 S.W.3d (Tex. 2005) |
| 21 | SEED-MA-N0-M1 | mild_mangle | not_in_corpus | page_mismatch, not_in_corpus, name_mismatch | In the Matter of Driscoll, 410 Mass. 659 (Mass. 1991) |
| 22 | ANAT-A313 | severe_mangle | not_covered | not_covered | CMH Homes v. Perez, 340 S.W.3d (Tex. 2011) |
| 23 | BANK-NM-08 | transposed_volume | not_in_corpus | likely_valid, not_in_corpus, not_covered | State v. Rojo, 621 N.M. 438 (1998) |
| 24 | ANAT-A297 | severe_mangle | not_covered | not_covered | Boyles v. Kerr, 855 593 (Tex. 1993) |
| 25 | SEED-IA-N0-M1 | mild_mangle | not_in_corpus | page_mismatch, not_in_corpus, name_mismatch | In The Interest Of P.l., 778 N.W.2d 44 (Iowa 2010) |
| 26 | TRICK-030 | severe_mangle | implausible | implausible, not_in_corpus | McDaniel v. CSX Transp., Inc., 9550 S.W.2d 257 (Tenn. 1997) |
| 27 | ANAT-A331 | severe_mangle | implausible | implausible | Licci v. Lebanese Canadian Bank SAL, 7327 F.3d 161 (2d Cir. 2013) |
| 28 | SEED-IA-N1-M1 | mild_mangle | not_in_corpus | page_mismatch, not_in_corpus, name_mismatch | In the Matter of Disciplinary Proceedings Against Batt, 778 N.W.2d 92 (Iowa 2010) |
| 29 | SEED-OH-M1 | mild_mangle | not_in_corpus | page_mismatch, not_in_corpus, name_mismatch | State v. Thompkins, 78 Ohio St. 3d 308 (Ohio 1997) |
| 30 | ANAT-A443 | structural | not_in_corpus | not_in_corpus | W. Cas. & Sur. Co. v. Brochu, 475 N.E.2d 873 (Ill. 1985) |
| 31 | ANAT-A451 | structural | not_in_corpus | not_in_corpus | Gilbert Frank Corp. v. Fed. Ins. Co., 70 N.Y.2d 967 (N.Y. 1988) |
| 32 | ANAT-A348 | severe_mangle | implausible | implausible | White v. Monsanto Co., 5859 So.2d 1205 (La. 1991) |


### Suggested fixes

1. On decline paths, still run near-miss recovery (same volume, party overlap, pin host) and return candidate + corrected form.
2. Do not stop at bare `not_in_corpus` when a nearby-page or transposed-volume hit exists.
3. Route Bluebook noise (confirm) separately from structural mangles (recover + warn).
4. Cut mangle-path timeouts — many Cat 4 gaps are `deadline_exceeded`, not wrong logic.

---

Machine twins: `5000citechecktest-CATEGORY-SCORE.json`, `5000citechecktest-CATEGORY-MISTAKES.json`.
