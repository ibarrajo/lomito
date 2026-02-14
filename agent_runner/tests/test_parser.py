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
    assert "P1-T3" not in ids
    assert "P2-T1" not in ids


def test_all_done_returns_empty(sample_orchestration: Path) -> None:
    tasks = parse_orchestration(sample_orchestration)
    status = {t.id: "done" for t in tasks}

    unblocked = get_unblocked_tasks(tasks, status)
    assert unblocked == []
