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
- **Code-side fix path**: Fix implementation → task-executor-frontend; Quality checks → quality-fixer-frontend; Re-validation → code-reviewer / security-reviewer
- **Design-side update path**: DD revision → technical-designer-frontend (update mode); DD review → document-reviewer; cross-DD consistency → design-sync (when multiple DDs exist); Re-validation → code-reviewer

The design-side path applies when the discrepancy reflects code that was correct but the Design Doc became stale, rather than code that violated the Design Doc.

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

Before presenting to the user, the orchestrator computes a recommended route per finding using the rule below (this rule is internal — do not include it in the user-facing prompt):

| Finding pattern | Recommended route |
|-----------------|-------------------|
| `dd_violation` where the code intent matches the original requirement but the Design Doc captured a different design | `d` (Design-side update) |
| `dd_violation` where the code drifted from a still-correct Design Doc | `c` (Code-side fix) |
| `reliability` / `security` / `maintainability` findings | `c` (Code-side fix) |

Then present to the user (label each finding with its recommended route, grouped by route):

```
Code Compliance: [complianceRate from code-reviewer]
  Verdict: [verdict from code-reviewer]
  Identifier Match Rate: [identifierMatchRate from code-reviewer]
  Acceptance Criteria:
  - [fulfilled] [item] (confidence: [high/medium/low])
  - [partially_fulfilled] [item]: [gap] — [suggestion] [recommended: c | d]
  - [unfulfilled] [item]: [gap] — [suggestion] [recommended: c | d]
  Identifier Mismatches:
  - [identifier]: DD=[designDocValue] Code=[codeValue] at [location] [recommended: c | d]
  Quality Findings:
  - [category] [location]: [description] — [rationale] [recommended: c]

Security Review: [status from security-reviewer]
  Findings by category:
  - [confirmed_risk] [location]: [description] — [rationale] [recommended: c]
  - [defense_gap] [location]: [description] — [rationale] [recommended: c]
  - [hardening] [location]: [description] — [rationale] [recommended: c]
  - [policy] [location]: [description] — [rationale] [recommended: c]
  Notes: [notes from security-reviewer, if present]

Resolve discrepancies — confirm or override the recommended route per finding:
  c) Code-side fix       — code violates Design Doc; modify code to match
  d) Design-side update  — code is correct; Design Doc is stale, revise it
  s) Skip                — accept current state without changes
```

Use AskUserQuestion. The default offer is **"accept all recommended routes"** — a single confirmation for the typical case where the orchestrator's recommendations are correct. When the user wants to override, collect per-finding c/d/s decisions instead. If the user selects `s` for everything: skip Steps 5-10, proceed to Step 11.

### Step 5: Execute Skill

Execute Skill: documentation-criteria (for task file template)

### Step 5d: Design-Side Update

Run this step only when the user routed at least one finding to `d`. When all routes are `c` or `s`, skip directly to Step 6.

1. Invoke technical-designer-frontend in update mode using Agent tool:
   - `subagent_type`: "dev-workflows-frontend:technical-designer-frontend"
   - `description`: "Design Doc update from review findings"
   - `prompt`: "Update Design Doc at [path] in update mode. The implementation has diverged in the following ways that the team has decided to ratify in the design rather than in the code: [list of `d`-routed findings with codeLocation and designDocValue from $STEP_2_OUTPUT]. Reflect the current code behavior in the relevant sections and add a history entry."

2. Invoke document-reviewer to verify the updated Design Doc:
   - `subagent_type`: "dev-workflows-frontend:document-reviewer"
   - `description`: "Document review of updated Design Doc"
   - `prompt`: "Review updated Design Doc at [path] for consistency and completeness."

3. When multiple Design Docs exist (`ls docs/design/*.md | grep -v template | wc -l > 1`), invoke design-sync:
   - `subagent_type`: "dev-workflows-frontend:design-sync"
   - `description`: "Cross-DD consistency check"
   - `prompt`: "source_design: [updated DD path]. Detect conflicts across all Design Docs after the update."
   - When `sync_status: conflicts_found`: present conflicts to the user; resolution requires re-invoking technical-designer-frontend for affected DDs.

4. After Step 5d completes:
   - If the user selected `d` for all findings (no `c` routes) → skip Steps 6-8, proceed to Step 9 for re-validation
   - If the user selected both `d` and `c` → re-evaluate the `c`-routed findings against the updated DD and drop any that are now satisfied by the DD revision; then proceed to Step 6 with the remaining `c` findings

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
- `prompt`: "Re-validate Design Doc compliance after fixes. Design Doc: [path]. Implementation files: [file list]. Prior compliance issues: $STEP_2_OUTPUT. Verify each prior issue is resolved (whether resolved code-side or design-side)."

### Step 10: Re-validate security-reviewer

Invoke security-reviewer using Agent tool (only if security fixes were applied):
- `subagent_type`: "dev-workflows-frontend:security-reviewer"
- `description`: "Re-validate security"
- `prompt`: "Re-validate security after fixes. Prior findings: $STEP_3_OUTPUT. Design Doc: [path]. Implementation files: [file list]."

### Step 11: Final Cleanup and Report

Delete the review-fix task file this recipe created (if any). Its work is committed; `docs/plans/` is ephemeral working state and is not retained between recipe runs:

- Delete `docs/plans/tasks/review-fixes-YYYYMMDD.md` if it exists

If the file cannot be deleted (filesystem error), report the failure but do not block the final report.

Then present the final report:

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

Cleanup: review-fixes task file removed
```

## Auto-fixable Items (code-side path)
- Simple unimplemented acceptance criteria
- Error handling additions
- Contract definition fixes
- Function splitting (length/complexity improvements)
- Security confirmed_risk and defense_gap fixes (input validation, auth checks, output encoding)

## Non-fixable Items
- Fundamental business logic changes
- Architecture-level modifications
- Committed secrets (blocked → human intervention)

## Design-Side Update Triggers
Discrepancies suitable for the design-side path (code is correct, DD became stale):
- Identifier renames where the new identifier reflects the team's current naming
- Behavioral changes that match the original requirement intent better than what the DD captured
- Component splits or merges where the new structure is sound and the DD documented the prior structure
- New ACs that the implementation already satisfies but the DD never enumerated

**Scope**: Design Doc compliance validation, security review, code-side auto-fixes, and design-side update routing.

## Scope Boundary for Subagents

Append the following block to every subagent prompt invoked from this recipe:

```
Scope boundary for subagents:
Operate within the review scope and referenced files in the prompt.
Use loaded skills to execute that scope.
Escalate when the required fix or investigation falls outside that scope.
```

