from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

from backend.app.api.auth import router as auth_router
from backend.app.api.agents import router as agents_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.chat import router as chat_router
from backend.app.api.documents import router as documents_router
from backend.app.api.memory import router as memory_router
from backend.app.api.notes import router as notes_router
from backend.app.api.notifications import router as notifications_router
from backend.app.api.providers import router as providers_router
from backend.app.api.settings import router as settings_router
from backend.app.api.rag import router as rag_router
from backend.app.api.tasks import router as tasks_router
from backend.app.api.health import router as health_router
from backend.app.services.security import enforce_rate_limit

app = FastAPI(title="AIPOS API")

frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.url.path not in {"/health"}:
        try:
            enforce_rate_limit(request)
        except HTTPException as exc:
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    try:
        response = await call_next(request)
    except Exception as exc:  # pragma: no cover - fallback guard for middleware path
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    return response


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(agents_router)
app.include_router(analytics_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(memory_router)
app.include_router(notes_router)
app.include_router(notifications_router)
app.include_router(providers_router)
app.include_router(settings_router)
app.include_router(rag_router)
app.include_router(tasks_router)
