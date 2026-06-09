---
name: recipe-plan
description: Create work plan from design document and obtain plan approval
disable-model-invocation: true
---

**Context**: Dedicated to the planning phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results
2. **Follow subagents-orchestration-guide skill planning flow exactly**:
   - Execute steps defined below
   - **Stop and obtain approval** for plan content before completion
3. **Scope**: See Scope Boundaries below

**CRITICAL**: When the user requests test generation, always execute acceptance-test-generator first — it provides the test skeleton that work-planner depends on.

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
   ! ls -la docs/design/*.md | head -10
   - Check for existence of design documents, notify user if none exist
   - Present options if multiple exist (can be specified with $ARGUMENTS)

### Step 2: Test Skeleton Generation Confirmation
   - Confirm with user whether to generate test skeletons (integration + E2E lanes) first
   - If user wants generation: invoke acceptance-test-generator
   - Pass generation results to next process according to subagents-orchestration-guide skill coordination specification

### Step 3: Work Plan Creation
Invoke work-planner using Agent tool:
- `subagent_type`: "dev-workflows:work-planner"
- `description`: "Work plan creation"
- If test skeletons were generated in Step 2, build the prompt by listing every lane's status:
  - Always include: "Integration test file: [path or 'not generated']"
  - For each E2E lane (`fixtureE2e`, `serviceE2e`):
    - When `generatedFiles.<lane>` is not null: "[lane] test file: [path]"
    - When `generatedFiles.<lane>` is null: "No [lane] skeleton generated (reason: [e2eAbsenceReason.<lane>])"
  - Append placement guidance: "Integration tests are created simultaneously with each phase implementation. fixture-e2e tests are created alongside the UI feature phase. service-integration-e2e tests are executed only in the final phase."
- If test skeletons were not generated:
  `prompt`: "Create work plan from Design Doc at [path]."

- Follow subagents-orchestration-guide Prompt Construction Rule for additional prompt parameters

### Step 4: Work Plan Review
Invoke document-reviewer to review the work plan:
- `subagent_type`: "dev-workflows:document-reviewer"
- `description`: "Work plan review"
- `prompt`: "doc_type: WorkPlan target: docs/plans/[plan-name].md. Review semantic traceability to the Design Doc, early verification placement, real-boundary verification coverage, Failure Mode Checklist, and Review Scope."
- The work plan is a derivation of the Design Doc, so plan-fidelity findings are resolved without user input. Branch on the reviewer's `verdict.decision`: on `needs_revision`, re-invoke work-planner in update mode with the findings and re-review, repeating until `approved` or `approved_with_conditions`. On `rejected`, escalate to the user.

### Step 5: Present for Approval
- Present the reviewed work plan to the user for batch approval. If the user requests changes, re-invoke work-planner with revised parameters and re-run Step 4.
- Highlight steps with unclear scope or external dependencies and ask the user to confirm

## Response at Completion

**Recommended**: After plan approval, output the standard block below.

```
Planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```

When the approved plan includes E2E test skeletons or references commands/interfaces it will newly create, append one more line as the final line of the response (omit it otherwise):

```
Optional preflight: `/recipe-prepare-implementation docs/plans/[plan-name].md` verifies these are implementable before build (exits no-op if all resolve).
```


