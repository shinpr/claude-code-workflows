---
name: recipe-fullstack-implement
description: Orchestrate full-cycle implementation across backend and frontend layers
disable-model-invocation: true
---

**Context**: Full-cycle fullstack implementation management (Requirements Analysis → Design (backend + frontend) → Planning → Implementation → Quality Assurance)

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

## Required Reference

**MANDATORY**: Read `references/monorepo-flow.md` from subagents-orchestration-guide skill BEFORE proceeding. Follow the Fullstack Flow defined there instead of the standard single-layer flow.

## Execution Protocol

1. **Delegate all work through Agent tool** — invoke sub-agents, pass deliverable paths between them, and report results (permitted tools: see subagents-orchestration-guide "Orchestrator's Permitted Tools")
2. **Follow monorepo-flow.md** for the design phase (multiple Design Docs, design-sync, vertical slicing)
3. **Follow subagents-orchestration-guide skill** for all other orchestration rules (stop points, structured responses, escalation)
4. **Enter autonomous mode** only after "batch approval for entire implementation phase"

**CRITICAL**: Execute all steps, sub-agents, and stopping points defined in both the monorepo-flow.md reference and subagents-orchestration-guide skill.

## Execution Decision Flow

### 1. Current Situation Assessment
Instruction Content: $ARGUMENTS

Assess the current situation:

| Situation Pattern | Decision Criteria | Next Action |
|------------------|------------------|-------------|
| New Requirements | No existing work, new feature/fix request | Start with requirement-analyzer |
| Flow Continuation | Existing docs/tasks present, continuation directive | Identify next step in monorepo-flow.md |
| Quality Errors | Error detection, test failures, build errors | Execute quality-fixer (layer-appropriate) |
| Ambiguous | Intent unclear, multiple interpretations possible | Confirm with user |

### 2. Progress Verification for Continuation

When continuing existing flow, verify:
- Latest artifacts (PRD/ADR/Design Docs/Work Plan/Tasks)
- Current phase position (Requirements/Design/Planning/Implementation/QA)
- Identify next step in monorepo-flow.md

### 3. Design through Planning Phase

**Follow monorepo-flow.md** for the complete design-through-planning flow (Steps 1-16 for Large scale, Steps 1-14 for Medium scale). The flow table in that reference defines every step, agent invocation, parallelization rule, and stop point.

Key points to enforce as the orchestrator runs the flow:
- Create separate Design Docs per layer (see monorepo-flow.md "Layer Context in Design Doc Creation")
- Frontend Design Doc references the approved UI Spec (pass UI Spec path to technical-designer-frontend) and reuses the ui-analyzer output produced earlier in the flow
- Execute document-reviewer once per Design Doc (separate invocations)
- Run design-sync for cross-layer consistency verification
- Pass all Design Docs to work-planner (subagent_type: "dev-workflows:work-planner") with vertical slicing instruction

### 4. Register All Flow Steps Using TaskCreate (MANDATORY)

**After scale determination, register all steps of the monorepo-flow.md using TaskCreate**:
- First task: "Map preloaded skills to applicable concrete rules"
- Register each step as individual task
- Set currently executing step to `in_progress` using TaskUpdate
- **Complete task registration before invoking subagents**

## After requirement-analyzer [Stop]

When user responds to questions:
- If response matches any `scopeDependencies.question` → Check `impact` for scale change
- If scale changes → Re-execute requirement-analyzer with updated context
- If `confidence: "confirmed"` or no scale change → Proceed to next step

## Subagents Orchestration Guide Compliance Execution

**Pre-execution Checklist (MANDATORY)**:
- [ ] Read monorepo-flow.md reference
- [ ] Confirmed relevant flow steps
- [ ] Identified current progress position
- [ ] Clarified next step
- [ ] Recognized stopping points
- [ ] codebase-analyzer included before each Design Doc creation
- [ ] code-verifier included before document-reviewer for each Design Doc
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable → Escalate before autonomous mode
  - Other environments (tests, quality tools) → Subagents will escalate

