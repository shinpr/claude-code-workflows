---
name: review
description: Design Doc compliance validation with optional auto-fixes
---

**Command Context**: Post-implementation quality assurance command

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**First Action**: Register Steps 1-4 to TodoWrite before any execution.

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

If user selects `y`:

## Pre-fix Flow (if user selects fixes)

### Step 3.1: Execute Skill

Execute Skill: documentation-criteria (for task file template)

### Step 3.2: Execute rule-advisor

Understand fix essence (symptomatic treatment vs root solution)

### Step 3.3: Create task file and execute fixes

1. **Update TodoWrite**: Register fix steps
2. **Create task file**: `docs/plans/tasks/review-fixes-YYYYMMDD.md`
3. **Execute task-executor**: Staged auto-fixes (stops at 5 files)
4. **Execute quality-fixer**: Confirm quality gate passage
5. **Re-validate**: Measure improvement with code-reviewer

### Step 4: Final Report
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