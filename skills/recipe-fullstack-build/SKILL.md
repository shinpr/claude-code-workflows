---
name: recipe-fullstack-build
description: Execute decomposed fullstack tasks with layer-aware agent routing
disable-model-invocation: true
---

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

## Required Reference

**MANDATORY**: Read `references/monorepo-flow.md` from subagents-orchestration-guide skill BEFORE proceeding. Follow the Extended Task Cycle and Agent Routing defined there.

## Execution Protocol

1. **Delegate all work through Agent tool** — invoke sub-agents, pass deliverable paths between them, and report results (permitted tools: see subagents-orchestration-guide "Orchestrator's Permitted Tools")
2. **Route agents by task filename pattern** (see monorepo-flow.md reference):
   - `*-backend-task-*` → task-executor + quality-fixer
   - `*-frontend-task-*` → task-executor-frontend + quality-fixer-frontend
3. **Follow the 4-step task cycle exactly**: executor → escalation check → quality-fixer → commit
4. **Enter autonomous mode** when user provides execution instruction with existing task files — this IS the batch approval
5. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: Run layer-appropriate quality-fixer(s) before every commit.

Work plan: $ARGUMENTS

## Pre-execution Prerequisites

### Work Plan Resolution

Before any task processing, locate the work plan. Resolution rule:
1. List task files in `docs/plans/tasks/` matching the layer-aware patterns `{plan-name}-backend-task-*.md` and `{plan-name}-frontend-task-*.md` only. Single-layer tasks (`{plan-name}-task-*.md`) are excluded here so a stale single-layer run does not redirect this recipe to the wrong work plan
2. From the matched files, also exclude every file matching any of these patterns — they originate from other workflow phases and are not implementation tasks for this run's plan: `*-task-prep-*.md` (readiness preflight tasks), `_overview-*.md` (decomposition overview file), `*-phase*-completion.md` (per-phase completion files), `review-fixes-*.md` (post-implementation review fixes), `integration-tests-*-task-*.md` (integration-test add-on scaffolding)
3. For each remaining file, extract the `{plan-name}` prefix as the segment that appears before `-backend-task-` or `-frontend-task-`
4. When at least one task file matches, the work plan is `docs/plans/{plan-name}.md` for the prefix that has the most recent task-file mtime; ties broken by the lexicographically last `{plan-name}`
5. When no task file matches the restricted pattern, the work plan is the most-recent-mtime non-template `.md` in `docs/plans/`

### Consumed Task Set

Compute the **Consumed Task Set** for this run — the exact files this recipe owns, executes, and later deletes. Use the same restricted pattern as Work Plan Resolution:

1. List task files in `docs/plans/tasks/` matching the layer-aware patterns `{plan-name}-backend-task-*.md` and `{plan-name}-frontend-task-*.md` for the `{plan-name}` resolved by Work Plan Resolution. Single-layer tasks are excluded
2. Exclude every file matching: `*-task-prep-*.md`, `_overview-*.md`, `*-phase*-completion.md`, `review-fixes-*.md`, `integration-tests-*-task-*.md` (these originate from other workflow phases)

Every subsequent reference to "task files" in this recipe — Task Generation Decision Flow, Task Execution Cycle iteration, and Final Cleanup — uses this set, not the unrestricted `docs/plans/tasks/*.md` glob.

### Task Generation Decision Flow

Analyze the Consumed Task Set and determine the action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | Consumed Task Set is non-empty | User's execution instruction serves as batch approval → Enter autonomous execution immediately |
| No tasks + plan exists | Consumed Task Set is empty but the resolved work plan exists | Confirm with user → run task-decomposer |
| Neither exists + Design Doc exists | No plan, no Consumed Task Set, but `docs/design/*.md` exists | Invoke work-planner to create work plan from Design Doc(s), then run document-reviewer (`dev-workflows:document-reviewer`, doc_type: WorkPlan); branch on the reviewer's `verdict.decision` — on `needs_revision`, re-invoke work-planner (update) and re-review until `approved`/`approved_with_conditions`, then present the reviewed plan for batch approval before task decomposition; on `rejected`, stop before task decomposition and escalate to the user |
| Neither exists | No plan, no Consumed Task Set, no Design Doc | Report missing prerequisites to user and stop |

## Task Decomposition Phase (Conditional)

When the Consumed Task Set is empty:

