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
   - Execute: requirement-analyzer → external resource hearing → ui-spec-designer → codebase-analyzer + ui-codebase-analyzer (parallel) → technical-designer-frontend → code-verifier → document-reviewer → design-sync
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: Execute document-reviewer, design-sync, and all stopping points defined in subagents-orchestration-guide skill flows — each serves as a quality gate. Skipping any step risks undetected inconsistencies.

## Workflow Overview

```
Requirements → requirement-analyzer → [Stop: Scale determination]
                                           ↓
                          external resource hearing (frontend domain)
                                           ↓
                                   ui-spec-designer → [Stop: UI Spec approval]
                                           ↓
                          codebase-analyzer + ui-codebase-analyzer (parallel)
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
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- Codebase analysis with codebase-analyzer and ui-codebase-analyzer in parallel (before technical design)
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

### Step 1.5: External Resource Hearing
Per the external-resource-context skill, capture access methods for resources outside the repository (design origin, design system, guidelines, visual verification environment) before any document is drafted. This step runs in the orchestrator directly because it needs AskUserQuestion.

1. **File-existence check**: Run `! ls docs/project-context/external-resources.md 2>/dev/null` to detect the project-tier file.
2. **Branch on existence**:
   - **Absent** → run the full hearing for the frontend domain (axes from `references/frontend.md` of the external-resource-context skill).
   - **Present** → AskUserQuestion: "`docs/project-context/external-resources.md` exists. Update it for this work? (no / yes-full / yes-diff-only)". On `no` skip to Step 2. On `yes-full` run the full hearing. On `yes-diff-only` AskUserQuestion which axes changed and run hearing only on those.
3. **Two-phase hearing** when running hearing:
   - For each frontend axis (Design Origin, Design System, Guidelines, Visual Verification Environment), use AskUserQuestion with the choices listed in the skill's `references/frontend.md`. Always include "対象外 / not applicable" as a choice. For each non-N/A axis, follow up with an access-method question.
   - After the structured axes, AskUserQuestion once: "Are there any other frontend external resources for this work that the structured questions did not cover? If yes, describe them in your next message." Append the free-form answer under "Additional resources" in the project-tier file.
4. **Persist**: Write or update `docs/project-context/external-resources.md` per the template in the skill's `references/template.md`. Create the directory if absent.
5. The feature-tier `## External Resources Used` section inside the UI Spec is filled later by ui-spec-designer (in Step 2) using this project-tier file as the source.

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
  - If no PRD (medium scale): `prompt: "Create UI Spec based on the following requirements: [requirements analysis output from Step 1]. No PRD available."` (add prototype path if provided)
- Invoke **document-reviewer** to verify UI Spec
  - `subagent_type: "dev-workflows-frontend:document-reviewer"`, `description: "UI Spec review"`, `prompt: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"`
- **[STOP]**: Present UI Spec for user approval

### Step 3: Design Document Creation Phase
First, analyze the existing codebase. Invoke codebase-analyzer and ui-codebase-analyzer **in parallel** (single message with two Agent tool calls — they share input but produce complementary output):
- Invoke **codebase-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:codebase-analyzer"`, `description: "Codebase analysis"`, `prompt: "requirement_analysis: [JSON from Step 1]. requirements: [user requirements]. Analyze existing codebase for frontend design guidance (data, contracts, dependencies, quality assurance mechanisms)."`
- Invoke **ui-codebase-analyzer** using Agent tool (parallel with the call above)
  - `subagent_type: "dev-workflows-frontend:ui-codebase-analyzer"`, `description: "UI codebase analysis"`, `prompt: "requirement_analysis: [JSON from Step 1]. ui_spec_path: [path from Step 2]. requirements: [user requirements]. Extract UI facts (visual structure, layout state, props patterns, state matrices, display conditions, i18n, accessibility, generated artifacts)."`

Create appropriate design documents according to scale determination. technical-designer-frontend presents at least two architecture alternatives (technology selection, data flow design) with trade-offs for each:
- Invoke **technical-designer-frontend** using Agent tool
  - For ADR: `subagent_type: "dev-workflows-frontend:technical-designer-frontend"`, `description: "ADR creation"`, `prompt: "Create ADR for [technical decision]. Present at least two alternatives with trade-offs."`
  - For Design Doc: `subagent_type: "dev-workflows-frontend:technical-designer-frontend"`, `description: "Design Doc creation"`, `prompt: "Create Design Doc based on requirements. Codebase analysis: [codebase-analyzer output JSON]. UI codebase analysis: [ui-codebase-analyzer output JSON]. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec. Apply ui: prefix to fact_ids from UI codebase analysis when filling the Fact Disposition Table. Present at least two architecture alternatives with trade-offs."`
- **(Design Doc only)** Invoke **code-verifier** to verify Design Doc against existing code. Skip for ADR.
  - `subagent_type: "dev-workflows-frontend:code-verifier"`, `description: "Design Doc verification"`, `prompt: "doc_type: design-doc document_path: [Design Doc path] Verify Design Doc against existing code."`
- Invoke **document-reviewer** to verify consistency (pass code-verifier results for Design Doc; omit for ADR)
  - `subagent_type: "dev-workflows-frontend:document-reviewer"`, `description: "Document review"`, `prompt: "Review [document path] for consistency and completeness. code_verification: [code verification output from this step] (Design Doc only)"`

### Step 4: Design Consistency Verification
- Invoke **design-sync** using Agent tool
  - `subagent_type: "dev-workflows-frontend:design-sync"`, `description: "Design consistency check"`, `prompt: "Check consistency across all Design Docs in docs/design/. Report conflicts and overlaps."`
- **[STOP]**: Present design documents and design-sync results, obtain user approval

## Completion Criteria

- [ ] Executed requirement-analyzer and determined scale
- [ ] Executed external resource hearing per the external-resource-context skill (`docs/project-context/external-resources.md` exists or update was explicitly skipped by the user)
- [ ] Executed codebase-analyzer and ui-codebase-analyzer in parallel and passed both results to technical-designer-frontend
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


