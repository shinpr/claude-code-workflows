---
name: add-integration-tests
description: Add integration/E2E tests to existing backend codebase using Design Doc
---

**Command Context**: Test addition workflow for existing backend implementations

**Scope**: Backend only (acceptance-test-generator supports backend only)

**Role**: Orchestrator

**Execution Method**:
- Skeleton generation → delegate to acceptance-test-generator
- Task file creation → orchestrator creates directly
- Test implementation → delegate to task-executor
- Test review → delegate to integration-test-reviewer
- Quality checks → delegate to quality-fixer

Design Doc path: $ARGUMENTS

**TodoWrite**: Register steps and update as each completes.

## Prerequisites
- Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### 1. Validate Design Doc (Orchestrator)
```bash
# Verify Design Doc exists
ls $ARGUMENTS || ls docs/design/*.md | grep -v template | tail -1
```

### 2. Skeleton Generation

**Task tool invocation**:
```
subagent_type: acceptance-test-generator
prompt: |
  Generate test skeletons from Design Doc.

  Design Doc: [path from Step 1]

  Output:
  - Integration test skeletons (*.int.test.ts)
  - E2E test skeletons if applicable (*.e2e.test.ts)
```

**Expected output**: `generatedFiles` containing integration and e2e paths

### 3. Create Task File (Orchestrator)

Create task file following task template (see documentation-criteria skill):
- Path: `docs/plans/tasks/integration-tests-YYYYMMDD.md`
- Content: Test implementation tasks based on generated skeletons
- Include skeleton file paths from Step 2 output in Target Files section

### 4. Test Implementation

**Task tool invocation**:
```
subagent_type: task-executor
prompt: |
  Implement tests following the task file.

  Task file: docs/plans/tasks/integration-tests-YYYYMMDD.md

  Requirements:
  - Follow TDD principles (Red-Green-Refactor)
  - Implement each skeleton test case
  - Run tests and verify they pass
```

**Expected output**: `status`, `testsAdded`

### 5. Test Review

**Task tool invocation**:
```
subagent_type: integration-test-reviewer
prompt: |
  Review test quality.

  Test files: [paths from Step 2 generatedFiles]
  Skeleton files: [original skeleton paths]
```

**Expected output**: `status` (approved/needs_revision), `requiredFixes`

**Flow control**:
- `status: needs_revision` → Return to Step 4 with `requiredFixes`
- `status: approved` → Proceed to Step 6

### 6. Quality Check

**Task tool invocation**:
```
subagent_type: quality-fixer
prompt: |
  Final quality assurance for test files.

  Scope: Test files added in this workflow

  Requirements:
  - Run all tests
  - Verify coverage meets requirements
  - Fix any quality issues
```

**Expected output**: `approved` (true/false)

### 7. Commit (Orchestrator)

On `approved: true` from quality-fixer:
- Commit test files with appropriate message using Bash
