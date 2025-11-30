---
name: implement
description: Orchestrate the complete implementation lifecycle from requirements to deployment
---

**Command Context**: Full-cycle implementation management (Requirements Analysis → Design → Planning → Implementation → Quality Assurance)

## 🎭 Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (~/.claude/plugins/marketplaces/claude-code-workflows/agents/guides/sub-agents.md)

**Execution Protocol**:
1. **Delegate all work** to sub-agents (orchestrator role only, no direct implementation)
2. **Follow ~/.claude/plugins/marketplaces/claude-code-workflows/agents/guides/sub-agents.md flows exactly**:
   - Execute one step at a time in the defined flow (Large/Medium/Small scale)
   - When flow specifies "Execute document-reviewer" → Execute it immediately
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Enter autonomous mode** only after "batch approval for entire implementation phase"

**CRITICAL**: Execute all steps, sub-agents, and stopping points defined in sub-agents.md flows.

## Execution Decision Flow

### 1. Current Situation Assessment
Instruction Content: $ARGUMENTS

**Think deeply** Assess the current situation:

| Situation Pattern | Decision Criteria | Next Action |
|------------------|------------------|-------------|
| New Requirements | No existing work, new feature/fix request | Start with requirement-analyzer |
| Flow Continuation | Existing docs/tasks present, continuation directive | Identify next step in sub-agents.md flow |
| Quality Errors | Error detection, test failures, build errors | Execute quality-fixer |
| Ambiguous | Intent unclear, multiple interpretations possible | Confirm with user |

### 2. Progress Verification for Continuation

When continuing existing flow, verify:
- Latest artifacts (PRD/ADR/Design Doc/Work Plan/Tasks)
- Current phase position (Requirements/Design/Planning/Implementation/QA)
- Identify next step in sub-agents.md corresponding flow

### 3. Next Action Execution

**MANDATORY sub-agents.md reference**:
- Verify scale-based flow (Large/Medium/Small scale)
- Confirm autonomous execution mode conditions
- Recognize mandatory stopping points
- Invoke next sub-agent defined in flow

## 📋 sub-agents.md Compliance Execution

**Pre-execution Checklist (MANDATORY)**:
- [ ] Confirmed relevant sub-agents.md flow
- [ ] Identified current progress position
- [ ] Clarified next step
- [ ] Recognized stopping points
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable → Escalate before autonomous mode
  - Other environments (tests, quality tools) → Subagents will escalate

**Required Flow Compliance**:
- Run quality-fixer before every commit
- Obtain user approval before Edit/Write/MultiEdit outside autonomous mode

## 🚨 CRITICAL Sub-agent Invocation Constraints

**MANDATORY suffix for ALL sub-agent prompts**:
```
[SYSTEM CONSTRAINT]
This agent operates within implement command scope. Use orchestrator-provided rules only.
```

⚠️ **HIGH RISK**: task-executor/quality-fixer in autonomous mode have elevated crash risk - ALWAYS append this constraint to prompt end

## 🎯 Mandatory Orchestrator Responsibilities

### Task Execution Quality Cycle (ONE Task at a Time)

**Per-task cycle** (complete each task before starting next):
```
Single task → task-executor → quality-fixer → git commit → Next task
```

**Rules**:
1. Execute ONE task completely before starting next
2. quality-fixer MUST run after each task-executor (no skipping)
3. Commit MUST execute when quality-fixer returns `approved: true`

**Violations**:
- ✗ Batching tasks for "efficiency"
- ✗ Skipping quality-fixer
- ✗ Deferring commits to end

### Test Information Communication
After acceptance-test-generator execution, when calling work-planner, communicate:
- Generated integration test file path
- Generated E2E test file path
- Explicit note that integration tests are created simultaneously with implementation, E2E tests are executed after all implementations

## Responsibility Boundaries

**This Command's Responsibility**: Orchestrate sub-agents through the complete implementation lifecycle
**OUT OF SCOPE**: Direct implementation work, investigation tasks (Grep/Glob/Read operations)