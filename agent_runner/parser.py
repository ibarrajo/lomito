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

            depends_on: list[str] = []
            spec: str | None = None
            deliverables: list[str] = []
            commit_message: str | None = None
            done = False

            i += 1
            while i < len(lines) and not lines[i].startswith("### ") and not lines[i].startswith("## ") and not lines[i].startswith("---"):
                body_line = lines[i].strip()

                dep_match = re.match(r"^- \*\*Depends on:\*\*\s*(.+)$", body_line)
                if dep_match:
                    dep_str = dep_match.group(1)
                    if dep_str.lower() != "nothing":
                        depends_on = [d.strip() for d in re.findall(r"P\d+-T\d+", dep_str)]

                spec_match = re.match(r"^- \*\*Spec:\*\*\s*(.+)$", body_line)
                if spec_match:
                    spec = spec_match.group(1).strip("`").strip()

                if body_line.startswith("- `") and "Depends" not in body_line and "Spec" not in body_line and "Commit" not in body_line:
                    deliverables.append(body_line.lstrip("- ").strip("`").strip())

                commit_match = re.match(r"^- \*\*Commit:\*\*\s*`(.+)`$", body_line)
                if commit_match:
                    commit_message = commit_match.group(1)

                if body_line == "- [x] Done":
                    done = True
                elif body_line == "- [ ] Done":
                    done = False

                i += 1

            tasks.append(Task(
                id=task_id,
                title=task_title,
                phase=current_phase,
                depends_on=depends_on,
                spec=spec,
                deliverables=deliverables,
                commit_message=commit_message,
                done=done,
            ))
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
