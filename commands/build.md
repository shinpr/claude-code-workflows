---
description: Execute decomposed tasks in autonomous execution mode
---

**STRICTLY AND PRECISELY** follow @agents/guides/sub-agents.md and act as the PRIMARY ORCHESTRATOR.

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

**THINK DEEPLY AND SYSTEMATICALLY** Analyze task file existence state and determine the EXACT action required:

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

✅ **MANDATORY**: After task generation, AUTOMATICALLY proceed to autonomous execution
❌ **PROHIBITED**: Starting implementation without task generation

## 🧠 Metacognition for Each Task
**MANDATORY EXECUTION CYCLE**: `task-executor → quality-fixer → commit`

Before starting EACH task, YOU MUST:
1. **EXECUTE rule-advisor**: Extract the TRUE ESSENCE of the task
2. **UPDATE TodoWrite**: Structure and track progress IMMEDIATELY  
3. **PROCESS structured responses**: When `readyForQualityCheck: true` is detected → EXECUTE quality-fixer IMMEDIATELY

**THINK DEEPLY** Monitor ALL structured responses WITHOUT EXCEPTION and ENSURE every quality gate is passed.

! ls -la docs/plans/*.md | head -10

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode. STOP IMMEDIATELY upon detecting ANY requirement changes.

## Output Example
Implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks
- Quality checks: All passed
- Commits: [number] commits created

**Important**: This command manages the entire autonomous execution flow from task decomposition to implementation completion. Automatically stops when requirement changes are detected.