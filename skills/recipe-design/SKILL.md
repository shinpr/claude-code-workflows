---
name: recipe-design
description: Execute from codebase analysis to design document creation
disable-model-invocation: true
---

**Context**: Dedicated to the design phase.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results. The one exception is the Step 1 scope bootstrap, a recipe-local orchestrator task limited to locating seed files.
2. **Run the design flow below in order**:
   - Execute: scope bootstrap → codebase-analyzer → [Stop: Scope confirmation] → technical-designer → code-verifier → document-reviewer → design-sync
   - code-verifier and design-sync apply when the design output is a Design Doc; both are skipped for ADR-only
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when design documents receive approval

**subagents-orchestration-guide usage**: Reference the guide only for orchestration principles (Delegation Boundary, Decision precedence, permitted tools), the Scale Determination table, and handoff contracts HC-02 onward. This recipe defines its own start order and subagent prompts. The guide's requirement-analyzer-origin flow, First Action Rule, HC-01, and Call Examples do not apply to this recipe.

**CRITICAL**: Execute document-reviewer, design-sync (for Design Docs), and all stopping points — each serves as a quality gate. Skipping any step risks undetected inconsistencies.

## Workflow Overview

```
Requirements → scope bootstrap → codebase-analyzer → [Stop: Scope confirmation]
                                                            ↓
                                                    technical-designer
                                                            ↓
                                                    code-verifier → document-reviewer
                                                            ↓
                                                       design-sync → [Stop: Design approval]
```

## Scope Boundaries

**Included in this skill**:
- Scope bootstrap: locating seed files so codebase-analyzer receives a populated input
- Codebase analysis with codebase-analyzer (entry point of the design phase)
- Scope confirmation with the user, grounded in codebase-analyzer findings
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer
- Design Doc verification with code-verifier (before document review)
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with design document (ADR/Design Doc) approval. Work planning and beyond are outside scope.

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
  - `subagent_type: "dev-workflows:codebase-analyzer"`, `description: "Codebase analysis"`
  - `prompt`: include
    - `requirements`: the user requirements verbatim
    - `requirement_analysis`: a JSON object with all four fields — `affectedFiles` (Step 1 seed), `purpose` (the user requirements), `scale` (provisional value from the Scale Determination table applied to the seed file count), `technicalConsiderations` (`{ constraints: [], risks: [], dependencies: [] }` — the bootstrap performs no analysis, so the object is present with empty lists)
    - Expected action: analyze the seed files and produce design guidance

### Step 3: Scope Confirmation
After codebase-analyzer returns, confirm the design scope with the user before any design work. This is a recipe-local confirmation step. Use AskUserQuestion.

Present, sourced from the codebase-analyzer JSON:
- **Target files/modules**: `analysisScope.filesAnalyzed` and the modules they belong to
- **Affected layers**: layers touched, derived from `analysisScope.categoriesDetected` and `focusAreas`
- **Unknowns/assumptions**: `limitations` plus any assumptions codebase-analyzer recorded
- **Questions before design**: open points that need a user answer before design proceeds

Ask the user to choose one:
- **Proceed to design with this scope** — continue to Step 4 (Design Doc)
- **Correct the scope and re-run** — return to Step 1 with the corrected scope; when the user names the corrected files or modules, use those directly as the Step 1 seed instead of re-deriving them by search
- **Hold additional hearing, then proceed** — gather the missing answers, then continue to Step 4
- **Produce an ADR** — when the confirmed scope involves architecture changes, new technology, or data flow changes, continue to Step 4 with technical-designer in ADR mode

After the user confirms the scope, count the confirmed target files and set the scale from the subagents-orchestration-guide Scale Determination table. This confirmed scale supersedes the Step 2 provisional value and determines the design document.

**[STOP]**: Wait for the user's choice before proceeding.

### Step 4: Design Document Creation
Pass the full codebase-analyzer JSON to technical-designer (handoff contract HC-02). technical-designer presents at least two design alternatives with trade-offs for each.

- Invoke **technical-designer** using Agent tool
  - For Design Doc: `subagent_type: "dev-workflows:technical-designer"`, `description: "Design Doc creation"`, `prompt: "Create Design Doc based on the requirements. Requirements: [user requirements verbatim]. Codebase analysis: [codebase-analyzer JSON from Step 2]. Confirmed scope: [Step 3 confirmed scope]. Apply the code: prefix to codebase-analyzer fact_ids when filling the Fact Disposition Table. Present at least two architecture alternatives with trade-offs."`
  - For ADR: `subagent_type: "dev-workflows:technical-designer"`, `description: "ADR creation"`, `prompt: "Create ADR for [technical decision]. Requirements: [user requirements verbatim]. Codebase analysis: [codebase-analyzer JSON from Step 2]. Confirmed scope: [Step 3 confirmed scope]. Present at least two alternatives with trade-offs."`
- **(Design Doc only)** Invoke **code-verifier** to verify the Design Doc against existing code. Skip for ADR.
  - `subagent_type: "dev-workflows:code-verifier"`, `description: "Design Doc verification"`, `prompt: "doc_type: design-doc document_path: [Design Doc path] Verify Design Doc against existing code."`
- Invoke **document-reviewer** to verify consistency (pass code-verifier results for Design Doc; omit for ADR)
  - `subagent_type: "dev-workflows:document-reviewer"`, `description: "Document review"`, `prompt: "Review [document path] for consistency and completeness. codebase_analysis: [codebase-analyzer JSON from Step 2]. code_verification: [code-verifier output from this step] (Design Doc only)"`
- **(Design Doc only)** Invoke **design-sync** to verify consistency across design documents. Skip for ADR-only.
  - `subagent_type: "dev-workflows:design-sync"`, `description: "Design consistency check"`, `prompt: "Check consistency across all Design Docs in docs/design/. Report conflicts and overlaps."`

**[STOP]**: Present the design document, plus design-sync results for a Design Doc, and obtain user approval.

## Completion Criteria

- [ ] Built the Step 1 scope bootstrap seed (or obtained target files from the user when the search returned none)
- [ ] Executed codebase-analyzer with a populated `requirement_analysis`
- [ ] Confirmed the design scope with the user and set the scale from the confirmed target files
- [ ] Created appropriate design document (ADR or Design Doc) with technical-designer
- [ ] Executed code-verifier on Design Doc and passed results to document-reviewer (skip for ADR-only)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification (skip for ADR-only)
- [ ] Obtained user approval for design document

## Output Example
Design phase completed.
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
