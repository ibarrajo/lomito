# Agent Runner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone LangGraph-based autonomous agent orchestrator that parses ORCHESTRATION.md, executes tasks using multi-LLM tool-calling agents, and commits completed work.

**Architecture:** LangGraph StateGraph with 4 agent nodes (Planner, Implementer, Reviewer, Committer) connected by conditional edges. Multi-LLM fallback chain (Claude Opus 4 → Gemini 2.0 Flash → GPT-4). SqliteSaver checkpointing for resume. CLI via Click.

**Tech Stack:** Python 3.12, langgraph, langchain-anthropic, langchain-google-genai, langchain-openai, click, pyyaml, python-dotenv

---

### Task 1: Project scaffold and dependencies

**Files:**

- Create: `agent_runner/__init__.py`
- Create: `agent_runner/requirements.txt`
- Create: `agent_runner/.env.example`
- Create: `agent_runner/config.yaml`
- Create: `agent_runner/agents/__init__.py`

**Step 1: Create directory structure**

```bash
mkdir -p agent_runner/agents
```

**Step 2: Write requirements.txt**

```
langgraph>=0.3.0
langgraph-checkpoint-sqlite>=2.0.0
langchain-core>=0.3.0
langchain-anthropic>=0.3.0
langchain-google-genai>=4.0.0
langchain-openai>=0.3.0
click>=8.1.0
pyyaml>=6.0
python-dotenv>=1.0.0
pydantic>=2.0.0
```

**Step 3: Write .env.example**

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AI...
OPENAI_API_KEY=sk-...
LOMITO_PROJECT_DIR=/Users/you/Code/lomito
```

**Step 4: Write config.yaml**

```yaml
project_dir: null # Override via LOMITO_PROJECT_DIR env var
orchestration_file: docs/plans/ORCHESTRATION.md
issues_file: docs/plans/ISSUES.md
checkpoint_dir: ~/.claude/tasks/lomito
log_dir: .agent-logs

models:
  planner: anthropic/claude-opus-4-20250514
  implementer: anthropic/claude-opus-4-20250514
  reviewer: anthropic/claude-opus-4-20250514
  committer: google/gemini-2.0-flash

fallback_chain:
  - provider: anthropic
    model: claude-opus-4-20250514
  - provider: google
    model: gemini-2.0-flash
  - provider: openai
    model: gpt-4

retry:
  max_review_retries: 3
  fallback_wait_seconds: 60
  request_timeout_seconds: 120

tools:
  allowed_commands:
    - git
    - npm
    - npx
    - tsc
    - eslint
    - prettier
    - node
    - python
  working_dir: null # Defaults to project_dir
```

**Step 5: Write **init**.py files**

`agent_runner/__init__.py`: empty
`agent_runner/agents/__init__.py`: empty

**Step 6: Commit**

```bash
git add agent_runner/
git commit -m "chore(agent): scaffold agent_runner package with dependencies and config"
```

---

### Task 2: State model and task parser

**Files:**

- Create: `agent_runner/state.py`
- Create: `agent_runner/parser.py`
- Create: `agent_runner/tests/__init__.py`
- Create: `agent_runner/tests/test_parser.py`

**Step 1: Write the Task model and AgentState in state.py**

```python
"""State definitions for the agent orchestrator."""

from __future__ import annotations

import operator
from dataclasses import dataclass, field
from typing import Annotated, Any

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
```

**Step 2: Write the ORCHESTRATION.md parser in parser.py**

```python
"""Parse ORCHESTRATION.md into structured Task objects."""

from __future__ import annotations

import re
from pathlib import Path

from agent_runner.state import Task


def parse_orchestration(file_path: str | Path) -> list[Task]:
    """Parse ORCHESTRATION.md and return a list of Task objects."""
    path = Path(file_path)
    content = path.read_text(encoding="utf-8")

    tasks: list[Task] = []
    current_phase = ""

    # Split into lines for parsing
    lines = content.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i]

        # Detect phase headers: ## Phase N: Name
        phase_match = re.match(r"^## Phase \d+: (.+)$", line)
        if phase_match:
            current_phase = phase_match.group(0).strip("## ").strip()
            i += 1
            continue

        # Detect task headers: ### P1-T1: Task Name
        task_match = re.match(r"^### (P\d+-T\d+): (.+)$", line)
        if task_match:
            task_id = task_match.group(1)
            task_title = task_match.group(2)

            # Parse task body
            depends_on: list[str] = []
            spec: str | None = None
            deliverables: list[str] = []
            commit_message: str | None = None
            done = False

            i += 1
            while i < len(lines) and not lines[i].startswith("### ") and not lines[i].startswith("## ") and not lines[i].startswith("---"):
                body_line = lines[i].strip()

                # Dependencies
                dep_match = re.match(r"^- \*\*Depends on:\*\*\s*(.+)$", body_line)
                if dep_match:
                    dep_str = dep_match.group(1)
                    if dep_str.lower() != "nothing":
                        depends_on = [
                            d.strip()
                            for d in re.findall(r"P\d+-T\d+", dep_str)
                        ]

                # Spec
                spec_match = re.match(r"^- \*\*Spec:\*\*\s*(.+)$", body_line)
                if spec_match:
                    spec = spec_match.group(1).strip("`").strip()

                # Deliverables
                if body_line.startswith("- `") and "Depends" not in body_line and "Spec" not in body_line and "Commit" not in body_line:
                    deliverables.append(body_line.lstrip("- ").strip("`").strip())

                # Commit message
                commit_match = re.match(r"^- \*\*Commit:\*\*\s*`(.+)`$", body_line)
                if commit_match:
                    commit_message = commit_match.group(1)

                # Done status
                if body_line == "- [x] Done":
                    done = True
                elif body_line == "- [ ] Done":
                    done = False

                i += 1

            tasks.append(
                Task(
                    id=task_id,
                    title=task_title,
                    phase=current_phase,
                    depends_on=depends_on,
                    spec=spec,
                    deliverables=deliverables,
                    commit_message=commit_message,
                    done=done,
                )
            )
            continue

        i += 1

    return tasks