**Required Flow Compliance**:
- Run quality-fixer (layer-appropriate) before every commit
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

### Task Execution Quality Cycle (Filename-Pattern-Based)

**Agent routing by task filename** (see monorepo-flow.md reference):
```
*-backend-task-*   → dev-workflows:task-executor + dev-workflows:quality-fixer
*-frontend-task-*  → dev-workflows-frontend:task-executor-frontend + dev-workflows-frontend:quality-fixer-frontend
```

**Rules**:
1. Execute ONE task completely before starting next (each task goes through the full 4-step cycle via Agent tool, using the correct executor per filename pattern)
2. Check executor status before quality-fixer (escalation check)
3. Quality-fixer MUST run after each executor before proceeding to commit. **Always pass** the current task file path as `task_file`
4. Check quality-fixer response:
   - `stub_detected` → Return to executor with `incompleteImplementations[]` details
   - `blocked` → Escalate to user
   - `approved` → Proceed to commit

### Post-Implementation Verification (After All Tasks Complete)

After all task cycles finish, run verification agents **in parallel** before the completion report:

1. **Invoke both in parallel** using Agent tool:
   - code-verifier (subagent_type: "dev-workflows:code-verifier") → invoke **once per Design Doc** (`doc_type: design-doc`, single `document_path`, `code_paths`: implementation file list from `git diff --name-only main...HEAD`)
   - security-reviewer (subagent_type: "dev-workflows:security-reviewer") → Design Doc path(s), implementation file list

2. **Consolidate results** — check pass/fail for each:
   - code-verifier: **pass** when `status` is `consistent` or `mostly_consistent`. **fail** when `needs_review` or `inconsistent`. Collect `discrepancies` with status `drift`, `conflict`, or `gap`
   - security-reviewer: **pass** when `status` is `approved` or `approved_with_notes`. **fail** when `needs_revision`. **blocked** → Escalate to user
   - Present unified verification report to user

3. **Fix cycle** (when any verifier failed):
   - Consolidate all actionable findings into a single task file
   - Execute layer-appropriate task-executor with consolidated fixes → quality-fixer
   - Re-run only the failed verifiers (by the criteria in step 2)
   - Repeat until all pass or `blocked` → Escalate to user

4. **All passed** → Proceed to Final Cleanup

### Final Cleanup

Before the completion report, delete the implementation task files this recipe consumed. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete every file matching `docs/plans/tasks/{plan-name}-backend-task-*.md` and `docs/plans/tasks/{plan-name}-frontend-task-*.md` (the `{plan-name}` derived from the work plan path used in this run)
- Delete every file matching `docs/plans/tasks/{plan-name}-phase*-completion.md` (the per-phase completion files generated by task-decomposer)
- Delete the corresponding `docs/plans/tasks/_overview-{plan-name}.md` if present
- Preserve the work plan itself (`docs/plans/{plan-name}.md`) — the user decides whether to delete it after final review

If task files cannot be deleted (filesystem error), report the failure but do not block the completion report.

### Test Information Communication
After acceptance-test-generator execution, when invoking work-planner (subagent_type: "dev-workflows:work-planner"), communicate:
- Generated integration test file path (from `generatedFiles.integration`)
- Generated fixture-e2e test file path or null (from `generatedFiles.fixtureE2e`)
- Generated service-integration-e2e test file path or null (from `generatedFiles.serviceE2e`)
- Per-lane E2E absence reason (from `e2eAbsenceReason.fixtureE2e` and `e2eAbsenceReason.serviceE2e`, when each lane is null)
- Explicit note: integration tests are created simultaneously with implementation, fixture-e2e tests are created alongside the UI feature phase, service-integration-e2e tests are executed only in the final phase

## Execution Method

All work is executed through sub-agents.
Sub-agent selection follows monorepo-flow.md reference and subagents-orchestration-guide skill.
