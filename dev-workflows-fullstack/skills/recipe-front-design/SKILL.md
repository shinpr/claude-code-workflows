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
   - Execute: requirement-analyzer → external resource hearing → codebase-analyzer + ui-analyzer (parallel) → ui-spec-designer → technical-designer-frontend → code-verifier → document-reviewer → design-sync
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: Execute document-reviewer, design-sync, and all stopping points defined in subagents-orchestration-guide skill flows — each serves as a quality gate. Skipping any step risks undetected inconsistencies.

## Workflow Overview

```
Requirements → requirement-analyzer → [Stop: Scale determination]
                                           ↓
                          external resource hearing (frontend domain)
                                           ↓
                          codebase-analyzer + ui-analyzer (parallel)
                                           ↓
                                   ui-spec-designer → [Stop: UI Spec approval]
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
- External resource hearing per the external-resource-context skill
- Codebase analysis with codebase-analyzer and ui-analyzer in parallel (before document creation)
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

Once the user has answered the three dialogue questions above, execute the process below within design scope. Follow subagents-orchestration-guide Call Examples for codebase-analyzer, ui-analyzer, and code-verifier invocations.

- Invoke **requirement-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-fullstack:requirement-analyzer"`
  - `description: "Requirement analysis"`
  - `prompt: "Requirements: [user requirements] Execute requirement analysis and scale determination"`
- **[STOP]**: Review requirement analysis results and address question items

### Step 1.5: External Resource Hearing
Run the hearing protocol per the external-resource-context skill (frontend domain). The orchestrator owns this step because it requires AskUserQuestion. The skill defines file-existence branching, two-phase hearing (structured axes + self-declaration), and persistence to `docs/project-context/external-resources.md`.

### Step 2: UI Fact Gathering
Invoke codebase-analyzer and ui-analyzer **in parallel** (single message with two Agent tool calls). They share input but produce complementary output. ui-analyzer reads the project-tier external-resources file and fetches external UI sources via the inherited MCP/URL access methods, then analyzes the UI codebase. codebase-analyzer covers data, contracts, dependencies, and quality assurance mechanisms.

- Invoke **codebase-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-fullstack:codebase-analyzer"`, `description: "Codebase analysis"`, `prompt: "requirement_analysis: [JSON from Step 1]. requirements: [user requirements]. Analyze existing codebase for frontend design guidance (data, contracts, dependencies, quality assurance mechanisms)."`
- Invoke **ui-analyzer** using Agent tool (parallel with the call above)
  - `subagent_type: "dev-workflows-fullstack:ui-analyzer"`, `description: "UI fact gathering"`, `prompt: "requirement_analysis: [JSON from Step 1]. requirements: [user requirements]. Read docs/project-context/external-resources.md, fetch external UI sources via the declared access methods, and analyze the existing UI codebase."`

Both outputs (codebase-analyzer JSON and ui-analyzer JSON) are reused by ui-spec-designer in Step 3 and by technical-designer-frontend in Step 4.

### Step 3: UI Specification Phase
After Step 2 outputs are received, ask the user about prototype code:

**Ask the user**: "Do you have prototype code for this feature? If so, please provide the path to the code. The prototype will be placed in `docs/ui-spec/assets/` as reference material for the UI Spec."

- **[STOP]**: Wait for user response about prototype code availability

Then create the UI Specification:
- Invoke **ui-spec-designer** using Agent tool
  - `subagent_type: "dev-workflows-fullstack:ui-spec-designer"`
  - `description: "UI Spec creation"`
  - Build the prompt by including:
    - Source: PRD path (Large scale) or requirement-analyzer output (Medium scale)
    - `ui_analysis`: ui-analyzer JSON from Step 2 (includes externalResources fetched_summary and componentStructure / propsPatterns / cssLayout / etc.)
    - Prototype path when provided
  - Example: `prompt: "Create UI Spec from PRD at [path]. ui_analysis: [JSON from Step 2 ui-analyzer]. Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/."`
- Invoke **document-reviewer** to verify UI Spec
  - `subagent_type: "dev-workflows-fullstack:document-reviewer"`, `description: "UI Spec review"`, `prompt: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"`
- **[STOP]**: Present UI Spec for user approval

### Step 4: Design Document Creation Phase
Create appropriate design documents according to scale determination. technical-designer-frontend presents at least two architecture alternatives (technology selection, data flow design) with trade-offs for each. Pass both Step 2 outputs:
- Invoke **technical-designer-frontend** using Agent tool
  - For ADR: `subagent_type: "dev-workflows-fullstack:technical-designer-frontend"`, `description: "ADR creation"`, `prompt: "Create ADR for [technical decision]. Present at least two alternatives with trade-offs."`
  - For Design Doc: `subagent_type: "dev-workflows-fullstack:technical-designer-frontend"`, `description: "Design Doc creation"`, `prompt: "Create Design Doc based on requirements. Codebase analysis: [codebase-analyzer JSON from Step 2]. UI analysis: [ui-analyzer JSON from Step 2]. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec. Apply code: prefix to codebase-analyzer fact_ids and ui: prefix to ui-analyzer fact_ids when filling the Fact Disposition Table. Present at least two architecture alternatives with trade-offs."`
- **(Design Doc only)** Invoke **code-verifier** to verify Design Doc against existing code. Skip for ADR.
  - `subagent_type: "dev-workflows-fullstack:code-verifier"`, `description: "Design Doc verification"`, `prompt: "doc_type: design-doc document_path: [Design Doc path] Verify Design Doc against existing code."`
- Invoke **document-reviewer** to verify consistency (pass code-verifier results for Design Doc; omit for ADR)
  - `subagent_type: "dev-workflows-fullstack:document-reviewer"`, `description: "Document review"`, `prompt: "Review [document path] for consistency and completeness. code_verification: [code verification output from this step] (Design Doc only)"`

### Step 5: Design Consistency Verification
- Invoke **design-sync** using Agent tool
  - `subagent_type: "dev-workflows-fullstack:design-sync"`, `description: "Design consistency check"`, `prompt: "Check consistency across all Design Docs in docs/design/. Report conflicts and overlaps."`
- **[STOP]**: Present design documents and design-sync results, obtain user approval

## Completion Criteria

- [ ] Executed requirement-analyzer and determined scale
- [ ] Executed external resource hearing per the external-resource-context skill (file written or update explicitly skipped by user)
- [ ] Executed codebase-analyzer and ui-analyzer in parallel; outputs reused by ui-spec-designer and technical-designer-frontend
- [ ] Created UI Specification with ui-spec-designer (when applicable) — its External Resources Used section is filled
- [ ] Created appropriate design document (ADR or Design Doc) with technical-designer-frontend — its External Resources Used subsection is filled when present
- [ ] Executed code-verifier on Design Doc and passed results to document-reviewer (skip for ADR-only)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification
- [ ] Obtained user approval for design document

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
