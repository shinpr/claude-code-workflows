---
name: recipe-front-review
description: Design Doc compliance and security validation with optional auto-fixes
disable-model-invocation: true
---

**Context**: Post-implementation quality assurance for React/TypeScript frontend

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**First Action**: Register Steps 1-11 using TaskCreate before any execution.

## Execution Method

- Compliance validation → performed by code-reviewer
- Security validation → performed by security-reviewer
- Fix implementation → performed by task-executor-frontend
- Quality checks → performed by quality-fixer-frontend
- Re-validation → performed by code-reviewer / security-reviewer

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
Invoke code-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-frontend:code-reviewer"
- `description`: "Code compliance review"
- `prompt`: "Design Doc: [path]. Implementation files: [git diff file list]. Review mode: full. Validate Design Doc compliance and return structured JSON report."

**Store output as**: `$STEP_2_OUTPUT`

### Step 3: Execute security-reviewer
Invoke security-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-frontend:security-reviewer"
- `description`: "Security review"
- `prompt`: "Design Doc: [path]. Implementation files: [git diff file list]. Review security compliance."

**Store output as**: `$STEP_3_OUTPUT`

### Step 4: Verdict and Response

**If security-reviewer returned `blocked`**: Stop immediately. Report the blocked finding and escalate to user. Do not proceed to fix steps.

**Code compliance criteria (considering project stage)**:
- Prototype: Pass at 70%+
- Production: 90%+ recommended

**Security criteria**:
- `approved` or `approved_with_notes` → Pass
- `needs_revision` → Fail

**Report both results independently using subagent output fields only**:

```
Code Compliance: [complianceRate from code-reviewer]
  Verdict: [verdict from code-reviewer]
  Identifier Match Rate: [identifierMatchRate from code-reviewer]
  Acceptance Criteria:
  - [fulfilled] [item] (confidence: [high/medium/low])
  - [partially_fulfilled] [item]: [gap] — [suggestion]
  - [unfulfilled] [item]: [gap] — [suggestion]
  Identifier Mismatches:
  - [identifier]: DD=[designDocValue] Code=[codeValue] at [location]
  Quality Findings:
  - [category] [location]: [description] — [rationale]

Security Review: [status from security-reviewer]
  Findings by category:
  - [confirmed_risk] [location]: [description] — [rationale]
  - [defense_gap] [location]: [description] — [rationale]
  - [hardening] [location]: [description] — [rationale]
  - [policy] [location]: [description] — [rationale]
  Notes: [notes from security-reviewer, if present]

Execute fixes? (y/n):
```

If both pass and user selects `n`: Skip Steps 5-10, proceed to Step 11.

### Step 5: Execute Skill

Execute Skill: documentation-criteria (for task file template)

### Step 6: Create Task File

Create task file at `docs/plans/tasks/review-fixes-YYYYMMDD.md`
Include both code compliance issues and security requiredFixes.

### Step 7: Execute Fixes

Invoke task-executor-frontend using Agent tool:
- `subagent_type`: "dev-workflows-frontend:task-executor-frontend"
- `description`: "Execute review fixes"
- `prompt`: "Task file: docs/plans/tasks/review-fixes-YYYYMMDD.md. Apply staged fixes (stops at 5 files)."

### Step 8: Quality Check

Invoke quality-fixer-frontend using Agent tool:
- `subagent_type`: "dev-workflows-frontend:quality-fixer-frontend"
- `description`: "Quality gate check"
- `prompt`: "Confirm quality gate passage for fixed files."

### Step 9: Re-validate code-reviewer

Invoke code-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-frontend:code-reviewer"
- `description`: "Re-validate compliance"
- `prompt`: "Re-validate Design Doc compliance after fixes. Design Doc: [path]. Implementation files: [file list]. Prior compliance issues: $STEP_2_OUTPUT. Verify each prior issue is resolved."

### Step 10: Re-validate security-reviewer

Invoke security-reviewer using Agent tool (only if security fixes were applied):
- `subagent_type`: "dev-workflows-frontend:security-reviewer"
- `description`: "Re-validate security"
- `prompt`: "Re-validate security after fixes. Prior findings: $STEP_3_OUTPUT. Design Doc: [path]. Implementation files: [file list]."

### Step 11: Final Report
```
Code Compliance:
  Initial: [X]%
  Final: [Y]% (if fixes executed)

Security Review:
  Initial: [status]
  Final: [status] (if fixes executed)
  Notes: [notes from approved_with_notes, if any]

Remaining issues:
- [items requiring manual intervention]
```

## Auto-fixable Items
- Simple unimplemented acceptance criteria
- Error handling additions
- Contract definition fixes
- Function splitting (length/complexity improvements)
- Security confirmed_risk and defense_gap fixes (input validation, auth checks, output encoding)

## Non-fixable Items
- Fundamental business logic changes
- Architecture-level modifications
- Design Doc deficiencies
- Committed secrets (blocked → human intervention)

**Scope**: Design Doc compliance validation, security review, and auto-fixes.
