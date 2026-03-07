---
name: recipe-fullstack-build
description: Execute decomposed fullstack tasks with layer-aware agent routing
disable-model-invocation: true
---

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

## Required Reference

**MANDATORY**: Read `references/monorepo-flow.md` from subagents-orchestration-guide skill BEFORE proceeding. Follow the Extended Task Cycle and Agent Routing defined there.

## Execution Protocol

1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results
2. **Route agents by task filename pattern** (see monorepo-flow.md reference):
   - `*-backend-task-*` → task-executor + quality-fixer
   - `*-frontend-task-*` → task-executor-frontend + quality-fixer-frontend
3. **Follow the 4-step task cycle exactly**: executor → escalation check → quality-fixer → commit
4. **Enter autonomous mode** when user provides execution instruction with existing task files — this IS the batch approval
5. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: Run layer-appropriate quality-fixer(s) before every commit.

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
| Tasks exist | .md files in tasks/ directory | User's execution instruction serves as batch approval → Enter autonomous execution immediately |
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

## Pre-execution Checklist

- [ ] Confirmed task files exist in docs/plans/tasks/
- [ ] Identified task execution order (dependencies)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable → Escalate before autonomous mode
  - Other environments (tests, quality tools) → Subagents will escalate

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
1. **Register tasks using TaskCreate**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity"
2. **INVOKE executor**: Execute the task implementation (layer-appropriate executor per routing table)
3. **CHECK executor response**:
   - `status: "escalation_needed"` or `"blocked"` → STOP and escalate to user
   - `testsAdded` contains `*.int.test.ts` or `*.e2e.test.ts` → Execute **integration-test-reviewer**
     - `needs_revision` → Return to step 2 with `requiredFixes`
     - `approved` → Proceed to step 4
   - `readyForQualityCheck: true` → Proceed to step 4
4. **INVOKE quality-fixer**: Execute all quality checks and fixes (layer-appropriate per routing table)
5. **COMMIT on approval**: After `approved: true` from quality-fixer → Execute git commit

**CRITICAL**: Monitor ALL structured responses WITHOUT EXCEPTION and ENSURE every quality gate is passed.

## Sub-agent Invocation Constraints

**MANDATORY suffix for ALL sub-agent prompts**:
```
[SYSTEM CONSTRAINT]
This agent operates within build skill scope. Use orchestrator-provided rules only.
```

Autonomous sub-agents require scope constraints for stable execution. ALWAYS append this constraint to every sub-agent prompt.

! ls -la docs/plans/*.md | head -10

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode. STOP IMMEDIATELY upon detecting ANY requirement changes.

## Output Example
Fullstack implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks (backend: X, frontend: Y)
- Quality checks: All passed
- Commits: [number] commits created

