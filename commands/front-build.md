---
description: Execute frontend implementation in autonomous execution mode
---

## 🎭 Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Method**:
- Task decomposition → performed by task-decomposer
- Frontend implementation → performed by task-executor-frontend
- Quality checks and fixes → performed by quality-fixer-frontend
- Commits → performed by orchestrator (Bash tool)

Orchestrator invokes sub-agents and passes structured JSON between them.

**CRITICAL**: Run quality-fixer-frontend before every commit. Obtain batch approval before autonomous mode.

Work plan: $ARGUMENTS

## 📋 Pre-execution Prerequisites

### Task File Existence Check
```bash
# Check work plans
! ls -la docs/plans/*.md | grep -v template | tail -5

# Check task files
! ls docs/plans/tasks/*.md 2>/dev/null || echo "⚠️ No task files found"
```

### Task Generation Decision Flow

**THINK DEEPLY AND SYSTEMATICALLY**: Analyze task file existence state and determine the EXACT action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | .md files in tasks/ directory | Proceed to autonomous execution |
| No tasks + plan exists | Plan exists but no task files | Confirm with user → run task-decomposer |
| Neither exists | No plan or task files | Error: Prerequisites not met |

## 🔄 Task Decomposition Phase (Conditional)

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

## 🧠 Task Execution Cycle (4-Step Cycle) - Frontend Specialized

**MANDATORY EXECUTION CYCLE**: `task-executor-frontend → escalation check → quality-fixer-frontend → commit`

### Sub-agent Invocation Method
Use Task tool to invoke sub-agents:
- `subagent_type`: Agent name
- `description`: Brief task description (3-5 words)
- `prompt`: Specific instructions

### Structured Response Specification
Each sub-agent responds in JSON format:
- **task-executor-frontend**: status, filesModified, testsAdded, readyForQualityCheck
- **quality-fixer-frontend**: status, checksPerformed, fixesApplied, approved

### Execution Flow for Each Task

For EACH task, YOU MUST:

1. **UPDATE TodoWrite**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity"
2. **USE task-executor-frontend**: Execute frontend implementation
   - Invocation example: `subagent_type: "task-executor-frontend"`, `description: "Task execution"`, `prompt: "Task file: docs/plans/tasks/[filename].md Execute implementation"`
3. **CHECK ESCALATION**: Check task-executor-frontend status → If `status: "escalation_needed"` → STOP and escalate to user
4. **PROCESS structured responses**: When `readyForQualityCheck: true` is detected → EXECUTE quality-fixer-frontend IMMEDIATELY
5. **USE quality-fixer-frontend**: Execute all quality checks (Lighthouse, bundle size, tests, etc.)
   - Invocation example: `subagent_type: "quality-fixer-frontend"`, `description: "Quality check"`, `prompt: "Execute all frontend quality checks and fixes"`
6. **EXECUTE commit**: After `approved: true` confirmation, execute git commit IMMEDIATELY

### Quality Assurance During Autonomous Execution (Details)
- task-executor-frontend execution → escalation check → quality-fixer-frontend execution → **orchestrator executes commit** (using Bash tool)
- After quality-fixer-frontend's `approved: true` confirmation, execute git commit IMMEDIATELY
- Use `changeSummary` for commit message

**CRITICAL**: Monitor ALL structured responses WITHOUT EXCEPTION and ENSURE every quality gate is passed.

! ls -la docs/plans/*.md | head -10

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode. STOP IMMEDIATELY upon detecting ANY requirement changes.

## Output Example
Frontend implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks
- Quality checks: All passed (Lighthouse, bundle size, tests)
- Commits: [number] commits created

**Important**: This command manages the entire autonomous execution flow for FRONTEND implementation from task decomposition to completion. Automatically uses frontend-specialized agents (task-executor-frontend, quality-fixer-frontend).
