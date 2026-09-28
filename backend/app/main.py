from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.memory import router as memory_router
from app.core.config import settings

app = FastAPI(
    title="Incident Response AI Agent",
    description="AI-powered incident analysis and resolution assistant.",
    version="0.1.0",
    debug=settings.APP_DEBUG,
)

# ---------------------------------------------------------------------------
# CORS — permissive in development; tighten in production via env vars
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.APP_ENV == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health_router)
app.include_router(memory_router)


# ---------------------------------------------------------------------------
# Startup / shutdown lifecycle hooks (placeholders for DB, memory, etc.)
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup() -> None:
    print(f"[startup] Environment  : {settings.APP_ENV}")
    print(f"[startup] Database URL : {settings.DATABASE_URL}")
    print(f"[startup] Hindsight URL: {settings.HINDSIGHT_BASE_URL}")
    print(f"[startup] Hindsight bank: {settings.HINDSIGHT_BANK_ID}")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    print("[shutdown] Application shutting down.")
