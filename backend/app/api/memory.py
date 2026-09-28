from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.hindsight_service import HindsightError, HindsightService, get_hindsight_service

router = APIRouter(prefix="/api/v1/memory", tags=["memory"])


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class MemoryHealthResponse(BaseModel):
    status: str
    message: str
    details: dict | None = None


class StoreRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Knowledge text to store")
    incident_id: int | None = Field(None, description="Optional incident ID for deduplication")
    context: str = Field("incident-response", description="Category label for extraction")


class StoreResponse(BaseModel):
    status: str
    message: str
    details: dict | None = None


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    max_tokens: int = Field(4096, ge=256, le=16384)
    budget: str = Field("mid", pattern="^(low|mid|high)$")


class SearchResponse(BaseModel):
    results: list[dict]
    memory_count: int


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("/health", response_model=MemoryHealthResponse)
async def memory_health() -> MemoryHealthResponse:
    """
    Verify connectivity to the Hindsight long-term memory service.

    Returns ``{"status": "ok"}`` when reachable, ``{"status": "error"}``
    with a description when not.
    """
    svc: HindsightService = get_hindsight_service()
    try:
        data = await svc.health_check()
        return MemoryHealthResponse(
            status="ok",
            message=data.get("message", "Hindsight is reachable"),
            details=data,
        )
    except HindsightError as exc:
        return MemoryHealthResponse(
            status="error",
            message=str(exc),
        )


@router.post("/store", response_model=StoreResponse)
async def store_memory(body: StoreRequest) -> StoreResponse:
    """Store incident knowledge in Hindsight long-term memory."""
    svc: HindsightService = get_hindsight_service()
    try:
        result = await svc.store_incident_knowledge(
            content=body.content,
            incident_id=body.incident_id,
            context=body.context,
        )
        return StoreResponse(
            status="ok",
            message="Knowledge stored successfully",
            details=result,
        )
    except (HindsightError, ValueError) as exc:
        return StoreResponse(status="error", message=str(exc))


@router.post("/search", response_model=SearchResponse)
async def search_memories(body: SearchRequest) -> SearchResponse:
    """Search Hindsight long-term memory for relevant past incident knowledge."""
    svc: HindsightService = get_hindsight_service()
    try:
        results = await svc.search_similar_incidents(
            query=body.query,
            max_tokens=body.max_tokens,
            budget=body.budget,
        )
        return SearchResponse(results=results, memory_count=len(results))
    except (HindsightError, ValueError) as exc:
        return SearchResponse(results=[], memory_count=0)
