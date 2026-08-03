---
name: recipe-review
description: Design Doc compliance and security validation with optional auto-fixes
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Post-implementation quality assurance

## Orchestrator Definition

**Core Identity**: "I am an orchestrator."

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression; include declined IDs with governing reasons and evidence in the final user report.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**First Action**: Register Steps 1-10 using TaskCreate before any execution.

## Execution Method

- Compliance validation → performed by code-reviewer
- Security validation → performed by security-reviewer
- **Code-side fix path**: Fix implementation → task-executor; Quality checks → quality-fixer; Re-validation → code-reviewer / security-reviewer
- **Design-side update path**: DD revision → technical-designer (update mode); DD review → document-reviewer; cross-DD consistency → design-sync (when multiple DDs exist); Re-validation → code-reviewer

Orchestrator invokes sub-agents and passes structured JSON between them. The design-side path applies when the discrepancy reflects code that was correct but the Design Doc became stale, rather than code that violated the Design Doc.

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

**If security-reviewer returned `blocked`**: Stop immediately. Report the blocked finding and escalate to user. Do not proceed to fix steps.

Apply the Review Resolution Gate to both outputs before reporting or routing them. Finding dispositions determine routing; compliance percentages remain diagnostic.

For each `apply` or `user_decision_required` finding, compute a proposed route using the rule below:

| Finding pattern | Recommended route |
|-----------------|-------------------|
| `dd_violation` where the code intent matches the original requirement but the Design Doc captured a different design | `d` (Design-side update) |
| `dd_violation` where the code drifted from a still-correct Design Doc | `c` (Code-side fix) |
| `reliability` / `security` / `maintainability` findings | `c` (Code-side fix) |

Then present the adjudicated result to the user. Group `apply` and `user_decision_required` findings by proposed route, and list declined IDs with their reasons separately:

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

Approve the proposed changes or decide unresolved items:
  c) Code-side fix       — code violates Design Doc; modify code to match
  d) Design-side update  — code is correct; Design Doc is stale, revise it
  s) Decline             — record the governing reason and accept current state
```

This review command authorizes analysis; use AskUserQuestion to obtain separate implementation authority. The batch option is **"approve all proposed `apply` routes"** and its scope consists exclusively of those routes. Collect an explicit decision for each `user_decision_required` item. When the approved change set is empty, proceed directly to Step 10.

Pass approved findings, routes, covered files/sections, and any stated total size budget to update or fix agents. Before re-validation, map every diff hunk to an approved finding or required consistency update; request a scope decision for unmapped or over-budget changes.

### Step 5: Design-Side Update

Run this step only when the user routed at least one finding to `d`. When no `d` routes exist, skip it; continue to Step 6 only when approved `c` routes remain.

1. Invoke technical-designer in update mode using Agent tool:
   - `subagent_type`: "dev-workflows-fullstack:technical-designer"
   - `description`: "Design Doc update from review findings"
   - `prompt`: "Update Design Doc at [path] in update mode. The implementation has diverged in the following ways that the team has decided to ratify in the design rather than in the code: [list of `d`-routed findings with codeLocation and designDocValue from $STEP_2_OUTPUT]. Reflect the current code behavior in the relevant sections and add a history entry."

2. Invoke document-reviewer to verify the updated Design Doc:
   - `subagent_type`: "dev-workflows-fullstack:document-reviewer"
   - `description`: "Document review of updated Design Doc"
   - `prompt`: "Review updated Design Doc at [path] for consistency and completeness. doc_type: DesignDoc. review_context: update."
   - Apply the Review Resolution Gate to this result. Route `apply` findings back to technical-designer and re-run document-reviewer with `prior_feedback`; stop for unresolved `user_decision_required`; proceed when the result is approved or every actionable finding is `decline`.

3. When multiple Design Docs exist (`ls docs/design/*.md | grep -v template | wc -l > 1`), invoke design-sync:
   - `subagent_type`: "dev-workflows-fullstack:design-sync"
   - `description`: "Cross-DD consistency check"
   - `prompt`: "source_design: [updated DD path]. Detect conflicts across all Design Docs after the update."
   - When `sync_status: conflicts_found`: present conflicts to the user; resolution requires re-invoking technical-designer for affected DDs.

4. After Step 5 completes:
   - If the user selected `d` for all findings (no `c` routes) → skip Steps 6-7, proceed to Step 8 for re-validation
   - If the user selected both `d` and `c` → re-evaluate the `c`-routed findings against the updated DD and drop any that are now satisfied by the DD revision; then proceed to Step 6 with the remaining `c` findings

### Step 6: Execute Fixes

Invoke task-executor using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:task-executor"
- `description`: "Execute review fixes"
- `prompt`: "Apply these approved code-side findings directly: [findings with IDs, governing sources, smallest correction, affected paths, and observable verification condition]. Keep the change within the approved routes and stated total size budget."

### Step 7: Quality Check

Invoke quality-fixer using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:quality-fixer"
- `description`: "Quality gate check"
- Pass Step 6 `filesModified` and `mutationEvidence`.
- `prompt`: "Confirm quality gate passage for fixed files."

### Step 8: Re-validate code-reviewer

Invoke code-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:code-reviewer"
- `description`: "Re-validate compliance"
- `prompt`: "Re-validate Design Doc compliance after fixes. Design Doc: [path]. Implementation files: [file list]. prior_feedback: [{id, disposition, correction?, reason?, evidence}]. Review the current state normally, then reconcile every prior item."

### Step 9: Re-validate security-reviewer

Invoke security-reviewer using Agent tool (only if security fixes were applied):
- `subagent_type`: "dev-workflows-fullstack:security-reviewer"
- `description`: "Re-validate security"
- `prompt`: "Re-validate security after fixes. governingDocuments: [{\"type\":\"design-doc\",\"path\":\"[path]\"}]. implementationFiles: [file list]. prior_feedback: [{id, disposition, correction?, reason?, evidence}]. Review the current state normally, then reconcile every prior item."

Apply the Review Resolution Gate to every Step 8 and Step 9 result before Step 10. Route new `apply` findings through their approved design-side or code-side path and repeat the affected verification; stop for unresolved `user_decision_required`; proceed when each result is approved or every actionable finding is `decline`.

### Step 10: Final Report

Present the final report:

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