def get_unblocked_tasks(tasks: list[Task], status: dict[str, str]) -> list[Task]:
    """Return tasks that are pending and have all dependencies satisfied."""
    done_ids = {tid for tid, s in status.items() if s == "done"}
    unblocked = []

    for task in tasks:
        if status.get(task.id, "pending") != "pending":
            continue
        if all(dep in done_ids for dep in task.depends_on):
            unblocked.append(task)

    return unblocked
```

**Step 3: Write parser tests**

```python
"""Tests for ORCHESTRATION.md parser."""

import textwrap
from pathlib import Path

import pytest

from agent_runner.parser import get_unblocked_tasks, parse_orchestration


@pytest.fixture
def sample_orchestration(tmp_path: Path) -> Path:
    content = textwrap.dedent("""\
        # Lomito Orchestration Plan

        ## Phase 1: Foundation

        ### P1-T1: Expo monorepo scaffolding
        - **Depends on:** nothing
        - **Spec:** `docs/specs/ENGINEERING_GUIDE.md`
        - **Deliverables:**
          - `apps/mobile/` — Expo app
          - `packages/shared/` — workspace
        - **Commit:** `chore: scaffold Expo monorepo`
        - [x] Done

        ### P1-T2: Design tokens
        - **Depends on:** P1-T1
        - **Spec:** `docs/style/DESIGN_TOKENS.md`
        - **Commit:** `feat(ui): implement design tokens`
        - [ ] Done

        ### P1-T3: Core UI
        - **Depends on:** P1-T2
        - **Commit:** `feat(ui): add core components`
        - [ ] Done

        ---

        ## Phase 2: Core Reporting

        ### P2-T1: Report submission
        - **Depends on:** P1-T7 (map), P1-T6 (auth)
        - [ ] Done
    """)
    file_path = tmp_path / "ORCHESTRATION.md"
    file_path.write_text(content)
    return file_path


def test_parse_tasks(sample_orchestration: Path) -> None:
    tasks = parse_orchestration(sample_orchestration)
    assert len(tasks) == 4

    t1 = tasks[0]
    assert t1.id == "P1-T1"
    assert t1.title == "Expo monorepo scaffolding"
    assert t1.depends_on == []
    assert t1.done is True
    assert t1.phase == "Phase 1: Foundation"
    assert t1.spec == "docs/specs/ENGINEERING_GUIDE.md"
    assert t1.commit_message == "chore: scaffold Expo monorepo"

    t2 = tasks[1]
    assert t2.id == "P1-T2"
    assert t2.depends_on == ["P1-T1"]
    assert t2.done is False

    t4 = tasks[3]
    assert t4.id == "P2-T1"
    assert t4.depends_on == ["P1-T7", "P1-T6"]
    assert t4.phase == "Phase 2: Core Reporting"


def test_get_unblocked_tasks(sample_orchestration: Path) -> None:
    tasks = parse_orchestration(sample_orchestration)
    status = {"P1-T1": "done"}

    unblocked = get_unblocked_tasks(tasks, status)
    ids = [t.id for t in unblocked]
    assert "P1-T2" in ids
    assert "P1-T3" not in ids  # Blocked by P1-T2
    assert "P2-T1" not in ids  # Blocked by P1-T7, P1-T6


def test_all_done_returns_empty(sample_orchestration: Path) -> None:
    tasks = parse_orchestration(sample_orchestration)
    status = {t.id: "done" for t in tasks}

    unblocked = get_unblocked_tasks(tasks, status)
    assert unblocked == []
