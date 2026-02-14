"""Multi-LLM router with automatic fallback chain."""

from __future__ import annotations

import logging
import time
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage

from agent_runner.config import Config, ModelConfig

logger = logging.getLogger("agent_runner")


def create_chat_model(model_config: ModelConfig, timeout: int = 120) -> BaseChatModel:
    """Create a LangChain chat model from a ModelConfig."""
    if model_config.provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=model_config.model, timeout=timeout, max_retries=0)
    elif model_config.provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(model=model_config.model, timeout=timeout)
    elif model_config.provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model=model_config.model, timeout=timeout, max_retries=0)
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
                    preferred.provider, preferred.model, agent_name, e,
                )
        return self._get_fallback_model()

    def _get_fallback_model(self) -> BaseChatModel:
        """Try each model in the fallback chain."""
        for mc in self.fallback_chain:
            try:
                model = create_chat_model(mc, self.timeout)
                self._current_provider = f"{mc.provider}/{mc.model}"
                return model
            except Exception as e:
                logger.warning("Fallback model %s/%s unavailable: %s", mc.provider, mc.model, e)
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
                    agent_name, provider_key, elapsed_ms,
                    extra={"agent": agent_name, "llm_provider": provider_key, "latency_ms": elapsed_ms},
                )
                return response

            except Exception as e:
                last_error = e
                logger.warning(
                    "LLM call failed: agent=%s provider=%s/%s error=%s",
                    agent_name, mc.provider, mc.model, str(e),
                )
                continue

        # All providers failed — wait and retry once
        logger.warning(
            "All providers failed. Waiting %ds before final retry...",
            self.config.fallback_wait_seconds,
        )
        time.sleep(self.config.fallback_wait_seconds)

        for mc in chain:
            try:
                model = create_chat_model(mc, self.timeout)
                if tools:
                    model = model.bind_tools(tools)
                return model.invoke(messages)
            except Exception:
                continue

        raise RuntimeError(f"All LLM providers exhausted after retry. Last error: {last_error}")
