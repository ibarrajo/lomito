"""Configuration loading from YAML + environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass
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
