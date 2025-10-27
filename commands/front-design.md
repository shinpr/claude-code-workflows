---
description: Execute from requirement analysis to frontend design document creation
---

**Command Context**: This command is dedicated to the frontend design phase.

Execute **from requirement analysis to frontend design document creation and approval**.

Requirements: $ARGUMENTS

## Execution Flow

### 1. Requirement Analysis Phase
**Think harder**: Considering the deep impact on design, first engage in dialogue to understand the background and purpose of requirements:
- What problems do you want to solve?
- Expected outcomes and success criteria
- Relationship with existing systems

Once requirements are moderately clarified:
- Invoke **requirement-analyzer** using Task tool
  - `subagent_type: "requirement-analyzer"`
  - `description: "Requirement analysis"`
  - `prompt: "Requirements: [user requirements] Execute requirement analysis and scale determination"`
- **[STOP]**: Review requirement analysis results and address question items

### 2. Design Document Creation Phase
Create appropriate design documents according to scale determination:
- Invoke **technical-designer-frontend** using Task tool
  - For ADR: `subagent_type: "technical-designer-frontend"`, `description: "ADR creation"`, `prompt: "Create ADR for [technical decision]"`
  - For Design Doc: `subagent_type: "technical-designer-frontend"`, `description: "Design Doc creation"`, `prompt: "Create Design Doc based on requirements"`
- Invoke **document-reviewer** to verify consistency
  - `subagent_type: "document-reviewer"`, `description: "Document review"`, `prompt: "Review [document path] for consistency and completeness"`
- **[STOP]**: Present design alternatives and trade-offs, obtain user approval

**Scope**: Up to frontend design document (ADR/Design Doc) approval. Work planning and beyond are outside the scope of this command.

## Output Example
Frontend design phase completed.
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved

**Important**: This command ends with design approval. Does not propose transition to next phase.
