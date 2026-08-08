---
name: recipe-front-plan
description: Create frontend work plan from design document and obtain plan approval
disable-model-invocation: true
---

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
   - Confirm with user whether to generate test skeletons (integration + fixture-e2e + service-integration-e2e) first
   - If user wants generation: acceptance-test-generator generates skeletons across all applicable lanes
     - Invoke acceptance-test-generator using Agent tool:
       - `subagent_type`: "dev-workflows-frontend:acceptance-test-generator"
       - `description`: "Test skeleton generation"
       - `design_docs: [Design Doc path]`
       - `ui_spec: [UI Spec path]` when one exists
       - `confirmed_requirement_context`: approved PRD path named by the Design Doc, or its unchanged Requirement Convergence record when no PRD exists
       - Follow subagents-orchestration-guide HC-06 for `value_input_required` and its unknown-value continuation
   - Pass existing generated skeleton paths to work-planner according to subagents-orchestration-guide HC-06

### Step 3: Work Plan Creation
Invoke work-planner using Agent tool:
- `subagent_type`: "dev-workflows-frontend:work-planner"
- `description`: "Work plan creation"
- `mode: create`
- `designDoc: [selected Design Doc path]`
- `uiSpec: [UI Spec path]` when one exists
- `prd: [approved PRD path]` when one exists
- `testSkeletons: [non-null generatedFiles paths]` when Step 2 generated skeletons

### Step 4: Work Plan Review
Invoke document-reviewer to review the work plan:
- `subagent_type`: "dev-workflows-frontend:document-reviewer"
- `description`: "Work plan review"
- `prompt`: "doc_type: WorkPlan target: docs/plans/[plan-name].md. Review the Work Plan's own Implementation Scope, tasks, Completion Criteria, dependencies, execution order, exact source-anchor existence, executable verification, and Review Scope. Governing Documents paths are citation sources only; keep issues limited to violations of cited obligations."
- Run the Review Resolution Gate through its correction re-review, escalation, and convergence transitions, using work-planner in update mode for rerouted corrections. Present the plan for approval only at its convergence condition.

### Step 5: Present for Approval
- Present the reviewed work plan to the user for batch approval. If the user requests changes, re-invoke work-planner with the user's requested changes verbatim and re-run Step 4.
- Highlight steps with unclear scope or external dependencies and ask the user to confirm

## Response at Completion
**Recommended**: End with the following standard response after plan content approval
```
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```

When findings were declined during Work Plan review, append their IDs, governing reasons, and evidence to this completion response.
