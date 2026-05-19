# AI Productivity Operating System (AIPOS)

AIPOS is a production-grade agentic AI productivity platform for chat, documents, notes, tasks, memory, and multi-agent workflows.
- Backend shell: FastAPI health, chat, documents, memory, task, notes, settings, notifications, analytics, and agent endpoints stubbed
- Frontend shell: landing page and dashboard route stubbed
- Backend shell: FastAPI health, chat, documents, memory, task, and agent endpoints stubbed
- Type-checking: local JSX shim added so the TSX scaffold remains editor-friendly in this workspace
- `EMBEDDING_MODEL` - local embedding model, defaults to `sentence-transformers/all-MiniLM-L6-v2`
- `CHROMA_PATH` - local ChromaDB storage path
- `USER_ID` - logical user identifier used by the local memory, tasks, and agent demo flows
- `RATE_LIMIT_REQUESTS` - optional per-IP request cap for the in-memory limiter
- `NEXT_PUBLIC_API_URL` - frontend API base URL, defaults to `http://localhost:8000`

- Configure `NEXT_PUBLIC_API_URL` to point at the deployed backend.

- Set the service root to `backend/`.
- Start the app with `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`.

### Render Template
- `render.yaml` is included in the repo for a backend web service.
## Free AI Architecture

- Development workflow: Next.js frontend → FastAPI backend → Ollama → local LLM
- Multi-agent workflow: frontend → FastAPI → agent orchestrator → specialized prompts and memory/task side effects

## Planned Structure

- `frontend/` - Next.js app
- `backend/` - FastAPI service
- `docs/` - product and architecture notes
- Workspace surfaces: dashboard, chat, documents, tasks, notes, memory, settings, notifications, analytics, and agent studio are now wired into the frontend
## Immediate Roadmap

1. Set up the frontend app shell.
2. Set up the FastAPI backend shell.
3. Connect authentication, chat, and document workflows.

## Run Full Stack

### One Command
- Run `bash run-dev.sh` from the repository root.

### Manual Start
1. Create the backend virtual environment: `python3 -m venv backend/.venv`.
2. Activate it: `source backend/.venv/bin/activate`.
3. Install backend dependencies: `pip install -r backend/requirements.txt`.
4. Create the frontend Node runtime: `cd frontend && python3 -m nodeenv .nodeenv`.
5. Activate it and install frontend dependencies: `cd frontend && source .nodeenv/bin/activate && npm install`.
6. Start the backend from the repository root with `PYTHONPATH=$(pwd) python3 backend/scripts/check_env.py && PYTHONPATH=$(pwd) python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`.
7. Start the frontend: `cd frontend && source .nodeenv/bin/activate && npm run dev`.

### Required Environment
- `AIPOS_AI_PROVIDER` for provider routing.
- `FRONTEND_ORIGINS` for backend CORS.
- `NEXT_PUBLIC_API_URL` for the frontend backend URL.
- The matching provider keys or Ollama settings for the selected provider.

### Demo Data
- `DEMO_SEED=1` seeds tasks, notes, memories, and notifications when using `bash run-dev.sh`.
- Set `DEMO_SEED=0` to start with empty local workspace data.
# ASTRA-powered-by-AIPOS

