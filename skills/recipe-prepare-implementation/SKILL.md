---
name: recipe-prepare-implementation
description: Verifies the work plan is implementable end-to-end and resolves verification-lane / fixture / E2E-environment gaps before the build phase begins. Use when "implement-ready/verification readiness/lane setup/E2E environment missing" is mentioned, or before invoking recipe-build/-front-build/-fullstack-build when readiness has not been preflight-checked.
disable-model-invocation: true
---

**Context**: Optional readiness phase between work-plan approval and recipe-*-build. Confirms the implementation will be observable from Phase 1 onward and resolves any gaps via Phase 0 tasks. Exits no-op when the readiness criteria already pass, so the recipe is safe to invoke unconditionally.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work through Agent tool** — invoke sub-agents, pass deliverable paths between them, and report results (permitted tools: see subagents-orchestration-guide "Orchestrator's Permitted Tools")
2. **Self-contained scope**: When gaps are found, this recipe BOTH generates resolution tasks AND executes them through the standard 4-step cycle. Recipe completes only when readiness criteria pass or remaining gaps are escalated.
3. **No-op exit**: When the readiness scan finds no failing criteria, generate no resolution tasks and exit immediately. The only file modifications in this branch are to the work plan itself — promoting the `Implementation Readiness:` header to `ready` and persisting the Readiness Report section. No code or test files are touched.

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
- No work plan → Stop and report: "recipe-prepare-implementation requires an approved work plan. Run recipe-plan / recipe-front-plan / recipe-fullstack-* first."

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
- Append (or replace, if already present) a `## Implementation Readiness Report` section in the work plan immediately after the header block, using the same Readiness Report markdown defined in Output Format below
- Update the work plan header `Implementation Readiness:` line to `ready` (insert it after `Related Issue/PR:` if absent)
- Present the Readiness Report to the user
- Exit with `outcome: ready, gaps_resolved: 0`
- The work plan modifications above are the only file modifications in this branch

When one or more criteria are `fail` → proceed to Step 4.

### Step 4: Plan Resolution Tasks

For each `fail` criterion:
1. Determine the smallest concrete task that closes the gap (examples: "Add fixture entry for ComponentX covering loading/empty/error states", "Add seed script for E2E user fixtures", "Document local startup commands in docs/run/local.md")
2. Decide the task's **layer** by matching every target file path against the markers below:
   - **backend** when every target file path matches one of: `**/api/**`, `**/server/**`, `**/services/**`, `**/backend/**`, `**/handlers/**`, `**/repositories/**`
   - **frontend** when every target file path matches one of: `**/components/**`, `**/pages/**`, `**/web/**`, `**/frontend/**`, `**/*.tsx`, `**/*.jsx`
   - **mixed** (target files span both backend and frontend markers) → escalate to user; ask the user to split the gap into per-layer tasks
   - **unrecognized** (any target file matches neither backend nor frontend markers — e.g., `docs/**`, `scripts/**`, root-level configs, fixture data files outside the markers above) → escalate to user; ask the user to either (a) decide which layer's executor / quality-fixer should run the task, or (b) update the markers if the project uses different paths

   Apply the rules in the order above. The first matching rule wins; "unrecognized" is the final fallback rather than a catch-all that defaults to backend.
3. Create a Phase 0 task file at `docs/plans/tasks/{plan-name}-backend-task-prep-{NN}.md` (backend) or `docs/plans/tasks/{plan-name}-frontend-task-prep-{NN}.md` (frontend) using the task template from documentation-criteria skill. The `-task-prep-` segment lets recipe-prepare-implementation distinguish prep tasks from implementation tasks while keeping the existing `{plan-name}-{layer}-task-*` matcher used by other recipes
4. Update the work plan to insert these tasks as Phase 0 (before Phase 1)

Present the proposed resolution task list to the user with AskUserQuestion. Proceed only after explicit approval — this is the single human gate inside this recipe.

### Step 5: Execute Resolution Tasks

For each resolution task, run the standard 4-step cycle (see subagents-orchestration-guide "Task Management: 4-Step Cycle"):

1. **Agent tool** — route by filename layer segment:
   - `*-backend-task-prep-*` → `subagent_type: "dev-workflows:task-executor"`
   - `*-frontend-task-prep-*` → `subagent_type: "dev-workflows-frontend:task-executor-frontend"`
   - Filename without a recognized layer segment → escalate (the file should not exist; Step 4 prevents this)
2. Check escalation per orchestration-guide
3. **quality-fixer** — route by the same filename layer segment:
   - `*-backend-task-prep-*` → `"dev-workflows:quality-fixer"`
   - `*-frontend-task-prep-*` → `"dev-workflows-frontend:quality-fixer-frontend"`
4. **Commit** when quality-fixer returns `approved`

Append the Scope Boundary block (below) to every subagent prompt.

### Step 6: Re-scan, Persist Readiness Report, Update Header, Cleanup, Exit

1. **Re-scan**: Re-run the Step 2 readiness scan after all resolution tasks are committed.

2. **Persist Readiness Report into work plan body**: Append (or replace, if already present) a `## Implementation Readiness Report` section in the work plan immediately after the header block. Use the same Readiness Report markdown defined in Output Format below. Downstream recipe-*-build / recipe-*-implement read this section when the header is `escalated` to surface remaining gaps to the user.

3. **Update work plan header**: Locate the line `Implementation Readiness: pending` in the work plan and rewrite it based on the re-scan outcome:

   | Re-scan result | New header value |
   |----------------|------------------|
   | All applicable criteria `pass` | `Implementation Readiness: ready` |
   | One or more `fail` remain | `Implementation Readiness: escalated` |

   If the line is absent (older work plan format), insert it after the `Related Issue/PR:` line.

4. **Final Cleanup**: Delete every prep task file this recipe created for the current `{plan-name}` (`docs/plans/tasks/{plan-name}-backend-task-prep-*.md` and `docs/plans/tasks/{plan-name}-frontend-task-prep-*.md`) AND the phase-completion file generated for prep phases (`docs/plans/tasks/{plan-name}-phase0-completion.md` when present, since prep tasks live in Phase 0). Prep task files for other plans are out of scope — this recipe deletes only what it created for the current run. Their work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs. The work plan itself is preserved for the downstream recipe-*-build / recipe-*-implement.

5. **Exit**:

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

### Resolution Tasks Executed (when gaps_resolved > 0)
- [task file path] — [one-line summary] — committed
- ...

### Remaining Gaps (when outcome is escalated)
- [criterion ID]: [unresolved reference] — Next action: [recommendation]
```

## Completion Criteria

- [ ] Work plan loaded and Verification Strategy / E2E references / Phase structure extracted
- [ ] Readiness scan run with per-criterion result and evidence recorded
- [ ] No-op exit when all `pass`, OR resolution tasks generated, approved, and executed via the 4-step cycle
- [ ] Re-scan run after the last resolution task commits
- [ ] `## Implementation Readiness Report` section persisted into the work plan body
- [ ] Work plan header `Implementation Readiness:` line updated to `ready` or `escalated`
- [ ] Prep task files (and Phase 0 phase-completion file when generated) deleted from `docs/plans/tasks/`
- [ ] Final report presented to the user
