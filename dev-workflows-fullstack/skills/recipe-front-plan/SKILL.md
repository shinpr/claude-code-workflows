---
name: recipe-front-plan
description: Create frontend work plan from design document and obtain plan approval
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Dedicated to the frontend planning phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Protocol**:
1. **Invoke named specialists for deliverable production** — pass data between them and validate their results
2. **Follow subagents-orchestration-guide skill planning flow**:
   - Execute steps defined below
   - **Stop and obtain approval** for plan content before completion
3. **Scope**: See Scope Boundaries below

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

Acceptance-test-generator is part of this planning flow and may return no selected lanes when the Design Doc has no justified integration/E2E proof boundary.

## Scope Boundaries

**Included in this skill**:
- Design document selection
- Test skeleton generation with acceptance-test-generator
- Work plan creation with work-planner
- Work plan review with document-reviewer
- Plan approval obtainment

**Responsibility Boundary**: This skill completes with work plan approval.

Follow the planning process below:

## Execution Process

### Step 1: Design Document Selection
   - Use the Design Doc explicitly supplied in `$ARGUMENTS` when present
   - Otherwise use the only Design Doc under `docs/design/` when exactly one exists
   - Resolve the UI Spec only from the selected Design Doc's `Referenced UI Spec` path
   - Report when no Design Doc exists; when multiple Design Docs exist, present them for selection

### Step 2: Test Skeleton Generation
   - Invoke acceptance-test-generator across all applicable lanes using Agent tool:
     - `subagent_type`: "dev-workflows-fullstack:acceptance-test-generator"
     - `description`: "Test skeleton generation"
     - `design_docs: [Design Doc path]`
     - `ui_spec: [UI Spec path]` when one exists
     - `confirmed_requirement_context`: approved PRD path named by the Design Doc, or its unchanged Requirement Convergence record when no PRD exists
     - Follow subagents-orchestration-guide HC-06 for `value_input_required` and its unknown-value continuation
   - Pass every non-null generated skeleton path to work-planner; treat an evidence-backed empty lane as complete for that lane and continue to work-planner

### Step 3: Work Plan Creation
Invoke work-planner using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:work-planner"
- `description`: "Work plan creation"
- `mode: create`
- `designDoc: [selected Design Doc path]`
- `uiSpec: [UI Spec path]` when one exists
- `prd: [approved PRD path]` when one exists
- `testSkeletons: [non-null generatedFiles paths]`

### Step 4: Work Plan Review
Invoke document-reviewer to review the work plan:
- `subagent_type`: "dev-workflows-fullstack:document-reviewer"
- `description`: "Work plan review"
- `prompt`: "doc_type: WorkPlan target: docs/plans/[plan-name].md. Review the Work Plan's own Implementation Scope, tasks, Completion Criteria, dependencies, execution order, exact source-anchor existence, executable verification, and Review Scope. Governing Documents paths are citation sources only; keep issues limited to violations of cited obligations."
- Run the Review Resolution Gate through correction re-review, its parent requirement or authority exits, and convergence, using work-planner in update mode for rerouted corrections. Present the plan for approval only at its convergence condition.

### Step 5: Present for Approval
- Present the reviewed work plan to the user for batch approval. If the user requests changes, re-invoke work-planner with the user's requested changes verbatim and re-run Step 4.
- Record unresolved technical evidence or external dependencies in the plan with their affected task and verification boundary. Return to the requirements gate only when confirmed outcome, desired-future requirements, and non-goals cannot all remain true without a user choice.

## Response at Completion
**Recommended**: End with the following standard response after plan content approval
```
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```

When findings were declined during Work Plan review, append their IDs, governing reasons, and evidence to this completion response.
