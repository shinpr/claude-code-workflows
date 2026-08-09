---
name: recipe-plan
description: Create work plan from design document and obtain plan approval
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Dedicated to the planning phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Protocol**:
1. **Invoke named specialists for deliverable production** — pass data between them and validate their results
2. **Follow subagents-orchestration-guide skill planning flow exactly**:
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
   - Report when none exist; when multiple exist, present them for selection

### Step 2: Test Skeleton Generation
   - Invoke acceptance-test-generator with `design_docs: [selected Design Doc path]` and `confirmed_requirement_context` as the approved PRD path named by its Requirement Convergence section, or that section's unchanged convergence record when no PRD exists
   - Follow subagents-orchestration-guide HC-06 for `value_input_required` and its unknown-value continuation
   - Pass every non-null generated skeleton path to the next process; an evidence-backed empty lane proceeds without a separate confirmation

### Step 3: Work Plan Creation
Invoke work-planner using Agent tool:
- `subagent_type`: "dev-workflows:work-planner"
- `description`: "Work plan creation"
- `mode: create`
- `designDoc: [selected Design Doc path]`
- `prd: [approved PRD path]` when one exists
- `testSkeletons: [non-null generatedFiles paths]`

### Step 4: Work Plan Review
Invoke document-reviewer to review the work plan:
- `subagent_type`: "dev-workflows:document-reviewer"
- `description`: "Work plan review"
- `prompt`: "doc_type: WorkPlan target: docs/plans/[plan-name].md. Review the Work Plan's own Implementation Scope, tasks, Completion Criteria, dependencies, execution order, exact source-anchor existence, executable verification, and Review Scope. Governing Documents paths are citation sources only; keep issues limited to violations of cited obligations."
- Run the Review Resolution Gate through its correction re-review, escalation, and convergence transitions, using work-planner in update mode for rerouted corrections. Present the plan for approval only at its convergence condition.

### Step 5: Present for Approval
- Present the reviewed work plan to the user for batch approval. If the user requests changes, re-invoke work-planner with the user's requested changes verbatim and re-run Step 4.
- Highlight steps with unclear scope or external dependencies and ask the user to confirm

## Response at Completion

**Recommended**: After plan approval, output the standard block below.

```
Planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```

When findings were declined during Work Plan review, append their IDs, governing reasons, and evidence to this completion response.
