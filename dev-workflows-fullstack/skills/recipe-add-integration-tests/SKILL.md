---
name: recipe-add-integration-tests
description: Add integration/E2E tests to existing codebase using Design Docs
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.

**Context**: Test addition workflow for existing implementations (backend, frontend, or fullstack)

## Orchestrator Definition

**Core Identity**: "I am an orchestrator."

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression; include declined IDs with governing reasons and evidence in the final user report.

**First Action**: Register Steps 1-7 using TaskCreate before any execution.

**Why Delegate**: Orchestrator's context is shared across all steps. Direct implementation consumes context needed for review and quality check phases. Subagents work in isolated context.

**Execution Method**:
- Skeleton generation → delegate to acceptance-test-generator
- Test implementation → delegate to task-executor
- Test review → delegate to integration-test-reviewer
- Quality checks → delegate to quality-fixer

Document paths: $ARGUMENTS

## Prerequisites

- At least one Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### Step 1: Discover and Validate Documents

```bash
# Verify at least one document path was provided
test -n "$ARGUMENTS" || { echo "ERROR: No document paths provided"; exit 1; }

# Verify provided paths exist
ls $ARGUMENTS

# Discover additional documents
ls docs/design/*.md 2>/dev/null | grep -v template
ls docs/ui-spec/*.md 2>/dev/null
```

Classify discovered documents by filename:
- Filename contains `backend` → **Design Doc (backend)**
- Filename contains `frontend` → **Design Doc (frontend)**
- Located in `docs/ui-spec/` → **UI Spec** (optional)
- None of the above → treat as single-layer Design Doc

### Step 2: Skeleton Generation

Invoke acceptance-test-generator using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:acceptance-test-generator"
- `description`: "Generate test skeletons"
- `prompt`: List only the documents that exist from Step 1:
  ```
  Generate test skeletons from the following documents:
  - Design Doc (backend): [path]    ← include only if exists
  - Design Doc (frontend): [path]   ← include only if exists
  - UI Spec: [path]                 ← include only if exists
  ```

**Expected output**: `generatedFiles` containing integration and e2e paths

### Step 3: Test Implementation

For each layer with generated skeletons, record the current HEAD as `diffBase`, then invoke the layer's task-executor:
- Backend or single-layer → `subagent_type`: "dev-workflows-fullstack:task-executor"
- Frontend → `subagent_type`: "dev-workflows-fullstack:task-executor-frontend"
- `description`: "Implement integration tests"
- `prompt`: "Implement every test defined by these generated skeletons: [layer-specific Step 2 paths]. Governing documents: [layer-specific Design Doc and UI Spec when present]. Keep changes within the generated tests and the setup or fixture files they require. Verify the implemented tests against the skeleton claims."

Execute one layer at a time through Steps 3→4→5→6→7 before starting the next.

**Expected output**: `status`, `filesModified`, `testsAdded`, `mutationEvidence`

Apply this response gate after every task-executor invocation in Steps 3 and 5:
- `status: completed`, `filesModified` and `testsAdded` are present, and at least one changed integration/E2E path can be identified from the cumulative response paths against `diffBase` → Proceed to Step 4
- `status: escalation_needed` → Escalate to the user
- Any other status, or a response missing the required fields above → Stop and report the invalid or missing fields

### Step 4: Test Review

Invoke integration-test-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:integration-test-reviewer"
- `description`: "Review test quality"
- `prompt`: "Review test quality. changedTestFiles: [integration/E2E paths in Step 3 filesModified or testsAdded that differ from diffBase]. diffBase: [revision recorded before Step 3]. skeletonFiles: [layer-specific paths from Step 2 generatedFiles]. mutationEvidence: [Step 3 mutationEvidence]."

**Expected output**: `status` (approved/needs_revision/blocked), `testFiles`, `reviewBasis`, `qualityIssues`, `requiredFixes`

### Step 5: Apply Review Fixes

Check Step 4 result:
- `status: approved` → Mark complete, proceed to Step 6
- `status: blocked` → Escalate to user
- `status: needs_revision` → Apply the Review Resolution Gate
  - one or more `apply` findings → Invoke task-executor with those findings, apply the executor response gate above, then return to Step 4 with `prior_feedback`
  - every actionable finding is `decline` → Mark review complete and proceed to Step 6
  - any unresolved `user_decision_required` finding → Escalate to user

Invoke the same layer's task-executor:
- `description`: "Fix review findings"
- `prompt`: "Fix these adjudicated test-review findings directly: [apply findings with IDs, governing basis, smallest correction, affected paths, and observable verification condition]."

### Step 6: Quality Check

Invoke quality-fixer for the current layer:
- Backend or single-layer → `subagent_type`: "dev-workflows-fullstack:quality-fixer"
- Frontend → `subagent_type`: "dev-workflows-fullstack:quality-fixer-frontend"
- `description`: "Final quality assurance"
- Pass the latest executor's `filesModified` and `mutationEvidence`.
- `prompt`: "Final quality assurance for test files added in this workflow. Run all tests and verify coverage."

**Expected output**: `status` (approved/stub_detected/blocked)

Check quality-fixer response:
- `stub_detected` → Return to Step 3 with `incompleteImplementations[]` details, then re-execute Steps 3→4→5→6
- `blocked` → Escalate to user
- `approved` → Proceed to Step 7

### Step 7: Commit

On `approved` from quality-fixer:
- Commit test files using Bash with message format: "test: add [layer] integration tests for [feature name]"

## Scope Boundary for Subagents

Append the following block to every subagent prompt invoked from this recipe:

```
Scope boundary for subagents:
Operate within the task scope and referenced files in the prompt.
Use loaded skills to execute that scope.
Escalate when the required fix or investigation falls outside that scope.
```
