---
name: recipe-front-design
description: Execute from codebase analysis to frontend design document creation
disable-model-invocation: true
---

**Context**: Dedicated to the frontend design phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results. The one exception is the Step 1 scope bootstrap, a recipe-local orchestrator task limited to locating seed files.
2. **Run the frontend design flow below in order** (this recipe covers medium/large frontend):
   - Execute: scope bootstrap → codebase-analyzer → [Stop: Scope confirmation] → external resource hearing → ui-analyzer → ui-spec-designer → technical-designer-frontend → code-verifier → document-reviewer → design-sync
   - ui-spec-designer, code-verifier, and design-sync apply when the design output is a Design Doc; all are skipped for ADR-only
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when design documents receive approval

**subagents-orchestration-guide usage**: Reference the guide only for orchestration principles (Delegation Boundary, Decision precedence, permitted tools), the Scale Determination table, and handoff contracts HC-02 onward. This recipe defines its own start order and subagent prompts. The guide's requirement-analyzer-origin flow, First Action Rule, HC-01, and Call Examples do not apply to this recipe.

**CRITICAL**: Execute document-reviewer, design-sync (for Design Docs), and all stopping points — each serves as a quality gate. Skipping any step risks undetected inconsistencies.

## Workflow Overview

```
Requirements → scope bootstrap → codebase-analyzer → [Stop: Scope confirmation]
                                                            ↓
                                          external resource hearing (frontend domain)
                                                            ↓
                                                       ui-analyzer
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
- Scope bootstrap: locating seed files so codebase-analyzer receives a populated input
- Codebase analysis with codebase-analyzer (entry point of the frontend design phase)
- Scope confirmation with the user, grounded in codebase-analyzer findings
- External resource hearing per the external-resource-context skill
- UI fact gathering with ui-analyzer
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer-frontend
- Design Doc verification with code-verifier (before document review)
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with frontend design document (UI Spec/ADR/Design Doc) approval. Work planning and beyond are outside scope.

## Execution Flow

Requirements: $ARGUMENTS

### Step 1: Scope Bootstrap
codebase-analyzer requires a populated `requirement_analysis.affectedFiles`. Build that seed with a lightweight, orchestrator-local pass — locating files only, with no deep reading and no design decisions:

1. Extract candidate keywords from the user requirements (feature names, domain nouns, identifiers).
2. Search the repository with Bash (`rg`, or `grep` when `rg` is unavailable) for files matching those keywords.
3. Collect the matched file paths as the seed `affectedFiles`.
4. **When the search returns no files**: ask the user which files or modules the design targets (AskUserQuestion), and use that answer as `affectedFiles` before invoking codebase-analyzer. If the user confirms no related code exists, report that codebase-grounded design does not apply and confirm with the user how to proceed.
5. **When the search returns more than ~20 files**: the keywords are too broad for a focused design scope. Present the most relevant candidates to the user (AskUserQuestion) and confirm the seed `affectedFiles` before invoking codebase-analyzer.

This step locates seed files only. Reading files in full, tracing dependencies, and analysis remain codebase-analyzer's responsibility.

### Step 2: Codebase Analysis
Invoke codebase-analyzer with its existing schema. The orchestrator constructs `requirement_analysis` from the Step 1 seed.

- Invoke **codebase-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:codebase-analyzer"`, `description: "Codebase analysis"`
  - `prompt`: include
    - `requirements`: the user requirements verbatim
    - `requirement_analysis`: a JSON object with all four fields — `affectedFiles` (Step 1 seed), `purpose` (the user requirements), `scale` (provisional value from the Scale Determination table applied to the seed file count), `technicalConsiderations` (`{ constraints: [], risks: [], dependencies: [] }` — the bootstrap performs no analysis, so the object is present with empty lists)
    - Expected action: analyze the seed files for frontend design guidance (data, contracts, dependencies, quality assurance mechanisms)

