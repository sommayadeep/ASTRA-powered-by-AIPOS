from fastapi import APIRouter

from backend.app.services.providers import provider_availability, resolve_provider_config

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/status")
def get_provider_status() -> dict[str, object]:
    config = resolve_provider_config()
    return {
        "default_provider": config.name,
        "available": provider_availability(),
    }
