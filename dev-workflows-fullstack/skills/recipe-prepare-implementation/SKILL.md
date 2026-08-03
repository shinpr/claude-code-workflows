---
name: recipe-prepare-implementation
description: Verifies the work plan is implementable end-to-end and resolves verification-lane / fixture / E2E-environment gaps before the build phase begins. Use when "implement-ready/verification readiness/lane setup/E2E environment missing" is mentioned, or before any build phase begins on a work plan whose readiness has not been preflight-checked.
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Optional readiness phase between work-plan approval and recipe-*-build. Confirms the implementation will be observable from Phase 1 onward and resolves any gaps before build execution. Exits no-op when the readiness criteria already pass, so the recipe is safe to invoke unconditionally.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Execution Protocol**:
1. **Invoke named specialists for deliverable production** — pass deliverable paths between them and validate their results (see subagents-orchestration-guide "Orchestrator Execution Boundary")
2. **Self-contained scope**: When gaps are found, this recipe defines resolution items and executes them through the standard 4-step cycle. Recipe completes only when readiness criteria pass or remaining gaps are escalated.
3. **No-op exit**: When the readiness scan finds no failing criteria, generate no resolution items and exit immediately, presenting the Readiness Report to the user. No files are modified in this branch.

Work plan: $ARGUMENTS

## When This Recipe Applies

Run before any recipe-*-build invocation when ANY of the following hold:
- Work plan was created from a Design Doc whose Verification Strategy references commands, files, functions, or endpoints not yet present in the codebase
- Work plan includes E2E test skeletons (seed data, auth fixture, environment variables, or external mocks may be unaddressed)
- Work plan touches UI components without a fixture entry or development route to render their visual states
- The team has not previously confirmed the local lane runs end-to-end for this feature area

When none of the above hold, the readiness scan in Step 2 will find zero failing criteria and the recipe exits no-op (see Context at the top of this skill).

## Readiness Criteria

Each criterion is a measurable check producing `pass`, `fail`, or `not_applicable` with cited evidence.

