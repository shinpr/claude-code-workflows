---
name: recipe-front-plan
description: Create frontend work plan from design document and obtain plan approval
disable-model-invocation: true
---

**Context**: Dedicated to the frontend planning phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results
2. **Follow subagents-orchestration-guide skill planning flow**:
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

### Step 2: Test Skeleton Generation Confirmation
   - Confirm with user whether to generate test skeletons (integration + E2E) first
   - If user wants generation: acceptance-test-generator generates both integration and E2E test skeletons
     - Invoke acceptance-test-generator using Agent tool:
       - `subagent_type`: "dev-workflows-frontend:acceptance-test-generator"
       - `description`: "Test skeleton generation"
       - If UI Spec exists: `prompt: "Generate test skeletons from Design Doc at [path]. UI Spec at [ui-spec path]."`
       - If no UI Spec: `prompt: "Generate test skeletons from Design Doc at [path]."`
   - Pass integration test file path, E2E test file path (or null), and e2eAbsenceReason to work-planner according to subagents-orchestration-guide "acceptance-test-generator → work-planner" section

### Step 3: Work Plan Creation
Invoke work-planner using Agent tool:
- `subagent_type`: "dev-workflows-frontend:work-planner"
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
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```