```

**Step 4: Run tests**

```bash
cd agent_runner && pip install -e . 2>/dev/null; cd .. && python -m pytest agent_runner/tests/test_parser.py -v
```

Expected: All 3 tests pass.

**Step 5: Commit**

```bash
git add agent_runner/state.py agent_runner/parser.py agent_runner/tests/
git commit -m "feat(agent): add state model and ORCHESTRATION.md parser with tests"
```

---

### Task 3: Configuration loader

**Files:**

- Create: `agent_runner/config.py`

**Step 1: Write config.py**

```python
"""Configuration loading from YAML + environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml
from dotenv import load_dotenv


@dataclass
class ModelConfig:
    provider: str
    model: str


@dataclass
class Config:
    project_dir: Path
    orchestration_file: str
    issues_file: str
    checkpoint_dir: Path
    log_dir: str
    models: dict[str, ModelConfig]
    fallback_chain: list[ModelConfig]
    max_review_retries: int
    fallback_wait_seconds: int
    request_timeout_seconds: int
    allowed_commands: list[str]

    @classmethod
    def load(cls, config_path: str | Path | None = None) -> Config:
        """Load config from YAML file, with env var overrides."""
        load_dotenv()

        if config_path is None:
            config_path = Path(__file__).parent / "config.yaml"

        with open(config_path) as f:
            raw = yaml.safe_load(f)

        project_dir = Path(
            os.environ.get("LOMITO_PROJECT_DIR", raw.get("project_dir") or ".")
        ).resolve()

        checkpoint_dir = Path(
            os.path.expanduser(raw.get("checkpoint_dir", "~/.claude/tasks/lomito"))
        )

        # Parse per-agent models
        models: dict[str, ModelConfig] = {}
        for agent_name, model_str in raw.get("models", {}).items():
            provider, model = model_str.split("/", 1)
            models[agent_name] = ModelConfig(provider=provider, model=model)

        # Parse fallback chain
        fallback_chain = [
            ModelConfig(provider=fc["provider"], model=fc["model"])
            for fc in raw.get("fallback_chain", [])
        ]

        retry = raw.get("retry", {})
        tools = raw.get("tools", {})

        return cls(
            project_dir=project_dir,
            orchestration_file=raw.get("orchestration_file", "docs/plans/ORCHESTRATION.md"),
            issues_file=raw.get("issues_file", "docs/plans/ISSUES.md"),
            checkpoint_dir=checkpoint_dir,
            log_dir=raw.get("log_dir", ".agent-logs"),
            models=models,
            fallback_chain=fallback_chain,
            max_review_retries=retry.get("max_review_retries", 3),
            fallback_wait_seconds=retry.get("fallback_wait_seconds", 60),
            request_timeout_seconds=retry.get("request_timeout_seconds", 120),
            allowed_commands=tools.get("allowed_commands", []),
        )
```

**Step 2: Commit**

```bash
git add agent_runner/config.py
git commit -m "feat(agent): add YAML + env config loader"
```

---

### Task 4: Structured logger

**Files:**

- Create: `agent_runner/logger.py`

**Step 1: Write logger.py**

```python
"""Structured JSON logging for agent orchestrator."""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class JSONFormatter(logging.Formatter):
    """Format log records as JSON lines."""

    def format(self, record: logging.LogRecord) -> str:
        log_data: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "agent": getattr(record, "agent", None),
            "llm_provider": getattr(record, "llm_provider", None),
            "message": record.getMessage(),
        }
        # Include extra fields
        for key in ("task_id", "tokens_in", "tokens_out", "latency_ms", "tool_name"):
            val = getattr(record, key, None)
            if val is not None:
                log_data[key] = val

        return json.dumps(log_data)


def setup_logging(log_dir: str, project_dir: Path) -> logging.Logger:
    """Set up file + console logging."""
    log_path = project_dir / log_dir
    log_path.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("agent_runner")
    logger.setLevel(logging.DEBUG)

    # JSON file handler
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    file_handler = logging.FileHandler(log_path / f"run_{timestamp}.jsonl")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)

    # Console handler (human-readable)
    console_handler = logging.StreamHandler(sys.stderr)
    console_handler.setLevel(logging.INFO)
    console_fmt = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )
    console_handler.setFormatter(console_fmt)
    logger.addHandler(console_handler)

    return logger


def log_llm_call(
    logger: logging.Logger,
    *,
    agent: str,
    provider: str,
    tokens_in: int,
    tokens_out: int,
    latency_ms: float,
    task_id: str | None = None,
) -> None:
    """Log an LLM API call with token usage."""
    logger.info(
        "LLM call: %s using %s (%d in, %d out, %.0fms)",
        agent,
        provider,
        tokens_in,
        tokens_out,
        latency_ms,
        extra={
            "agent": agent,
            "llm_provider": provider,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "latency_ms": latency_ms,
            "task_id": task_id,
        },
    )
```

**Step 2: Commit**

```bash
git add agent_runner/logger.py
git commit -m "feat(agent): add structured JSON logging"
```

---

### Task 5: Model router with multi-LLM fallback

**Files:**

- Create: `agent_runner/models.py`
- Create: `agent_runner/tests/test_models.py`

**Step 1: Write models.py**

```python
"""Multi-LLM router with automatic fallback chain."""

from __future__ import annotations

import logging
import time
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage

from agent_runner.config import Config, ModelConfig

logger = logging.getLogger("agent_runner")

# Provider-specific error types that trigger fallback
RATE_LIMIT_CODES = {429}
SERVER_ERROR_CODES = {500, 502, 503, 504}


def create_chat_model(model_config: ModelConfig, timeout: int = 120) -> BaseChatModel:
    """Create a LangChain chat model from a ModelConfig."""
    if model_config.provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=model_config.model,
            timeout=timeout,
            max_retries=0,  # We handle retries ourselves
        )
    elif model_config.provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=model_config.model,
            timeout=timeout,
        )
    elif model_config.provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_config.model,
            timeout=timeout,
            max_retries=0,
        )
    else:
        raise ValueError(f"Unknown provider: {model_config.provider}")


class ModelRouter:
    """Routes LLM calls through a fallback chain of providers."""

    def __init__(self, config: Config) -> None:
        self.config = config
        self.fallback_chain = config.fallback_chain
        self.timeout = config.request_timeout_seconds
        self._current_provider: str = ""
        self._token_usage: dict[str, dict[str, int]] = {}

    @property
    def current_provider(self) -> str:
        return self._current_provider

    @property
    def token_usage(self) -> dict[str, dict[str, int]]:
        return self._token_usage

    def get_model_for_agent(self, agent_name: str) -> BaseChatModel:
        """Get the preferred model for a specific agent, with fallback."""
        preferred = self.config.models.get(agent_name)
        if preferred:
            try:
                model = create_chat_model(preferred, self.timeout)
                self._current_provider = f"{preferred.provider}/{preferred.model}"
                return model
            except Exception as e:
                logger.warning(
                    "Preferred model %s/%s unavailable for %s: %s",
                    preferred.provider,
                    preferred.model,
                    agent_name,
                    e,
                )

        # Fall through to chain
        return self._get_fallback_model()

    def _get_fallback_model(self) -> BaseChatModel:
        """Try each model in the fallback chain."""
        for mc in self.fallback_chain:
            try:
                model = create_chat_model(mc, self.timeout)
                self._current_provider = f"{mc.provider}/{mc.model}"
                return model
            except Exception as e:
                logger.warning(
                    "Fallback model %s/%s unavailable: %s",
                    mc.provider,
                    mc.model,
                    e,
                )

        raise RuntimeError("All LLM providers exhausted. Cannot continue.")

    def invoke_with_fallback(
        self,
        agent_name: str,
        messages: list[BaseMessage],
        tools: list[Any] | None = None,
    ) -> Any:
        """Invoke an LLM with automatic fallback on failure."""
        chain = list(self.fallback_chain)

        # Try preferred model first
        preferred = self.config.models.get(agent_name)
        if preferred:
            chain = [preferred] + [
                mc for mc in chain
                if not (mc.provider == preferred.provider and mc.model == preferred.model)
            ]

        last_error: Exception | None = None
        for mc in chain:
            try:
                model = create_chat_model(mc, self.timeout)
                if tools:
                    model = model.bind_tools(tools)

                start = time.monotonic()
                response = model.invoke(messages)
                elapsed_ms = (time.monotonic() - start) * 1000

                # Track token usage
                provider_key = f"{mc.provider}/{mc.model}"
                self._current_provider = provider_key
                usage = getattr(response, "usage_metadata", None)
                if usage:
                    if provider_key not in self._token_usage:
                        self._token_usage[provider_key] = {"input": 0, "output": 0}
                    self._token_usage[provider_key]["input"] += getattr(usage, "input_tokens", 0)
                    self._token_usage[provider_key]["output"] += getattr(usage, "output_tokens", 0)

                logger.info(
                    "LLM call succeeded: agent=%s provider=%s latency=%.0fms",
                    agent_name,
                    provider_key,
                    elapsed_ms,
                    extra={
                        "agent": agent_name,
                        "llm_provider": provider_key,
                        "latency_ms": elapsed_ms,
                    },
                )

                return response

            except Exception as e:
                last_error = e
                logger.warning(
                    "LLM call failed: agent=%s provider=%s/%s error=%s",
                    agent_name,
                    mc.provider,
                    mc.model,
                    str(e),
                )
                continue

        # All providers failed — wait and retry once
        logger.warning(
            "All providers failed. Waiting %ds before final retry...",
            self.config.fallback_wait_seconds,
        )
        time.sleep(self.config.fallback_wait_seconds)

        # One more attempt with the first available
        for mc in chain:
            try:
                model = create_chat_model(mc, self.timeout)
                if tools:
                    model = model.bind_tools(tools)
                return model.invoke(messages)
            except Exception:
                continue

        raise RuntimeError(
            f"All LLM providers exhausted after retry. Last error: {last_error}"
        )
```

**Step 2: Commit**

```bash
git add agent_runner/models.py
git commit -m "feat(agent): add multi-LLM router with fallback chain"
```

---

### Task 6: Agent tools (file ops, bash, grep)

**Files:**

- Create: `agent_runner/tools.py`

**Step 1: Write tools.py with LangChain tool definitions**

```python
"""Tools available to LLM agents for file operations and shell commands."""

from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

from langchain_core.tools import tool


def make_tools(working_dir: Path, allowed_commands: list[str]) -> list:
    """Create tool instances bound to a working directory."""

    @tool
    def read_file(file_path: str) -> str:
        """Read the contents of a file. Use absolute paths or paths relative to the project root."""
        p = _resolve_path(file_path, working_dir)
        if not p.exists():
            return f"Error: File not found: {p}"
        if not p.is_file():
            return f"Error: Not a file: {p}"
        try:
            content = p.read_text(encoding="utf-8")
            if len(content) > 50000:
                return content[:50000] + f"\n\n... [truncated, {len(content)} total chars]"
            return content
        except Exception as e:
            return f"Error reading file: {e}"

    @tool
    def write_file(file_path: str, content: str) -> str:
        """Write content to a file. Creates parent directories if needed."""
        p = _resolve_path(file_path, working_dir)
        try:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(content, encoding="utf-8")
            return f"Successfully wrote {len(content)} chars to {p}"
        except Exception as e:
            return f"Error writing file: {e}"

    @tool
    def edit_file(file_path: str, old_string: str, new_string: str) -> str:
        """Replace an exact string in a file. The old_string must appear exactly once."""
        p = _resolve_path(file_path, working_dir)
        if not p.exists():
            return f"Error: File not found: {p}"
        try:
            content = p.read_text(encoding="utf-8")
            count = content.count(old_string)
            if count == 0:
                return f"Error: old_string not found in {p}"
            if count > 1:
                return f"Error: old_string found {count} times in {p}. Must be unique."
            new_content = content.replace(old_string, new_string, 1)
            p.write_text(new_content, encoding="utf-8")
            return f"Successfully edited {p}"
        except Exception as e:
            return f"Error editing file: {e}"

    @tool
    def list_directory(dir_path: str = ".") -> str:
        """List files and directories at a path."""
        p = _resolve_path(dir_path, working_dir)
        if not p.exists():
            return f"Error: Directory not found: {p}"
        if not p.is_dir():
            return f"Error: Not a directory: {p}"
        try:
            entries = sorted(p.iterdir())
            result = []
            for entry in entries[:200]:  # Limit entries
                prefix = "d " if entry.is_dir() else "f "
                result.append(f"{prefix}{entry.name}")
            if len(entries) > 200:
                result.append(f"... and {len(entries) - 200} more entries")
            return "\n".join(result)
        except Exception as e:
            return f"Error listing directory: {e}"

    @tool
    def search_files(pattern: str, path: str = ".", file_glob: str = "") -> str:
        """Search for a regex pattern in files using grep. Returns matching lines with file paths."""
        p = _resolve_path(path, working_dir)
        cmd = ["grep", "-rn", "--include", file_glob or "*", "-E", pattern, str(p)]
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=str(working_dir),
            )
            output = result.stdout
            if len(output) > 20000:
                output = output[:20000] + "\n... [truncated]"
            return output or "No matches found."
        except subprocess.TimeoutExpired:
            return "Error: Search timed out after 30s"
        except Exception as e:
            return f"Error searching: {e}"

    @tool
    def run_command(command: str) -> str:
        """Run a shell command. Only allowed commands can be used (git, npm, npx, tsc, eslint, prettier, node, python)."""
        # Validate command against allowlist
        cmd_parts = command.strip().split()
        if not cmd_parts:
            return "Error: Empty command"

        base_cmd = cmd_parts[0]
        if base_cmd not in allowed_commands:
            return f"Error: Command '{base_cmd}' not in allowed list: {allowed_commands}"

        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=120,
                cwd=str(working_dir),
                env={**os.environ, "PATH": os.environ.get("PATH", "")},
            )
            output = ""
            if result.stdout:
                output += result.stdout
            if result.stderr:
                output += f"\nSTDERR:\n{result.stderr}"
            if result.returncode != 0:
                output += f"\nExit code: {result.returncode}"

            if len(output) > 30000:
                output = output[:30000] + "\n... [truncated]"

            return output or "(no output)"
        except subprocess.TimeoutExpired:
            return "Error: Command timed out after 120s"
        except Exception as e:
            return f"Error running command: {e}"

    return [read_file, write_file, edit_file, list_directory, search_files, run_command]


def _resolve_path(path_str: str, working_dir: Path) -> Path:
    """Resolve a path relative to working directory, or use as absolute."""
    p = Path(path_str)
    if p.is_absolute():
        return p
    return working_dir / p
```

**Step 2: Commit**

```bash
git add agent_runner/tools.py
git commit -m "feat(agent): add LangChain tools for file ops, search, and shell commands"
```

---

### Task 7: Agent node implementations

**Files:**

- Create: `agent_runner/agents/planner.py`
- Create: `agent_runner/agents/implementer.py`
- Create: `agent_runner/agents/reviewer.py`
- Create: `agent_runner/agents/committer.py`

**Step 1: Write planner agent**

The planner reads parsed tasks, determines the next unblocked one, and loads the spec file content if available.

```python
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

    # Check for unblocked tasks
    unblocked = get_unblocked_tasks(tasks, task_status)

    if not unblocked:
        # Check if all tasks are done or all remaining are blocked/failed
        pending = [t for t in tasks if task_status.get(t.id, "pending") == "pending"]
        if not pending:
            logger.info("All tasks completed!")
            return {"current_task": None, "error": None}
        else:
            logger.info("No unblocked tasks. %d tasks still blocked.", len(pending))
            return {"current_task": None, "error": "blocked"}

    # For simple cases, just pick the first unblocked task
    if len(unblocked) == 1:
        selected = unblocked[0]
    else:
        # Ask LLM to pick the best task
        task_summary = "\n".join(
            f"- {t.id}: {t.title} (depends on: {', '.join(t.depends_on) or 'nothing'})"
            for t in tasks
        )
        status_summary = "\n".join(
            f"- {tid}: {status}" for tid, status in task_status.items()
        )
        unblocked_summary = "\n".join(
            f"- {t.id}: {t.title}" for t in unblocked
        )

        messages = [
            SystemMessage(content=PLANNER_SYSTEM),
            HumanMessage(content=f"""Tasks:\n{task_summary}\n\nStatus:\n{status_summary}\n\nUnblocked tasks:\n{unblocked_summary}\n\nWhich task should we execute next?"""),
        ]

        response = router.invoke_with_fallback("planner", messages)
        response_text = response.content.strip()

        # Parse response for task ID
        selected = unblocked[0]  # Default to first
        for task in unblocked:
            if task.id in response_text:
                selected = task
                break

    logger.info("Planner selected task: %s - %s", selected.id, selected.title)

    # Load spec content if available
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
```

**Step 2: Write implementer agent**

```python
"""Implementer agent: executes a task by writing code with tools."""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

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

MAX_TOOL_ROUNDS = 30  # Maximum tool-calling rounds per implementation


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

    # Add any existing context messages (e.g., from reviewer feedback)
    context_messages = state.get("messages", [])
    if context_messages:
        messages.extend(context_messages)

    # Tool-calling loop
    for round_num in range(MAX_TOOL_ROUNDS):
        response = router.invoke_with_fallback("implementer", messages, tools=tools)
        messages.append(response)

        # Check if the model made tool calls
        if not response.tool_calls:
            # No more tool calls — implementation is done
            logger.info(
                "Implementer finished task %s after %d rounds",
                task.id,
                round_num + 1,
            )
            break

        # Execute tool calls and add results
        for tool_call in response.tool_calls:
            tool_fn = _find_tool(tools, tool_call["name"])
            if tool_fn is None:
                tool_result = f"Error: Unknown tool '{tool_call['name']}'"
            else:
                try:
                    tool_result = tool_fn.invoke(tool_call["args"])
                except Exception as e:
                    tool_result = f"Error executing {tool_call['name']}: {e}"

            messages.append(
                ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"])
            )
            logger.debug(
                "Tool %s called (round %d)", tool_call["name"], round_num + 1
            )
    else:
        logger.warning("Implementer hit max rounds (%d) for task %s", MAX_TOOL_ROUNDS, task.id)

    return {
        "messages": messages,
        "git_dirty": True,
        "error": None,
    }


def _find_tool(tools: list, name: str):
    """Find a tool by name."""
    for t in tools:
        if t.name == name:
            return t
    return None
```

**Step 3: Write reviewer agent**

```python
"""Reviewer agent: reviews changes and runs tests."""

from __future__ import annotations

import logging
from typing import Any

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
            # Check for approval/rejection in final message
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
                # Ambiguous — treat as approved if no explicit rejection
                logger.info("Reviewer gave ambiguous response for %s, treating as approved", task.id)
                return {"messages": messages, "error": None}

        # Execute tool calls
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

            messages.append(
                ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"])
            )

    # Hit max rounds — approve by default
    logger.warning("Reviewer hit max rounds for task %s, auto-approving", task.id)
    return {"messages": messages, "error": None}
```

**Step 4: Write committer agent**

```python
"""Committer agent: creates git commits with conventional messages."""

from __future__ import annotations

import logging
import subprocess
from pathlib import Path
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

    # Check if there are changes to commit
    status_result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        cwd=working_dir,
    )
    if not status_result.stdout.strip():
        logger.info("No changes to commit for task %s", task.id)
        return {"git_dirty": False, "error": None}

    # Get diff for commit message generation
    diff_result = subprocess.run(
        ["git", "diff", "--stat"],
        capture_output=True,
        text=True,
        cwd=working_dir,
    )

    # Use task's commit message if available, otherwise generate one
    if task.commit_message:
        commit_msg = task.commit_message
    else:
        messages = [
            SystemMessage(content=COMMITTER_SYSTEM),
            HumanMessage(content=f"""Task: {task.id} - {task.title}

