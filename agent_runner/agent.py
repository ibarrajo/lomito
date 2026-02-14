"""CLI entry point for the agent orchestrator."""

from __future__ import annotations

import sys
from pathlib import Path

import click

from agent_runner.config import Config
from agent_runner.graph import build_graph
from agent_runner.logger import setup_logging
from agent_runner.parser import parse_orchestration


def _initial_state(config: Config) -> dict:
    """Build initial state from ORCHESTRATION.md."""
    orch_path = config.project_dir / config.orchestration_file
    if not orch_path.exists():
        click.echo(f"Error: {orch_path} not found", err=True)
        sys.exit(1)

    tasks = parse_orchestration(orch_path)

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
    """Lomito Agent Orchestrator - Autonomous task execution with LangGraph."""
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

    token_usage = values.get("token_usage", {})
    if token_usage:
        click.echo("\nToken Usage:")
        for provider, usage in token_usage.items():
            click.echo(f"  {provider}: {usage.get('input', 0)} in / {usage.get('output', 0)} out")

    click.echo("\nTask Details:")
    for tid, s in sorted(task_status.items()):
        icon = {"done": "v", "pending": "o", "failed": "x", "skipped": "-", "blocked": "b"}.get(s, "?")
        click.echo(f"  [{icon}] {tid}: {s}")


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
