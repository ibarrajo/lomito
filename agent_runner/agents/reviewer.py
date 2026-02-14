"""Reviewer agent: reviews changes and runs tests."""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage

from agent_runner.models import ModelRouter
from agent_runner.state import AgentState

logger = logging.getLogger("agent_runner")

REVIEWER_SYSTEM = """You are the Reviewer agent for the Lomito project.

Your job is to review code changes made by the Implementer and decide whether they're ready to commit.

Review criteria:
1. All deliverables from the task are present
2. TypeScript strict mode: no `any`, no `@ts-ignore`
3. React Native: functional components, hooks, expo-image, FlatList/FlashList
4. Accessibility: accessibilityLabel on interactive elements
5. i18n: user-facing strings use t('key')
6. No security issues (no exposed secrets, proper input sanitization)
7. Code follows project conventions (camelCase, PascalCase, kebab-case files)

You have access to tools to:
- Read files to review the changes
- Run `git diff` to see what changed
- Run `npx tsc --noEmit` to typecheck
- Run `npx eslint` to lint

After reviewing, respond with either:
- APPROVED: followed by a brief summary of the changes
- REJECTED: followed by specific issues that must be fixed

Be constructive but strict. Only reject for real issues, not style preferences.
"""

MAX_REVIEW_ROUNDS = 15


def reviewer_node(state: AgentState, *, router: ModelRouter, tools: list) -> dict:
    """Review changes and approve or reject."""
    task = state["current_task"]
    if task is None:
        return {"error": "No task to review"}

    deliverables_str = "\n".join(f"- {d}" for d in task.deliverables) if task.deliverables else "See task description."

    messages = [
        SystemMessage(content=REVIEWER_SYSTEM),
        HumanMessage(content=f"""Review the changes for task {task.id}: {task.title}

Expected deliverables:
{deliverables_str}

Use `git diff` and `git diff --cached` to see changes, read files to review them,
and run typecheck/lint to verify quality. Then approve or reject."""),
    ]

    for round_num in range(MAX_REVIEW_ROUNDS):
        response = router.invoke_with_fallback("reviewer", messages, tools=tools)
        messages.append(response)

        if not response.tool_calls:
            content = response.content.upper()
            if "APPROVED" in content:
                logger.info("Reviewer approved task %s", task.id)
                return {"messages": messages, "error": None}
            elif "REJECTED" in content:
                logger.info("Reviewer rejected task %s", task.id)
                return {
                    "messages": messages,
                    "error": "review_rejected",
                    "retry_count": state.get("retry_count", 0) + 1,
                }
            else:
                logger.info("Reviewer gave ambiguous response for %s, treating as approved", task.id)
                return {"messages": messages, "error": None}

        for tool_call in response.tool_calls:
            tool_fn = None
            for t in tools:
                if t.name == tool_call["name"]:
                    tool_fn = t
                    break

            if tool_fn is None:
                tool_result = f"Error: Unknown tool '{tool_call['name']}'"
            else:
                try:
                    tool_result = tool_fn.invoke(tool_call["args"])
                except Exception as e:
                    tool_result = f"Error: {e}"

            messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"]))

    logger.warning("Reviewer hit max rounds for task %s, auto-approving", task.id)
    return {"messages": messages, "error": None}
