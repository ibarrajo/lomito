"""LangGraph StateGraph wiring for the agent orchestrator."""

from __future__ import annotations

import sqlite3
from functools import partial
from pathlib import Path
from typing import Any, Literal

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, StateGraph

from agent_runner.agents.committer import committer_node
from agent_runner.agents.implementer import implementer_node
from agent_runner.agents.planner import planner_node
from agent_runner.agents.reviewer import reviewer_node
from agent_runner.config import Config
from agent_runner.models import ModelRouter
from agent_runner.state import AgentState
from agent_runner.tools import make_tools


def route_after_planner(state: AgentState) -> Literal["implementer", "__end__"]:
    """Route after planner: to implementer if task selected, else end."""
    if state.get("current_task") is None:
        return END
    return "implementer"


def route_after_reviewer(state: AgentState, *, max_retries: int = 3) -> Literal["committer", "implementer", "planner"]:
    """Route after reviewer: approve -> commit, reject -> retry or skip."""
    error = state.get("error")
    if error != "review_rejected":
        return "committer"

    retry_count = state.get("retry_count", 0)
    if retry_count < max_retries:
        return "implementer"

    return "planner"


def build_graph(config: Config) -> tuple[Any, SqliteSaver]:
    """Build and compile the agent orchestrator graph."""
    router = ModelRouter(config)
    tools = make_tools(
        working_dir=config.project_dir,
        allowed_commands=config.allowed_commands,
    )

    graph = StateGraph(AgentState)

    graph.add_node("planner", partial(planner_node, router=router, app_config=config))
    graph.add_node("implementer", partial(implementer_node, router=router, tools=tools))
    graph.add_node("reviewer", partial(reviewer_node, router=router, tools=tools))
    graph.add_node("committer", partial(committer_node, router=router, app_config=config))

    graph.set_entry_point("planner")

    graph.add_conditional_edges("planner", route_after_planner)
    graph.add_edge("implementer", "reviewer")
    graph.add_conditional_edges(
        "reviewer",
        partial(route_after_reviewer, max_retries=config.max_review_retries),
    )
    graph.add_edge("committer", "planner")

    checkpoint_dir = config.checkpoint_dir
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    db_path = checkpoint_dir / "checkpoints.db"
    conn = sqlite3.connect(str(db_path))
    memory = SqliteSaver(conn)

    compiled = graph.compile(checkpointer=memory)
    return compiled, memory
