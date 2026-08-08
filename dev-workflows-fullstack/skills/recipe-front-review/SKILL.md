---
name: recipe-front-review
description: Design Doc compliance and security validation with optional auto-fixes
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Post-implementation quality assurance for React/TypeScript frontend

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**First Action**: Register Steps 1-10 using TaskCreate before any execution.

## Execution Method

- Compliance validation → performed by code-reviewer
- Security validation → performed by security-reviewer
- **Code-side fix path**: Fix implementation → task-executor-frontend; Quality checks → quality-fixer-frontend; Re-validation → code-reviewer / security-reviewer
- **Design-side update path**: DD revision → technical-designer-frontend (update mode); DD review → document-reviewer; cross-DD consistency → design-sync (when multiple DDs exist); Re-validation → code-reviewer

The design-side path applies when the discrepancy reflects code that was correct but the Design Doc became stale, rather than code that violated the Design Doc.

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

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
- `subagent_type`: "dev-workflows-fullstack:code-reviewer"
- `description`: "Code compliance review"
- `prompt`: "Design Doc: [path]. Implementation files: [git diff file list]. Review mode: full. Validate Design Doc compliance and return structured JSON report."

**Store output as**: `$STEP_2_OUTPUT`

### Step 3: Execute security-reviewer
Invoke security-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:security-reviewer"
- `description`: "Security review"
- `prompt`: "governingDocuments: [{\"type\":\"design-doc\",\"path\":\"[path]\"}]. implementationFiles: [git diff file list]. Review security compliance."

**Store output as**: `$STEP_3_OUTPUT`

### Step 4: Verdict and Response

**If security-reviewer reports a limitation**: Apply subagents-orchestration-guide Specialist Result Acceptance. Route findings from their substance and repository evidence, carry unavailable verification into the report, and present only a user-owned decision or unavailable authority to the user.

Apply the Review Resolution Gate to both outputs before reporting or routing them. Finding dispositions determine routing.

For each `apply` or `user_decision_required` finding, compute a proposed route using the rule below:

| Finding pattern | Recommended route |
|-----------------|-------------------|
| `dd_violation` where the code intent matches the original requirement but the Design Doc captured a different design | `d` (Design-side update) |
| `dd_violation` where the code drifted from a still-correct Design Doc | `c` (Code-side fix) |
| `reliability` / `security` / `maintainability` findings | `c` (Code-side fix) |

Then present the adjudicated result to the user. Group `apply` and `user_decision_required` findings by proposed route, and list declined IDs with their reasons separately:

```
Code Review: [verdict from code-reviewer]
  Acceptance Criteria:
  - [fulfilled] [item] (confidence: [high/medium/low])
  - [unfulfilled] [item]: [gap] — [suggestion] [recommended: c | d]
  Identifier Mismatches:
  - [identifier]: DD=[designDocValue] Code=[codeValue] at [location] [recommended: c | d]
  Quality Findings:
  - [category] [location]: [description] — [rationale] [recommended: c]

Security Review: [status from security-reviewer]
  Findings by category:
  - [confirmed_risk] [location]: [description] — [rationale] [recommended: c]
  - [defense_gap] [location]: [description] — [rationale] [recommended: c]

Approve the proposed changes or decide unresolved items:
  c) Code-side fix       — code violates Design Doc; modify code to match
  d) Design-side update  — code is correct; Design Doc is stale, revise it
  s) Decline             — record the governing reason and accept current state
```

This review command authorizes analysis; use AskUserQuestion to obtain separate implementation authority. The batch option is **"approve all proposed `apply` routes"** and its scope consists exclusively of those routes. Collect an explicit decision for each `user_decision_required` item. When the approved change set is empty, proceed directly to Step 10.

Pass approved findings, routes, covered files/sections, and any stated total size budget to update or fix agents. Before re-validation, map every diff hunk to an approved finding or required consistency update; request a scope decision for unmapped or over-budget changes.

### Step 5: Design-Side Update

Run this step only when the user routed at least one finding to `d`. When no `d` routes exist, skip it; continue to Step 6 only when approved `c` routes remain.

1. Invoke technical-designer-frontend in update mode using Agent tool:
   - `subagent_type`: "dev-workflows-fullstack:technical-designer-frontend"
   - `description`: "Design Doc update from review findings"
   - `prompt`: "Update Design Doc at [path] in update mode. Ratify these findings in the design rather than the code: [complete `d`-routed finding objects from $STEP_2_OUTPUT, unchanged except for their approved routes]. Reflect the current code behavior in the relevant sections and add a history entry."

