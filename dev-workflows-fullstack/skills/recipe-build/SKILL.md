---
name: recipe-build
description: Execute materialized task files in autonomous execution mode
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work through Agent tool** — invoke sub-agents, pass deliverable paths between them, and report results (permitted tools: see subagents-orchestration-guide "Orchestrator's Permitted Tools")
2. **Follow the 4-step task cycle exactly**: execute → branch on executor result → quality-fix → commit
3. **Enter autonomous mode** when user provides execution instruction with existing task files — this IS the batch approval
4. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: Run quality-fixer before every commit.

Work plan: $ARGUMENTS

## Pre-execution Prerequisites

### Work Plan Resolution

Before any task processing, locate the work plan. Resolution rule:
1. List task files in `docs/plans/tasks/` matching the single-layer pattern `{plan-name}-task-*.md`. Layer-aware fullstack tasks (`{plan-name}-backend-task-*.md` / `{plan-name}-frontend-task-*.md`) are excluded here so a stale fullstack run does not redirect this recipe to the wrong work plan
2. From the matched files, also exclude every file matching any of these patterns — they originate from other workflow phases and are not implementation tasks for this run's plan: `*-task-prep-*.md` (readiness preflight tasks), `_overview-*.md` (materialization overview file), `*-phase*-completion.md` (per-phase completion files), `review-fixes-*.md` (post-implementation review fixes), `integration-tests-*-task-*.md` (integration-test add-on scaffolding)
3. For each remaining file, extract the `{plan-name}` prefix as the segment that appears before `-task-`
4. When at least one task file matches, the work plan is `docs/plans/{plan-name}.md` for the prefix that has the most recent task-file mtime; ties broken by the lexicographically last `{plan-name}`
5. When no task file matches the restricted pattern, the work plan is the most-recent-mtime non-template `.md` in `docs/plans/`

### Consumed Task Set

Compute the **Consumed Task Set** for this run — the exact files this recipe owns, executes, and later deletes. Use the same restricted pattern as Work Plan Resolution:

1. List task files in `docs/plans/tasks/` matching the single-layer pattern `{plan-name}-task-*.md` for the `{plan-name}` resolved by Work Plan Resolution. Layer-aware fullstack tasks are excluded
2. Exclude every file matching: `*-task-prep-*.md`, `_overview-*.md`, `*-phase*-completion.md`, `review-fixes-*.md`, `integration-tests-*-task-*.md` (these originate from other workflow phases)

Every subsequent reference to "task files" in this recipe — Task Generation Decision Flow, Task Execution Cycle iteration, and Final Cleanup — uses this set, not the unrestricted `docs/plans/tasks/*.md` glob.

### Task Generation Decision Flow

Analyze the Consumed Task Set and determine the action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | Consumed Task Set is non-empty | User's execution instruction serves as batch approval → Enter autonomous execution immediately |
| No tasks + plan exists | Consumed Task Set is empty but the resolved work plan exists | Confirm with user → run task-decomposer |
| Neither exists + Design Doc exists | No plan, no Consumed Task Set, but `docs/design/*.md` exists | Invoke work-planner to create work plan from Design Doc, then run document-reviewer (`dev-workflows-fullstack:document-reviewer`, doc_type: WorkPlan); branch on the reviewer's `verdict.decision` — on `needs_revision`, re-invoke work-planner (update) and re-review until `approved`/`approved_with_conditions`; if the same blocking finding repeats without new evidence or a contract change, stop and escalate it; then present the reviewed plan for batch approval before task materialization; on `rejected`, stop before task materialization and escalate to the user |
| Neither exists | No plan, no Consumed Task Set, no Design Doc | Report missing prerequisites to user and stop |

## Task Materialization Phase (Conditional)

When the Consumed Task Set is empty:

### 1. User Confirmation
```
No task files in the Consumed Task Set.
Work plan: docs/plans/[plan-name].md

Generate tasks from the work plan? (y/n):
```

