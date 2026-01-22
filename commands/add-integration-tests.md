---
name: add-integration-tests
description: Add integration/E2E tests to existing backend codebase using Design Doc
argument-hint: <design doc name or path>
---

**Command Context**: Test addition workflow for existing backend implementations

**Scope**: Backend only (acceptance-test-generator supports backend only)

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**First Action**: Register Steps 0-8 to TodoWrite before any execution.

**Why Delegate**: Orchestrator's context is shared across all steps. Direct implementation consumes context needed for review and quality check phases. Task files create context boundaries. Subagents work in isolated context.

**Execution Method**:
- Skeleton generation → delegate to acceptance-test-generator
- Task file creation → orchestrator creates directly (minimal context usage)
- Test implementation → delegate to task-executor
- Test review → delegate to integration-test-reviewer
- Quality checks → delegate to quality-fixer

Design Doc path: $ARGUMENTS

## Prerequisites

- Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### Step 0: Execute Skill

Execute Skill: documentation-criteria (for task file template in Step 3)

### Step 1: Validate Design Doc

```bash
# Verify Design Doc exists
ls $ARGUMENTS || ls docs/design/*.md | grep -v template | tail -1
```

### Step 2: Skeleton Generation

Invoke acceptance-test-generator using Task tool:
- `subagent_type`: "acceptance-test-generator"
- `description`: "Generate test skeletons"
- `prompt`: "Generate test skeletons from Design Doc at [path from Step 1]"

**Expected output**: `generatedFiles` containing integration and e2e paths

### Step 3: Create Task File [GATE]

Create task file at: `docs/plans/tasks/integration-tests-YYYYMMDD/task-01.md`

**Template**:
```markdown
---
name: Implement integration tests for [feature name]
type: test-implementation
---

## Objective

Implement test cases defined in skeleton files.

## Target Files

- Skeleton: [path from Step 2 generatedFiles]
- Design Doc: [path from Step 1]

## Tasks

- [ ] Implement each test case in skeleton
- [ ] Verify all tests pass
- [ ] Ensure coverage meets requirements

## Acceptance Criteria

- All skeleton test cases implemented
- All tests passing
- No quality issues
```

**Output**: "Task file created at [path]. Ready for Step 4."

### Step 4: Test Implementation

Invoke task-executor using Task tool:
- `subagent_type`: "task-executor"
- `description`: "Implement integration tests"
- `prompt`: "Task file: docs/plans/tasks/integration-tests-YYYYMMDD/task-01.md. Implement tests following the task file."

**Expected output**: `status`, `testsAdded`

### Step 5: Test Review

Invoke integration-test-reviewer using Task tool:
- `subagent_type`: "integration-test-reviewer"
- `description`: "Review test quality"
- `prompt`: "Review test quality. Test files: [paths from Step 4 testsAdded]. Skeleton files: [paths from Step 2 generatedFiles]"

**Expected output**: `status` (approved/needs_revision), `requiredFixes`

### Step 6: Apply Review Fixes

Check Step 5 result:
- `status: approved` → Mark complete, proceed to Step 7
- `status: needs_revision` → Invoke task-executor with requiredFixes, then return to Step 5

Invoke task-executor using Task tool:
- `subagent_type`: "task-executor"
- `description`: "Fix review findings"
- `prompt`: "Fix the following issues in test files: [requiredFixes from Step 5]"

### Step 7: Quality Check

Invoke quality-fixer using Task tool:
- `subagent_type`: "quality-fixer"
- `description`: "Quality gate check"
- `prompt`: "Execute final quality checks for test files: [paths from Step 4 testsAdded]"

**Expected output**: `approved` (true/false)

### Step 8: Final Report and Commit

```
Test Implementation Complete

Generated skeletons: [paths from Step 2]
Implemented tests: [paths from Step 4]
Review status: [approved]
Quality status: [approved]

Ready for commit.
```

Commit test files with message: `test: add integration tests for [feature name]`
