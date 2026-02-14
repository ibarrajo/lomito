"""Committer agent: creates git commits with conventional messages."""

from __future__ import annotations

import logging
import subprocess
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from agent_runner.models import ModelRouter
from agent_runner.state import AgentState

logger = logging.getLogger("agent_runner")

COMMITTER_SYSTEM = """You are the Committer agent. Generate a conventional commit message for the changes.

Rules:
- Format: type(scope): description
- Types: feat, fix, chore, docs, refactor, test, style
- Scope: the main area changed (ui, db, auth, map, i18n, agent, etc.)
- Description: imperative mood, lowercase, no period, under 72 chars
- If a commit message was specified in the task, use it exactly

Respond with ONLY the commit message, nothing else."""


def committer_node(state: AgentState, *, router: ModelRouter, config: Any) -> dict:
    """Stage changes and create a git commit."""
    task = state["current_task"]
    if task is None:
        return {"error": "No task to commit"}

    working_dir = str(config.project_dir)

    status_result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True, text=True, cwd=working_dir,
    )
    if not status_result.stdout.strip():
        logger.info("No changes to commit for task %s", task.id)
        return {"git_dirty": False, "error": None}

    diff_result = subprocess.run(
        ["git", "diff", "--stat"],
        capture_output=True, text=True, cwd=working_dir,
    )

    if task.commit_message:
        commit_msg = task.commit_message
    else:
        messages = [
            SystemMessage(content=COMMITTER_SYSTEM),
            HumanMessage(content=f"Task: {task.id} - {task.title}\n\nGit diff stat:\n{diff_result.stdout[:3000]}\n\nFiles changed:\n{status_result.stdout[:3000]}\n\nGenerate the commit message."),
        ]
        response = router.invoke_with_fallback("committer", messages)
        commit_msg = response.content.strip().strip('"').strip("'")

    subprocess.run(["git", "add", "-A"], cwd=working_dir, check=True)

    try:
        subprocess.run(
            ["git", "commit", "-m", commit_msg],
            cwd=working_dir, capture_output=True, text=True, check=True,
        )
        logger.info("Committed: %s", commit_msg)

        # Update task status to done
        task_status = dict(state["task_status"])
        task_status[task.id] = "done"

        return {"git_dirty": False, "error": None, "task_status": task_status}
    except subprocess.CalledProcessError as e:
        logger.error("Git commit failed: %s", e.stderr)
        return {"git_dirty": True, "error": f"commit_failed: {e.stderr}"}
