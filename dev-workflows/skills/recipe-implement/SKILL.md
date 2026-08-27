---
name: recipe-implement
description: Orchestrate the complete implementation lifecycle from requirements to deployment
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Full-cycle implementation management (Requirements Analysis → Design → Planning → Implementation → Quality Assurance)

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Protocol**:
1. **Invoke named specialists for deliverable production** — pass deliverable paths between them and validate their results (see subagents-orchestration-guide "Orchestrator Execution Boundary")
2. **Follow subagents-orchestration-guide skill flows exactly**:
   - Execute one step at a time in the defined flow (Large/Medium/Small scale)
   - When flow specifies "Execute document-reviewer" → Execute it immediately
   - **Stop at every `[Stop: ...]` marker** → Use AskUserQuestion for confirmation and wait for approval before proceeding
3. **Enter autonomous mode** after confirmed Small requirements or Medium/Large batch approval

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

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

Execute Skill: requirement-convergence before running the hearing protocol.

Build and judge the convergence record from the user's statements and requirement-analyzer `requestSignals`, using `scopeEvidence` and `costEvidence` as supporting facts, then run the requirement-convergence hearing protocol. After the requirements are confirmed, apply the subagents-orchestration-guide Small evidence gate before assigning the final Structural Scale; when the gate is unresolved, invoke codebase-analyzer before routing.

When user responds to questions:
- Update the orchestrator-owned convergence record from the answer, then update the Structural Scale judgment through the Small evidence gate.
- Re-execute requirement-analyzer only when the answer changes the repository analysis target or scope evidence.
- Repeat the hearing until every convergence field is `ready` or `weak-but-explicit`, then proceed with the resulting Scale.
- For Small, the user's requirement confirmation authorizes the direct implementation scope; proceed to the 4-step cycle without a Work Plan.

### 4. Bind the Applicable Flow

After Structural Scale is determined, follow only that scale's applicable path. Treat each applicable design, review, approval, planning, implementation, verification, cleanup, and reporting phase as a gate. Advance only when the current phase's stated evidence or approval exists; skip only branches whose stated condition is false.

## Subagents Orchestration Guide Compliance Execution

**Pre-execution Checklist (MANDATORY)**:
- [ ] Confirmed relevant subagents-orchestration-guide skill flow
- [ ] Identified current progress position
- [ ] Clarified next step
- [ ] Recognized stopping points
- [ ] codebase-analyzer included before Design Doc creation (Medium/Large scale)
- [ ] code-verifier included before document-reviewer for Design Doc review (Medium/Large scale)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability is unavailable → Apply Specialist Result Acceptance before autonomous mode
  - Other environments (tests, quality tools) → Quality agents retain proof limitations while the task cycle continues

**Required Flow Compliance**:
- Run quality-fixer before every commit
- Obtain user approval before Edit/Write/MultiEdit outside autonomous mode

## Mandatory Orchestrator Responsibilities

### Task Execution Quality Cycle (4-Step Cycle per Task)

**Per-task cycle** (complete each task before starting next):
1. **Agent tool** (subagent_type: "dev-workflows:task-executor") → Record the current HEAD as `diffBase`; pass `task_file: [path]` when one exists, otherwise pass `direct_scope` as the confirmed outcome and exclusions, `governing_sources`, `target_paths`, and `observable_verification`
2. Check task-executor response:
   - `status: escalation_needed` or `blocked` → Apply subagents-orchestration-guide Specialist Result Acceptance
   - `requiresTestReview` is `true` → Identify the changed integration/E2E test files in the current changes and invoke integration-test-reviewer with them as `changedTestFiles`, plus `diffBase`, optional `taskFile`, prompt-only claims, and `mutationEvidence`
     - `approved` → Proceed to step 3
     - `blocked` → Apply Specialist Result Acceptance
     - `needs_revision` → Pass `qualityIssues` unchanged into the Review Resolution Gate; return to step 1 for rerouted corrections and derive convergence from correction re-review `prior_feedback_reconciliation`
   - Otherwise → Proceed to step 3
3. quality-fixer → Pass `task_file` when one exists, upstream `mutationEvidence`, and `qualityCommand` when available (caller first, otherwise current task)
   - `stub_detected` → Return to step 1 with quality-fixer's `incompleteImplementations` array unchanged as the canonical `incompleteImplementations` field
   - `blocked` → Apply Specialist Result Acceptance
   - `verification_incomplete` → Retain the complete result for final retry and proceed to step 4
   - `approved` → Proceed to step 4
4. git commit → Apply subagents-orchestration-guide Commit Boundary Check, then execute with Bash after `approved` or `verification_incomplete`; append its verification trailers for the latter

### Post-Implementation Review (Medium/Large, After All Tasks Complete)

Apply subagents-orchestration-guide's retained verification limitation retry before the document-dependent reviewers. Continue after clearing or retaining each result and report only repeated limitations.

Resolve the Work Plan's readable Design Doc; missing input blocks review.

Emit these Agent calls in one assistant message, then await both:
- code-reviewer (subagent_type: "dev-workflows:code-reviewer") → review the completed implementation with the resolved typed `governingDocuments`, the actual files changed by completed tasks as `implementationFiles`, and the Work Plan path
- security-reviewer (subagent_type: "dev-workflows:security-reviewer") → review the completed implementation against the same typed `governingDocuments`

Apply subagents-orchestration-guide's Post-Implementation Review status-routing and fix/re-run rules. Present the unified report; proceed to Final Cleanup after the complete review set reaches Review Resolution convergence.

For Small, skip this document-dependent review. Retry a retained verification limitation once after the task commit; complete with observed `observable_verification` evidence and report any proof that remains unavailable.

### Final Cleanup

For Medium/Large, before the completion report, delete the implementation task files this recipe consumed. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete every file matching `docs/plans/tasks/{plan-name}-task-*.md` (the `{plan-name}` derived from the work plan path used in this run)
- Preserve the work plan itself (`docs/plans/{plan-name}.md`) — the user decides whether to delete it after final review

If task-file deletion fails, include the filesystem error in the completion report and finish the report with the implementation result.

Small has no task-file cleanup.

In the completion report, list each declined actionable finding with its ID, governing reason, and evidence when any occurred.

### Test Information Communication
After acceptance-test-generator execution, when invoking work-planner (subagent_type: "dev-workflows:work-planner"), communicate:
- `testSkeletons`: every non-null path from `generatedFiles`

## Execution Method

Deliverable production is executed through the specialist selected by subagents-orchestration-guide; workflow decisions and returned-result validation remain with the orchestrator.
