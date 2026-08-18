---
name: recipe-add-integration-tests
description: Add integration/E2E tests to existing codebase using Design Docs
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Test addition workflow for existing implementations (backend, frontend, or fullstack)

## Orchestrator Definition

**Core Identity**: "I am an orchestrator."

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Gate**: Complete Steps 1-7 in order for each generated layer. Advance only through the current step's stated output or response gate; skip work only when its stated condition is false. Report completion after every layer has completed its review, quality, commit, and retained-limitation retry.

**Why Delegate**: Orchestrator's context is shared across all steps. Direct implementation consumes context needed for review and quality check phases. Subagents work in isolated context.

**Execution Method**:
- Skeleton generation → delegate to acceptance-test-generator
- Test implementation → delegate to task-executor
- Test review → delegate to integration-test-reviewer
- Quality checks → delegate to quality-fixer

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

Document paths: $ARGUMENTS

## Prerequisites

- At least one Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### Step 1: Discover and Validate Documents

Confirm `$ARGUMENTS` names at least one existing document path; report and end when it is empty or every path is unresolvable. Then discover the remaining Design Docs, UI Specs, and PRDs under `docs/design/`, `docs/ui-spec/`, and `docs/prd/`.

Classify discovered documents by filename:
- Filename contains `backend` → **Design Doc (backend)**
- Filename contains `frontend` → **Design Doc (frontend)**
- Located in `docs/ui-spec/` → **UI Spec** (optional)
- Located in `docs/prd/` → **approved PRD / confirmed requirement context** (optional; prefer the path named by the Design Doc)
- None of the above → treat as single-layer Design Doc

### Step 2: Skeleton Generation

Invoke acceptance-test-generator using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:acceptance-test-generator"
- `description`: "Generate test skeletons"
- `design_docs`: Existing backend, frontend, or single-layer Design Doc paths from Step 1
- `ui_spec`: Existing UI Spec path when present
- `confirmed_requirement_context`: Approved PRD path or unchanged Design Doc Requirement Convergence record

Follow subagents-orchestration-guide HC-06 for `value_input_required` and its unknown-value continuation before Step 3.

**Expected output**: `generatedFiles` containing integration and e2e paths

### Step 3: Test Implementation

For each layer with generated skeletons, record the current HEAD as `diffBase`, then invoke the layer's task-executor:
- Backend or single-layer → `subagent_type`: "dev-workflows-fullstack:task-executor"
- Frontend → `subagent_type`: "dev-workflows-fullstack:task-executor-frontend"
- `description`: "Implement integration tests"
- `direct_scope`: Implement every test defined by the layer-specific generated skeletons
- `governing_sources`: Layer-specific Design Doc, applicable UI Spec, and generated skeleton paths
- `target_paths`: Generated test paths plus the existing setup or fixture paths explicitly identified before invocation
- `observable_verification`: Execute the implemented tests and verify every skeleton claim at its declared boundary

Execute one layer at a time through Steps 3→4→5→6→7 before starting the next.

**Expected output**: `status`, `testsAdded`, `mutationEvidence`

Apply this response gate after every task-executor invocation in Steps 3 and 5:
- At least one changed integration/E2E test file and its implementation evidence are confirmed from the response and repository state → Proceed to Step 4
- Required implementation remains incomplete → Apply Specialist Result Acceptance and continue Step 3 while repository evidence supplies an advancing action
- A changed product outcome, major approved design change, user-held authority, or irreversible action is identified → Present that decision to the user
- Other result variations → Apply subagents-orchestration-guide Specialist Result Acceptance

### Step 4: Test Review

Invoke integration-test-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:integration-test-reviewer"
- `description`: "Review test quality"
- `prompt`: "Review test quality. changedTestFiles: [confirmed changed integration/E2E test paths]. diffBase: [revision recorded before Step 3]. skeletonFiles: [layer-specific paths from Step 2 generatedFiles]. mutationEvidence: [Step 3 mutationEvidence]."

**Expected output**: `status` (approved/needs_revision/blocked), `testFiles`, `reviewBasis`, `qualityIssues`; correction re-review also returns `prior_feedback_reconciliation`

### Step 5: Apply Review Fixes

Check Step 4 result:
- `status: approved` → Mark complete, proceed to Step 6
- `status: blocked` → Apply Specialist Result Acceptance
- `status: needs_revision` → Pass Step 4 `qualityIssues` unchanged into the Review Resolution Gate; invoke task-executor for rerouted corrections, return to Step 4, and derive convergence from `prior_feedback_reconciliation`

Invoke the same layer's task-executor:
- `description`: "Fix review findings"
- Reuse Step 3 `direct_scope`, `governing_sources`, `target_paths`, and `observable_verification`
- `correction_findings`: Complete reviewer finding objects verbatim, with only their orchestrator dispositions added

### Step 6: Quality Check

Invoke quality-fixer for the current layer:
- Backend or single-layer → `subagent_type`: "dev-workflows-fullstack:quality-fixer"
- Frontend → `subagent_type`: "dev-workflows-fullstack:quality-fixer-frontend"
- `description`: "Final quality assurance"
- Pass the latest executor's `mutationEvidence`.
- `prompt`: "Run the repository-configured quality checks applicable to the test files added in this workflow and verify their intended observable behavior."

**Expected output**: `status` (`approved`, `stub_detected`, `verification_incomplete`, or `blocked`)

Check quality-fixer response:
- `stub_detected` → Return to Step 3 with the quality-fixer's `incompleteImplementations` array unchanged as the canonical `incompleteImplementations` field, then re-execute Steps 3→4→5→6
- `blocked` → Apply Specialist Result Acceptance
- `verification_incomplete` → Retain the complete result for one final retry and proceed to Step 7
- `approved` → Proceed to Step 7

### Step 7: Commit

On `approved` or `verification_incomplete` from quality-fixer:
- Apply subagents-orchestration-guide Commit Boundary Check, then commit test files using Bash with message format: "test: add [layer] integration tests for [feature name]". Append its verification trailers for `verification_incomplete`.

After every layer has a clean commit boundary, retry each retained verification limitation once with the same layer quality-fixer inputs. Clear an `approved` result, route newly discovered incomplete implementation through Steps 3→6, and retain a repeated limitation for the completion report while continuing the workflow.

In the completion report, list each repeated verification limitation and each declined actionable finding with its ID, governing reason, and evidence when any occurred.
