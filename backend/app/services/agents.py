from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from backend.app.services.ai import generate_chat_reply
from backend.app.services.memory import add_memory
from backend.app.services.tasks import create_task as store_task


@dataclass(frozen=True)
class AgentResult:
    agent: str
    output: str
    metadata: dict[str, Any]


def _choose_agents(prompt: str) -> list[str]:
    lowered = prompt.lower()
    selected: list[str] = []

    if any(keyword in lowered for keyword in ["research", "find", "analyze", "summarize", "compare"]):
        selected.append("research")
    if any(keyword in lowered for keyword in ["plan", "roadmap", "schedule", "organize", "study plan"]):
        selected.append("planner")
    if any(keyword in lowered for keyword in ["code", "debug", "repository", "function", "bug"]):
        selected.append("coding")
    if any(keyword in lowered for keyword in ["remember", "memory", "preference", "preference"]):
        selected.append("memory")

    if not selected:
        selected = ["research", "planner"]

    return selected


def _run_research_agent(prompt: str) -> AgentResult:
    output = generate_chat_reply(
        "You are the Research Agent for AIPOS. Produce a concise, structured research brief with key points, trends, and takeaways. "
        f"Task: {prompt}"
    )
    return AgentResult(agent="research", output=output, metadata={"type": "brief"})


def _run_planner_agent(prompt: str) -> AgentResult:
    output = generate_chat_reply(
        "You are the Planner Agent for AIPOS. Turn the request into an actionable step-by-step plan with priorities and milestones. "
        f"Task: {prompt}"
    )
    return AgentResult(agent="planner", output=output, metadata={"type": "plan"})


def _run_coding_agent(prompt: str) -> AgentResult:
    output = generate_chat_reply(
        "You are the Coding Agent for AIPOS. Explain the code task, propose the fix, and include implementation notes. "
        f"Task: {prompt}"
    )
    return AgentResult(agent="coding", output=output, metadata={"type": "implementation"})


def _run_memory_agent(prompt: str, user_id: str) -> AgentResult:
    generated_memory = f"User workflow preference or context: {prompt}"
    add_memory(user_id, generated_memory, importance_score=0.75)
    return AgentResult(agent="memory", output="Saved a memory note for future personalization.", metadata={"saved": True})


def execute_agent_workflow(prompt: str, user_id: str = "demo-user") -> dict[str, Any]:
    agents = _choose_agents(prompt)
    results: list[AgentResult] = []

    for agent in agents:
        if agent == "research":
            results.append(_run_research_agent(prompt))
        elif agent == "planner":
            results.append(_run_planner_agent(prompt))
        elif agent == "coding":
            results.append(_run_coding_agent(prompt))
        elif agent == "memory":
            results.append(_run_memory_agent(prompt, user_id))

    combined_prompt = "\n\n".join(
        f"[{result.agent.upper()}]\n{result.output}" for result in results if result.output
    )
    final_response = generate_chat_reply(
        "You are the AIPOS orchestrator. Merge the following agent outputs into a single concise answer for the user. "
        f"User request: {prompt}\n\nAgent outputs:\n{combined_prompt}"
    )

    if any(agent in agents for agent in ["planner", "coding"]):
        store_task(user_id, f"Follow up on: {prompt}", priority="medium")

    return {
        "requested_agents": agents,
        "results": [
            {"agent": result.agent, "output": result.output, "metadata": result.metadata}
            for result in results
        ],
        "final_response": final_response,
    }
