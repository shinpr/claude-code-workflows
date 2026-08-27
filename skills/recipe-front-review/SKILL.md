---
name: recipe-front-review
description: Reviews completed frontend implementation for governing-source compliance, scope economy, repository quality, and security, then applies user-approved React corrections.
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Post-implementation quality assurance for React/TypeScript frontend

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Gate**: Complete Steps 1-10 in order, following only the branches activated by their stated conditions. Advance through each review, correction, and re-validation transition only at its declared convergence condition. Present the final report after every applicable finding and retained quality limitation reaches its required disposition or retry result.

## Execution Method

- Implementation review → performed by code-reviewer
- Security validation → performed by security-reviewer
- **Code-side fix path**: Fix implementation → task-executor-frontend; Quality checks → quality-fixer-frontend; Re-validation → code-reviewer / security-reviewer
- **Design-side update path**: DD revision → technical-designer-frontend (update mode); DD review → document-reviewer; cross-DD consistency → design-sync (when multiple DDs exist); Re-validation → code-reviewer

The design-side path applies when the discrepancy reflects code that was correct but the Design Doc became stale, rather than code that violated the Design Doc.

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

Design Doc: $ARGUMENTS

## Execution Flow

### Step 1: Prerequisite Check
Derive `implementationFiles` from paths changed between the current branch's merge base with the repository's default branch and the current repository state, including committed changes, working-tree changes, and untracked files. `implementationFiles` contains each changed path whose contents implement or verify the reviewed behavior or control its schema, build, deployment, or runtime behavior, including source files, tests, migrations, executable scripts, and behavior-affecting configuration. Governing documents and Work Plans retain their dedicated roles in document selection and governing-document inputs; task files and documentation-only paths remain outside this recipe's code and security review inputs.

Use the Design Doc explicitly supplied in `$ARGUMENTS`. When omitted, first use a Work Plan whose declared target files or responsibilities intersect `implementationFiles` and take its recorded Design Doc path. When that does not produce one candidate, use the sole Design Doc under `docs/design/`. Present candidates only when multiple governing Design Docs remain; report a missing prerequisite when none exists.

### Step 2: Execute code-reviewer
Invoke code-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-frontend:code-reviewer"
- `description`: "Completed frontend implementation review"
- `prompt`: "Review the completed frontend implementation. governingDocuments: [{\"type\":\"design-doc\",\"path\":\"[path]\"}]. implementationFiles: [implementationFiles]. Return the initial review JSON."

**Store output as**: `$STEP_2_OUTPUT`

### Step 3: Execute security-reviewer
Invoke security-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-frontend:security-reviewer"
- `description`: "Security review"
- `prompt`: "governingDocuments: [{\"type\":\"design-doc\",\"path\":\"[path]\"}]. implementationFiles: [implementationFiles]. Review security compliance."

**Store output as**: `$STEP_3_OUTPUT`

### Step 4: Verdict and Response

When either reviewer returns a blocked or otherwise unusable result, apply subagents-orchestration-guide Specialist Result Acceptance to its semantic cause. Carry only a remaining verification limitation into the report.

Apply the Review Resolution Gate to both outputs before reporting or routing them. Finding dispositions determine routing.

For each `apply` finding, compute a proposed route using the mutually exclusive rule below:

| Finding pattern | Recommended route |
|-----------------|-------------------|
| Resolution keeps the current implementation because it matches the original requirement and corrects a stale Design Doc | `d` (Design-side update) |
| Resolution requires changing implementation to reach the accepted state | `c` (Code-side correction) |

Then present the adjudicated result to the user. Group `apply` findings by proposed route and list declined IDs with their reasons:

```
Implementation Review: [verdict from code-reviewer]
  Acceptance Criteria:
  - [fulfilled] [item]: [evidence]
  - [unfulfilled] [item] -> [corresponding finding ID under Required Corrections]
  Required Corrections:
  - [id] [category] [location]: [description] — [basis and effect] [recommended: c | d]
  Limitations:
  - [unverified judgment and effect]

Security Review: [status from security-reviewer]
  Findings by category:
  - [confirmed_risk] [location]: [description] — [rationale] [recommended: c]
  - [defense_gap] [location]: [description] — [rationale] [recommended: c]

Approve the proposed changes:
  c) Code-side correction — change implementation to reach the accepted state
  d) Design-side update   — keep the accepted implementation and update the stale Design Doc
  s) Decline              — record the governing reason and accept current state
```

This review command authorizes analysis; use AskUserQuestion to obtain separate implementation authority. The batch option is **"approve all proposed `apply` routes"** and its scope consists exclusively of those routes. When the approved change set is empty, proceed directly to Step 10.

Pass approved findings, routes, covered files/sections, and any stated total size budget to update or fix agents. Before re-validation, map every diff hunk to an approved finding or required consistency update. Remove accidental unmapped changes; when a necessary change would alter a confirmed value boundary or explicit size constraint, return to Requirement Change Detection.

### Step 5: Design-Side Update

Run this step only when the user routed at least one finding to `d`. When no `d` routes exist, skip it; continue to Step 6 only when approved `c` routes remain.

