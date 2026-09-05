---
name: recipe-front-adjust
description: Adjust an already-implemented UI in-session with verification against the design source
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.

**Context**: UI adjustment on already-implemented features. The verification loop (edit → check against the design source → refine) runs in the parent session.

## Execution Pattern

**Core Identity**: "I am a guided executor. I run the adjustment and the verification loop myself; subagents handle one-shot tasks."

**Execution Protocol**:
1. **Delegate to subagents** (one-shot calls): quality-fixer-frontend.
2. **Run in the parent session** (multi-step loops and user dialogs): external-resource hearing via AskUserQuestion, write-set inspection, scale judgment, adjustment-context approval, adjustment edits, verification against the design source, iteration until acceptance.
3. **Stop at every `[Stop: ...]` marker** before proceeding.

## Execution Gate

Complete Steps 1-7 in order for each adjustment unit. Advance only through the current step's stated evidence, quality result, or user stop; skip work only when its stated condition is false. Report completion after every applicable Completion Criterion and retained-limitation retry is satisfied.

## Workflow Overview

```
Adjustment request → conditional external resource evidence
                                  ↓
                     existing-pattern and write-set inspection
                                  ↓
                     structural boundary judgment on candidate write set
                                  ↓
                     local existing-pattern adjustment → [Stop]
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
- Existing-pattern and write-set inspection in the parent session
- Structural boundary judgment via documentation-criteria
- Adjustment edits and verification against the design source (run in this session)
- Quality verification via quality-fixer-frontend
- Commit per adjustment unit

**Responsibility Boundary**: This skill completes when each adjustment is committed after its quality cycle and any retained proof limitation receives its final retry. Adjustment work is end-to-end within this recipe; parent session owns edits, verification loops, quality-result routing, and commits.

**Escalation Boundary**: Escalate to the full frontend design phase when the request crosses a responsibility or approved UI boundary, requires a complete Design Doc, or contains a technical choice that passes documentation-criteria's Choice and Durability filters.

Adjustment request: $ARGUMENTS

## Execution Flow

### Step 1: External Resource Hearing
Execute Skill: external-resource-context before running the hearing protocol.

Run the hearing protocol only when external evidence can change the current adjustment target or verification result. Otherwise continue with the existing repository/UI Spec evidence and record no external references.

### Step 2: Determine the Route and Write Set

Execute Skill: documentation-criteria.

Inspect the named or current UI and the smallest sufficient repository evidence needed to identify the likely write set and preserved visible behavior. Include a generated artifact only when repository tooling shows that a candidate write triggers its generator. When the UI Spec creation condition applies, route to `recipe-front-design` and stop. Otherwise record the evidence-backed candidate write set for this existing-pattern adjustment.

### Step 3: Scale Judgment

1. Read the candidate write set from Step 2.
2. Apply Structural Scale to the confirmed outcome and responsibility boundary. Use write-set count as supporting evidence only:
   - **0 files**: The adjustment request did not map to any existing file. Escalate to the user with the message "No write target identified from the adjustment request. Please clarify which component(s) should change, or run the full frontend design phase if this is a new feature." Stop this recipe.
   - **Direct adjustment**: One coherent UI outcome follows existing component, state, interaction, and verification patterns inside one responsibility boundary. Continue directly to adjustment context even when generated or tightly coupled files increase the count.
   - **Design required**: The change crosses a responsibility or approved UI contract, coordinates independently valuable outcomes, or needs a durable technical choice between credible alternatives. Escalate to the full frontend design phase.

### Step 4: Adjustment Context

No work plan. Build a minimal adjustment context for the parent session:
- Adjustment request (verbatim)
- Existing UI pattern and preserved visible behavior relevant to the adjustment
- Evidence-backed affected files list from the candidate write set
- External resources fetched_summary and access methods that the verification loop will use

Present the adjustment context to the user for review.
- **[STOP]**: User confirms the adjustment context covers the work.

### Step 5: Adjustment + Verification (parent session)

Execute Skill: frontend-ai-guide before planning or applying adjustment edits.
Execute Skill: typescript-rules before planning or applying adjustment edits.
Execute Skill: implementation-approach before planning or applying adjustment edits.
Execute Skill: test-implement before adding or changing tests.

For each file in the confirmed adjustment context:
1. **Plan the edit** from the confirmed adjustment context and relevant external resource (e.g., design origin's fetched_summary).
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
  - `subagent_type: "dev-workflows-frontend:quality-fixer-frontend"`
  - `description: "Quality verification for adjustment unit"`
  - `direct_scope`: Copy the current unit's confirmed adjustment request and preserved visible behavior from Step 4 unchanged.
  - `governing_sources`: Pass the existing UI and design source references used for this unit unchanged.
  - `observable_verification`: Copy the verification criteria used for this unit in Step 5 unchanged.
  - Pass `qualityCommand` when available (caller first, otherwise current task).
- Route the quality-fixer-frontend response by `status`:
  - `approved` → proceed to Step 7
  - `stub_detected` → return to Step 5 to complete the implementation for this unit, then re-invoke quality-fixer-frontend
  - `verification_incomplete` → retain the complete result for final retry and proceed to Step 7
  - `blocked` → Apply subagents-orchestration-guide Specialist Result Acceptance using the result's semantic evidence, changed files, and repository state

### Step 7: Commit (per adjustment unit)
Before committing, use repository state at the commit boundary as the primary evidence and account for every actual change by mapping it to the confirmed adjustment, preserved pattern, or a necessary dependency, test, or generated artifact. Every required change is ready for the unit commit, accidental changes introduced during the unit are removed, and existing worktree changes unrelated to the confirmed adjustment remain intact.

Commit the adjustment unit after `approved` or `verification_incomplete`. For the latter, derive and append one `Verification-Limitation: <reason>` and `Verification-Affected: <affected check or command>` trailer pair per retained limitation.

Then loop back to Step 5 for the next file until all units are committed.

On continuation, reconstruct retained limitations from the verification trailers on adjustment-unit commits already completed for this request. After all units are committed, retry each retained verification limitation once with quality-fixer-frontend. Clear an `approved` result, commit any resulting fixes through Steps 6→7, and include only a repeated limitation in the completion report.

## Completion Criteria

- [ ] External resource hearing executed (project-tier file written or update explicitly skipped)
- [ ] UI Spec applicability and the candidate write set were determined from the requested UI and sufficient repository evidence
- [ ] Structural boundary judgment applied; changes requiring complete design or a qualifying durable decision escalated
- [ ] Adjustment context, including the affected files, was presented and confirmed once
- [ ] All adjustment units edited; each declared verification mechanism ran, received manual confirmation where required, or retained its exact proof limitation after final retry
- [ ] Each adjustment unit completed quality-fixer-frontend before commit; retained proof limitations were retried and reported
- [ ] Each adjustment unit committed

## Output Example

```
Frontend adjustment completed.
- External resources: docs/project-context/external-resources.md (updated|unchanged)
- UI evidence: existing pattern [path], external sources [fetched|partial|not_recorded]
- Scale: direct existing-pattern adjustment
- Adjustment units committed: [count]
- Quality status: all passed | [remaining proof limitations]
```
