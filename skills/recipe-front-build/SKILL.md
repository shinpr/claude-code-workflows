---
name: recipe-front-build
description: Execute materialized frontend task files in autonomous execution mode
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

**CRITICAL**: Run quality-fixer-frontend before every commit.

Work plan: $ARGUMENTS

## Pre-execution Prerequisites

### Work Plan Resolution

Before any task processing, locate the work plan. Resolution rule:
1. Use the work plan explicitly supplied in `$ARGUMENTS` when present.
2. Otherwise group single-layer task files by the existing `{plan-name}-task-*.md` naming contract and map each group to `docs/plans/{plan-name}.md`. Exclude layer-aware fullstack task sets.
3. When task groups produce no candidate, use the only Work Plan under `docs/plans/` when exactly one exists.
4. Select the sole candidate. When multiple candidates remain, present them for selection. When none exists, continue through the missing-prerequisite branch below.

### Consumed Task Set

Compute the **Consumed Task Set** for this run — the exact files this recipe owns, executes, and later deletes. Use the same restricted pattern as Work Plan Resolution:

1. List task files in `docs/plans/tasks/` matching the single-layer pattern `{plan-name}-task-*.md` for the `{plan-name}` resolved by Work Plan Resolution. Layer-aware fullstack tasks are excluded

Every subsequent reference to "task files" in this recipe — Task Generation Decision Flow, Task Execution Cycle iteration, and Final Cleanup — uses this set, not the unrestricted `docs/plans/tasks/*.md` glob.

### Task Generation Decision Flow

Analyze the Consumed Task Set and determine the action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | Consumed Task Set is non-empty | User's execution instruction serves as batch approval → Enter autonomous execution immediately |
| No tasks + approved plan exists | Consumed Task Set is empty but the resolved work plan has batch approval | Run task-decomposer; the approval already authorizes mechanical task materialization |
| No tasks + unapproved plan exists | Consumed Task Set is empty and the resolved work plan is not approved | Review it when needed, then present the plan approval gate before task materialization |
| Neither exists + Design Doc exists | No plan, no Consumed Task Set, but `docs/design/*.md` exists | Invoke work-planner to create a work plan, then run document-reviewer (`dev-workflows-frontend:document-reviewer`, doc_type: WorkPlan). Run Review Resolution through its correction re-review, escalation, and convergence transitions, using work-planner for rerouted corrections; then present the resolved plan for batch approval before task materialization |
| Neither exists | No plan, no Consumed Task Set, no Design Doc | Report missing prerequisites to user and stop |

## Task Materialization Phase (Conditional)

When the Consumed Task Set is empty:

### 1. Authorization Check

Use the normal Work Plan review and approval gate when batch approval is absent. Existing batch approval authorizes task materialization directly.

### 2. Task Materialization
Invoke task-decomposer using Agent tool:
- `subagent_type`: "dev-workflows-frontend:task-decomposer"
- `description`: "Materialize work plan tasks"
- `prompt`: "Read work plan at docs/plans/[plan-name].md and output individual single-commit task files in docs/plans/tasks/."

### 3. Verify Generation
Recompute the Consumed Task Set using the same restricted pattern from the Consumed Task Set section above. When it remains empty, apply Specialist Result Acceptance: validate the invocation and returned artifacts, correct recoverable input or naming errors, and rerun. Stop for the user only when resolving the plan or intended task boundary requires a user-owned decision.

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
1. **EXECUTE**: invoke Agent tool (subagent_type: "dev-workflows-frontend:task-executor-frontend") → Record the current HEAD as `diffBase`, pass `task_file: [path]`, and receive the structured response
2. **BRANCH ON EXECUTOR RESULT**:
   - `status: "escalation_needed"` or `"blocked"` → Apply subagents-orchestration-guide Specialist Result Acceptance; escalate only a valid user-owned block
   - `requiresTestReview` is `true` → Identify the changed integration/E2E test files in the current changes and invoke integration-test-reviewer with them as `changedTestFiles`, plus `diffBase`, `taskFile`, prompt-only claims, and `mutationEvidence`
     - `approved` → Proceed to step 3
     - `blocked` → Apply Specialist Result Acceptance
     - `needs_revision` → Pass `qualityIssues` unchanged into the Review Resolution Gate; return to step 1 for rerouted corrections and derive convergence from correction re-review `prior_feedback_reconciliation`
   - `status: completed` → Proceed to step 3
3. **QUALITY-FIX**: Invoke quality-fixer-frontend with `task_file`, upstream `mutationEvidence`, and `qualityCommand` when available (caller first, otherwise current task)
   - `stub_detected` → Return to step 1 with quality-fixer-frontend's `incompleteImplementations` array unchanged as the canonical `incompleteImplementations` field
   - `blocked` → Apply Specialist Result Acceptance
   - `verification_incomplete` → Retain the complete result for final retry and proceed to step 4
   - `approved` → Proceed to step 4
4. **COMMIT**: Apply subagents-orchestration-guide Commit Boundary Check, then execute git commit after quality-fixer-frontend returns `approved` or `verification_incomplete`; append its verification trailers for the latter

Use each subagent's semantic result and repository evidence through Specialist Result Acceptance; canonical status fields provide the normal routing shortcut. Proceed to the next task after step 4 and retain any verification limitation with its status kept proof-limited.

Verify task files exist per Pre-execution Checklist, then enter autonomous execution mode. When requirement changes are detected during execution, escalate to the user with the change summary before continuing.

## Post-Implementation Verification (After All Tasks Complete)

Before invoking post-implementation verifiers, apply subagents-orchestration-guide's retained verification limitation retry with quality-fixer-frontend. Continue with the verifiers after clearing or retaining each result; include only repeated limitations in the completion report.

Resolve the Work Plan's readable Design Doc; missing input blocks verification.

Emit these Agent calls in one assistant message, then await both:
- code-verifier (subagent_type: "dev-workflows-frontend:code-verifier") → verify the completed implementation against the resolved `doc_type` and `document_path`
- security-reviewer (subagent_type: "dev-workflows-frontend:security-reviewer") → review the completed implementation against the same typed `governingDocuments`

Apply subagents-orchestration-guide's Post-Implementation Verification status-routing and fix/re-run rules with the frontend executor and quality-fixer. Present the unified report; proceed to Final Cleanup after the complete verification set reaches Review Resolution convergence.

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
