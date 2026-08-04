---
name: recipe-front-adjust
description: Adjust an already-implemented UI in-session with verification against the design source
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: UI adjustment on already-implemented features. The verification loop (edit → check against the design source → refine) runs in the parent session.

## Execution Pattern

**Core Identity**: "I am a guided executor. I run the adjustment and the verification loop myself; subagents handle one-shot tasks."

**Execution Protocol**:
1. **Delegate to subagents** (one-shot calls): ui-analyzer, quality-fixer-frontend.
2. **Run in the parent session** (multi-step loops and user dialogs): external-resource hearing via AskUserQuestion, write-set confirmation, scale judgment, adjustment edits, verification against the design source, iteration until acceptance.
3. **Stop at every `[Stop: ...]` marker** before proceeding.

## Initial Mandatory Tasks

**Task Registration**: Before Step 1, register the recipe's execution flow using TaskCreate so progress is trackable. Register Steps 1-7 below as individual tasks plus a final task "Verify completion against Completion Criteria". Update status using TaskUpdate as each step starts and completes.

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
                     1-2 files: adjustment context → [Stop]
                                  ↓
                     adjustment + verification (parent session)
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
- Adjustment edits and verification against the design source (run in this session)
- Quality verification via quality-fixer-frontend
- Commit per adjustment unit

**Responsibility Boundary**: This skill completes when the adjustment is committed and quality has passed. Adjustment work is end-to-end within this recipe; parent session owns edits, verification loops, quality-result routing, and commits.

**Escalation Boundary**: Escalate to the full frontend design phase when the request requires PRD, UI Spec, Design Doc, new architecture, multi-screen redesign, or any ADR Creation Condition from documentation-criteria.

Adjustment request: $ARGUMENTS

## Execution Flow

### Step 1: External Resource Hearing
Execute Skill: external-resource-context before running the hearing protocol.

Run the hearing protocol per the external-resource-context skill (frontend domain).

### Step 2: UI Fact Gathering

- Invoke **ui-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-fullstack:ui-analyzer"`
  - `description: "UI fact gathering for adjustment"`
  - `prompt: "requirement_analysis: { affectedFiles: [files inferred from the adjustment request], scale: 'small', purpose: 'UI adjustment', technicalConsiderations: [] }. requirements: [adjustment request]. target_components: [components named in the request]. ui_spec_path: [path if an existing UI Spec covers the affected components, else absent]. Read docs/project-context/external-resources.md, fetch external UI sources via the declared access methods, and analyze the existing UI codebase. Populate candidateWriteSet[] with the files most likely to require modification."`

### Step 3: Scale Judgment

Execute Skill: documentation-criteria (loads the Creation Decision Matrix and ADR Creation Conditions used in this step and in the Escalation Boundary).

1. Read `candidateWriteSet[]` from ui-analyzer output.
2. Present the candidate list to the user via AskUserQuestion: "Confirmed write set for this adjustment? (a) accept high-confidence entries / (b) accept all entries / (c) edit list manually". On `c`, send a follow-up plain message asking the user to paste the edited file list, then proceed with that list.
3. Apply the Creation Decision Matrix from the documentation-criteria skill to the **confirmed write set count**:
   - **0 files**: The adjustment request did not map to any existing file. Escalate to the user with the message "No write target identified from the adjustment request. Please clarify which component(s) should change, or run the full frontend design phase if this is a new feature." Stop this recipe.
   - **1-2 files**: Direct adjustment, no work plan.
   - **3+ files** OR any ADR Creation Condition triggered (architecture changes, contract changes affecting 3+ locations, complex multi-state logic, etc.): Adjustment scope exceeded. Escalate the user to the full frontend design phase. Stop this recipe.

### Step 4: Adjustment Context

No work plan. Build a minimal adjustment context for the parent session:
- Adjustment request (verbatim)
- ui-analyzer focusAreas[] (raw fact_id; the `ui:` prefix is only applied when merging with codebase-analysis facts in a Fact Disposition Table, which Branch A does not do)
- Affected files list
- External resources fetched_summary and access methods that the verification loop will use

