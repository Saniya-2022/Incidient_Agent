"""
Tests for HindsightService using mocked HTTP responses.

These tests never start a real Hindsight server — all HTTP calls are
intercepted by `respx`, which lets us assert on payloads and simulate
error conditions deterministically.
"""

import pytest
import respx
from httpx import Response

from app.services.hindsight_service import HindsightError, HindsightService

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

BANK_ID = "test-bank"
BASE_URL = "http://hindsight-test.local"
BANK_BASE = f"{BASE_URL}/v1/default/banks/{BANK_ID}"


@pytest.fixture()
def svc() -> HindsightService:
    """Return a HindsightService pointed at the mock base URL."""
    return HindsightService(
        base_url=BASE_URL,
        api_key="test-key",
        bank_id=BANK_ID,
        timeout=5.0,
    )


# ---------------------------------------------------------------------------
# health_check
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_health_check_ok(svc: HindsightService) -> None:
    """health_check returns status=ok when the bank profile endpoint responds 200."""
    profile_payload = {"bank_id": BANK_ID, "name": "Test Bank"}
    with respx.mock(base_url=BASE_URL) as mock:
        mock.get(f"/v1/default/banks/{BANK_ID}/profile").mock(
            return_value=Response(200, json=profile_payload)
        )
        result = await svc.health_check()

    assert result["status"] == "ok"
    assert "bank_profile" in result


@pytest.mark.asyncio
async def test_health_check_bank_not_found_is_ok(svc: HindsightService) -> None:
    """A 404 from the profile endpoint is acceptable — server is reachable."""
    with respx.mock(base_url=BASE_URL) as mock:
        mock.get(f"/v1/default/banks/{BANK_ID}/profile").mock(
            return_value=Response(404, json={"detail": "bank not found"})
        )
        result = await svc.health_check()

    assert result["status"] == "ok"
    assert "does not exist yet" in result["message"]


@pytest.mark.asyncio
async def test_health_check_server_error_raises(svc: HindsightService) -> None:
    """A 500 from Hindsight raises HindsightError."""
    with respx.mock(base_url=BASE_URL) as mock:
        mock.get(f"/v1/default/banks/{BANK_ID}/profile").mock(
            return_value=Response(500, text="Internal Server Error")
        )
        with pytest.raises(HindsightError, match="500"):
            await svc.health_check()


@pytest.mark.asyncio
async def test_health_check_connection_refused_raises(svc: HindsightService) -> None:
    """A connection error raises HindsightError with a friendly message."""
    import httpx

    with respx.mock(base_url=BASE_URL) as mock:
        mock.get(f"/v1/default/banks/{BANK_ID}/profile").mock(
            side_effect=httpx.ConnectError("Connection refused")
        )
        with pytest.raises(HindsightError, match="Cannot reach Hindsight"):
            await svc.health_check()


# ---------------------------------------------------------------------------
# store_incident_knowledge
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_store_knowledge_posts_correct_payload(svc: HindsightService) -> None:
    """store_incident_knowledge sends the right body and returns success."""
    retain_response = {"success": True, "bank_id": BANK_ID, "items_count": 1}

    with respx.mock(base_url=BASE_URL) as mock:
        route = mock.post(f"/v1/default/banks/{BANK_ID}/memories").mock(
            return_value=Response(200, json=retain_response)
        )
        result = await svc.store_incident_knowledge(
            content="The root cause was a misconfigured Nginx upstream timeout.",
            incident_id=42,
            context="incident-response",
        )

    assert result["success"] is True

    # Inspect what was sent
    request = route.calls[0].request
    import json
    body = json.loads(request.content)
    items = body["items"]
    assert len(items) == 1
    assert items[0]["content"] == "The root cause was a misconfigured Nginx upstream timeout."
    assert items[0]["context"] == "incident-response"
    assert items[0]["document_id"] == "incident-42"


@pytest.mark.asyncio
async def test_store_knowledge_no_incident_id(svc: HindsightService) -> None:
    """store_incident_knowledge works without an incident_id (no document_id set)."""
    retain_response = {"success": True, "bank_id": BANK_ID, "items_count": 1}

    with respx.mock(base_url=BASE_URL) as mock:
        route = mock.post(f"/v1/default/banks/{BANK_ID}/memories").mock(
            return_value=Response(200, json=retain_response)
        )
        await svc.store_incident_knowledge(content="Some knowledge.")

    import json
    body = json.loads(route.calls[0].request.content)
    # No document_id key should be present when incident_id is None
    assert "document_id" not in body["items"][0]


@pytest.mark.asyncio
async def test_store_knowledge_empty_content_raises(svc: HindsightService) -> None:
    """Passing empty content raises ValueError before any HTTP call."""
    with respx.mock(base_url=BASE_URL):
        with pytest.raises(ValueError, match="content must not be empty"):
            await svc.store_incident_knowledge(content="   ")


@pytest.mark.asyncio
async def test_store_knowledge_http_error_raises(svc: HindsightService) -> None:
    """A 422 from Hindsight raises HindsightError."""
    with respx.mock(base_url=BASE_URL) as mock:
        mock.post(f"/v1/default/banks/{BANK_ID}/memories").mock(
            return_value=Response(422, json={"detail": "invalid payload"})
        )
        with pytest.raises(HindsightError, match="422"):
            await svc.store_incident_knowledge(content="Some knowledge.")


