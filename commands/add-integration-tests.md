---
name: add-integration-tests
description: Add integration/E2E tests to existing backend codebase using Design Doc
---

**Command Context**: Test addition workflow for existing backend implementations

**Scope**: Backend only (acceptance-test-generator supports backend only)

## Execution Method

- Skeleton generation → performed by acceptance-test-generator
- Task file creation → following task template (see documentation-criteria skill)
- Test implementation → performed by task-executor
- Test review → performed by integration-test-reviewer
- Quality checks → performed by quality-fixer

Orchestrator invokes sub-agents and passes structured JSON between them.

Design Doc path: $ARGUMENTS

**Think deeply** Understand the essence of test addition and execute:

## Prerequisites
- Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### 1. Validate Design Doc
```bash
# Verify Design Doc exists
ls $ARGUMENTS || ls docs/design/*.md | grep -v template | tail -1
```

### 2. Execute acceptance-test-generator
Generate test skeletons from Design Doc:
- Extract Acceptance Criteria (AC)
- Generate integration test skeletons (`*.int.test.ts`)
- Generate E2E test skeletons if applicable (`*.e2e.test.ts`)

### 3. Create Task File
Create task file following task template (see documentation-criteria skill):
- Path: `docs/plans/tasks/integration-tests-YYYYMMDD.md`
- Content: Test implementation tasks based on generated skeletons
- Include skeleton file paths in Target Files section

### 4. Execute task-executor
Implement tests following the task file:
- Follow TDD principles (Red-Green-Refactor)
- Implement each skeleton test case
- Run tests and verify they pass

### 5. Execute integration-test-reviewer
Review test quality:
- Verify skeleton compliance
- Check test coverage
- If `needs_revision` → Return to step 4 with `requiredFixes`
- If `approved` → Proceed to quality check

### 6. Execute quality-fixer
Final quality assurance:
- Run all tests
- Verify coverage meets requirements
- Fix any quality issues

### 7. Commit
Commit test files with appropriate message.

## Delegation
- acceptance-test-generator: Skeleton generation
- task-executor: Test implementation
- integration-test-reviewer: Test quality review
- quality-fixer: Final quality check
