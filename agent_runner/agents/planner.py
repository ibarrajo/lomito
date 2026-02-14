"""Planner agent: selects the next unblocked task."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from agent_runner.models import ModelRouter
from agent_runner.parser import get_unblocked_tasks
from agent_runner.state import AgentState

logger = logging.getLogger("agent_runner")

PLANNER_SYSTEM = """You are the Planner agent for the Lomito project orchestrator.

Your job is to analyze the list of tasks and their dependencies, then select the best next task to work on.

You will receive:
1. The full task list with dependency info and completion status
2. The list of currently unblocked tasks

Respond with ONLY the task ID you want to execute next (e.g., "P1-T3"), or "DONE" if all tasks are complete.

Selection criteria:
- Pick tasks from the earliest incomplete phase first
- If multiple tasks are unblocked, prefer tasks that unblock the most downstream tasks
- Never select a task whose dependencies are not all "done"
"""


def planner_node(state: AgentState, *, router: ModelRouter, config: Any) -> dict:
    """Select the next task to execute."""
    tasks = state["tasks"]
    task_status = state["task_status"]

    unblocked = get_unblocked_tasks(tasks, task_status)

    if not unblocked:
        pending = [t for t in tasks if task_status.get(t.id, "pending") == "pending"]
        if not pending:
            logger.info("All tasks completed!")
            return {"current_task": None, "error": None}
        else:
            logger.info("No unblocked tasks. %d tasks still blocked.", len(pending))
            return {"current_task": None, "error": "blocked"}

    if len(unblocked) == 1:
        selected = unblocked[0]
    else:
        task_summary = "\n".join(
            f"- {t.id}: {t.title} (depends on: {', '.join(t.depends_on) or 'nothing'})"
            for t in tasks
        )
        status_summary = "\n".join(
            f"- {tid}: {status}" for tid, status in task_status.items()
        )
        unblocked_summary = "\n".join(f"- {t.id}: {t.title}" for t in unblocked)

        messages = [
            SystemMessage(content=PLANNER_SYSTEM),
            HumanMessage(content=f"Tasks:\n{task_summary}\n\nStatus:\n{status_summary}\n\nUnblocked tasks:\n{unblocked_summary}\n\nWhich task should we execute next?"),
        ]

        response = router.invoke_with_fallback("planner", messages)
        response_text = response.content.strip()

        selected = unblocked[0]
        for task in unblocked:
            if task.id in response_text:
                selected = task
                break

    logger.info("Planner selected task: %s - %s", selected.id, selected.title)

    spec_content = ""
    if selected.spec:
        spec_path = Path(config.project_dir) / selected.spec
        if spec_path.exists():
            try:
                spec_content = spec_path.read_text(encoding="utf-8")[:10000]
            except Exception:
                pass

    return {
        "current_task": selected,
        "retry_count": 0,
        "error": None,
        "messages": [
            SystemMessage(content=f"Working on task {selected.id}: {selected.title}"),
            HumanMessage(content=f"Spec:\n{spec_content}" if spec_content else "No spec file available."),
        ],
    }
