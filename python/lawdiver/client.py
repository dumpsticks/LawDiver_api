"""LawDiver caselaw API client (Python).

Docs: https://lawdiver.com/docs/api
Base: https://lawdiver.com/api/v1
"""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any, Mapping, MutableMapping, Optional

import httpx
from dotenv import load_dotenv

DEFAULT_BASE = "https://lawdiver.com/api/v1"


def _load_env() -> None:
    for candidate in (Path.cwd() / ".env", Path.cwd().parent / ".env", Path.cwd().parent.parent / ".env"):
        if candidate.is_file():
            load_dotenv(candidate, override=False)


def _resolve_api_key(explicit: Optional[str] = None) -> str:
    if explicit:
        return explicit
    _load_env()
    key = (os.environ.get("LAWDIVER_API_KEY") or os.environ.get("LAWTOOLS_API_KEY") or "").strip()
    if not key:
        raise RuntimeError(
            "Missing API key. Set LAWDIVER_API_KEY (or LAWTOOLS_API_KEY). "
            "Create a key at https://lawdiver.com/account/api-keys"
        )
    return key


class LawDiverApiError(Exception):
    def __init__(self, status: int, payload: Mapping[str, Any]):
        err = payload.get("error") or {}
        code = err.get("code", "unknown")
        message = err.get("message", "error")
        request_id = payload.get("requestId", "?")
        super().__init__(f"{code}: {message} ({request_id})")
        self.status = status
        self.code = code
        self.request_id = request_id
        self.payload = payload
        self.details = err.get("details")


class LawDiverClient:
    """Thin REST client for LawDiver API v1."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 60.0,
    ) -> None:
        self.api_key = _resolve_api_key(api_key)
        self.base_url = (base_url or os.environ.get("LAWDIVER_API_BASE") or DEFAULT_BASE).rstrip("/")
        self._client = httpx.Client(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=timeout,
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "LawDiverClient":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def discovery(self) -> Any:
        """Unauthenticated discovery document."""
        # Discovery does not need a key; still fine to send one.
        r = httpx.get(self.base_url, timeout=30.0)
        r.raise_for_status()
        return r.json()

    def search(
        self,
        *,
        query: str,
        jurisdiction: Mapping[str, Any],
        idempotency_key: Optional[str] = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"query": query, "jurisdiction": dict(jurisdiction), **kwargs}
        return self._request("POST", "/search", json=body, idempotency_key=idempotency_key)

    def jurisdictions(self) -> Any:
        return self._request("GET", "/jurisdictions")

    def cite_check(
        self,
        *,
        citation: Optional[str] = None,
        citations: Optional[list[str]] = None,
        idempotency_key: Optional[str] = None,
    ) -> dict[str, Any]:
        if (citation is None) == (citations is None):
            raise ValueError("Provide exactly one of citation= or citations=")
        body: dict[str, Any] = {"citation": citation} if citation is not None else {"citations": citations}
        return self._request("POST", "/citecheck/cite", json=body, idempotency_key=idempotency_key)

    def resolve_citation(self, query: str) -> Any:
        return self._request("POST", "/citations/resolve", json={"query": query})

    def retrieve(
        self,
        *,
        query: str,
        case_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"query": query}
        if case_id:
            body["caseId"] = case_id
        return self._request("POST", "/cases/retrieve", json=body, idempotency_key=idempotency_key)

    def case_metadata(self, case_id: str) -> Any:
        return self._request("GET", f"/cases/{case_id}")

    def case_batch(self, case_ids: list[str]) -> Any:
        return self._request("POST", "/cases/batch", json={"caseIds": case_ids})

    def good_law(self, case_id: str) -> Any:
        return self._request("GET", f"/cases/{case_id}/good-law")

    def cited_by(self, case_id: str, *, limit: int = 25, offset: int = 0) -> Any:
        return self._request("GET", f"/cases/{case_id}/cited-by", params={"limit": limit, "offset": offset})

    def case_pdf(self, case_id: str) -> bytes:
        r = self._client.get(f"/cases/{case_id}/pdf")
        if r.status_code >= 400:
            try:
                raise LawDiverApiError(r.status_code, r.json())
            except ValueError as exc:
                raise RuntimeError(f"PDF download failed: HTTP {r.status_code}") from exc
        return r.content

    def start_document_cite_check(self, file_path: str | Path) -> dict[str, Any]:
        path = Path(file_path)
        with path.open("rb") as f:
            r = self._client.post(
                "/citecheck/document",
                files={"file": (path.name, f)},
            )
        return self._parse(r)

    def document_job(self, job_id: str) -> dict[str, Any]:
        return self._request("GET", f"/citecheck/jobs/{job_id}")

    def document_report(self, job_id: str) -> bytes:
        r = self._client.get(f"/citecheck/jobs/{job_id}/report")
        if r.status_code >= 400:
            try:
                raise LawDiverApiError(r.status_code, r.json())
            except ValueError as exc:
                raise RuntimeError(f"Report download failed: HTTP {r.status_code}") from exc
        return r.content

    def cite_check_document(
        self,
        file_path: str | Path,
        *,
        poll_seconds: Optional[float] = None,
        max_polls: int = 120,
        download_report: bool = False,
    ) -> dict[str, Any]:
        started = self.start_document_cite_check(file_path)
        job_id = started["jobId"]
        delay = poll_seconds if poll_seconds is not None else float(started.get("pollAfterSeconds") or 5)
        job: dict[str, Any] = started
        for _ in range(max_polls):
            if job.get("status") not in ("queued", "processing"):
                break
            time.sleep(delay)
            job = self.document_job(job_id)
        if job.get("status") != "completed":
            raise RuntimeError(f"Cite check {job.get('status')}: {job.get('error') or 'timed out'}")
        out: dict[str, Any] = {"job": job}
        if download_report:
            out["report"] = self.document_report(job_id)
        return out

    def usage(self, days: int = 30) -> dict[str, Any]:
        return self._request("GET", "/usage", params={"days": days})

    def _request(
        self,
        method: str,
        path: str,
        *,
        json: Optional[MutableMapping[str, Any]] = None,
        params: Optional[Mapping[str, Any]] = None,
        idempotency_key: Optional[str] = None,
    ) -> dict[str, Any]:
        headers: dict[str, str] = {}
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        r = self._client.request(method, path, json=json, params=params, headers=headers)
        return self._parse(r)

    @staticmethod
    def _parse(r: httpx.Response) -> dict[str, Any]:
        try:
            payload = r.json()
        except ValueError as exc:
            raise RuntimeError(f"Non-JSON response: HTTP {r.status_code}") from exc
        if r.status_code >= 400:
            raise LawDiverApiError(r.status_code, payload)
        return payload
