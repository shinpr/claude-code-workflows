---
name: recipe-implement
description: Orchestrate the complete implementation lifecycle from requirements to deployment
disable-model-invocation: true
---

**Context**: Full-cycle implementation management (Requirements Analysis → Design → Planning → Implementation → Quality Assurance)

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work through Agent tool** — invoke sub-agents, pass deliverable paths between them, and report results (permitted tools: see subagents-orchestration-guide "Orchestrator's Permitted Tools")
2. **Follow subagents-orchestration-guide skill flows exactly**:
   - Execute one step at a time in the defined flow (Large/Medium/Small scale)
   - When flow specifies "Execute document-reviewer" → Execute it immediately
   - **Stop at every `[Stop: ...]` marker** → Use AskUserQuestion for confirmation and wait for approval before proceeding
3. **Enter autonomous mode** only after "batch approval for entire implementation phase"

**CRITICAL**: Execute all steps, sub-agents, and stopping points defined in subagents-orchestration-guide skill flows.

## Execution Decision Flow

### 1. Current Situation Assessment
Instruction Content: $ARGUMENTS

Assess the current situation:

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
- Identify next step in subagents-orchestration-guide skill corresponding flow

### 3. Next Action Execution

**MANDATORY subagents-orchestration-guide skill reference**:
- Verify scale-based flow (Large/Medium/Small scale)
- Confirm autonomous execution mode conditions
- Recognize mandatory stopping points
- Invoke next sub-agent defined in flow

### After requirement-analyzer [Stop]

When user responds to questions:
- If response matches any `scopeDependencies.question` → Check `impact` for scale change
- If scale changes → Re-execute requirement-analyzer with updated context
- If `confidence: "confirmed"` or no scale change → Proceed to next step

### 4. Register All Flow Steps Using TaskCreate (MANDATORY)

**After scale determination, register all steps of the applicable flow using TaskCreate**:
- First task: "Map preloaded skills to applicable concrete rules"
- Register each step as individual task
- Set currently executing step to `in_progress` using TaskUpdate
- **Complete task registration before invoking subagents**

## Subagents Orchestration Guide Compliance Execution

**Pre-execution Checklist (MANDATORY)**:
- [ ] Confirmed relevant subagents-orchestration-guide skill flow
- [ ] Identified current progress position
- [ ] Clarified next step
- [ ] Recognized stopping points
- [ ] codebase-analyzer included before Design Doc creation (Medium/Large scale)
- [ ] code-verifier included before document-reviewer for Design Doc review (Medium/Large scale)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable → Escalate before autonomous mode
  - Other environments (tests, quality tools) → Subagents will escalate

**Required Flow Compliance**:
- Run quality-fixer before every commit
- Obtain user approval before Edit/Write/MultiEdit outside autonomous mode

## Scope Boundary for Subagents

Append the following block to every subagent prompt invoked from this recipe:

```
Scope boundary for subagents:
Operate within the task scope and referenced files in the prompt.
Use loaded skills to execute that scope.
Escalate when the required fix or investigation falls outside that scope.
```

## Mandatory Orchestrator Responsibilities

### Task Execution Quality Cycle (4-Step Cycle per Task)

**Per-task cycle** (complete each task before starting next):
1. **Agent tool** (subagent_type: "dev-workflows:task-executor") → Pass task file path in prompt, receive structured response
2. Check task-executor response:
   - `status: escalation_needed` or `blocked` → Escalate to user
   - `requiresTestReview` is `true` → Execute **integration-test-reviewer**
     - `needs_revision` → Return to step 1 with `requiredFixes`
     - `approved` → Proceed to step 3
   - Otherwise → Proceed to step 3
3. quality-fixer → Quality check and fixes. **Always pass** the current task file path as `task_file`
   - `stub_detected` → Return to step 1 with `incompleteImplementations[]` details
   - `blocked` → Escalate to user
   - `approved` → Proceed to step 4
4. git commit → Execute with Bash (on `approved`)

### Post-Implementation Verification (After All Tasks Complete)

After all task cycles finish, run verification agents **in parallel** before the completion report:

1. **Invoke both in parallel** using Agent tool:
   - code-verifier (subagent_type: "dev-workflows:code-verifier") → `doc_type: design-doc`, Design Doc path, `code_paths`: implementation file list (`git diff --name-only main...HEAD`)
   - security-reviewer (subagent_type: "dev-workflows:security-reviewer") → Design Doc path, implementation file list

2. **Consolidate results** — check pass/fail for each:
   - code-verifier: **pass** when `status` is `consistent` or `mostly_consistent`. **fail** when `needs_review` or `inconsistent`. Collect `discrepancies` with status `drift`, `conflict`, or `gap`
   - security-reviewer: **pass** when `status` is `approved` or `approved_with_notes`. **fail** when `needs_revision`. **blocked** → Escalate to user
   - Present unified verification report to user

3. **Fix cycle** (when any verifier failed):
   - Consolidate all actionable findings into a single task file
   - Execute task-executor with consolidated fixes → quality-fixer
   - Re-run only the failed verifiers (by the criteria in step 2)
   - Repeat until all pass or `blocked` → Escalate to user

4. **All passed** → Proceed to completion report

### Test Information Communication
After acceptance-test-generator execution, when invoking work-planner (subagent_type: "dev-workflows:work-planner"), communicate:
- Generated integration test file path (from `generatedFiles.integration`)
- Generated E2E test file path or null (from `generatedFiles.e2e`)
- E2E absence reason (from `e2eAbsenceReason`, when E2E is null)
- Explicit note that integration tests are created simultaneously with implementation, E2E tests are executed after all implementations (when E2E path is provided)

## Execution Method

All work is executed through sub-agents.
Sub-agent selection follows subagents-orchestration-guide skill.
