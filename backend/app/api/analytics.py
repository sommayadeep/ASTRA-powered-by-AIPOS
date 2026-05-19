from fastapi import APIRouter

from app.services.analytics import get_dashboard_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("")
def read_analytics(user_id: str = "demo-user") -> dict[str, object]:
    return get_dashboard_analytics(user_id)