### Step 3: Scope Confirmation
After codebase-analyzer returns, confirm the design scope with the user before any design work. This is a recipe-local confirmation step. Use AskUserQuestion.

Present, sourced from the codebase-analyzer JSON:
- **Target files/modules**: `analysisScope.filesAnalyzed` and the modules they belong to
- **Affected layers**: layers touched, derived from `analysisScope.categoriesDetected` and `focusAreas`
- **Unknowns/assumptions**: `limitations` plus any assumptions codebase-analyzer recorded
- **Questions before design**: open points that need a user answer before design proceeds

Ask the user to choose one:
- **Proceed to design with this scope** — continue to Step 4
- **Correct the scope and re-run** — return to Step 1 with the corrected scope; when the user names the corrected files or modules, use those directly as the Step 1 seed instead of re-deriving them by search
- **Hold additional hearing, then proceed** — gather the missing answers, then continue to Step 4
- **Produce an ADR** — when the confirmed scope involves architecture changes, new technology, or data flow changes, continue through the flow with an ADR as the design document; Step 6 (UI Specification) is skipped for ADR

After the user confirms the scope, count the confirmed target files and set the scale from the subagents-orchestration-guide Scale Determination table. This confirmed scale supersedes the Step 2 provisional value and determines the design document.

**[STOP]**: Wait for the user's choice before proceeding.

### Step 4: External Resource Hearing
Run the hearing protocol per the external-resource-context skill (frontend domain). The orchestrator owns this step because it requires AskUserQuestion. The skill defines file-existence branching, two-phase hearing (structured axes + self-declaration), and persistence to `docs/project-context/external-resources.md`.

### Step 5: UI Fact Gathering
Invoke ui-analyzer to gather UI facts. It reads the project-tier external-resources file, fetches external UI sources via the inherited MCP/URL access methods, then analyzes the UI codebase. Its output complements the codebase-analyzer output from Step 2 (data, contracts, dependencies, quality assurance mechanisms).

- Invoke **ui-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:ui-analyzer"`, `description: "UI fact gathering"`
  - `prompt`: include
    - `requirements`: the user requirements
    - `requirement_analysis`: a JSON object with all four fields — `affectedFiles` (`analysisScope.filesAnalyzed` from Step 2 codebase-analyzer), `purpose` (the user requirements), `scale` (the Step 3 confirmed scale), `technicalConsiderations` (`{ constraints: [], risks: [], dependencies: [] }`)
    - Expected action: read `docs/project-context/external-resources.md`, fetch external UI sources via the declared access methods, and analyze the existing UI codebase

Both outputs (codebase-analyzer JSON from Step 2 and ui-analyzer JSON from Step 5) are reused by ui-spec-designer in Step 6 and by technical-designer-frontend in Step 7.

### Step 6: UI Specification Phase
**When the design document is a Design Doc** (this step is skipped for ADR-only): after Step 5 output is received, ask the user about prototype code:

**Ask the user**: "Do you have prototype code for this feature? If so, please provide the path to the code. The prototype will be placed in `docs/ui-spec/assets/` as reference material for the UI Spec."

- **[STOP]**: Wait for user response about prototype code availability

Then create the UI Specification:
- Invoke **ui-spec-designer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:ui-spec-designer"`
  - `description: "UI Spec creation"`
  - Build the prompt by including:
    - Source: an existing PRD in `docs/prd/` when one exists for this feature; otherwise the user requirements with the Step 2 codebase-analyzer JSON and the Step 3 confirmed scope
    - `ui_analysis`: ui-analyzer JSON from Step 5 (includes externalResources fetched_summary and componentStructure / propsPatterns / cssLayout / etc.)
    - Prototype path when provided
  - Example (existing PRD): `prompt: "Create UI Spec from PRD at [path]. ui_analysis: [JSON from Step 5 ui-analyzer]. Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/."`
  - Example (no PRD): `prompt: "Create UI Spec from these requirements: [user requirements verbatim]. Codebase analysis: [codebase-analyzer JSON from Step 2]. Confirmed scope: [Step 3 confirmed scope]. ui_analysis: [JSON from Step 5 ui-analyzer]. Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/."`
