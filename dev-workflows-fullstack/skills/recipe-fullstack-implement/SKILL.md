---
name: recipe-fullstack-implement
description: Orchestrate full-cycle implementation across backend and frontend layers
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Full-cycle fullstack implementation management (Requirements Analysis → Design (backend + frontend) → Planning → Implementation → Quality Assurance)

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

## Required Reference

**MANDATORY**: Read `references/monorepo-flow.md` from subagents-orchestration-guide skill BEFORE proceeding. Follow the Fullstack Flow defined there instead of the standard single-layer flow.

## Execution Protocol

1. **Invoke named specialists for deliverable production** — pass deliverable paths between them and validate their results (see subagents-orchestration-guide "Orchestrator Execution Boundary")
2. **Follow monorepo-flow.md** for the design phase (multiple Design Docs, design-sync, vertical slicing)
3. **Follow subagents-orchestration-guide skill** for all other orchestration rules (stop points, structured responses, escalation)
4. **Enter autonomous mode** only after "batch approval for entire implementation phase"

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

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

Execute Skill: external-resource-context before running the external resource hearing in monorepo-flow.md.

**Follow monorepo-flow.md** for the current Large or Medium design-through-planning flow. Its Large table and Medium step range define the required steps, agent invocations, and stop points.

Key points to enforce as the orchestrator runs the flow:
- Create separate Design Docs per layer (see monorepo-flow.md "Layer Context in Design Doc Creation")
- Frontend Design Doc references an applicable approved UI Spec and reuses applicable ui-analyzer output produced earlier in the flow
- Execute document-reviewer once per Design Doc (separate invocations)
- Run design-sync for cross-layer consistency verification
- Pass all Design Docs to work-planner (subagent_type: "dev-workflows-fullstack:work-planner") with vertical slicing instruction
- Pass the Work Plan to document-reviewer (`doc_type: WorkPlan`) and request batch approval only after the review passes

### 4. Register All Flow Steps Using TaskCreate (MANDATORY)

After scale determination, use TaskCreate to register each design/planning step and the implementation, verification, cleanup, and report phases. Complete registration before invoking subagents; mark and advance the active phase with TaskUpdate.

## After requirement-analyzer [Stop]

Execute Skill: requirement-convergence before running the hearing protocol.

Build and judge the convergence record from the user's statements and requirement-analyzer `requestSignals`, using `scopeEvidence` and `costEvidence` as supporting facts, then run the requirement-convergence hearing protocol. After the requirements are confirmed, apply the subagents-orchestration-guide Small evidence gate before assigning the final Structural Scale; when the gate is unresolved, invoke codebase-analyzer before routing.

When user responds to questions:
- Update the orchestrator-owned convergence record from the answer, then update the Structural Scale judgment through the Small evidence gate.
- Re-execute requirement-analyzer only when the answer changes the repository analysis target or scope evidence.
- Repeat the hearing until every convergence field is `ready` or `weak-but-explicit`, then proceed with the resulting Scale.

## Subagents Orchestration Guide Compliance Execution

**Pre-execution Checklist (MANDATORY)**:
- [ ] Read monorepo-flow.md reference
- [ ] Confirmed relevant flow steps
- [ ] Identified current progress position
- [ ] Clarified next step
- [ ] Recognized stopping points
- [ ] one complete-scope codebase-analyzer result included before Design Doc creation
- [ ] code-verifier included before document-reviewer for each Design Doc
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable → Escalate before autonomous mode
  - Other environments (tests, quality tools) → Quality agents retain proof limitations while the task cycle continues

**Required Flow Compliance**:
- Run quality-fixer (layer-appropriate) before every commit
- Obtain user approval before Edit/Write/MultiEdit outside autonomous mode

## Mandatory Orchestrator Responsibilities

### Task Execution Quality Cycle (Filename-Pattern-Based)

**Agent routing by task filename** (see monorepo-flow.md reference):
```
*-backend-task-*   → dev-workflows-fullstack:task-executor + dev-workflows-fullstack:quality-fixer
*-frontend-task-*  → dev-workflows-fullstack:task-executor-frontend + dev-workflows-fullstack:quality-fixer-frontend
```

**Rules**:
1. Execute ONE task completely before starting next (each task goes through the full 4-step cycle via Agent tool, using the correct executor per filename pattern)
2. Check executor status before quality-fixer (escalation check). When `requiresTestReview` is `true`, identify the changed integration/E2E test files in the current changes and invoke integration-test-reviewer with them as `changedTestFiles`, plus `diffBase`, `taskFile`, prompt claims, and `mutationEvidence`, then branch on its status:
   - `approved` → Continue to rule 3
   - `blocked` → Apply subagents-orchestration-guide Specialist Result Acceptance
   - `needs_revision` → Pass `qualityIssues` unchanged into the Review Resolution Gate, return rerouted corrections to the layer executor, and continue to rule 3 only when correction re-review `prior_feedback_reconciliation` establishes convergence
3. Run the layer quality-fixer after the executor and any required test-review loop completes, passing `task_file`, upstream `mutationEvidence`, and `qualityCommand` when available (caller first, otherwise current task)
4. Check quality-fixer response:
   - `stub_detected` → Return to executor with the layer quality-fixer's `incompleteImplementations` array unchanged as the canonical `incompleteImplementations` field
   - `blocked` → Apply Specialist Result Acceptance
   - `verification_incomplete` → Retain the complete result for final retry and proceed to commit
   - `approved` → Proceed to commit
5. Apply subagents-orchestration-guide Commit Boundary Check before each commit; append its verification trailers when the quality-fixer result is `verification_incomplete`

### Post-Implementation Verification (After All Tasks Complete)

Apply subagents-orchestration-guide's retained verification limitation retry with each layer's quality-fixer before the document-dependent verifiers. Continue after clearing or retaining each result and report only repeated limitations.

Resolve all readable Design Docs from the Work Plan, or the Work Plan itself when none exist; missing input blocks verification.

Emit one code-verifier call per resolved document plus one security-reviewer call in one assistant message, then await all:
- code-verifier (subagent_type: "dev-workflows-fullstack:code-verifier") → verify the completed implementation against each resolved `doc_type` and single `document_path`
- security-reviewer (subagent_type: "dev-workflows-fullstack:security-reviewer") → review the completed implementation against the typed `governingDocuments` list

Apply subagents-orchestration-guide's Post-Implementation Verification status-routing and fix/re-run rules with the layer-appropriate executor and quality-fixer. Present the unified report; proceed to Final Cleanup after the complete verification set reaches Review Resolution convergence.

### Final Cleanup

Before the completion report, delete the implementation task files this recipe consumed. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete every file matching `docs/plans/tasks/{plan-name}-backend-task-*.md` and `docs/plans/tasks/{plan-name}-frontend-task-*.md` (the `{plan-name}` derived from the work plan path used in this run)
- Preserve the work plan itself (`docs/plans/{plan-name}.md`) — the user decides whether to delete it after final review

If task-file deletion fails, include the filesystem error in the completion report and finish the report with the implementation result.

In the completion report, list each declined actionable finding with its ID, governing reason, and evidence when any occurred.

### Test Information Communication
After acceptance-test-generator execution, when invoking work-planner (subagent_type: "dev-workflows-fullstack:work-planner"), communicate:
- `testSkeletons`: every non-null path from `generatedFiles`

## Execution Method

Deliverable production is executed through the specialist selected by monorepo-flow.md and subagents-orchestration-guide; workflow decisions and returned-result validation remain with the orchestrator.