### 1. User Confirmation
```
No task files in the Consumed Task Set.
Work plan: docs/plans/[plan-name].md

Generate tasks from the work plan? (y/n):
```

### 2. Task Decomposition (if approved)
Invoke task-decomposer using Agent tool:
- `subagent_type`: "dev-workflows:task-decomposer"
- `description`: "Decompose work plan"
- `prompt`: "Read work plan at docs/plans/[plan-name].md and decompose into atomic tasks. Output: Individual task files in docs/plans/tasks/. Granularity: 1 task = 1 commit = independently executable. Use layer-aware naming: {plan}-backend-task-{n}.md, {plan}-frontend-task-{n}.md based on Target files paths."

### 3. Verify Generation
Recompute the Consumed Task Set using the same restricted pattern from the Consumed Task Set section above. Confirm it is now non-empty. If it is still empty, escalate to the user — task-decomposer either failed silently or produced files that don't match the expected pattern.

## Pre-execution Checklist

- [ ] Confirmed Consumed Task Set is non-empty (computed in the Consumed Task Set section above)
- [ ] Identified task execution order within the Consumed Task Set (dependencies)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable → Escalate before autonomous mode
  - Other environments (tests, quality tools) → Subagents will escalate

## Task Execution Cycle (Filename-Pattern-Based)

**MANDATORY**: For each task in the Consumed Task Set, route agents by task filename pattern from monorepo-flow.md reference.

### Agent Routing Table

| Filename Pattern | Executor | Quality Fixer |
|-----------------|----------|---------------|
| `*-backend-task-*` | dev-workflows:task-executor | dev-workflows:quality-fixer |
| `*-frontend-task-*` | dev-workflows-frontend:task-executor-frontend | dev-workflows-frontend:quality-fixer-frontend |
| `*-task-*` (no layer prefix) | dev-workflows:task-executor | dev-workflows:quality-fixer (default) |

### Task Execution (4-Step Cycle)

For EACH task, YOU MUST:
1. **Register tasks using TaskCreate**: Register work steps. Always include first task "Map preloaded skills to applicable concrete rules" and final task "Verify the mapped rules before final JSON"
2. **Agent tool** (subagent_type per routing table) → Pass task file path in prompt, receive structured response
3. **CHECK executor response**:
   - `status: "escalation_needed"` or `"blocked"` → STOP and escalate to user
   - `requiresTestReview` is `true` → Execute **integration-test-reviewer**
     - `needs_revision` → Return to step 2 with `requiredFixes`
     - `approved` → Proceed to step 4
   - `readyForQualityCheck: true` → Proceed to step 4
4. **INVOKE quality-fixer**: Execute all quality checks and fixes (layer-appropriate per routing table). **Always pass** the current task file path as `task_file`
5. **CHECK quality-fixer response**:
   - `stub_detected` → Return to step 2 with `incompleteImplementations[]` details
   - `blocked` → STOP and escalate to user
   - `approved` → Proceed to step 6
6. **COMMIT on approval**: Execute git commit

**CRITICAL**: Parse every sub-agent response for status fields. Execute the matching branch in the 4-step cycle. Proceed to next task only after layer-appropriate quality-fixer returns `approved`.

## Scope Boundary for Subagents

Append the following block to every subagent prompt invoked from this recipe:

```
Scope boundary for subagents:
Operate within the task scope and referenced files in the prompt.
Use loaded skills to execute that scope.
Escalate when the required fix or investigation falls outside that scope.
```

Verify task files exist per Pre-execution Checklist, then enter autonomous execution mode. When requirement changes are detected during execution, escalate to the user with the change summary before continuing.

## Post-Implementation Verification (After All Tasks Complete)

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

## Final Cleanup

Before the completion report, delete the implementation task files this recipe consumed. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete every file in the Consumed Task Set
- Delete every file matching `docs/plans/tasks/{plan-name}-phase*-completion.md` (the per-phase completion files generated by task-decomposer for this `{plan-name}`)
- Delete the corresponding `docs/plans/tasks/_overview-{plan-name}.md` if present
- Preserve the work plan itself (`docs/plans/{plan-name}.md`) — the user decides whether to delete it after final review

If task files cannot be deleted (filesystem error), report the failure but do not block the completion report.

## Completion Report Contract

Final report must include:
- Task decomposition status
- Implemented task count, including backend/frontend counts
- Quality check result
- Commit count
- Cleanup result
- Escalation or blocking summary, if any
