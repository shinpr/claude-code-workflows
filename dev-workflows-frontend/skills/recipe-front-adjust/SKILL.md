---
name: recipe-front-adjust
description: Coordinate a frontend UI adjustment by hearing external resources, gathering UI facts, scaling the work, optionally creating a work plan, executing the adjustment in this session with MCP-driven verification, and delegating quality checks. Use when "UI adjustment / visual tweak / existing component update / front adjust" is mentioned, or when the user wants to refine an already-implemented UI.
disable-model-invocation: true
---

**Context**: Dedicated to UI adjustment workflows on already-implemented features. Unlike recipe-front-design (document creation, fully delegated) and recipe-front-build (specified implementation, fully delegated), adjustment work depends on an iterative MCP-driven verification loop (compare with design source → adjust → re-verify) that needs to run alongside file edits. The standard implementation delegate (`task-executor-frontend`) uses a `tools` allowlist that excludes MCP, so the verification loop cannot run inside it. This recipe therefore performs the adjustment and verification in the parent session and delegates only the steps that fit a single subagent call (UI fact gathering, work plan creation, quality checks).

## Execution Pattern

**Core Identity**: "I am a guided executor. Subagents handle UI fact gathering, work plan creation, and quality checks; I run the adjustment and the MCP-driven verification loop myself."

**Execution Protocol**:
1. **Delegate to subagents**: UI fact gathering (ui-analyzer — uses `disallowedTools` to inherit MCP access for fetching external sources in its own context), work plan creation (work-planner), quality checks (quality-fixer-frontend).
2. **Run in the parent session**: external-resource hearing via AskUserQuestion, scale judgment, the actual adjustment edits, MCP-driven verification (compare CSS against design source, check visual rendering via a browser MCP, etc.), and the iteration loop until acceptance.
3. **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding.
4. **Scope**: see Scope Boundaries below.

**Why this differs from other recipes**: The adjust verification loop is multi-step (edit → verify against MCP → refine → re-verify). A single subagent call cannot host this loop because returning intermediate results to the orchestrator and re-invoking the subagent for each iteration would amplify context cost. The parent session keeps the loop tight. Delegated subagents (ui-analyzer, work-planner, quality-fixer-frontend) each complete in one call and do not need the loop.

## Workflow Overview

```
Adjustment request → external resource hearing (parent session, AskUserQuestion)
                                  ↓
                     ui-analyzer (subagent: fetch external sources + analyze code + propose candidateWriteSet)
                                  ↓
                     write-set confirmation (parent session, AskUserQuestion)
                                  ↓
                     scale judgment on confirmed write set (documentation-criteria matrix)
                                  ↓
            ┌────────────────────┴────────────────────┐
            ↓                                          ↓
   (1-2 files: inline)                  (3-5 files: work-planner subagent → [Stop])
            ↓                                          ↓
            └─→ adjustment + MCP verification (parent session) ←──┘
                                  ↓
                     quality-fixer-frontend (subagent: typecheck/lint/test)
                                  ↓
                     commit
```

## Scope Boundaries

**Included in this skill**:
- External resource hearing per the external-resource-context skill
- UI fact gathering via ui-analyzer
- Scale judgment via documentation-criteria's Creation Decision Matrix
- Optional work plan creation via work-planner
- Adjustment edits and MCP-driven verification (run in this session)
- Quality verification via quality-fixer-frontend
- Commit per adjustment unit

**Responsibility Boundary**: This skill completes when the adjustment is committed and quality has passed. Adjustment work is end-to-end within this recipe; it does not hand off to other implementation recipes.

**Out of scope**:
- Creating PRD, UI Spec, or Design Doc — adjustment work uses existing documents. When the requested change exceeds adjustment scope (new feature, new architecture, multi-screen redesign, or any ADR Creation Condition from documentation-criteria), escalate the user to the full frontend design phase.

Adjustment request: $ARGUMENTS

## Execution Flow

