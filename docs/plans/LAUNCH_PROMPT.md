# Lomito — Claude Code Launch Prompt

## Quick Start

```bash
cd ~/Code/lomito
CLAUDE_CODE_TASK_LIST_ID=lomito claude --model opus
```

Then paste the prompt below.

---

## Launch Prompt (copy everything between the lines)

```
Read CLAUDE.md for full project context, then read docs/plans/ORCHESTRATION.md for the phased task plan.

## Your role

You are the orchestrator. You do NOT write code. You decompose work, create tasks, delegate to subagents, verify results, and commit.

## Startup sequence

1. Run "Show me all tasks" to check for existing task state.
2. If no tasks exist, hydrate Phase 1 from docs/plans/ORCHESTRATION.md:
   - Create each task via TaskCreate with subject, description, and blockedBy dependencies.
   - P1-T1 and P1-T4 have no dependencies (can start in parallel).
   - P1-T2 depends on P1-T1. P1-T3 depends on P1-T2. P1-T5 depends on P1-T1.
   - P1-T6 depends on P1-T3, P1-T4, P1-T5.
   - P1-T7 depends on P1-T3, P1-T4.
3. Check docs/plans/ISSUES.md for blockers. If a task is blocked by a missing API key, skip it and move to the next unblocked task.

## Execution loop

For each unblocked task:
1. Mark it in_progress via TaskUpdate.
2. Delegate to a subagent: "Use the implementer agent to complete [task]. The task spec is: [paste deliverables from ORCHESTRATION.md]."
3. When the subagent finishes, use the reviewer agent: "Use the reviewer agent to check the files created for [task]."
4. If reviewer passes: stage, commit, and mark completed.
   - git add -A
   - git commit -m "[commit message from ORCHESTRATION.md]"
   - TaskUpdate → completed
5. If reviewer fails: send feedback to a new implementer subagent to fix the issues, then re-review.
6. Move to next unblocked task.

## Parallel execution

P1-T1 (Expo scaffold) and P1-T4 (Supabase schema) can run in parallel — they touch completely different directories. When both are done, P1-T2, P1-T5 become unblocked.

## When to stop

Stop and report status when:
- All Phase 1 tasks are completed
- All remaining tasks are blocked (log blockers to ISSUES.md)
- You encounter a true error you cannot resolve

## Rules

- NEVER write code in the main session. Always delegate to subagents.
- Subagents use Sonnet (cheaper, fast for focused tasks). You stay on Opus for orchestration.
- Each subagent gets a fresh context — always pass the full task spec and relevant file paths.
- One commit per task. Conventional commit messages.
- If something is ambiguous, make a reasonable decision and document it in a code comment. Don't stop.
- Keep docs/plans/ORCHESTRATION.md updated by checking off completed tasks.

Start now. Hydrate the task list and begin executing.
```

---

## Resuming Work (after terminal close or new session)

```bash
cd ~/Code/lomito
CLAUDE_CODE_TASK_LIST_ID=lomito claude --model opus --resume
```

Or for a fresh session that picks up the task state:

```bash
cd ~/Code/lomito
CLAUDE_CODE_TASK_LIST_ID=lomito claude --model opus
```

Then: `Show me all tasks and continue executing unblocked work.`

---

## Running Unattended

For long-running autonomous sessions, use headless mode:

```bash
cd ~/Code/lomito
CLAUDE_CODE_TASK_LIST_ID=lomito claude -p "Read CLAUDE.md, check task state, and continue executing unblocked tasks. Delegate to subagents. Commit completed work. Stop when blocked or all tasks are done." --model opus --dangerously-skip-permissions
```

To restart automatically on completion/crash (bash loop):

```bash
cd ~/Code/lomito
while true; do
  echo "$(date): Starting Lomito agent session..."
  CLAUDE_CODE_TASK_LIST_ID=lomito claude -p \
    "Read CLAUDE.md. Show all tasks. Execute the next unblocked task by delegating to the implementer agent. Review with reviewer agent. Commit if passing. Update task status. Continue until blocked or done." \
    --model opus \
    --dangerously-skip-permissions \
    2>&1 | tee -a .claude-agent.log
  
  EXIT_CODE=$?
  echo "$(date): Session ended (exit $EXIT_CODE). Checking for remaining work..."
  
  # Check if there are uncompleted tasks
  TASKS_REMAINING=$(find ~/.claude/tasks/ -name "*.json" -exec grep -l '"status":"pending"' {} \; 2>/dev/null | wc -l)
  
  if [ "$TASKS_REMAINING" -eq 0 ]; then
    echo "$(date): All tasks complete or no tasks found. Stopping."
    break
  fi
  
  echo "$(date): Tasks remaining. Restarting in 10 seconds..."
  sleep 10
done
```

⚠️ **`--dangerously-skip-permissions` means no confirmation prompts.** Only use on a dedicated machine or in a sandboxed environment. The agent will install npm packages, write files, and run shell commands without asking.
