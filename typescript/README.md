# LawDiver API — TypeScript / Node.js examples

**Primary language in this repository.** The official LawDiver docs also use TypeScript for the quickstart and recipes.

Requires **Node.js 18+** (native `fetch`, `FormData`, `Blob`).

## Setup

```bash
# from repo root
cp .env.example .env
# paste LAWDIVER_API_KEY=lt_live_...

cd typescript
npm install
```

## Run examples

```bash
npm run example:search
npm run example:cite-check
npm run example:retrieve
npm run example:document   # needs path to a PDF/DOCX as argv
npm run example:agent
npm run example:usage
npm run example:good-law
```

## Use the client in your app

```typescript
import { LawDiverClient } from "./src/client.js";

const client = new LawDiverClient();

const found = await client.search({
  query: "qualified immunity",
  jurisdiction: { type: "federal_circuit", circuit: "11" },
  limit: 5,
});
```

Build declarations:

```bash
npm run build
```

## Files

| Path | Purpose |
| --- | --- |
| `src/client.ts` | Thin REST client |
| `src/types.ts` | Request/response types |
| `examples/*.ts` | Runnable demos |