Git diff stat:
{diff_result.stdout[:3000]}

Files changed:
{status_result.stdout[:3000]}

Generate the commit message."""),
        ]
        response = router.invoke_with_fallback("committer", messages)
        commit_msg = response.content.strip().strip('"').strip("'")

    # Stage all changes
    subprocess.run(
        ["git", "add", "-A"],
        cwd=working_dir,
        check=True,
    )

    # Commit
    try:
        subprocess.run(
            ["git", "commit", "-m", commit_msg],
            cwd=working_dir,
            capture_output=True,
            text=True,
            check=True,
        )
        logger.info("Committed: %s", commit_msg)
        return {"git_dirty": False, "error": None}
    except subprocess.CalledProcessError as e:
        logger.error("Git commit failed: %s", e.stderr)
        return {"git_dirty": True, "error": f"commit_failed: {e.stderr}"}
```

**Step 5: Commit**

```bash
git add agent_runner/agents/
git commit -m "feat(agent): add planner, implementer, reviewer, and committer agent nodes"
```

---

### Task 8: LangGraph graph wiring

**Files:**

- Create: `agent_runner/graph.py`

**Step 1: Write the StateGraph with conditional edges**

```python
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
    """Route after reviewer: approve → commit, reject → retry or skip."""
    error = state.get("error")
    if error != "review_rejected":
        return "committer"

    retry_count = state.get("retry_count", 0)
    if retry_count < max_retries:
        return "implementer"

    # Too many retries — skip task, go back to planner
    return "planner"


def build_graph(config: Config) -> tuple[Any, SqliteSaver]:
    """Build and compile the agent orchestrator graph."""
    # Set up model router
    router = ModelRouter(config)

    # Set up tools
    tools = make_tools(
        working_dir=config.project_dir,
        allowed_commands=config.allowed_commands,
    )

    # Create graph
    graph = StateGraph(AgentState)

    # Add nodes (using partial to inject dependencies)
    graph.add_node(
        "planner",
        partial(planner_node, router=router, config=config),
    )
    graph.add_node(
        "implementer",
        partial(implementer_node, router=router, tools=tools),
    )
    graph.add_node(
        "reviewer",
        partial(reviewer_node, router=router, tools=tools),
    )
    graph.add_node(
        "committer",
        partial(committer_node, router=router, config=config),
    )

    # Set entry point
    graph.set_entry_point("planner")

    # Add edges
    graph.add_conditional_edges("planner", route_after_planner)
    graph.add_edge("implementer", "reviewer")
    graph.add_conditional_edges(
        "reviewer",
        partial(route_after_reviewer, max_retries=config.max_review_retries),
    )
    graph.add_edge("committer", "planner")

    # Set up checkpointing
    checkpoint_dir = config.checkpoint_dir
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    db_path = checkpoint_dir / "checkpoints.db"
    conn = sqlite3.connect(str(db_path))
    memory = SqliteSaver(conn)

    compiled = graph.compile(checkpointer=memory)
    return compiled, memory
```

**Step 2: Commit**

```bash
git add agent_runner/graph.py
git commit -m "feat(agent): wire LangGraph StateGraph with conditional edges and checkpointing"
```

---

### Task 9: CLI entry point

**Files:**

- Create: `agent_runner/agent.py`

**Step 1: Write CLI with Click**

```python
"""CLI entry point for the agent orchestrator."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import click

