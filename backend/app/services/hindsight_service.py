"""
Hindsight long-term memory service.

Uses the Hindsight HTTP API (hindsight.vectorize.io) to store and retrieve
incident-related knowledge across sessions.

Endpoints used:
  POST /v1/default/banks/{bank_id}/memories        — retain (store)
  POST /v1/default/banks/{bank_id}/memories/recall — recall (search)
  GET  /v1/default/banks/{bank_id}/profile         — health / connectivity probe
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class HindsightError(Exception):
    """Raised when any Hindsight HTTP call fails."""


class HindsightService:
    """Client wrapper around the Hindsight HTTP API."""

    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        bank_id: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        self.base_url = (base_url or settings.HINDSIGHT_BASE_URL).rstrip("/")
        self.api_key = api_key or settings.HINDSIGHT_API_KEY
        self.bank_id = bank_id or settings.HINDSIGHT_BANK_ID
        self.timeout = timeout

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _headers(self) -> dict[str, str]:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _bank_url(self, path: str) -> str:
        """Build a URL scoped to the configured bank."""
        return f"{self.base_url}/v1/default/banks/{self.bank_id}/{path.lstrip('/')}"

    def _handle_response(self, response: httpx.Response, operation: str) -> dict[str, Any]:
        """Raise HindsightError on non-2xx, otherwise return parsed JSON."""
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = exc.response.text[:500]
            raise HindsightError(
                f"Hindsight {operation} failed [{exc.response.status_code}]: {body}"
            ) from exc
        try:
            return response.json()
        except Exception as exc:
            raise HindsightError(
                f"Hindsight {operation} returned non-JSON response: {response.text[:200]}"
            ) from exc

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def health_check(self) -> dict[str, Any]:
        """
        Verify connectivity to Hindsight by fetching the bank profile.

        Returns a dict with at least ``{"status": "ok"}`` on success.
        Raises HindsightError on any failure.
        """
        url = self._bank_url("profile")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self._headers())
        except httpx.ConnectError as exc:
            raise HindsightError(
                f"Cannot reach Hindsight at {self.base_url}: {exc}"
            ) from exc
        except httpx.TimeoutException as exc:
            raise HindsightError(
                f"Hindsight health check timed out after {self.timeout}s"
            ) from exc

        # A 404 here means the bank doesn't exist yet — that's acceptable for a
        # health check; the server itself is reachable.
        if response.status_code == 404:
            return {
                "status": "ok",
                "message": f"Hindsight reachable. Bank '{self.bank_id}' does not exist yet "
                           "(it will be created on first retain call).",
            }

        data = self._handle_response(response, "health_check")
        return {"status": "ok", "bank_profile": data}

    async def store_incident_knowledge(
        self,
        content: str,
        incident_id: int | None = None,
        context: str = "incident-response",
        document_id: str | None = None,
        metadata: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """
        Store incident-related knowledge (facts, resolutions, root causes) in
        Hindsight so they can be retrieved in future similar incidents.

        Args:
            content:     Free-text knowledge to store (e.g. the root cause +
                         resolution for an incident).
            incident_id: Optional incident ID, used to build a stable
                         ``document_id`` so repeated calls upsert rather than
                         duplicate.
            context:     Category label injected into the extraction prompt.
            document_id: Override the auto-generated document ID.
            metadata:    Extra key-value pairs attached to each extracted memory.

        Returns:
            The raw Hindsight retain response dict.
        """
        if not content.strip():
            raise ValueError("content must not be empty")

        # Use a deterministic document ID so re-storing the same incident
        # replaces the previous version (Hindsight upsert semantics).
        doc_id = document_id or (f"incident-{incident_id}" if incident_id else None)

        payload: dict[str, Any] = {
            "items": [
                {
                    "content": content,
                    "context": context,
                    **({"document_id": doc_id} if doc_id else {}),
                    **({"metadata": metadata} if metadata else {}),
                }
            ]
        }

        url = self._bank_url("memories")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=self._headers())
        except httpx.ConnectError as exc:
            raise HindsightError(
                f"Cannot reach Hindsight at {self.base_url}: {exc}"
            ) from exc
        except httpx.TimeoutException as exc:
            raise HindsightError(
                f"Hindsight retain timed out after {self.timeout}s"
            ) from exc

        result = self._handle_response(response, "store_incident_knowledge")
        logger.info(
            "Stored incident knowledge in Hindsight | bank=%s doc_id=%s",
            self.bank_id,
            doc_id,
        )
        return result

    async def search_similar_incidents(
        self,
        query: str,
        max_tokens: int = 4096,
        budget: str = "mid",
        types: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieve memories relevant to a given incident query.

        Uses Hindsight's TEMPR multi-strategy retrieval (semantic similarity,
        keyword, graph traversal, temporal) and returns a ranked list of
        relevant past-incident facts.

        Args:
            query:      Natural-language description of the current incident.
            max_tokens: Token budget for the returned facts (default 4096).
            budget:     Search depth — ``"low"``, ``"mid"``, or ``"high"``.
            types:      Fact types to include; defaults to
                        ``["world", "experience", "observation"]``.

        Returns:
            A list of result dicts, each containing at least ``text`` and
            ``type`` fields.
        """
        if not query.strip():
            raise ValueError("query must not be empty")

        payload: dict[str, Any] = {
            "query": query,
            "max_tokens": max_tokens,
            "budget": budget,
            "types": types or ["world", "experience", "observation"],
        }

        url = self._bank_url("memories/recall")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=self._headers())
        except httpx.ConnectError as exc:
            raise HindsightError(
                f"Cannot reach Hindsight at {self.base_url}: {exc}"
            ) from exc
        except httpx.TimeoutException as exc:
            raise HindsightError(
                f"Hindsight recall timed out after {self.timeout}s"
            ) from exc

        data = self._handle_response(response, "search_similar_incidents")
        results: list[dict[str, Any]] = data.get("results", [])
        logger.info(
            "Retrieved %d memories from Hindsight | bank=%s query_len=%d",
            len(results),
            self.bank_id,
            len(query),
        )
        return results

    async def get_incident_context(
        self,
        incident_title: str,
        service: str,
        error_message: str,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """
        Build an enriched context dict by querying Hindsight for memories
        relevant to the incoming incident. Intended to be called by the agent
        before generating its analysis prompt.

        Args:
            incident_title: Human-readable title of the incident.
            service:        The service that raised the incident.
            error_message:  The raw error or exception message.
            max_tokens:     Token budget for returned memories.

        Returns:
            A dict with:
              - ``memories``:         raw list of Hindsight result dicts
              - ``context_text``:     a pre-formatted string ready for prompt
                                      injection
              - ``memory_count``:     number of memories retrieved
        """
        query = (
            f"Incident in service '{service}': {incident_title}. "
            f"Error: {error_message}"
        )

        memories = await self.search_similar_incidents(
            query=query,
            max_tokens=max_tokens,
            budget="mid",
        )

        if not memories:
            return {
                "memories": [],
                "context_text": "No relevant past incidents found in long-term memory.",
                "memory_count": 0,
            }

        lines = ["## Relevant Past Incident Knowledge\n"]
        for i, mem in enumerate(memories, start=1):
            text = mem.get("text", "").strip()
            mem_type = mem.get("type", "unknown")
            if text:
                lines.append(f"{i}. [{mem_type}] {text}")

        return {
            "memories": memories,
            "context_text": "\n".join(lines),
            "memory_count": len(memories),
        }


# ---------------------------------------------------------------------------
# Module-level singleton — created lazily so tests can override settings
# ---------------------------------------------------------------------------

def get_hindsight_service() -> HindsightService:
    """Return a HindsightService instance configured from app settings."""
    return HindsightService()