# ---------------------------------------------------------------------------
# search_similar_incidents
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_search_returns_results(svc: HindsightService) -> None:
    """search_similar_incidents returns the results list from Hindsight."""
    recall_response = {
        "results": [
            {"id": "m1", "text": "Root cause: DB connection pool exhausted.", "type": "world"},
            {"id": "m2", "text": "Fix: increase pool size to 50.", "type": "experience"},
        ]
    }

    with respx.mock(base_url=BASE_URL) as mock:
        mock.post(f"/v1/default/banks/{BANK_ID}/memories/recall").mock(
            return_value=Response(200, json=recall_response)
        )
        results = await svc.search_similar_incidents(
            query="Database connection timeout in payment service",
            max_tokens=2048,
            budget="low",
        )

    assert len(results) == 2
    assert results[0]["text"] == "Root cause: DB connection pool exhausted."


@pytest.mark.asyncio
async def test_search_sends_correct_payload(svc: HindsightService) -> None:
    """search_similar_incidents sends the right body to the recall endpoint."""
    with respx.mock(base_url=BASE_URL) as mock:
        route = mock.post(f"/v1/default/banks/{BANK_ID}/memories/recall").mock(
            return_value=Response(200, json={"results": []})
        )
        await svc.search_similar_incidents(
            query="OOM in auth service",
            max_tokens=1024,
            budget="high",
            types=["world"],
        )

    import json
    body = json.loads(route.calls[0].request.content)
    assert body["query"] == "OOM in auth service"
    assert body["max_tokens"] == 1024
    assert body["budget"] == "high"
    assert body["types"] == ["world"]


@pytest.mark.asyncio
async def test_search_empty_query_raises(svc: HindsightService) -> None:
    """Passing an empty query raises ValueError before any HTTP call."""
    with respx.mock(base_url=BASE_URL):
        with pytest.raises(ValueError, match="query must not be empty"):
            await svc.search_similar_incidents(query="  ")


@pytest.mark.asyncio
async def test_search_http_error_raises(svc: HindsightService) -> None:
    """A 500 from Hindsight recall raises HindsightError."""
    with respx.mock(base_url=BASE_URL) as mock:
        mock.post(f"/v1/default/banks/{BANK_ID}/memories/recall").mock(
            return_value=Response(500, text="Internal Server Error")
        )
        with pytest.raises(HindsightError):
            await svc.search_similar_incidents(query="some incident")


# ---------------------------------------------------------------------------
# get_incident_context
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_incident_context_with_memories(svc: HindsightService) -> None:
    """get_incident_context returns formatted context_text when memories exist."""
    recall_response = {
        "results": [
            {"id": "m1", "text": "High CPU was caused by a missing index.", "type": "world"},
        ]
    }

    with respx.mock(base_url=BASE_URL) as mock:
        mock.post(f"/v1/default/banks/{BANK_ID}/memories/recall").mock(
            return_value=Response(200, json=recall_response)
        )
        ctx = await svc.get_incident_context(
            incident_title="High CPU usage",
            service="api-gateway",
            error_message="CPU > 95% for 5 minutes",
        )

    assert ctx["memory_count"] == 1
    assert "High CPU was caused by a missing index." in ctx["context_text"]
    assert "[world]" in ctx["context_text"]


@pytest.mark.asyncio
async def test_get_incident_context_no_memories(svc: HindsightService) -> None:
    """get_incident_context returns a friendly message when no memories match."""
    with respx.mock(base_url=BASE_URL) as mock:
        mock.post(f"/v1/default/banks/{BANK_ID}/memories/recall").mock(
            return_value=Response(200, json={"results": []})
        )
        ctx = await svc.get_incident_context(
            incident_title="Unknown error",
            service="checkout",
            error_message="NullPointerException at line 42",
        )

    assert ctx["memory_count"] == 0
    assert "No relevant past incidents" in ctx["context_text"]


# ---------------------------------------------------------------------------
# Authorization header
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_api_key_sent_in_header(svc: HindsightService) -> None:
    """The Bearer token is included in every outgoing request."""
    with respx.mock(base_url=BASE_URL) as mock:
        route = mock.get(f"/v1/default/banks/{BANK_ID}/profile").mock(
            return_value=Response(200, json={"bank_id": BANK_ID})
        )
        await svc.health_check()

    auth_header = route.calls[0].request.headers.get("authorization", "")
    assert auth_header == "Bearer test-key"


@pytest.mark.asyncio
async def test_no_auth_header_when_key_empty() -> None:
    """When HINDSIGHT_API_KEY is empty, no Authorization header is sent."""
    svc_no_key = HindsightService(
        base_url=BASE_URL, api_key="", bank_id=BANK_ID, timeout=5.0
    )
    with respx.mock(base_url=BASE_URL) as mock:
        route = mock.get(f"/v1/default/banks/{BANK_ID}/profile").mock(
            return_value=Response(200, json={"bank_id": BANK_ID})
        )
        await svc_no_key.health_check()

    assert "authorization" not in route.calls[0].request.headers
