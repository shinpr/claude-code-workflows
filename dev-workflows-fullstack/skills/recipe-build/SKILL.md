---
name: recipe-build
description: Execute materialized task files in autonomous execution mode
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Protocol**:
1. **Invoke named specialists for deliverable production** — pass deliverable paths between them and validate their results (see subagents-orchestration-guide "Orchestrator Execution Boundary")
2. **Follow the 4-step task cycle exactly**: execute → branch on executor result → quality-fix → commit
3. **Enter autonomous mode** when user provides execution instruction with existing task files — this IS the batch approval
4. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: Run quality-fixer before every commit.

Work plan: $ARGUMENTS

## Pre-execution Prerequisites

### Work Plan Resolution

Before any task processing, locate the work plan. Resolution rule:
1. List task files in `docs/plans/tasks/` matching the single-layer pattern `{plan-name}-task-*.md`. Layer-aware fullstack tasks (`{plan-name}-backend-task-*.md` / `{plan-name}-frontend-task-*.md`) are excluded here so a stale fullstack run does not redirect this recipe to the wrong work plan
2. For each matched file, extract the `{plan-name}` prefix as the segment that appears before `-task-`
3. When at least one task file matches, the work plan is `docs/plans/{plan-name}.md` for the prefix that has the most recent task-file mtime; ties broken by the lexicographically last `{plan-name}`
4. When no task file matches the restricted pattern, the work plan is the most recently modified `.md` in `docs/plans/`

### Consumed Task Set

Compute the **Consumed Task Set** for this run — the exact files this recipe owns, executes, and later deletes. Use the same restricted pattern as Work Plan Resolution:

1. List task files in `docs/plans/tasks/` matching the single-layer pattern `{plan-name}-task-*.md` for the `{plan-name}` resolved by Work Plan Resolution. Layer-aware fullstack tasks are excluded

Every subsequent reference to "task files" in this recipe — Task Generation Decision Flow, Task Execution Cycle iteration, and Final Cleanup — uses this set, not the unrestricted `docs/plans/tasks/*.md` glob.

### Task Generation Decision Flow

Analyze the Consumed Task Set and determine the action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | Consumed Task Set is non-empty | User's execution instruction serves as batch approval → Enter autonomous execution immediately |
| No tasks + plan exists | Consumed Task Set is empty but the resolved work plan exists | Confirm with user → run task-decomposer |
| Neither exists + Design Doc exists | No plan, no Consumed Task Set, but `docs/design/*.md` exists | Invoke work-planner to create a work plan, then run document-reviewer (`dev-workflows-fullstack:document-reviewer`, doc_type: WorkPlan). Run Review Resolution through its correction re-review, escalation, and convergence transitions, using work-planner for rerouted corrections; then present the resolved plan for batch approval before task materialization |
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
  - Other environments (tests, quality tools) → Quality agents retain proof limitations while the task cycle continues

## Task Execution Cycle (4-Step Cycle)
**MANDATORY EXECUTION CYCLE**: `execute → branch on executor result → quality-fix → commit`

Before the loop, register `"Execute consumed task set"`, `"Run post-implementation verification"`, `"Clean up consumed task files"`, and `"Report completion"` once with TaskCreate; mark and advance the active phase with TaskUpdate.

For EACH task in the Consumed Task Set, YOU MUST:
1. **EXECUTE**: invoke Agent tool (subagent_type: "dev-workflows-fullstack:task-executor") → Record the current HEAD as `diffBase`, pass `task_file: [path]`, and receive the structured response
2. **BRANCH ON EXECUTOR RESULT**:
   - `status: "escalation_needed"` or `"blocked"` → Apply subagents-orchestration-guide Specialist Result Acceptance; escalate only a valid user-owned block
   - `requiresTestReview` is `true` → Identify the changed integration/E2E test files in the current changes and invoke integration-test-reviewer with them as `changedTestFiles`, plus `diffBase`, `taskFile`, prompt-only claims, and `mutationEvidence`
     - `approved` → Proceed to step 3
     - `blocked` → Apply Specialist Result Acceptance
     - `needs_revision` → Pass `qualityIssues` unchanged into the Review Resolution Gate; return to step 1 for rerouted corrections and derive convergence from correction re-review `prior_feedback_reconciliation`
   - `status: completed` → Proceed to step 3
3. **QUALITY-FIX**: Invoke quality-fixer with `task_file`, upstream `mutationEvidence`, and `qualityCommand` when available (caller first, otherwise current task)
   - `stub_detected` → Return to step 1 with quality-fixer's `incompleteImplementations` array unchanged as the canonical `incompleteImplementations` field
   - `blocked` → Apply Specialist Result Acceptance
   - `verification_incomplete` → Retain the complete result for final retry and proceed to step 4
   - `approved` → Proceed to step 4
4. **COMMIT**: Apply subagents-orchestration-guide Commit Boundary Check, then execute git commit after quality-fixer returns `approved` or `verification_incomplete`; append its verification trailers for the latter

Use each subagent's semantic result and repository evidence through Specialist Result Acceptance; canonical status fields provide the normal routing shortcut. Proceed to the next task after step 4 and retain any verification limitation with its status kept proof-limited.

Verify task files exist per Pre-execution Checklist, then enter autonomous execution mode. When requirement changes are detected during execution, escalate to the user with the change summary before continuing.

## Post-Implementation Verification (After All Tasks Complete)

Before invoking post-implementation verifiers, apply subagents-orchestration-guide's retained verification limitation retry. Continue with the verifiers after clearing or retaining each result; include only repeated limitations in the completion report.

Resolve the Work Plan's readable Design Doc; missing input blocks verification.

Emit these Agent calls in one assistant message, then await both:
- code-verifier (subagent_type: "dev-workflows-fullstack:code-verifier") → resolved `doc_type`, `document_path`, and `code_paths` from `git diff --name-only main...HEAD`
- security-reviewer (subagent_type: "dev-workflows-fullstack:security-reviewer") → the same typed `governingDocuments` and `implementationFiles`

Apply subagents-orchestration-guide's Post-Implementation Verification status-routing and fix/re-run rules. Present the unified report; proceed to Final Cleanup after the complete verification set reaches Review Resolution convergence.

## Final Cleanup

Before the completion report, delete the implementation task files this recipe consumed. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete every file in the Consumed Task Set
- Preserve the work plan itself (`docs/plans/{plan-name}.md`) — the user decides whether to delete it after final review

If task-file deletion fails with a filesystem error, report the failure and continue to the completion report.

## Completion Report Contract

Final report must include:
- Task materialization status
- Implemented task count
- Quality check result
- Verification limitations that remained after final retry
- Commit count
- Cleanup result
- Declined actionable findings with ID, governing reason, and evidence, when any occurred
- Escalation or blocking summary, if any
