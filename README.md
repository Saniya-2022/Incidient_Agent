# Incident Response AI Agent

An AI-powered backend that accepts incident reports, stores them in SQLite,
retrieves relevant past incidents from long-term memory (Hindsight), and uses
Groq LLM to produce root cause analysis, resolution steps, and prevention
recommendations.

---

## Project Structure

```
incident-agent/
├── .env                  # Local secrets (never commit)
├── .env.example          # Template — copy this to .env
├── requirements.txt
├── README.md
└── backend/
    ├── app/
    │   ├── main.py       # FastAPI entry point
    │   ├── api/          # Route handlers
    │   │   ├── health.py     # GET /health
    │   │   └── memory.py     # GET/POST /api/v1/memory/*
    │   ├── core/         # Config, settings
    │   ├── models/       # SQLAlchemy ORM models + Pydantic schemas
    │   └── services/     # Business logic
    │       └── hindsight_service.py  # Hindsight memory client
    ├── tests/            # Test suite
    └── pytest.ini        # pytest configuration
```

---

## Getting Started

### 1. Prerequisites

- Python 3.11 or later
- `pip`

### 2. Create and activate a virtual environment

```bash
# From the project root (incident-agent/)
python -m venv .venv

# Windows CMD
.venv\Scripts\activate.bat

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
# Copy the template
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux
```

Edit `.env` and fill in the Hindsight settings:

```dotenv
# Hindsight long-term memory
HINDSIGHT_BASE_URL=http://localhost:8888   # URL where your Hindsight server runs
HINDSIGHT_API_KEY=                         # Leave empty if no auth is configured
HINDSIGHT_BANK_ID=incident-response-agent  # Memory bank name
```

### 5. Start the FastAPI development server

Run from the `backend/` directory:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## API Endpoints

### Health check (Phase 1)

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### Hindsight memory health (Phase 2)

Verifies connectivity to the Hindsight long-term memory service:

```bash
curl http://localhost:8000/api/v1/memory/health
```

**Response when Hindsight is reachable:**
```json
{"status": "ok", "message": "Hindsight is reachable", "details": {...}}
```

**Response when Hindsight is not running:**
```json
{"status": "error", "message": "Cannot reach Hindsight at http://localhost:8888: ..."}
```

### Store memory

```bash
curl -X POST http://localhost:8000/api/v1/memory/store \
  -H "Content-Type: application/json" \
  -d '{"content": "Root cause: DB pool exhausted. Fix: increase pool size.", "incident_id": 1}'
```

### Search memory

```bash
curl -X POST http://localhost:8000/api/v1/memory/search \
  -H "Content-Type: application/json" \
  -d '{"query": "database connection timeout", "budget": "mid"}'
```

---

## Interactive API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

Tests use `respx` to mock all HTTP calls — **no running Hindsight server required**.

---

## Configuring Hindsight

Hindsight is a self-hosted long-term memory service. To run it locally:

```bash
# Docker (quickest)
docker run -p 8888:8888 \
  -e HINDSIGHT_API_LLM_PROVIDER=openai \
  -e HINDSIGHT_API_LLM_API_KEY=sk-... \
  ghcr.io/vectorize-io/hindsight:latest
```

Then set in `.env`:

```dotenv
HINDSIGHT_BASE_URL=http://localhost:8888
HINDSIGHT_BANK_ID=incident-response-agent
```

The bank is created automatically on the first `retain` call.

---

## Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | FastAPI skeleton, health endpoint, config |
| 2 | ✅ Done | Hindsight long-term memory integration |
| 3 | Pending | SQLite models + incident CRUD routes |
| 4 | Pending | Groq LLM analysis engine |
| 5 | Pending | Agent orchestration |
| 6 | Pending | Web dashboard |
