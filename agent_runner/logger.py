"""Structured JSON logging for agent orchestrator."""

from __future__ import annotations

import json
import logging
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

    # Avoid duplicate handlers on re-init
    if logger.handlers:
        return logger

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
