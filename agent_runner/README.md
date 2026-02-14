# Lomito Agent Runner

Autonomous task orchestrator using LangGraph. Parses `ORCHESTRATION.md`, executes tasks using multi-LLM tool-calling agents, reviews changes, and commits completed work.

## Architecture

```
Planner -> Implementer -> Reviewer -> Committer -> Planner (loop)
                ^              |
                +--------------+ (review rejected, retry)
```

- **Planner**: Reads tasks, resolves dependencies, selects next unblocked task
- **Implementer**: Tool-calling LLM that reads/writes files and runs commands
- **Reviewer**: Checks code quality, runs typecheck/lint, approves or rejects
- **Committer**: Stages changes and creates conventional commits

## Setup

1. Create a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r agent_runner/requirements.txt
```

3. Copy and fill in API keys:

```bash
cp agent_runner/.env.example .env
```

Required keys (at least one):
- `ANTHROPIC_API_KEY` - Claude Opus 4 (primary)
- `GOOGLE_API_KEY` - Gemini 2.0 Flash (fallback 1)
- `OPENAI_API_KEY` - GPT-4 (fallback 2)

Optional:
- `LOMITO_PROJECT_DIR` - Project root (defaults to current directory)

## Usage

```bash
# Start orchestration (executes all unblocked tasks)
python agent_runner/agent.py run

# Check current state
python agent_runner/agent.py status

# Resume from last checkpoint after interruption
python agent_runner/agent.py resume

# Clear all state and start fresh
python agent_runner/agent.py reset

# Use a custom config file
python agent_runner/agent.py --config path/to/config.yaml run
```

## Configuration

Edit `agent_runner/config.yaml` to customize:

- **models**: Which LLM each agent uses (format: `provider/model`)
- **fallback_chain**: Priority order for LLM failover
- **retry**: Max review retries, timeout, fallback wait time
- **tools.allowed_commands**: Shell commands agents can execute

## Multi-LLM Fallback

The router tries providers in order: Anthropic -> Google -> OpenAI. On rate limits (429), server errors (5xx), or timeouts, it automatically falls back to the next provider. If all fail, it waits and retries once before raising.

Each agent can have its own preferred model. The committer defaults to Gemini Flash (fast and cheap for commit message generation).

## State and Checkpoints

State is persisted to `~/.claude/tasks/lomito/checkpoints.db` using LangGraph's SQLite checkpointer. If interrupted (Ctrl+C or error), resume with `python agent_runner/agent.py resume`.

## Logs

Structured JSON logs are written to `.agent-logs/` with timestamps, agent names, LLM providers, token counts, and latency. Console output shows human-readable progress.

## Running Tests

```bash
python -m pytest agent_runner/tests/ -v
```
