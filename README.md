# LawDiver Caselaw API — Examples & Integration Guide

> **Build legal research, cite-checking, and caselaw retrieval into your own apps** using the same verified U.S. caselaw corpus that powers [LawDiver](https://lawdiver.com) — **10M+ federal and state opinions**, good-law signals, Bluebook citations, and opinion PDFs.

**Official API docs:** [https://lawdiver.com/docs/api](https://lawdiver.com/docs/api)  
**Base URL:** `https://lawdiver.com/api/v1`  
**Auth:** Bearer API key (`lt_live_…`)  
**Status:** Free during rollout · Plain REST · JSON (PDF where noted)

---

## Languages in this repository

| Language | Role | Folder |
| --- | --- | --- |
| **TypeScript / Node.js** | **Primary** — matches the official LawDiver quickstart and recipes | [`typescript/`](./typescript/) |
| **Python 3** | **Also included** — same endpoints, idiomatic `httpx` client | [`python/`](./python/) |
| **cURL / shell** | Language-agnostic recipes for any stack | [`curl/`](./curl/) |
| **PowerShell** | Windows-native HTTP recipes | [`curl/powershell.md`](./curl/powershell.md) |

The LawDiver API is **language-agnostic REST**. You do not need an SDK — any HTTP client works. This repo ships thin clients and copy-paste examples so you can integrate quickly in TypeScript or Python.

```bash
# Discover the surface (no key required)
curl https://lawdiver.com/api/v1
```

---

## Why the LawDiver API is awesome

- **Same corpus as the product** — Case search, cite check, and PDF retrieval run over the verified caselaw that powers CaseDiver on lawdiver.com, not a thin scrape.
- **Built for real legal workflows** — Citation validation with Bluebook forms, good-law / negative treatment, parallel reporters, and did-you-mean — not just keyword search.
- **Agent-ready search** — One `POST /search` can return analysis cards, opinion excerpts, and good-law reports so LLM tools can reason without a second hop.
- **Document cite check** — Upload a brief (PDF/DOCX), get a job, poll, download a report PDF with verdicts and exhibit pages.
- **Honest uncertainty** — `likely_valid`, `corpusCaveat`, and `did_you_mean` refuse silent auto-corrections that would invent authority.
- **Plain REST** — Bearer auth, JSON envelopes, `requestId` on every response, idempotency keys on the hot paths, rate-limit headers you can actually use.
- **Free during rollout** — Usage is ledgered so you can see volume now; pricing policy is published on the discovery document when it changes.
- **MCP + web** — Same platform also offers CaseDiver (free public search), CiteDiver, StatDiver, and an MCP server for agent tooling.

---

## What LawDiver is (the app)

[**LawDiver**](https://lawdiver.com) is a U.S. legal research and workflow platform.

### CaseDiver — free caselaw search for everyone

[CaseDiver](https://lawdiver.com/casediver) lets citizens, self-represented litigants, students, journalists, and lawyers search **more than 10 million** federal and state court opinions, read full text, and download official PDFs — **no subscription and no login** for core search. Coverage includes the U.S. Supreme Court, federal courts of appeals, federal district courts, and appellate / supreme courts of all fifty states. The citation graph holds tens of millions of resolved opinion-to-opinion edges; high courts land in a daily feed.

Search modes include citation, case name, boolean/keyword (with connectors like `AND`, `OR`, `/s`, `w/5`), semantic (issue descriptions), and hybrid. Jurisdiction scoping mirrors what practitioners actually cite (for example one state plus related federal).

### CiteDiver, StatDiver, MCP, and the API

Beyond free search, LawDiver offers **CiteDiver** (citation workflows), **StatDiver**, a **caselaw API** (this repo), **MCP** for tool-using agents, and bulk/data products. The API is the programmatic surface over the same verified corpus — ideal for law-firm tools, legaltech products, research assistants, compliance pipelines, and AI agents that must ground answers in real opinions.

> LawDiver is offered to users located in the United States. It is **not legal advice**. Westlaw and Lexis are trademarks of their respective owners; LawDiver is not affiliated with either.

---

## What the API can do

| Capability | Endpoint(s) | Typical use |
| --- | --- | --- |
| **Case search** | `POST /search` | Issue research scoped to jurisdiction; optional AI case card + opinion text + good-law |
| **Jurisdictions reference** | `GET /jurisdictions` | Authoritative state/circuit codes and example payloads |
| **Cite check (citations)** | `POST /citecheck/cite` | Validate 1–50 cites; Bluebook form; good-law; hallucination-shaped `name_mismatch` |
| **Cite check (document)** | `POST /citecheck/document` + jobs | Upload brief → async report PDF |
| **Citation resolve** | `POST /citations/resolve` | Map cite/name → up to 5 candidates (no PDF) |
| **Case retrieve** | `POST /cases/retrieve` | Resolve → deliver one case or did-you-mean round trip |
| **Case metadata** | `GET /cases/:id` | Metadata for opinion or cluster id |
| **Case batch** | `POST /cases/batch` | Up to 50 ids in one call |
| **Good-law detail** | `GET /cases/:id/good-law` | Status + negative treatment citations |
| **Cited by** | `GET /cases/:id/cited-by` | Paginated citing cases |
| **Case PDF** | `GET /cases/:id/pdf` | Opinion PDF + processing/analysis appendix |
| **Usage ledger** | `GET /usage` | Volume by operation + your rate limits |

Full field-level reference: [docs/endpoints.md](./docs/endpoints.md) · Canonical source: [lawdiver.com/docs/api](https://lawdiver.com/docs/api).

---

## Get an API key (5 minutes)

1. **Sign up** at [lawdiver.com](https://lawdiver.com) and **verify your email**.
2. Open **[Account → API keys](https://lawdiver.com/account/api-keys)**.
3. **Create a key**. It is shown **exactly once** (only a SHA-256 hash is stored — it cannot be re-displayed).
4. Store it as an environment variable on your **server**:

```bash
# recommended for this repo
export LAWDIVER_API_KEY=lt_live_xxxxxxxxxxxxxxxxxxxx

# official docs also use:
export LAWTOOLS_API_KEY=lt_live_xxxxxxxxxxxxxxxxxxxx
```

5. Send it on every authenticated request:

```http
Authorization: Bearer lt_live_xxxxxxxxxxxxxxxxxxxx
# or
X-API-Key: lt_live_xxxxxxxxxxxxxxxxxxxx
```

**Never** put a key in browser JavaScript, a mobile app bundle, or a public repo. Call LawDiver from your backend and proxy results to the client. If a key is lost, revoke it and issue a new one — revocation applies on the next request.

More detail: [docs/getting-started.md](./docs/getting-started.md) · [docs/authentication.md](./docs/authentication.md).

---

## Quickstart

### 1. Clone and configure

```bash
git clone https://github.com/dumpsticks/LawDiver_api.git
cd LawDiver_api
cp .env.example .env
# edit .env and paste your key
```

### 2a. TypeScript (Node 18+)

```bash
cd typescript
npm install
npm run example:search
```

Minimal call:

```typescript
import { LawDiverClient } from "./src/client.js";

const client = new LawDiverClient(); // reads LAWDIVER_API_KEY

const found = await client.search({
  query: "promissory estoppel reliance damages",
  jurisdiction: { type: "one_state_plus_federal", state: "NY" },
  limit: 5,
});

for (const r of found.results) {
  console.log(r.caseName, "—", r.citation);
}
```

### 2b. Python 3.10+

```bash
cd python
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
python examples/01_search.py
```

Minimal call:

```python
from lawdiver import LawDiverClient

client = LawDiverClient()  # reads LAWDIVER_API_KEY

found = client.search(
    query="promissory estoppel reliance damages",
    jurisdiction={"type": "one_state_plus_federal", "state": "NY"},
    limit=5,
)

for r in found["results"]:
    print(r["caseName"], "—", r.get("citation"))
```

### 2c. cURL

```bash
curl -X POST https://lawdiver.com/api/v1/search \
  -H "Authorization: Bearer $LAWDIVER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "qualified immunity excessive force",
    "jurisdiction": { "type": "federal_circuit", "circuit": "11" },
    "limit": 5
  }'
```

See [`curl/examples.sh`](./curl/examples.sh) for the full cookbook.

---

## Repository map

```
LawDiver_api/
├── README.md                 ← you are here (overview + SEO guide)
├── docs/                     ← deep guides (auth, endpoints, errors, recipes)
├── typescript/               ← TypeScript client + runnable examples
├── python/                   ← Python client + runnable examples
├── curl/                     ← shell recipes
└── .env.example              ← key template (copy to .env)
```

| Doc | Contents |
| --- | --- |
| [docs/getting-started.md](./docs/getting-started.md) | Signup, keys, first successful call, env vars |
| [docs/about-lawdiver.md](./docs/about-lawdiver.md) | Product overview for SEO / product pages |
| [docs/why-lawdiver-api.md](./docs/why-lawdiver-api.md) | Value proposition for builders |
| [docs/authentication.md](./docs/authentication.md) | Headers, key hygiene, revocation |
| [docs/endpoints.md](./docs/endpoints.md) | Endpoint catalog with request/response notes |
| [docs/error-handling.md](./docs/error-handling.md) | Stable error codes, did-you-mean, retries |
| [docs/recipes.md](./docs/recipes.md) | End-to-end patterns (agents, briefs, idempotency) |

---

## How the API works (mental model)

1. **Authenticate** with a server-side Bearer key.
2. **Every JSON response** includes `requestId` (quote it in support) and usually a `usage` block (units recorded even while free).
3. **Search requires jurisdiction** — unscoped national search is almost never what you want.
4. **Cite check never silently “fixes” a cite** — `likely_valid` returns candidates; you (or a human) pick.
5. **Retrieve ambiguity is `200` + `did_you_mean`**, not an error — present candidates, call again with `caseId`.
6. **Idempotency-Key** is honored on `POST /search`, `POST /citecheck/cite`, and `POST /cases/retrieve` for safe retries after timeouts.
7. **Document cite check is async** — upload → poll job → download report PDF.
8. **PDFs are re-rendered** (good-law changes) — cache bytes yourself when you need safe retry; they do not use idempotency keys.
9. **Rate limits** arrive as `X-RateLimit-*`; on `429`, honor `Retry-After`.
10. **Branch on `error.code`**, not message text — codes are stable.

---

## Example gallery

| Example | TypeScript | Python |
| --- | --- | --- |
| Case search | [`typescript/examples/01-search.ts`](./typescript/examples/01-search.ts) | [`python/examples/01_search.py`](./python/examples/01_search.py) |
| Cite check citations | [`02-cite-check.ts`](./typescript/examples/02-cite-check.ts) | [`02_cite_check.py`](./python/examples/02_cite_check.py) |
| Case retrieve + did-you-mean | [`03-retrieve.ts`](./typescript/examples/03-retrieve.ts) | [`03_retrieve.py`](./python/examples/03_retrieve.py) |
| Document cite check | [`04-document-cite-check.ts`](./typescript/examples/04-document-cite-check.ts) | [`04_document_cite_check.py`](./python/examples/04_document_cite_check.py) |
| Agent-oriented search | [`05-agent-search.ts`](./typescript/examples/05-agent-search.ts) | [`05_agent_search.py`](./python/examples/05_agent_search.py) |
| Usage + discovery | [`06-usage.ts`](./typescript/examples/06-usage.ts) | [`06_usage.py`](./python/examples/06_usage.py) |
| Good-law + cited-by | [`07-good-law-cited-by.ts`](./typescript/examples/07-good-law-cited-by.ts) | [`07_good_law_cited_by.py`](./python/examples/07_good_law_cited_by.py) |

---

## Pricing, limits, and support

- **Free during the current rollout.** Usage rows still appear (`costCents` may be `0`).
- Default-ish ceiling: on the order of **60 requests/minute** per account (confirm via `GET /usage` → `yourPricing.rateLimitPerMinute`).
- Need a higher ceiling or another key? Ask — those are per-account settings, not plan tiers.
- Support: include the response **`requestId`** so LawDiver can jump to the exact ledger/log row.

Canonical policy always wins: [API docs](https://lawdiver.com/docs/api) and `GET /api/v1`.

---

## SEO / product keywords

LawDiver caselaw API · free Westlaw alternative API · U.S. court opinions API · case citation checker API · Bluebook citation validation · good law citator API · legal research API for developers · TypeScript caselaw client · Python legal research SDK examples · brief cite check PDF · federal and state opinion search API · MCP legal tools · CaseDiver API integration

---

## Disclaimer

Examples in this repository are community-oriented integration samples. They are **not legal advice**. Always verify authority against primary sources for any filing or advice. See LawDiver [Terms](https://lawdiver.com/terms) and the official [API documentation](https://lawdiver.com/docs/api).

---

## Links

- [LawDiver home](https://lawdiver.com)
- [API documentation](https://lawdiver.com/docs/api)
- [CaseDiver](https://lawdiver.com/casediver)
- [Search connectors](https://lawdiver.com/docs/search-connectors)
- [API keys](https://lawdiver.com/account/api-keys)
- [MCP](https://lawdiver.com) (product nav)
