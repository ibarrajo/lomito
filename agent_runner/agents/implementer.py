"""Implementer agent: executes a task by writing code with tools."""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage

from agent_runner.models import ModelRouter
from agent_runner.state import AgentState

logger = logging.getLogger("agent_runner")

IMPLEMENTER_SYSTEM = """You are the Implementer agent for the Lomito project.

You have access to tools for reading, writing, and editing files, searching code, and running shell commands.

Your job is to implement the assigned task by:
1. Reading relevant existing code to understand the codebase
2. Writing or modifying files to implement the deliverables
3. Running typecheck (npx tsc --noEmit) and lint (npx eslint) to verify your changes
4. Ensuring all deliverables listed in the task are created/modified

Project conventions:
- TypeScript strict mode, no `any`
- camelCase variables, PascalCase components/types, kebab-case filenames
- Functional React Native components with hooks
- All user-facing strings use i18n: t('namespace.key')
- expo-image instead of Image, FlatList/FlashList for lists

When you're done implementing, respond with a summary of what you changed.
Do NOT commit — the Committer agent handles that.
"""

MAX_TOOL_ROUNDS = 30


def implementer_node(state: AgentState, *, router: ModelRouter, tools: list) -> dict:
    """Execute the current task using tool-calling LLM."""
    task = state["current_task"]
    if task is None:
        return {"error": "No task selected"}

    deliverables_str = "\n".join(f"- {d}" for d in task.deliverables) if task.deliverables else "See spec for details."

    messages = [
        SystemMessage(content=IMPLEMENTER_SYSTEM),
        HumanMessage(content=f"""Task: {task.id} - {task.title}

Deliverables:
{deliverables_str}

{"Spec reference: " + task.spec if task.spec else ""}

Implement this task now. Use the available tools to read existing code, write new files, and verify your changes."""),
    ]

    context_messages = state.get("messages", [])
    if context_messages:
        messages.extend(context_messages)

    for round_num in range(MAX_TOOL_ROUNDS):
        response = router.invoke_with_fallback("implementer", messages, tools=tools)
        messages.append(response)

        if not response.tool_calls:
            logger.info("Implementer finished task %s after %d rounds", task.id, round_num + 1)
            break

        for tool_call in response.tool_calls:
            tool_fn = _find_tool(tools, tool_call["name"])
            if tool_fn is None:
                tool_result = f"Error: Unknown tool '{tool_call['name']}'"
            else:
                try:
                    tool_result = tool_fn.invoke(tool_call["args"])
                except Exception as e:
                    tool_result = f"Error executing {tool_call['name']}: {e}"

            messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"]))
            logger.debug("Tool %s called (round %d)", tool_call["name"], round_num + 1)
    else:
        logger.warning("Implementer hit max rounds (%d) for task %s", MAX_TOOL_ROUNDS, task.id)

    return {"messages": messages, "git_dirty": True, "error": None}


def _find_tool(tools: list, name: str):
    """Find a tool by name."""
    for t in tools:
        if t.name == name:
            return t
    return None