1. Invoke technical-designer-frontend in update mode using Agent tool:
   - `subagent_type`: "dev-workflows-frontend:technical-designer-frontend"
   - `description`: "Design Doc update from review findings"
   - `prompt`: "Update Design Doc at [path] in update mode. Ratify these findings in the design rather than the code: [complete `d`-routed finding objects from $STEP_2_OUTPUT, unchanged except for their approved routes]. Reflect the current code behavior in the relevant sections and add a history entry."

2. Invoke document-reviewer to verify the updated Design Doc:
   - `subagent_type`: "dev-workflows-frontend:document-reviewer"
   - `description`: "Document review of updated Design Doc"
   - `prompt`: "Review updated Design Doc at [path] for consistency and completeness. doc_type: DesignDoc. review_context: update."
   - Run the Review Resolution Gate through its correction re-review and convergence transitions, using technical-designer-frontend for rerouted corrections. Proceed only at its convergence condition.

3. When more than one Design Doc exists under `docs/design/`, invoke design-sync:
   - `subagent_type`: "dev-workflows-frontend:design-sync"
   - `description`: "Cross-DD consistency check"
   - `prompt`: "source_design: [updated DD path]"
   - When `sync_status: CONFLICTS_FOUND`, apply the Review Resolution Gate using design-sync as a fresh verifier. Send the `apply` conflicts to the owning technical designer, rerun design-sync after correction, and retain evidenced declines as complete.

4. After Step 5 completes:
   - If the user selected `d` for all findings (no `c` routes) → skip Steps 6-7, proceed to Step 8 for re-validation
   - If the user selected both `d` and `c` → re-evaluate the `c`-routed findings against the updated DD and drop any that are now satisfied by the DD revision; then proceed to Step 6 with the remaining `c` findings

### Step 6: Execute Fixes

Invoke task-executor-frontend using Agent tool:
- `subagent_type`: "dev-workflows-frontend:task-executor-frontend"
- `description`: "Execute review fixes"
- `direct_scope`: Apply the approved frontend corrections within the confirmed review scope and stated total size budget
- `governing_sources`: The reviewed Design Doc, applicable UI Spec, and accepted requirement or ADR paths
- `target_paths`: The implementation and test paths confirmed for the approved code-side routes
- `observable_verification`: The focused UI behavior tests or observable contract checks named by the findings and governing sources pass
- `correction_findings`: Complete reviewer finding objects verbatim, with only their orchestrator dispositions added

### Step 7: Quality Check

Invoke quality-fixer-frontend using Agent tool:
- `subagent_type`: "dev-workflows-frontend:quality-fixer-frontend"
- `description`: "Quality gate check"
- Pass Step 6 `mutationEvidence`.
- `prompt`: "Confirm quality gate passage for fixed files."

Route the quality-fixer-frontend result:
- `approved` → Proceed to Step 8
- `stub_detected` → Return to Step 6 with `incompleteImplementations` unchanged, then repeat Step 7
- `verification_incomplete` → Retain the complete result and proceed to Step 8
- `blocked` → Apply Specialist Result Acceptance

### Step 8: Re-validate code-reviewer

Immediately before this invocation, re-derive `implementationFiles` using the Step 1 inclusion rule so it includes implementation artifacts added or changed by the approved corrections.

Invoke code-reviewer using Agent tool:
- `subagent_type`: "dev-workflows-frontend:code-reviewer"
- `description`: "Re-validate frontend implementation review"
- `prompt`: "Re-review the completed frontend implementation after approved corrections. governingDocuments: [{\"type\":\"design-doc\",\"path\":\"[path]\"}]. implementationFiles: [implementationFiles]. prior_feedback: [{id, disposition, reason?, evidence}]. Reconcile every received item."

### Step 9: Re-validate security-reviewer

Immediately before this invocation, re-derive `implementationFiles` using the Step 1 inclusion rule so it includes implementation artifacts added or changed by the approved corrections.

Invoke security-reviewer using Agent tool when subagents-orchestration-guide's post-implementation **Re-run rule** requires a current security result:
- `subagent_type`: "dev-workflows-frontend:security-reviewer"
- `description`: "Re-validate security"
- `prompt`: "Re-validate security after fixes. governingDocuments: [{\"type\":\"design-doc\",\"path\":\"[path]\"}]. implementationFiles: [implementationFiles]. prior_feedback: [{id, disposition, reason?, evidence}]. Reconcile every prior item under the reviewer's re-review scope."

Apply the Review Resolution Gate to every Step 8 and Step 9 result before Step 10. Follow its `maintained` transitions and repeat the affected verification after a rerouted correction; apply the parent requirement or authority gate when Review Resolution exits to it; proceed at its convergence condition.

Before Step 10, retry each retained quality-fixer-frontend limitation once with the same Step 7 inputs and affected check. Clear an `approved` result, route newly discovered incomplete implementation through Steps 6-9, and report a repeated `verification_incomplete` result. When the retry changes the repository, repeat Steps 8-9 for the changed code before reporting.

### Step 10: Final Report

Present the final report:

```
Implementation Review:
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

**Scope**: Completed frontend implementation review, security review, and user-approved correction routing.