2. Invoke document-reviewer to verify the updated Design Doc:
   - `subagent_type`: "dev-workflows-fullstack:document-reviewer"
   - `description`: "Document review of updated Design Doc"
   - `prompt`: "Review updated Design Doc at [path] for consistency and completeness. doc_type: DesignDoc. review_context: update."
   - Run the Review Resolution Gate through its correction re-review, escalation, and convergence transitions, using technical-designer-frontend for rerouted corrections. Proceed only at its convergence condition.

3. When multiple Design Docs exist (`ls docs/design/*.md | grep -v template | wc -l > 1`), invoke design-sync:
   - `subagent_type`: "dev-workflows-fullstack:design-sync"
   - `description`: "Cross-DD consistency check"
   - `prompt`: "source_design: [updated DD path]"
   - When `sync_status: CONFLICTS_FOUND`, apply the Review Resolution Gate using design-sync as a fresh verifier. Send the `apply` conflicts to the owning technical designer, rerun design-sync after correction, retain evidenced declines as complete, and request user input for `user_decision_required` or the Gate's escalation conditions.

4. After Step 5 completes:
   - If the user selected `d` for all findings (no `c` routes) → skip Steps 6-7, proceed to Step 8 for re-validation
   - If the user selected both `d` and `c` → re-evaluate the `c`-routed findings against the updated DD and drop any that are now satisfied by the DD revision; then proceed to Step 6 with the remaining `c` findings

### Step 6: Execute Fixes

Invoke task-executor-frontend using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:task-executor-frontend"
- `description`: "Execute review fixes"
- `direct_scope`: Apply the approved frontend corrections within the confirmed review scope and stated total size budget
- `governing_sources`: The reviewed Design Doc, applicable UI Spec, and accepted requirement or ADR paths
- `target_paths`: The implementation and test paths confirmed for the approved code-side routes
- `observable_verification`: The focused UI behavior tests or observable contract checks named by the findings and governing sources pass
- `correction_findings`: Complete reviewer finding objects verbatim, with only their orchestrator dispositions added

### Step 7: Quality Check

Invoke quality-fixer-frontend using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:quality-fixer-frontend"
- `description`: "Quality gate check"
- Pass Step 6 `mutationEvidence`.
- `prompt`: "Confirm quality gate passage for fixed files."

Route the quality-fixer-frontend result:
- `approved` → Proceed to Step 8
- `stub_detected` → Return to Step 6 with `incompleteImplementations` unchanged, then repeat Step 7
- `verification_incomplete` → Retain the complete result and proceed to Step 8
- `blocked` → Apply Specialist Result Acceptance

### Step 8: Re-validate code-reviewer

Invoke code-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:code-reviewer"
- `description`: "Re-validate compliance"
- `prompt`: "Re-validate Design Doc compliance after fixes. Design Doc: [path]. Implementation files: [file list]. prior_feedback: [{id, disposition, reason?, evidence}]. Reconcile every prior item under the reviewer's re-review scope."

### Step 9: Re-validate security-reviewer

Invoke security-reviewer using Agent tool (only if security fixes were applied):
- `subagent_type`: "dev-workflows-fullstack:security-reviewer"
- `description`: "Re-validate security"
- `prompt`: "Re-validate security after fixes. governingDocuments: [{\"type\":\"design-doc\",\"path\":\"[path]\"}]. implementationFiles: [file list]. prior_feedback: [{id, disposition, reason?, evidence}]. Reconcile every prior item under the reviewer's re-review scope."

Apply the Review Resolution Gate to every Step 8 and Step 9 result before Step 10. Follow its `maintained` transitions and repeat the affected verification after a rerouted correction; stop at its escalation conditions; proceed at its convergence condition.

Before Step 10, retry each retained quality-fixer-frontend limitation once with the same Step 7 inputs and affected check. Clear an `approved` result, route newly discovered incomplete implementation through Steps 6-9, and report a repeated `verification_incomplete` result. When the retry changes the repository, repeat Steps 8-9 for the changed code before reporting.

### Step 10: Final Report

Present the final report:

```
Code Review:
  Initial: [verdict from code-reviewer]
  Correction review: [verdict for the re-review scope] (if fixes executed)
  Reconciliation: [resolved / withdrawn / maintained by finding ID]

Security Review:
  Initial: [status]
  Correction review: [status for the re-review scope] (if fixes executed)
  Reconciliation: [resolved / withdrawn / maintained by finding ID]

Quality Check:
  Final: [approved / verification_incomplete / not_run when no code-side fixes were selected]

Remaining proof limitations:
- [reason — affected check and evidence] (only when repeated after retry)

Declined actionable findings:
- [ID: governing reason — evidence] (only when any were declined)

Remaining issues:
- [items requiring manual intervention]
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
