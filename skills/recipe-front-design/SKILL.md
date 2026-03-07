---
name: recipe-front-design
description: Execute from requirement analysis to frontend design document creation
disable-model-invocation: true
---

**Context**: Dedicated to the frontend design phase.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Requirement analysis → performed by requirement-analyzer
- UI Specification creation → performed by ui-spec-designer
- Design document creation → performed by technical-designer-frontend
- Document review → performed by document-reviewer

Orchestrator invokes sub-agents and passes structured JSON between them.

## Scope Boundaries

**Included in this skill**:
- Requirement analysis with requirement-analyzer
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer-frontend
- Document review with document-reviewer

**Responsibility Boundary**: This skill completes with frontend design document (UI Spec/ADR/Design Doc) approval. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

## Execution Flow

### Step 1: Requirement Analysis Phase
Considering the deep impact on design, first engage in dialogue to understand the background and purpose of requirements:
- What problems do you want to solve?
- Expected outcomes and success criteria
- Relationship with existing systems

Once requirements are moderately clarified:
- Invoke **requirement-analyzer** using Task tool
  - `subagent_type: "requirement-analyzer"`
  - `description: "Requirement analysis"`
  - `prompt: "Requirements: [user requirements] Execute requirement analysis and scale determination"`
- **[STOP]**: Review requirement analysis results and address question items

### Step 2: UI Specification Phase
After requirement analysis approval, ask the user about prototype code:

**Ask the user**: "Do you have prototype code for this feature? If so, please provide the path to the code. The prototype will be placed in `docs/ui-spec/assets/` as reference material for the UI Spec."

- **[STOP]**: Wait for user response about prototype code availability

Then create the UI Specification:
- Invoke **ui-spec-designer** using Task tool
  - `subagent_type: "ui-spec-designer"`
  - `description: "UI Spec creation"`
  - If PRD exists and prototype provided: `prompt: "Create UI Spec from PRD at [path]. Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-slug}/"`
  - If PRD exists and no prototype: `prompt: "Create UI Spec from PRD at [path]. No prototype code available."`
  - If no PRD (medium scale): `prompt: "Create UI Spec based on the following requirements: [pass requirement-analyzer output]. No PRD available."` (add prototype path if provided)
- Invoke **document-reviewer** to verify UI Spec
  - `subagent_type: "document-reviewer"`, `description: "UI Spec review"`, `prompt: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"`
- **[STOP]**: Present UI Spec for user approval

### Step 3: Design Document Creation Phase
Create appropriate design documents according to scale determination:
- Invoke **technical-designer-frontend** using Task tool
  - For ADR: `subagent_type: "technical-designer-frontend"`, `description: "ADR creation"`, `prompt: "Create ADR for [technical decision]"`
  - For Design Doc: `subagent_type: "technical-designer-frontend"`, `description: "Design Doc creation"`, `prompt: "Create Design Doc based on requirements. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec."`
- Invoke **document-reviewer** to verify consistency
  - `subagent_type: "document-reviewer"`, `description: "Document review"`, `prompt: "Review [document path] for consistency and completeness"`
- **[STOP]**: Present design alternatives and trade-offs, obtain user approval

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