### 2. Task Materialization (if approved)
Invoke task-decomposer using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:task-decomposer"
- `description`: "Materialize work plan tasks"
- `prompt`: "Read work plan at docs/plans/[plan-name].md and output individual single-commit task files in docs/plans/tasks/."

### 3. Verify Generation
Recompute the Consumed Task Set using the same restricted pattern from the Consumed Task Set section above. Confirm it is now non-empty. If it is still empty, escalate to the user — task-decomposer either failed silently or produced files that don't match the expected pattern.

**Flow**: Task generation → Consumed Task Set recompute → Autonomous execution (in this order)

## Pre-execution Checklist

- [ ] Confirmed Consumed Task Set is non-empty (computed in the Consumed Task Set section above)
- [ ] Identified task execution order within the Consumed Task Set (dependencies)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable → Escalate before autonomous mode
  - Other environments (tests, quality tools) → Subagents will escalate

## Task Execution Cycle (4-Step Cycle)
**MANDATORY EXECUTION CYCLE**: `execute → branch on executor result → quality-fix → commit`

Before the loop, register `"Execute consumed task set"`, `"Run post-implementation verification"`, `"Clean up consumed task files"`, and `"Report completion"` once with TaskCreate; mark and advance the active phase with TaskUpdate.

For EACH task in the Consumed Task Set, YOU MUST:
1. **EXECUTE**: invoke Agent tool (subagent_type: "dev-workflows-fullstack:task-executor") → Record the current HEAD as `diffBase`, pass the task file path in the prompt, and receive the structured response
2. **BRANCH ON EXECUTOR RESULT**:
   - `status: "escalation_needed"` or `"blocked"` → STOP and escalate to user
   - `requiresTestReview` is `true` → Invoke integration-test-reviewer with `diffBase`, changed integration/E2E paths, `taskFile`, prompt-only claims, and `mutationEvidence`
     - `needs_revision` → Return to step 1 with `requiredFixes`
     - `approved` → Proceed to step 3
     - `blocked` → STOP and escalate to user
   - `readyForQualityCheck: true` → Proceed to step 3
3. **QUALITY-FIX**: Invoke quality-fixer with `task_file`, upstream `mutationEvidence`, and `qualityCommand` when available (caller first, otherwise current task)
   - `stub_detected` → Return to step 1 with `incompleteImplementations[]` details
   - `blocked` → STOP and escalate to user
   - `approved` → Proceed to step 4
4. **COMMIT**: Execute git commit after quality-fixer returns `approved`

**CRITICAL**: Parse every sub-agent response for status fields. Execute the matching branch in the 4-step cycle. Proceed to next task only after quality-fixer returns `approved`.

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

Resolve the Work Plan's readable Design Doc, or the Work Plan itself when no Design Doc exists; missing input blocks verification.

Emit these Agent calls in one assistant message, then await both:
- code-verifier (subagent_type: "dev-workflows-fullstack:code-verifier") → resolved `doc_type`, `document_path`, and `code_paths` from `git diff --name-only main...HEAD`
- security-reviewer (subagent_type: "dev-workflows-fullstack:security-reviewer") → the same typed `governingDocuments` and `implementationFiles`

Apply subagents-orchestration-guide's Post-Implementation Verification pass/fail and fix/re-run rules. Present the unified report; proceed to Final Cleanup after both pass.

## Final Cleanup

Before the completion report, delete the implementation task files this recipe consumed. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete every file in the Consumed Task Set
- Delete every file matching `docs/plans/tasks/{plan-name}-phase*-completion.md` (the per-phase completion files generated by task-decomposer for this `{plan-name}`)
- Delete the corresponding `docs/plans/tasks/_overview-{plan-name}.md` if present
- Preserve the work plan itself (`docs/plans/{plan-name}.md`) — the user decides whether to delete it after final review

If task files cannot be deleted (filesystem error), report the failure but do not block the completion report.

## Completion Report Contract

Final report must include:
- Task materialization status
- Implemented task count
- Quality check result
- Commit count
- Cleanup result
- Escalation or blocking summary, if any