### Step 1: External Resource Hearing
Run the hearing protocol per the external-resource-context skill (frontend domain). The parent session owns this step because it requires AskUserQuestion. The skill defines file-existence branching, two-phase hearing (structured axes + self-declaration), and persistence to `docs/project-context/external-resources.md`.

### Step 2: UI Fact Gathering
Ground the adjustment in observable facts before scoping the work. ui-analyzer reads the project-tier external-resources file and fetches external UI sources (design origin, design system catalog, guidelines) via the inherited MCP/URL access methods, then analyzes the existing UI codebase. Heavy fetches stay inside the subagent's own context.

- Invoke **ui-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:ui-analyzer"`
  - `description: "UI fact gathering for adjustment"`
  - `prompt: "requirement_analysis: { affectedFiles: [files inferred from the adjustment request], scale: 'small', purpose: 'UI adjustment', technicalConsiderations: [] }. requirements: [adjustment request]. target_components: [components named in the request]. ui_spec_path: [path if an existing UI Spec covers the affected components, else absent]. Read docs/project-context/external-resources.md, fetch external UI sources via the declared access methods, and analyze the existing UI codebase. Populate candidateWriteSet[] with the files most likely to require modification."`
- Read the JSON output. `componentStructure[]`, `externalResources.*`, `focusAreas[]`, and `candidateWriteSet[]` drive the scale judgment in Step 3 and the adjustment loop in Step 5.

### Step 3: Scale Judgment
Scale judgment is based on the **write set** (files that will actually be modified), not on the broader set the analyzer read. The analyzer's `candidateWriteSet[]` is a candidate list, not a commitment — confirm it with the user before branching.

1. Read `candidateWriteSet[]` from ui-analyzer output. Distinguish high-confidence entries (likely-to-modify) from medium/low-confidence entries (speculative).
2. Present the candidate list to the user via AskUserQuestion: "Confirmed write set for this adjustment? (a) accept high-confidence entries / (b) accept all entries / (c) edit list manually". On `c`, accept the user's edited list.
3. Apply the Creation Decision Matrix from the documentation-criteria skill to the **confirmed write set count**:
   - **1-2 files**: Direct adjustment, no work plan.
   - **3-5 files**: Work plan required.
   - **6+ files** OR any ADR Creation Condition triggered (architecture changes, contract changes affecting 3+ locations, complex multi-state logic, etc.): Adjustment scope exceeded. Escalate the user to the full frontend design phase. Stop this recipe.

### Step 4: Plan Creation (Conditional)
Branch on the scale outcome.

#### Branch A — 1-2 files
No work plan. Build a minimal adjustment context for the parent session:
- Adjustment request (verbatim)
- ui-analyzer focusAreas[] with `ui:` prefix preserved
- Affected files list
- External resources fetched_summary and access methods that the verification loop will use

Present the adjustment context to the user for review.
- **[STOP]**: User confirms the adjustment context covers the work.

#### Branch B — 3-5 files
Create a right-sized work plan. Invoke **work-planner** using Agent tool:
- `subagent_type: "dev-workflows-frontend:work-planner"`
- `description: "Adjustment work plan"`
- `prompt: "Create a work plan for this UI adjustment. Adjustment request: [verbatim]. ui_analysis: [ui-analyzer JSON]. External resources: docs/project-context/external-resources.md. Scale: 3-5 files (no Design Doc, no ADR). Each phase should be implementable as 1-3 commits. Include a quality checklist matched to the affected components: visual verification, accessibility, i18n parity, generated artifact regeneration when relevant. Output path: docs/plans/[YYYYMMDD]-adjust-[short-description].md."`

After work-planner returns:
- Present the work plan to the user.
- **[STOP]**: Wait for plan approval or revision request. If the user requests changes, re-invoke work-planner with revised guidance.

### Step 5: Adjustment + MCP Verification (parent session)
This is the loop the parent session runs directly. Subagents are not used here because their `tools` allowlist excludes MCP and would break the verification step.

