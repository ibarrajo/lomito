# Agent Runner Design — LangGraph Autonomous Orchestrator

## Overview

Standalone Python package (`agent_runner/`) that autonomously executes tasks from `ORCHESTRATION.md` using a LangGraph StateGraph with multi-LLM fallback.

## Architecture

### Graph: StateGraph with 5 nodes

```
Planner → Implementer → Reviewer → Committer → Planner (loop)
                ▲            │
                └────────────┘ (review rejected)
Planner → END (no unblocked tasks)
```

### State

```python
class AgentState(TypedDict):
    tasks: list[Task]
    current_task: Task | None
    task_status: dict[str, str]     # task_id -> pending|done|failed|blocked
    messages: list[BaseMessage]
    git_dirty: bool
    retry_count: int
    current_llm: str
    error: str | None
    phase: str
```

### Conditional Edges

- Planner → END: no unblocked tasks
- Planner → Implementer: task selected
- Reviewer → Committer: approved
- Reviewer → Implementer: rejected (retry_count < 3)
- Reviewer → Planner: rejected 3x, skip + log to ISSUES.md
- Committer → Planner: next task

### Multi-LLM Fallback

Priority: Claude Opus 4 → Gemini 2.0 Flash → GPT-4. Fallback on 429, 5xx, timeout, quota. Per-agent model override via config.yaml.

### Agent Tools

All agents get: file_read, file_write, file_edit, bash_exec, list_directory, grep_search. Implementer and Reviewer get all tools. Planner/Committer get a subset.

### Checkpointing

LangGraph SqliteSaver to `~/.claude/tasks/lomito/checkpoints.db`. Resume reconstructs graph state from last checkpoint.

### CLI

- `python agent.py run` — start/continue orchestration
- `python agent.py status` — show state, current task, token usage
- `python agent.py resume` — explicit resume from checkpoint
- `python agent.py reset` — clear checkpoints, start fresh

### Logging

Structured JSON logs to `.agent-logs/`. Per-step: timestamp, agent, LLM provider, tokens, latency. Summary at end of run.

### File Structure

```
agent_runner/
├── agent.py              # CLI entry point (click)
├── state.py              # AgentState TypedDict + Task model
├── graph.py              # LangGraph StateGraph wiring
├── models.py             # ModelRouter with fallback chain
├── tools.py              # LangChain tools (file ops, bash, grep)
├── parser.py             # ORCHESTRATION.md markdown parser
├── config.py             # Config loading (YAML + env)
├── logger.py             # Structured JSON logging
├── agents/
│   ├── __init__.py
│   ├── planner.py        # Task selection + dependency resolution
│   ├── implementer.py    # Code generation with tool calling
│   ├── reviewer.py       # Code review + test execution
│   └── committer.py      # Git commit with conventional messages
├── config.yaml           # Default model + agent config
├── requirements.txt
├── .env.example
└── README.md
```
