from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """Liveness probe — returns 200 OK when the service is running."""
    return {"status": "ok"}
