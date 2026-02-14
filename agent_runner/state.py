"""State definitions for the agent orchestrator."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from langchain_core.messages import BaseMessage
from langgraph.graph import MessagesState


@dataclass
class Task:
    """A single task parsed from ORCHESTRATION.md."""

    id: str  # e.g., "P1-T1"
    title: str
    phase: str
    depends_on: list[str] = field(default_factory=list)
    spec: str | None = None
    deliverables: list[str] = field(default_factory=list)
    commit_message: str | None = None
    done: bool = False


class AgentState(MessagesState):
    """Shared state across all graph nodes."""

    tasks: list[Task]
    current_task: Task | None
    task_status: dict[str, str]  # task_id -> "pending"|"done"|"failed"|"blocked"|"skipped"
    git_dirty: bool
    retry_count: int
    current_llm: str
    error: str | None
    phase: str
    token_usage: dict[str, Any]  # provider -> {input: int, output: int, cost: float}
