"""Tools available to LLM agents for file operations and shell commands."""

from __future__ import annotations

import os
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
            for entry in entries[:200]:
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
                cmd, capture_output=True, text=True, timeout=30, cwd=str(working_dir),
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
        cmd_parts = command.strip().split()
        if not cmd_parts:
            return "Error: Empty command"

        base_cmd = cmd_parts[0]
        if base_cmd not in allowed_commands:
            return f"Error: Command '{base_cmd}' not in allowed list: {allowed_commands}"

        try:
            result = subprocess.run(
                command, shell=True, capture_output=True, text=True,
                timeout=120, cwd=str(working_dir),
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
