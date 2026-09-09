"""Example 02 — Cite check citations (Python)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lawdiver import LawDiverClient

with LawDiverClient() as client:
    payload = client.cite_check(citations=["570 U.S. 744", "999 F.3d 1"])

print(f"requestId: {payload['requestId']}")
print(f"units: {payload['usage']['quantity']}")
print()

for item in payload["results"]:
    print(f"{item['citationAsWritten']} → {item['verdict']}")
    if item.get("correctedCitation"):
        print(f"  Bluebook: {item['correctedCitation']}")
    if item.get("explanation"):
        print(f"  {item['explanation']}")
    if item.get("corpusCaveat"):
        print(f"  caveat: {item['corpusCaveat']}")
    if item["verdict"] in ("likely_valid", "name_mismatch"):
        for cand in item.get("candidates") or []:
            print(f"  candidate: {cand.get('bluebookCitation') or cand}")
    print()