- Invoke **document-reviewer** to verify UI Spec
  - `subagent_type: "dev-workflows-frontend:document-reviewer"`, `description: "UI Spec review"`, `prompt: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"`
- **[STOP]**: Present UI Spec for user approval

### Step 7: Design Document Creation Phase
technical-designer-frontend presents at least two architecture alternatives (technology selection, data flow design) with trade-offs for each. Pass the Step 2 codebase-analyzer output and the Step 5 ui-analyzer output:
- Invoke **technical-designer-frontend** using Agent tool
  - For ADR: `subagent_type: "dev-workflows-frontend:technical-designer-frontend"`, `description: "ADR creation"`, `prompt: "Create ADR for [technical decision]. Requirements: [user requirements verbatim]. Codebase analysis: [codebase-analyzer JSON from Step 2]. UI analysis: [ui-analyzer JSON from Step 5]. Confirmed scope: [Step 3 confirmed scope]. Present at least two alternatives with trade-offs."`
  - For Design Doc: `subagent_type: "dev-workflows-frontend:technical-designer-frontend"`, `description: "Design Doc creation"`, `prompt: "Create Design Doc based on the requirements. Requirements: [user requirements verbatim]. Codebase analysis: [codebase-analyzer JSON from Step 2]. UI analysis: [ui-analyzer JSON from Step 5]. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec. Apply code: prefix to codebase-analyzer fact_ids and ui: prefix to ui-analyzer fact_ids when filling the Fact Disposition Table. Present at least two architecture alternatives with trade-offs."`
- **(Design Doc only)** Invoke **code-verifier** to verify Design Doc against existing code. Skip for ADR.
  - `subagent_type: "dev-workflows-frontend:code-verifier"`, `description: "Design Doc verification"`, `prompt: "doc_type: design-doc document_path: [Design Doc path] Verify Design Doc against existing code."`
- Invoke **document-reviewer** to verify consistency (pass code-verifier results for Design Doc; omit for ADR)
  - `subagent_type: "dev-workflows-frontend:document-reviewer"`, `description: "Document review"`, `prompt: "Review [document path] for consistency and completeness. codebase_analysis: [codebase-analyzer JSON from Step 2]. ui_analysis: [ui-analyzer JSON from Step 5]. code_verification: [code verification output from this step] (Design Doc only)"`

### Step 8: Design Consistency Verification
- **(Design Doc only)** Invoke **design-sync** using Agent tool. Skip for ADR-only.
  - `subagent_type: "dev-workflows-frontend:design-sync"`, `description: "Design consistency check"`, `prompt: "Check consistency across all Design Docs in docs/design/. Report conflicts and overlaps."`
- **[STOP]**: Present the design document, plus design-sync results for a Design Doc, and obtain user approval

## Completion Criteria

- [ ] Built the Step 1 scope bootstrap seed (or obtained target files from the user when the search returned none)
- [ ] Executed codebase-analyzer with a populated `requirement_analysis`
- [ ] Confirmed the design scope with the user and set the scale from the confirmed target files
- [ ] Executed external resource hearing per the external-resource-context skill (file written or update explicitly skipped by user)
- [ ] Executed ui-analyzer; codebase-analyzer (Step 2) and ui-analyzer (Step 5) outputs reused by ui-spec-designer and technical-designer-frontend
- [ ] Created UI Specification with ui-spec-designer (when applicable) — its External Resources Used section is filled
- [ ] Created appropriate design document (ADR or Design Doc) with technical-designer-frontend — its External Resources Used subsection is filled when present
- [ ] Executed code-verifier on Design Doc and passed results to document-reviewer (skip for ADR-only)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification (skip for ADR-only)
- [ ] Obtained user approval for design document

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
