---
name: recipe-implement
description: Orchestrate the complete implementation lifecycle from requirements to deployment
disable-model-invocation: true
---

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

Build and judge the convergence record from the user's statements and requirement-analyzer `requestSignals`, using `scopeEvidence` and `costEvidence` as supporting facts. Determine Structural Scale from the confirmed outcome and responsibility boundaries, then run the requirement-convergence hearing protocol before presenting anything else.

When user responds to questions:
- Update the orchestrator-owned convergence record and Structural Scale judgment from the answer.
- Re-execute requirement-analyzer only when the answer changes the repository analysis target or scope evidence.
- Repeat the hearing until every convergence field is `ready` or `weak-but-explicit`, then proceed with the resulting Scale.
- For Small, the user's requirement confirmation authorizes the direct implementation scope; proceed to the 4-step cycle without a Work Plan.

### 4. Register All Flow Steps Using TaskCreate (MANDATORY)

After scale determination, use TaskCreate to register the applicable design/planning steps and the implementation, verification, report, and Medium/Large cleanup phases. Complete registration before invoking subagents; mark and advance the active phase with TaskUpdate.

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
1. **Agent tool** (subagent_type: "dev-workflows:task-executor") → Record the current HEAD as `diffBase`; pass the task file path when one exists, otherwise pass `direct_scope` as the confirmed outcome and exclusions, `governing_sources`, `target_paths`, and `observable_verification`
2. Check task-executor response:
   - `status: escalation_needed` or `blocked` → Escalate to user
   - `requiresTestReview` is `true` → Derive `changedTestFiles` from the current `git status --short` write set and invoke integration-test-reviewer with it, `diffBase`, optional `taskFile`, prompt-only claims, and `mutationEvidence`
     - `approved` → Proceed to step 3
     - `blocked` → Escalate to user
     - `needs_revision` → Pass `qualityIssues` unchanged into the Review Resolution Gate; return to step 1 for rerouted corrections and derive convergence from correction re-review `prior_feedback_reconciliation`
   - Otherwise → Proceed to step 3
3. quality-fixer → Pass `task_file` when one exists, upstream `mutationEvidence`, and `qualityCommand` when available (caller first, otherwise current task); quality-fixer derives the uncommitted write set from repository status
   - `stub_detected` → Return to step 1 with `incompleteImplementations[]` details
   - `blocked` → Escalate to user
   - `approved` → Proceed to step 4
4. git commit → Execute with Bash (on `approved`)

### Post-Implementation Verification (Medium/Large, After All Tasks Complete)

Resolve the Work Plan's readable Design Doc; missing input blocks verification.

Emit these Agent calls in one assistant message, then await both:
- code-verifier (subagent_type: "dev-workflows:code-verifier") → resolved `doc_type`, `document_path`, and `code_paths` from `git diff --name-only main...HEAD`
- security-reviewer (subagent_type: "dev-workflows:security-reviewer") → the same typed `governingDocuments` and `implementationFiles`

Apply subagents-orchestration-guide's Post-Implementation Verification pass/fail and fix/re-run rules. Present the unified report; proceed to Final Cleanup after both pass.

For Small, skip this document-dependent verification. Complete after quality-fixer approval and successful `observable_verification` from the confirmed direct scope.

### Final Cleanup

For Medium/Large, before the completion report, delete the implementation task files this recipe consumed. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete every file matching `docs/plans/tasks/{plan-name}-task-*.md` (the `{plan-name}` derived from the work plan path used in this run)
- Preserve the work plan itself (`docs/plans/{plan-name}.md`) — the user decides whether to delete it after final review

If task-file deletion fails, include the filesystem error in the completion report and finish the report with the implementation result.

Small has no task-file cleanup.

In the completion report, list each declined actionable finding with its ID, governing reason, and evidence when any occurred.

### Test Information Communication
After acceptance-test-generator execution, when invoking work-planner (subagent_type: "dev-workflows:work-planner"), communicate:
- Generated integration test file path (from `generatedFiles.integration`)
- Generated fixture-e2e test file path or null (from `generatedFiles.fixtureE2e`)
- Generated service-integration-e2e test file path or null (from `generatedFiles.serviceE2e`)
- Per-lane E2E absence reason (from `e2eAbsenceReason.fixtureE2e` and `e2eAbsenceReason.serviceE2e`, when each lane is null)

## Execution Method

Deliverable production is executed through the specialist selected by subagents-orchestration-guide; workflow decisions and returned-result validation remain with the orchestrator.