from agent_runner.config import Config
from agent_runner.graph import build_graph
from agent_runner.logger import setup_logging
from agent_runner.parser import parse_orchestration
from agent_runner.state import Task


def _initial_state(config: Config) -> dict:
    """Build initial state from ORCHESTRATION.md."""
    orch_path = config.project_dir / config.orchestration_file
    if not orch_path.exists():
        click.echo(f"Error: {orch_path} not found", err=True)
        sys.exit(1)

    tasks = parse_orchestration(orch_path)

    # Build initial status: mark already-done tasks
    task_status: dict[str, str] = {}
    for task in tasks:
        task_status[task.id] = "done" if task.done else "pending"

    done_count = sum(1 for s in task_status.values() if s == "done")
    total = len(tasks)
    click.echo(f"Loaded {total} tasks ({done_count} done, {total - done_count} remaining)")

    return {
        "tasks": tasks,
        "current_task": None,
        "task_status": task_status,
        "messages": [],
        "git_dirty": False,
        "retry_count": 0,
        "current_llm": "",
        "error": None,
        "phase": tasks[0].phase if tasks else "",
        "token_usage": {},
    }


@click.group()
@click.option("--config", "config_path", default=None, help="Path to config.yaml")
@click.pass_context
def cli(ctx: click.Context, config_path: str | None) -> None:
    """Lomito Agent Orchestrator — Autonomous task execution with LangGraph."""
    ctx.ensure_object(dict)
    ctx.obj["config_path"] = config_path


