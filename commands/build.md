---
name: build
description: Execute decomposed tasks in autonomous execution mode
argument-hint: (no arguments - uses existing task files)
---

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents (orchestrator role only)
2. **Follow subagents-orchestration-guide skill autonomous execution mode exactly**:
   - Execute: task-decomposer → (task-executor → quality-fixer → commit) loop
   - **Stop immediately** upon detecting requirement changes
3. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: Run quality-fixer before every commit. Obtain batch approval before autonomous mode.

Work plan: $ARGUMENTS

## Pre-execution Prerequisites

### Task File Existence Check
```bash
# Check work plans
! ls -la docs/plans/*.md | grep -v template | tail -5

# Check task files
! ls docs/plans/tasks/*.md 2>/dev/null || echo "⚠️ No task files found"
```

### Task Generation Decision Flow

**THINK DEEPLY AND SYSTEMATICALLY** Analyze task file existence state and determine the EXACT action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | .md files in tasks/ directory | Proceed to autonomous execution |
| No tasks + plan exists | Plan exists but no task files | Confirm with user → run task-decomposer |
| Neither exists | No plan or task files | Error: Prerequisites not met |

## Task Decomposition Phase (Conditional)

When task files don't exist:

### 1. User Confirmation
```
No task files found.
Work plan: docs/plans/[plan-name].md

Generate tasks from the work plan? (y/n): 
```

### 2. Task Decomposition (if approved)
```
@task-decomposer Read work plan and decompose into atomic tasks:
- Input: docs/plans/[plan-name].md
- Output: Individual task files in docs/plans/tasks/
- Granularity: 1 task = 1 commit = independently executable
```

### 3. Verify Generation
```bash
# Verify generated task files
! ls -la docs/plans/tasks/*.md | head -10
```

✅ **Flow**: Task generation → Autonomous execution (in this order)

## Commit Strategy Selection (Before Autonomous Mode)

**Ask user before starting execution**:

"Which commit strategy do you prefer?"
- **per-task** (default) — Commit after each task. Atomic commits, easy rollback
- **per-phase** — Commit after each phase completes. Balanced granularity
- **per-feature** — Single commit at the end. Clean history
- **manual** — You decide when to commit. Full control

## Task Execution Cycle
**MANDATORY EXECUTION CYCLE**: `task-executor → escalation check → quality-fixer → [conditional commit]`

For EACH task, YOU MUST:
1. **UPDATE TodoWrite**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity"
2. **INVOKE task-executor**: Execute the task implementation
3. **CHECK ESCALATION**: Check task-executor status → If `status: "escalation_needed"` → STOP and escalate to user
4. **PROCESS structured responses**: When `readyForQualityCheck: true` is detected → EXECUTE quality-fixer IMMEDIATELY
5. **COMMIT based on strategy**:
   - **per-task**: Commit immediately after `approved: true`
   - **per-phase**: Accumulate, commit when phase completes
   - **per-feature**: Accumulate all, single commit at end
   - **manual**: Wait for user to request commit

**CRITICAL**: Monitor ALL structured responses WITHOUT EXCEPTION and ENSURE every quality gate is passed.

! ls -la docs/plans/*.md | head -10

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode. STOP IMMEDIATELY upon detecting ANY requirement changes.

## Output Example
Implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks
- Quality checks: All passed
- Commits: [number] commits created

**Important**: This command manages the entire autonomous execution flow from task decomposition to implementation completion. Automatically stops when requirement changes are detected.