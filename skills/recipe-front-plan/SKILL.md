---
name: recipe-front-plan
description: Create frontend work plan from design document and obtain plan approval
disable-model-invocation: true
---

**Context**: Dedicated to the frontend planning phase.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Test skeleton generation → performed by acceptance-test-generator
- Work plan creation → performed by work-planner

Orchestrator invokes sub-agents and passes structured JSON between them.

## Scope Boundaries

**Included in this skill**:
- Design document selection
- Test skeleton generation with acceptance-test-generator
- Work plan creation with work-planner
- Plan approval obtainment

**Responsibility Boundary**: This skill completes with work plan approval.

Create frontend work plan with the following process:

## Execution Process

### Step 1: Design Document Selection
! ls -la docs/design/*.md | head -10
- Check for existence of design documents, notify user if none exist
- Present options if multiple exist (can be specified with $ARGUMENTS)

### Step 2: Test Skeleton Generation
Invoke acceptance-test-generator using Task tool:
- `subagent_type`: "acceptance-test-generator"
- `description`: "Test skeleton generation"
- If UI Spec exists: `prompt: "Generate test skeletons from Design Doc at [path]. UI Spec at [ui-spec path]."`
- If no UI Spec: `prompt: "Generate test skeletons from Design Doc at [path]."`

### Step 3: Work Plan Creation
Invoke work-planner using Task tool:
- `subagent_type`: "work-planner"
- `description`: "Work plan creation"
- `prompt`: "Create work plan from Design Doc at [path]. Integration test file: [path from step 2]. E2E test file: [path from step 2]. Integration tests are created simultaneously with each phase implementation, E2E tests are executed only in final phase."

Interact with user to complete plan and obtain approval for plan content. Clarify specific implementation steps and risks.

**Scope**: Up to work plan creation and obtaining approval for plan content.

## Response at Completion
✅ **Recommended**: End with the following standard response after plan content approval
```
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```