@cli.command()
@click.pass_context
def run(ctx: click.Context) -> None:
    """Start the orchestrator. Executes all unblocked tasks."""
    config = Config.load(ctx.obj.get("config_path"))
    logger = setup_logging(config.log_dir, config.project_dir)

    click.echo("Building agent graph...")
    compiled_graph, memory = build_graph(config)

    click.echo("Parsing ORCHESTRATION.md...")
    state = _initial_state(config)

    thread_config = {"configurable": {"thread_id": "lomito-main"}}

    click.echo("Starting orchestration loop...\n")
    try:
        result = compiled_graph.invoke(state, config=thread_config)
        click.echo("\nOrchestration complete.")
        _print_summary(result)
    except KeyboardInterrupt:
        click.echo("\nInterrupted. State saved to checkpoint. Resume with: python agent.py resume")
    except Exception as e:
        logger.exception("Orchestration failed")
        click.echo(f"\nError: {e}", err=True)
        click.echo("State saved to checkpoint. Resume with: python agent.py resume")
        sys.exit(1)


@cli.command()
@click.pass_context
def resume(ctx: click.Context) -> None:
    """Resume from the last checkpoint."""
    config = Config.load(ctx.obj.get("config_path"))
    logger = setup_logging(config.log_dir, config.project_dir)

    compiled_graph, memory = build_graph(config)
    thread_config = {"configurable": {"thread_id": "lomito-main"}}

    # Get the last checkpoint state
    last_state = compiled_graph.get_state(thread_config)
    if last_state is None or not last_state.values:
        click.echo("No checkpoint found. Use 'run' to start fresh.")
        return

    click.echo("Resuming from checkpoint...")
    click.echo(f"Current task: {last_state.values.get('current_task')}")

    try:
        result = compiled_graph.invoke(None, config=thread_config)
        click.echo("\nOrchestration complete.")
        _print_summary(result)
    except KeyboardInterrupt:
        click.echo("\nInterrupted. State saved.")
    except Exception as e:
        logger.exception("Resume failed")
        click.echo(f"\nError: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.pass_context
def status(ctx: click.Context) -> None:
    """Show current orchestration state."""
    config = Config.load(ctx.obj.get("config_path"))
    compiled_graph, memory = build_graph(config)
    thread_config = {"configurable": {"thread_id": "lomito-main"}}

    last_state = compiled_graph.get_state(thread_config)
    if last_state is None or not last_state.values:
        click.echo("No checkpoint found. Run 'python agent.py run' to start.")
        return

    values = last_state.values
    task_status = values.get("task_status", {})

    click.echo("=== Agent Orchestrator Status ===\n")

    # Task summary
    done = sum(1 for s in task_status.values() if s == "done")
    pending = sum(1 for s in task_status.values() if s == "pending")
    failed = sum(1 for s in task_status.values() if s == "failed")
    skipped = sum(1 for s in task_status.values() if s == "skipped")

    click.echo(f"Tasks: {done} done, {pending} pending, {failed} failed, {skipped} skipped")
    click.echo(f"Current task: {values.get('current_task')}")
    click.echo(f"Current LLM: {values.get('current_llm', 'N/A')}")
    click.echo(f"Git dirty: {values.get('git_dirty', False)}")
    click.echo(f"Retry count: {values.get('retry_count', 0)}")

    if values.get("error"):
        click.echo(f"Last error: {values['error']}")

    # Token usage
    token_usage = values.get("token_usage", {})
    if token_usage:
        click.echo("\nToken Usage:")
        for provider, usage in token_usage.items():
            click.echo(f"  {provider}: {usage.get('input', 0)} in / {usage.get('output', 0)} out")

    # Per-task status
    click.echo("\nTask Details:")
    for tid, s in sorted(task_status.items()):
        icon = {"done": "✓", "pending": "○", "failed": "✗", "skipped": "⊘", "blocked": "⊖"}.get(s, "?")
        click.echo(f"  {icon} {tid}: {s}")


@cli.command()
@click.confirmation_option(prompt="This will delete all checkpoints. Are you sure?")
@click.pass_context
def reset(ctx: click.Context) -> None:
    """Clear all checkpoints and start fresh."""
    config = Config.load(ctx.obj.get("config_path"))
    db_path = config.checkpoint_dir / "checkpoints.db"

    if db_path.exists():
        db_path.unlink()
        click.echo(f"Deleted {db_path}")
    else:
        click.echo("No checkpoint database found.")

    click.echo("State cleared. Run 'python agent.py run' to start fresh.")


def _print_summary(result: dict) -> None:
    """Print a summary of the orchestration run."""
    task_status = result.get("task_status", {})
    done = sum(1 for s in task_status.values() if s == "done")
    total = len(task_status)

    click.echo(f"\n=== Summary ===")
    click.echo(f"Tasks completed: {done}/{total}")

    token_usage = result.get("token_usage", {})
    if token_usage:
        click.echo("\nToken usage:")
        for provider, usage in token_usage.items():
            click.echo(f"  {provider}: {usage.get('input', 0)} in / {usage.get('output', 0)} out")


if __name__ == "__main__":
    cli()
```

**Step 2: Commit**

```bash
git add agent_runner/agent.py
git commit -m "feat(agent): add Click CLI with run, resume, status, and reset commands"
```

---

### Task 10: README and .gitignore updates

**Files:**

- Create: `agent_runner/README.md`
- Modify: `.gitignore`

**Step 1: Write README.md**

Document setup, configuration, usage, and architecture.

**Step 2: Add agent-specific entries to .gitignore**

```
# Agent runner
.agent-logs/
agent_runner/__pycache__/
agent_runner/tests/__pycache__/
*.pyc
```

**Step 3: Commit**

```bash
git add agent_runner/README.md .gitignore
git commit -m "docs(agent): add README and update .gitignore for agent runner"
```

---

### Task 11: Integration test — dry run

**Step 1: Install dependencies**

```bash
cd agent_runner && pip install -r requirements.txt
```

**Step 2: Run parser tests**

```bash
python -m pytest agent_runner/tests/test_parser.py -v
```

**Step 3: Verify CLI loads without API keys**

```bash
python agent_runner/agent.py --help
python agent_runner/agent.py status
```

**Step 4: Fix any issues found**

**Step 5: Commit fixes if needed**

```bash
git add -A && git commit -m "fix(agent): address integration issues from dry run"
```
