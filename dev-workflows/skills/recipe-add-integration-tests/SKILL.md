---
name: recipe-add-integration-tests
description: Add integration/E2E tests to existing codebase using Design Docs
disable-model-invocation: true
---

**Context**: Test addition workflow for existing implementations (backend, frontend, or fullstack)

## Orchestrator Definition

**Core Identity**: "I am an orchestrator."

**First Action**: Register Steps 0-8 using TaskCreate before any execution.

**Why Delegate**: Orchestrator's context is shared across all steps. Direct implementation consumes context needed for review and quality check phases. Task files create context boundaries. Subagents work in isolated context.

**Execution Method**:
- Skeleton generation → delegate to acceptance-test-generator
- Task file creation → orchestrator creates directly (minimal context usage)
- Test implementation → delegate to task-executor
- Test review → delegate to integration-test-reviewer
- Quality checks → delegate to quality-fixer

Document paths: $ARGUMENTS

## Prerequisites

- At least one Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### Step 0: Execute Skill

Execute Skill: documentation-criteria (for task file template in Step 3)

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
- `subagent_type`: "dev-workflows:acceptance-test-generator"
- `description`: "Generate test skeletons"
- `prompt`: List only the documents that exist from Step 1:
  ```
  Generate test skeletons from the following documents:
  - Design Doc (backend): [path]    ← include only if exists
  - Design Doc (frontend): [path]   ← include only if exists
  - UI Spec: [path]                 ← include only if exists
  ```

**Expected output**: `generatedFiles` containing integration and e2e paths

### Step 3: Create Task Files [GATE]

Create one task file per layer, using the monorepo-flow.md naming convention for deterministic agent routing:
- Backend skeletons exist → `docs/plans/tasks/integration-tests-backend-task-YYYYMMDD.md`
- Frontend skeletons exist → `docs/plans/tasks/integration-tests-frontend-task-YYYYMMDD.md`
- Single-layer (no backend/frontend distinction) → `docs/plans/tasks/integration-tests-backend-task-YYYYMMDD.md`

**Template** (per task file):
```markdown
---
name: Implement [layer] integration tests for [feature name]
type: test-implementation
---

## Objective

Implement test cases defined in skeleton files.

## Target Files

- Skeleton: [layer-specific paths from Step 2 generatedFiles]
- Design Doc: [layer-specific Design Doc from Step 1]

## Tasks

- [ ] Implement each test case in skeleton
- [ ] Verify all tests pass
- [ ] Ensure coverage meets requirements

## Acceptance Criteria

- All skeleton test cases implemented
- All tests passing
- quality-fixer reports approved
```

**Output**: "Task file(s) created at [path(s)]. Ready for Step 4."

### Step 4: Test Implementation

For each task file from Step 3, invoke task-executor routed by filename pattern (per monorepo-flow.md):
- `*-backend-task-*` → `subagent_type`: "dev-workflows:task-executor"
- `*-frontend-task-*` → `subagent_type`: "dev-workflows-frontend:task-executor-frontend"
- `description`: "Implement integration tests"
- `prompt`: "Task file: [task file path from Step 3]. Implement tests following the task file."

Execute one task file at a time through Steps 4→5→6→7 before starting the next.

**Expected output**: `status`, `testsAdded`

### Step 5: Test Review

Invoke integration-test-reviewer using Agent tool:
- `subagent_type`: "dev-workflows:integration-test-reviewer"
- `description`: "Review test quality"
- `prompt`: "Review test quality. Test files: [paths from Step 4 testsAdded]. Skeleton files: [layer-specific paths from Step 2 generatedFiles matching current task's layer]"

**Expected output**: `status` (approved/needs_revision), `requiredFixes`

### Step 6: Apply Review Fixes

Check Step 5 result:
- `status: approved` → Mark complete, proceed to Step 7
- `status: needs_revision` → Invoke task-executor with requiredFixes, then return to Step 5

Invoke task-executor routed by task filename pattern:
- `*-backend-task-*` → `subagent_type`: "dev-workflows:task-executor"
- `*-frontend-task-*` → `subagent_type`: "dev-workflows-frontend:task-executor-frontend"
- `description`: "Fix review findings"
- `prompt`: "Fix the following issues in test files: [requiredFixes from Step 5]"

### Step 7: Quality Check

Invoke quality-fixer routed by task filename pattern:
- `*-backend-task-*` → `subagent_type`: "dev-workflows:quality-fixer"
- `*-frontend-task-*` → `subagent_type`: "dev-workflows-frontend:quality-fixer-frontend"
- `description`: "Final quality assurance"
- `prompt`: "Final quality assurance for test files added in this workflow. Run all tests and verify coverage."

**Expected output**: `status` (approved/stub_detected/blocked)

Check quality-fixer response:
- `stub_detected` → Return to Step 4 with `incompleteImplementations[]` details, then re-execute Steps 4→5→6→7
- `blocked` → Escalate to user
- `approved` → Proceed to Step 8

### Step 8: Commit

On `approved` from quality-fixer:
- Commit test files using Bash with message format: "test: add [layer] integration tests for [feature name]"
