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
- Plan approval obtainment

**Responsibility Boundary**: This skill completes with work plan approval.

Follow the planning process below:

## Execution Process

### Step 1: Design Document Selection
   ! ls -la docs/design/*.md | head -10
   - Check for existence of design documents, notify user if none exist
   - Present options if multiple exist (can be specified with $ARGUMENTS)

### Step 2: E2E Test Skeleton Generation Confirmation
   - Confirm with user whether to generate E2E test skeleton first
   - If user wants generation: Generate test skeleton with acceptance-test-generator
   - Pass generation results to next process according to subagents-orchestration-guide skill coordination specification

### Step 3: Work Plan Creation
Invoke work-planner using Agent tool:
- `subagent_type`: "dev-workflows:work-planner"
- `description`: "Work plan creation"
- If test skeletons were generated in Step 2:
  - When `generatedFiles.e2e` is not null:
    `prompt`: "Create work plan from Design Doc at [path]. Integration test file: [integration test path]. E2E test file: [E2E test path]. Integration tests are created simultaneously with each phase implementation, E2E tests are executed only in final phase."
  - When `generatedFiles.e2e` is null:
    `prompt`: "Create work plan from Design Doc at [path]. Integration test file: [integration test path]. No E2E test skeletons were generated (reason: [e2eAbsenceReason]). Integration tests are created simultaneously with each phase implementation."
- If test skeletons were not generated:
  `prompt`: "Create work plan from Design Doc at [path]."

- Follow subagents-orchestration-guide Prompt Construction Rule for additional prompt parameters
- Present work plan to user for review. If user requests changes, re-invoke work-planner with revised parameters
- Highlight steps with unclear scope or external dependencies and ask user to confirm


## Response at Completion
**Recommended**: End with the following standard response after plan content approval
```
Planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```
