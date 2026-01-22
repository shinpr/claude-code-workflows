---
name: review
description: Design Doc compliance validation with optional auto-fixes
---

**Command Context**: Post-implementation quality assurance command

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**First Action**: Register Steps 1-10 to TodoWrite before any execution.

## Execution Method

- Compliance validation → performed by code-reviewer
- Rule analysis → performed by rule-advisor
- Fix implementation → performed by task-executor
- Quality checks → performed by quality-fixer
- Re-validation → performed by code-reviewer

Orchestrator invokes sub-agents and passes structured JSON between them.

Design Doc (uses most recent if omitted): $ARGUMENTS

## Execution Flow

### Step 1: Prerequisite Check
```bash
# Identify Design Doc
ls docs/design/*.md | grep -v template | tail -1

# Check implementation files
git diff --name-only main...HEAD
```

### Step 2: Execute code-reviewer
Validate Design Doc compliance:
- Acceptance criteria fulfillment
- Code quality check
- Implementation completeness assessment

### Step 3: Verdict and Response

**Criteria (considering project stage)**:
- Prototype: Pass at 70%+
- Production: 90%+ recommended
- Critical items (security, etc.): Required regardless of rate

**Compliance-based response**:

For low compliance (production <90%):
```
Validation Result: [X]% compliance
Unfulfilled items:
- [item list]

Execute fixes? (y/n):
```

### Step 4: Execute Skill

Check Step 3 result:
- User selects `n` or compliance sufficient → Mark complete, proceed to Step 10
- User selects `y` → Execute Skill: documentation-criteria (for task file template)

### Step 5: Execute rule-advisor

Check Step 3 result:
- User selects `n` or compliance sufficient → Mark complete, proceed to Step 10
- User selects `y` → Invoke rule-advisor to understand fix essence

### Step 6: Create Task File

Check Step 3 result:
- User selects `n` or compliance sufficient → Mark complete, proceed to Step 10
- User selects `y` → Create task file at `docs/plans/tasks/review-fixes-YYYYMMDD.md`

### Step 7: Execute Fixes

Check Step 3 result:
- User selects `n` or compliance sufficient → Mark complete, proceed to Step 10
- User selects `y` → Invoke task-executor with task file (stops at 5 files)

Invoke task-executor using Task tool:
- `subagent_type`: "task-executor"
- `description`: "Execute review fixes"
- `prompt`: "Task file: docs/plans/tasks/review-fixes-YYYYMMDD.md. Apply staged fixes."

### Step 8: Quality Check

Check Step 3 result:
- User selects `n` or compliance sufficient → Mark complete, proceed to Step 10
- User selects `y` → Invoke quality-fixer

Invoke quality-fixer using Task tool:
- `subagent_type`: "quality-fixer"
- `description`: "Quality gate check"
- `prompt`: "Confirm quality gate passage for fixed files."

### Step 9: Re-validate

Check Step 3 result:
- User selects `n` or compliance sufficient → Mark complete, proceed to Step 10
- User selects `y` → Invoke code-reviewer to measure improvement

Invoke code-reviewer using Task tool:
- `subagent_type`: "code-reviewer"
- `description`: "Re-validate compliance"
- `prompt`: "Re-validate Design Doc compliance after fixes."

### Step 10: Final Report

```
Initial compliance: [X]%
Final compliance: [Y]% (if fixes executed)
Improvement: [Y-X]%

Remaining issues:
- [items requiring manual intervention]
```

## Auto-fixable Items
- Simple unimplemented acceptance criteria
- Error handling additions
- Contract definition fixes
- Function splitting (length/complexity improvements)

## Non-fixable Items
- Fundamental business logic changes
- Architecture-level modifications
- Design Doc deficiencies

**Scope**: Design Doc compliance validation and auto-fixes.