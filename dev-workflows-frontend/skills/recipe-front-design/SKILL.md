---
name: recipe-front-design
description: Execute from requirement analysis to frontend design document creation
disable-model-invocation: true
---

**Context**: Dedicated to the frontend design phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results
2. **Follow subagents-orchestration-guide skill design flow** (this recipe covers medium/large frontend; refer to the guide for scale-specific variations):
   - Execute: requirement-analyzer → codebase-analyzer → ui-spec-designer → technical-designer-frontend → code-verifier → document-reviewer → design-sync
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: Execute document-reviewer, design-sync, and all stopping points defined in subagents-orchestration-guide skill flows — each serves as a quality gate. Skipping any step risks undetected inconsistencies.

## Workflow Overview

```
Requirements → requirement-analyzer → [Stop: Scale determination]
                                           ↓
                                   codebase-analyzer → ui-spec-designer → [Stop: UI Spec approval]
                                           ↓
                                   technical-designer-frontend
                                           ↓
                                   code-verifier → document-reviewer
                                           ↓
                                      design-sync → [Stop: Design approval]
```

## Scope Boundaries

**Included in this skill**:
- Requirement analysis with requirement-analyzer
- Codebase analysis with codebase-analyzer (before technical design)
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer-frontend
- Design Doc verification with code-verifier (before document review)
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with frontend design document (UI Spec/ADR/Design Doc) approval. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

## Execution Flow

### Step 1: Requirement Analysis Phase
Considering the deep impact on design, first engage in dialogue to understand the background and purpose of requirements:
- What problems do you want to solve?
- Expected outcomes and success criteria
- Relationship with existing systems

Once the user has answered the three dialogue questions above, execute the process below within design scope. Follow subagents-orchestration-guide Call Examples for codebase-analyzer and code-verifier invocations.

- Invoke **requirement-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:requirement-analyzer"`
  - `description: "Requirement analysis"`
  - `prompt: "Requirements: [user requirements] Execute requirement analysis and scale determination"`
- **[STOP]**: Review requirement analysis results and address question items

### Step 2: UI Specification Phase
After requirement analysis approval, ask the user about prototype code:

**Ask the user**: "Do you have prototype code for this feature? If so, please provide the path to the code. The prototype will be placed in `docs/ui-spec/assets/` as reference material for the UI Spec."

- **[STOP]**: Wait for user response about prototype code availability

Then create the UI Specification:
- Invoke **ui-spec-designer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:ui-spec-designer"`
  - `description: "UI Spec creation"`
  - If PRD exists and prototype provided: `prompt: "Create UI Spec from PRD at [path]. Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/"`
  - If PRD exists and no prototype: `prompt: "Create UI Spec from PRD at [path]. No prototype code available."`
  - If no PRD (medium scale): `prompt: "Create UI Spec based on the following requirements: [pass requirement-analyzer output]. No PRD available."` (add prototype path if provided)
- Invoke **document-reviewer** to verify UI Spec
  - `subagent_type: "dev-workflows-frontend:document-reviewer"`, `description: "UI Spec review"`, `prompt: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"`
- **[STOP]**: Present UI Spec for user approval

### Step 3: Design Document Creation Phase
First, analyze the existing codebase:
- Invoke **codebase-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:codebase-analyzer"`, `description: "Codebase analysis"`, `prompt: "requirement_analysis: [JSON from Step 1]. requirements: [user requirements]. Analyze existing codebase for frontend design guidance."`

Create appropriate design documents according to scale determination. technical-designer-frontend presents at least two architecture alternatives (technology selection, data flow design) with trade-offs for each:
- Invoke **technical-designer-frontend** using Agent tool
  - For ADR: `subagent_type: "dev-workflows-frontend:technical-designer-frontend"`, `description: "ADR creation"`, `prompt: "Create ADR for [technical decision]. Present at least two alternatives with trade-offs."`
  - For Design Doc: `subagent_type: "dev-workflows-frontend:technical-designer-frontend"`, `description: "Design Doc creation"`, `prompt: "Create Design Doc based on requirements. Codebase analysis: [JSON from codebase-analyzer]. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec. Present at least two architecture alternatives with trade-offs."`
- **(Design Doc only)** Invoke **code-verifier** to verify Design Doc against existing code. Skip for ADR.
  - `subagent_type: "dev-workflows-frontend:code-verifier"`, `description: "Design Doc verification"`, `prompt: "doc_type: design-doc document_path: [Design Doc path] Verify Design Doc against existing code."`
- Invoke **document-reviewer** to verify consistency (pass code-verifier results for Design Doc; omit for ADR)
  - `subagent_type: "dev-workflows-frontend:document-reviewer"`, `description: "Document review"`, `prompt: "Review [document path] for consistency and completeness. code_verification: [JSON from code-verifier] (Design Doc only)"`

### Step 4: Design Consistency Verification
- Invoke **design-sync** using Agent tool
  - `subagent_type: "dev-workflows-frontend:design-sync"`, `description: "Design consistency check"`, `prompt: "Check consistency across all Design Docs in docs/design/. Report conflicts and overlaps."`
- **[STOP]**: Present design documents and design-sync results, obtain user approval

## Completion Criteria

- [ ] Executed requirement-analyzer and determined scale
- [ ] Executed codebase-analyzer and passed results to technical-designer-frontend
- [ ] Created UI Specification with ui-spec-designer (when applicable)
- [ ] Created appropriate design document (ADR or Design Doc) with technical-designer-frontend
- [ ] Executed code-verifier on Design Doc and passed results to document-reviewer (skip for ADR-only)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification
- [ ] Obtained user approval for design document

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