| ID | Criterion | Pass evidence |
|----|-----------|---------------|
| R1 | Verification Strategy references resolve | Every command, file path, function, endpoint, and test referenced in the work plan's Verification Strategy section either exists in the codebase (verified via Glob/Grep) or is the deliverable of a task already in this plan |
| R2 | E2E preconditions addressed | When E2E skeletons exist: every precondition mentioned in skeleton comments (seed data, auth fixture, env var, external mock) is present in the codebase or covered by a Phase 0 task in this plan |
| R3 | Phase 1 observability | The first implementation phase contains at least one task whose Operation Verification Methods can execute at task completion using only artifacts that exist before the task starts (existing code, prior Phase 0 task deliverables, or the task's own outputs) |
| R4 | UI rendering surface | When the plan implements UI components: a fixture entry, dev route, Storybook story, or equivalent rendering surface exists for the impacted components, OR a Phase 0 task adds one |
| R5 | Local lane procedure | The work plan or a referenced doc records the commands needed to start the system locally for manual verification (start commands, default ports, seed steps) |

R4 and R5 are evaluated only when their triggering signals appear in the work plan; otherwise mark `not_applicable`.

## Pre-execution Prerequisites

```bash
# Verify the work plan exists
! ls -la docs/plans/*.md | grep -v template | tail -5
```

**State check**:
- Work plan exists → Proceed to Step 1
- No work plan → Stop and report: "A work plan is required. Complete the upstream planning phase first, then re-invoke this recipe."

## Execution Flow

### Step 1: Load Inputs

Read the work plan path passed in `$ARGUMENTS`. Extract:
- Verification Strategy section (Correctness Proof Method + Early Verification Point)
- Quality Assurance Mechanisms table
- Design-to-Plan Traceability table
- Test skeleton references listed in the plan header
- Phase structure with each phase's tasks
- Referenced Design Doc(s) and UI Spec (when present)

### Step 2: Readiness Scan

For each criterion R1–R5:
1. Execute the scan defined in Readiness Criteria using Read / Glob / Grep
2. Record the result: `pass` / `fail` / `not_applicable`
3. Cite evidence: file:line for `pass`, the unresolved reference for `fail`, the missing trigger signal for `not_applicable`

Build the Readiness Report (see Output Format) regardless of outcome.

### Step 3: No-op Check

When every applicable criterion is `pass` (zero `fail`):
- Present the Readiness Report (see Output Format below) to the user
- Exit with `outcome: ready, gaps_resolved: 0`
- No files are modified in this branch

When one or more criteria are `fail` → proceed to Step 4.

### Step 4: Plan Resolution Items

For each `fail` criterion:
1. Determine the smallest concrete correction that closes the gap (examples: "Add fixture entry for ComponentX covering loading/empty/error states", "Add seed script for E2E user fixtures", "Document local startup commands in docs/run/local.md")
2. Decide the resolution item's **layer** by matching every target file path against the markers below:
   - **backend** when every target file path matches one of: `**/api/**`, `**/server/**`, `**/services/**`, `**/backend/**`, `**/handlers/**`, `**/repositories/**`
   - **frontend** when every target file path matches one of: `**/components/**`, `**/pages/**`, `**/web/**`, `**/frontend/**`, `**/*.tsx`, `**/*.jsx`
   - **mixed** (target files span both backend and frontend markers) → escalate to user; ask the user to split the gap into per-layer items
   - **unrecognized** (any target file matches neither backend nor frontend markers — e.g., `docs/**`, `scripts/**`, root-level configs, fixture data files outside the markers above) → escalate to user; ask the user to either (a) decide which layer's executor / quality-fixer should run the item, or (b) update the markers if the project uses different paths

   Apply the rules in the order above. The first matching rule wins; "unrecognized" is the final fallback rather than a catch-all that defaults to backend.

Present the proposed resolution item list to the user with AskUserQuestion. Proceed only after explicit approval — this is the single human gate inside this recipe.

### Step 5: Execute Resolution Items

For each approved resolution item, run execute → branch → quality-fix → commit:

1. **Agent tool** — route by the item's layer:
   - `backend` → `subagent_type: "dev-workflows-fullstack:task-executor"`
   - `frontend` → `subagent_type: "dev-workflows-fullstack:task-executor-frontend"`
   - Pass the exact resolution item, governing documents, target paths, and verification condition directly
2. Check escalation per orchestration-guide
3. **quality-fixer** — route by the same Executor lane:
   - `backend` → `"dev-workflows-fullstack:quality-fixer"`
   - `frontend` → `"dev-workflows-fullstack:quality-fixer-frontend"`
   - Pass upstream `filesModified` and `mutationEvidence`.
4. **Commit** when quality-fixer returns `approved`

Append the Scope Boundary block (below) to every subagent prompt.

### Step 6: Re-scan, Present Readiness Report, Exit

1. **Re-scan**: Re-run the Step 2 readiness scan after all resolution items are committed.

2. **Present Readiness Report**: Present the Readiness Report (see Output Format below) to the user. The report is shown in-session and is not written into the work plan — the durable output is the committed readiness fixes.

3. **Exit**:

   | Re-scan result | Action |
   |----------------|--------|
   | All applicable criteria `pass` | Exit with `outcome: ready, gaps_resolved: N` and final Readiness Report |
   | One or more `fail` remain | Exit with `outcome: escalated` — present remaining failures to the user with the next-action recommendation. Treat the re-scan as the terminal evaluation; further resolution requires the user to re-invoke this recipe with updated inputs. |

## Scope Boundary for Subagents

Append the following block to every subagent prompt invoked from this recipe:

```
Scope boundary for subagents:
Operate within the task scope and referenced files in the prompt.
Use loaded skills to execute that scope.
Escalate when the required fix or investigation falls outside that scope.
```

## Output Format

Final report presented to the user at exit:

```
## Implementation Readiness Report

Work plan: [path]
Outcome: ready | escalated
Gaps resolved: [N]

### Readiness Criteria

| ID | Result | Evidence |
|----|--------|----------|
| R1 | pass / fail / not_applicable | [file:line OR "missing: <unresolved reference>"] |
| R2 | ... | ... |
| R3 | ... | ... |
| R4 | ... | ... |
| R5 | ... | ... |

### Resolution Items Executed (when gaps_resolved > 0)
- [criterion ID] — [one-line summary] — committed
- ...

### Remaining Gaps (when outcome is escalated)
- [criterion ID]: [unresolved reference] — Next action: [recommendation]
```

## Completion Criteria

- [ ] Work plan loaded and Verification Strategy / E2E references / Phase structure extracted
- [ ] Readiness scan run with per-criterion result and evidence recorded
- [ ] No-op exit when all `pass`, OR resolution items planned, approved, and executed via the 4-step cycle
- [ ] Re-scan run after the last resolution item commits
- [ ] Final report presented to the user
