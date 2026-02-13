---
name: fullstack-build
description: Execute decomposed fullstack tasks with layer-aware agent routing
---

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

## Required Reference

**MANDATORY**: Read `references/monorepo-flow.md` from subagents-orchestration-guide skill BEFORE proceeding. Follow the Extended Task Cycle and Agent Routing defined there.

## Execution Protocol

1. **Delegate all work** to sub-agents (orchestrator role only)
2. **Route agents by task filename pattern** (see monorepo-flow.md reference):
   - `*-backend-task-*` → task-executor + quality-fixer
   - `*-frontend-task-*` → task-executor-frontend + quality-fixer-frontend
3. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: Run layer-appropriate quality-fixer(s) before every commit. Obtain batch approval before autonomous mode.

Work plan: $ARGUMENTS

## Pre-execution Prerequisites

### Task File Existence Check
```bash
# Check work plans
! ls -la docs/plans/*.md | grep -v template | tail -5

# Check task files
! ls docs/plans/tasks/*.md 2>/dev/null || echo "No task files found"
```

### Task Generation Decision Flow

Analyze task file existence state and determine the action required:

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
Invoke task-decomposer using Task tool:
- `subagent_type`: "task-decomposer"
- `description`: "Decompose work plan"
- `prompt`: "Read work plan at docs/plans/[plan-name].md and decompose into atomic tasks. Output: Individual task files in docs/plans/tasks/. Granularity: 1 task = 1 commit = independently executable. Use layer-aware naming: {plan}-backend-task-{n}.md, {plan}-frontend-task-{n}.md based on Target files paths."

### 3. Verify Generation
```bash
# Verify generated task files
! ls -la docs/plans/tasks/*.md | head -10
```

## Task Execution Cycle (Filename-Pattern-Based)

**MANDATORY**: Route agents by task filename pattern from monorepo-flow.md reference.

### Agent Routing Table

| Filename Pattern | Executor | Quality Fixer |
|-----------------|----------|---------------|
| `*-backend-task-*` | task-executor | quality-fixer |
| `*-frontend-task-*` | task-executor-frontend | quality-fixer-frontend |
| `*-task-*` (no layer prefix) | task-executor | quality-fixer (default) |

### Task Execution (4-Step Cycle)

For EACH task, YOU MUST:
1. **UPDATE TodoWrite**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity"
2. **INVOKE executor**: Execute the task implementation (layer-appropriate executor per routing table)
3. **CHECK ESCALATION**: Check executor status → If `status: "escalation_needed"` → STOP and escalate to user
4. **PROCESS structured responses**: When `readyForQualityCheck: true` is detected → EXECUTE quality-fixer (layer-appropriate) IMMEDIATELY
5. **COMMIT on approval**: After `approved: true` from quality-fixer → Execute git commit

### integration-test-reviewer Placement

When `testsAdded` contains `*.int.test.ts` or `*.e2e.test.ts`:
- After task-executor, before quality-fixer (standard flow)

**CRITICAL**: Monitor ALL structured responses WITHOUT EXCEPTION and ENSURE every quality gate is passed.

! ls -la docs/plans/*.md | head -10

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode. STOP IMMEDIATELY upon detecting ANY requirement changes.

## Output Example
Fullstack implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks (backend: X, frontend: Y)
- Quality checks: All passed
- Commits: [number] commits created

**Important**: This command manages the entire autonomous execution flow for fullstack implementation. Routes agents by task filename pattern for layer-appropriate execution and quality assurance.