For each adjustment unit (per file in Branch A; per work plan phase in Branch B):
1. **Plan the edit** based on ui-analyzer focusAreas and the relevant external resource (e.g., design origin's fetched_summary).
2. **Apply the edit** using Edit / Write / MultiEdit on the affected files.
3. **Verify against external sources** using the access methods from `docs/project-context/external-resources.md`:
   - Design origin via the configured design-tool MCP (compare current rendering vs design source)
   - Visual verification via the configured browser MCP (capture screenshot, check layout)
   - Design system catalog via the configured design-system MCP (confirm component variants and tokens)
4. **Refine and re-verify** until the adjustment matches the design source.
5. When the adjustment unit converges, proceed to Step 6 for that unit.

When the user has not configured an MCP that the verification step would normally use, fall back to manual verification (ask the user to confirm the result, or use file-based comparison if a specification file is available).

### Step 6: Quality Verification (per adjustment unit)
Delegate quality checks. quality-fixer-frontend runs typecheck / lint / test / format and fixes issues — these do not require MCP access.

`quality-fixer-frontend` expects `task_file` to be an actual file path and uses `filesModified` as the primary scope for incomplete-implementation checks. After per-unit commits, `git diff HEAD` becomes empty for the just-committed unit, so passing `filesModified` explicitly is required for correct scoping.

- Invoke **quality-fixer-frontend** using Agent tool
  - `subagent_type: "dev-workflows-frontend:quality-fixer-frontend"`
  - `description: "Quality verification for adjustment unit"`
  - Build the prompt by branch:
    - **Branch A (1-2 files)**: omit `task_file`. Pass `filesModified: [list of files edited in this adjustment unit]` so quality-fixer scopes to those files.
    - **Branch B (3-5 files)**: pass `task_file: <work plan path or per-phase task path when one was generated>` AND `filesModified: [list of files edited in this adjustment unit]`. Both fields together give quality-fixer the work-plan context plus the precise write set.
  - Example (Branch A): `prompt: "filesModified: [src/components/Card/Card.tsx, src/components/Card/Card.module.css]. Run quality checks across the listed files."`
  - Example (Branch B): `prompt: "task_file: docs/plans/[plan-name].md. filesModified: [src/components/Card/Card.tsx, src/components/Card/Card.module.css]. Run quality checks across the listed files."`
- Parse the response per subagents-orchestration-guide:
  - `approved` → proceed to Step 7
  - `stub_detected` → return to Step 5 to complete the implementation, then re-run quality-fixer-frontend
  - `blocked` → escalate to user with the blocking issue and stop

### Step 7: Commit (per adjustment unit)
Commit the adjustment unit on quality approval. Include the affected files and any regenerated artifacts (CSS module typings, message catalog typings, etc.) flagged by ui-analyzer's `generatedArtifacts` section.

Then loop back to Step 5 for the next unit (Branch B work plan phase, or next file in Branch A) until all units are committed.

## Completion Criteria

- [ ] External resource hearing executed (project-tier file written or update explicitly skipped)
- [ ] ui-analyzer returned a JSON output, including externalResources fetch_status per axis and candidateWriteSet
- [ ] Write set confirmed by the user before scale judgment
- [ ] Scale judgment applied to the confirmed write set; 6+ files or ADR conditions escalated to the design phase
- [ ] Branch A: adjustment context presented and confirmed; Branch B: work plan approved
- [ ] All adjustment units edited and verified via MCP (or manual fallback when MCP absent)
- [ ] Each adjustment unit passed quality-fixer-frontend with explicit `filesModified` scoping
- [ ] Each adjustment unit committed

## Output Example

```
Frontend adjustment completed.
- External resources: docs/project-context/external-resources.md (updated|unchanged)
- UI fact gathering: ui-analyzer focused on [N] components, [M] focus areas, external sources [fetched|partial|not_recorded]
- Scale: <1-2 files | 3-5 files>
- Work plan: <path | not required>
- Adjustment units committed: [count]
- Quality status: all passed
```
