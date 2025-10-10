---
description: Execute from requirement analysis to design document creation
---

**Command Context**: This command is dedicated to the design phase.

Following the design flow described in @agents/guides/sub-agents.md, execute **from requirement-analyzer to design document creation and approval**.

Requirements: $ARGUMENTS

**Think harder** Considering the deep impact on design, first engage in dialogue to understand the background and purpose of requirements:
- What problems do you want to solve?
- Expected outcomes and success criteria
- Relationship with existing systems

Once requirements are moderately clarified, analyze with requirement-analyzer and create appropriate design documents according to scale.

Clearly present design alternatives and trade-offs.

**Scope**: Up to design document (ADR/Design Doc) approval. Work planning and beyond are outside the scope of this command.

## Output Example
Design phase completed.
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved

**Important**: This command ends with design approval. Does not propose transition to next phase.