Present the adjustment context to the user for review.
- **[STOP]**: User confirms the adjustment context covers the work.

### Step 5: Adjustment + Verification (parent session)

Execute Skill: frontend-ai-guide before planning or applying adjustment edits.
Execute Skill: typescript-rules before planning or applying adjustment edits.
Execute Skill: implementation-approach before planning or applying adjustment edits.
Execute Skill: test-implement before adding or changing tests.

For each file in the confirmed adjustment context:
1. **Plan the edit** based on ui-analyzer focusAreas and the relevant external resource (e.g., design origin's fetched_summary).
2. **Apply the edit** using Edit / Write / MultiEdit on the affected files.
3. **Verify against external sources** using whichever access method `docs/project-context/external-resources.md` declares for each axis:
   - Design origin: compare current rendering against the design source via the declared access method (e.g., design-tool MCP, WebFetch from a public URL, file read from a specification path)
   - Visual rendering: capture screenshot or run a smoke check via the declared visual verification method (e.g., browser MCP, E2E test runner CLI invoked via Bash, dev-server URL inspection, Storybook URL)
   - Design system tokens / variants: confirm against the declared design system source (e.g., design-system MCP, package import, Storybook URL, internal documentation path)
4. **Refine and re-verify** until the adjustment matches the design source, or matches the user-confirmed adjustment target when no separate design source exists.
5. When the adjustment unit converges, proceed to Step 6 for that unit.

When the project-tier file declares no automated verification mechanism for an axis, ask the user to confirm the result manually, or use file-based comparison when a specification file is available.

### Step 6: Quality Verification (per adjustment unit)

- Invoke **quality-fixer-frontend** using Agent tool
  - `subagent_type: "dev-workflows-fullstack:quality-fixer-frontend"`
  - `description: "Quality verification for adjustment unit"`
  - Pass `qualityCommand` when available (caller first, otherwise current task).
  - Pass `filesModified: [list of files edited in this adjustment unit]` as the review scope.
  - Example: `prompt: "filesModified: [src/components/Card/Card.tsx, src/components/Card/Card.module.css]. Run quality checks across the listed files."`
- Route the quality-fixer-frontend response by `status`:
  - `approved` → proceed to Step 7
  - `stub_detected` → return to Step 5 to complete the implementation for this unit, then re-invoke quality-fixer-frontend
  - `blocked` → read `reason`. When `"Cannot determine due to unclear specification"`, surface `blockingIssues[]` to the user and stop. When `"Execution prerequisites not met"`, surface `missingPrerequisites[]` with `resolutionSteps` to the user and stop

### Step 7: Commit (per adjustment unit)
Commit the adjustment unit on quality approval. Include the affected files and any regenerated artifacts (CSS module typings, message catalog typings, etc.) flagged by ui-analyzer's `generatedArtifacts` section.

Then loop back to Step 5 for the next file until all units are committed.

## Completion Criteria

- [ ] External resource hearing executed (project-tier file written or update explicitly skipped)
- [ ] ui-analyzer returned a JSON output, including externalResources fetch_status per axis and candidateWriteSet
- [ ] Write set confirmed by the user before scale judgment
- [ ] Scale judgment applied to the confirmed write set; 3+ files or ADR conditions escalated to the design phase
- [ ] Adjustment context presented and confirmed
- [ ] All adjustment units edited and verified using the project's declared verification mechanism (manual confirmation when no automated mechanism is declared)
- [ ] Each adjustment unit passed quality-fixer-frontend with explicit `filesModified` scoping
- [ ] Each adjustment unit committed

## Output Example

```
Frontend adjustment completed.
- External resources: docs/project-context/external-resources.md (updated|unchanged)
- UI fact gathering: ui-analyzer focused on [N] components, [M] focus areas, external sources [fetched|partial|not_recorded]
- Scale: 1-2 files
- Adjustment units committed: [count]
- Quality status: all passed
```
