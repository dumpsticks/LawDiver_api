# LawDiver API — Python examples

**Also included** alongside the primary TypeScript examples. Same endpoints, idiomatic `httpx` client.

Requires **Python 3.10+**.

## Setup

```bash
# from repo root
cp .env.example .env
# paste LAWDIVER_API_KEY=lt_live_...

cd python
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Add the package to `PYTHONPATH` (examples do this automatically when run from `python/`):

```bash
# from python/
python examples/01_search.py
```

Or install editable:

```bash
pip install -e .
```

## Run examples

```bash
python examples/01_search.py
python examples/02_cite_check.py
python examples/03_retrieve.py
python examples/04_document_cite_check.py path/to/brief.pdf
python examples/05_agent_search.py
python examples/06_usage.py
python examples/07_good_law_cited_by.py
```

## Use the client

```python
from lawdiver import LawDiverClient

with LawDiverClient() as client:
    found = client.search(
        query="promissory estoppel",
        jurisdiction={"type": "one_state_plus_federal", "state": "NY"},
        limit=5,
    )
    for r in found["results"]:
        print(r["caseName"], r.get("citation"))
```
