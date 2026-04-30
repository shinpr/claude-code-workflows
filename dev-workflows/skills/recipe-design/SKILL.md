---
name: recipe-design
description: Execute from requirement analysis to design document creation
disable-model-invocation: true
---

**Context**: Dedicated to the design phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results
2. **Follow subagents-orchestration-guide skill design flow exactly**:
   - Execute: requirement-analyzer → codebase-analyzer → technical-designer → code-verifier → document-reviewer → design-sync
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: Execute document-reviewer, design-sync, and all stopping points defined in subagents-orchestration-guide skill flows — each serves as a quality gate. Skipping any step risks undetected inconsistencies.

## Workflow Overview

```
Requirements → requirement-analyzer → [Stop: Scale determination]
                                           ↓
                                   codebase-analyzer → technical-designer
                                           ↓
                                   code-verifier → document-reviewer
                                           ↓
                                      design-sync → [Stop: Design approval]
```

## Scope Boundaries

**Included in this skill**:
- Requirement analysis with requirement-analyzer
- Codebase analysis with codebase-analyzer (before technical design)
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer
- Design Doc verification with code-verifier (before document review)
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with design document (ADR/Design Doc) approval. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

Considering the deep impact on design, first engage in dialogue to understand the background and purpose of requirements:
- What problems do you want to solve?
- Expected outcomes and success criteria
- Relationship with existing systems

Once the user has answered the three dialogue questions above, analyze with requirement-analyzer and create appropriate design documents according to scale.

Present at least two design alternatives with trade-offs for each.

Execute the process below within design scope. Follow subagents-orchestration-guide Call Examples for codebase-analyzer and code-verifier invocations.

## Completion Criteria

- [ ] Executed requirement-analyzer and determined scale
- [ ] Executed codebase-analyzer and passed results to technical-designer
- [ ] Created appropriate design document (ADR or Design Doc) with technical-designer
- [ ] Executed code-verifier on Design Doc and passed results to document-reviewer (skip for ADR-only)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification
- [ ] Obtained user approval for design document

## Output Example
Design phase completed.
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
