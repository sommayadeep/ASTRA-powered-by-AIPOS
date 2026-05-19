from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.services.agents import execute_agent_workflow

router = APIRouter(prefix="/agents", tags=["agents"])


class AgentWorkflowRequest(BaseModel):
    prompt: str = Field(min_length=1)
    user_id: str = Field(default="demo-user", min_length=1)


@router.post("/execute")
def execute_workflow(payload: AgentWorkflowRequest) -> dict[str, object]:
    return execute_agent_workflow(payload.prompt, payload.user_id)
