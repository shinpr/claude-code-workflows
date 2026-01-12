---
description: Create frontend work plan from design document and obtain plan approval
---

**Command Context**: This command is dedicated to the frontend planning phase.

## Orchestrator Definition

**Role**: Orchestrator

**Execution Method**:
- Work plan creation → performed by work-planner

Orchestrator invokes sub-agents and passes structured JSON between them.

## Scope Boundaries

**Included in this command**:
- Design document selection
- Work plan creation with work-planner
- Plan approval obtainment

**Responsibility Boundary**: This command completes with work plan approval.

Create frontend work plan with the following process:

## Execution Process

### 1. Design Document Selection
! ls -la docs/design/*.md | head -10
- Check for existence of design documents, notify user if none exist
- Present options if multiple exist (can be specified with $ARGUMENTS)

### 2. Work Plan Creation
Invoke **work-planner** using Task tool:
- `subagent_type: "work-planner"`
- `description: "Work plan creation"`
- `prompt: "Create work plan from Design Doc at [path]"`
- Interact with user to complete plan and obtain approval for plan content

**Think deeply** Create a work plan from the selected design document, clarifying specific implementation steps and risks.

**Scope**: Up to work plan creation and obtaining approval for plan content.

## Response at Completion
✅ **Recommended**: End with the following standard response after plan content approval
```
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```
