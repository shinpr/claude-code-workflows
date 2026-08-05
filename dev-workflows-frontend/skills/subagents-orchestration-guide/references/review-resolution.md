# Review Resolution

Use this protocol when a deliverable reviewer or verifier returns findings that can route correction, progression, or escalation. Verification output used as evidence by a downstream specialist remains part of that specialist handoff.

Preserve reviewer/verifier evidence ownership so each gate converges on the governing sources; orchestrator reinterpretation would create unreviewed requirements and make approval or reconciliation non-terminal.

## Verdict Gate

Route a document-reviewer result before assessing issues:

- `approved`: complete the review with `issues: []`; downstream consumers receive the approved artifact path and pre-existing governing evidence only.
- `needs_revision`: continue to section 1 with the returned issues.
- `rejected`: resolve the governing-source conflict or user-held decision before another review.

Treat `approved` with non-empty `issues`, or `needs_revision` with empty `issues`, as an invalid reviewer result and re-invoke document-reviewer with the same inputs for a contract-correct result. An approved review creates no author correction or downstream semantic input.

For verifier, design-sync, code-reviewer, security-reviewer, and integration-test-reviewer results, enter section 1 only for the status or findings that their caller contract routes to correction.

## 1. Assess Every Finding

Before assigning a disposition, inspect the relevant parts of the current deliverable, cited repository evidence, and governing sources, treating reviewer assertions as evidence to verify.

The orchestrator records one disposition for every actionable finding:

| Disposition | Use when |
|---|---|
| `apply` | Leaving the current deliverable unchanged would prevent the confirmed outcome, violate a binding requirement, design decision, or repository rule, or leave required correctness or verification unsupported. |
| `decline` | Leaving the current deliverable unchanged still achieves the confirmed outcome and satisfies binding constraints and required correctness and verification; the finding instead proposes added scope, a reversed exclusion, optional hardening or generic cleanup, duplicate proof, depends on a property outside the reviewer's declared artifact boundary, or concerns other work outside that boundary. |
| `user_decision_required` | Resolving the finding would change a confirmed product outcome, exclusion, major approved design decision, or requires authority held only by the user. |

A confirmed security risk or governing-source contradiction receives `apply` or `user_decision_required`; cost alone leaves that classification unchanged.

For each finding record:

- stable finding ID;
- disposition;
- governing basis and concrete evidence;
- the reason when `decline`.

The disposition controls routing. For `apply`, forward the complete reviewer finding object exactly as returned, preserving every field and value, and add only the `apply` disposition. This verbatim transfer keeps correction grounded in reviewed evidence; an orchestrator-authored paraphrase or supplement would become an unreviewed requirement. The author or executor determines the correction from the governing sources. When those sources cannot determine a correction that requires user-held authority, assign `user_decision_required` and continue at section 3.

Only findings with `apply`, and maintained `apply` findings under section 3, enter an author or executor handoff.

## 2. Revise and Reconsider

Pass complete `apply` finding objects verbatim with their dispositions to the author or executor. On reviewer re-review, reuse the initial reviewer inputs and add `prior_feedback` as an array of `{ id, disposition, reason?, evidence }`.

The correction assessment covers exactly every received item. The reviewer completes that scope and then:

- mark an applied item `resolved` when current evidence shows that the artifact satisfies the finding and preserves the changed boundary; otherwise mark that item `maintained`, citing current evidence;
- mark a declined finding `withdrawn` when current evidence and governing sources no longer support it; otherwise mark that item `maintained`, citing current evidence;
- emit exactly one `prior_feedback_reconciliation` entry for every received ID.

Derive the correction re-review status or verdict only from these reconciliation entries. An independent factual verifier may repeat an observed discrepancy; the orchestrator assigns its disposition from governing evidence.

## 3. Converge or Escalate

Resolve correction re-review entries by their recorded `prior_disposition`:

- `resolved` and `withdrawn` are complete;
- `maintained` with `prior_disposition: apply` returns the original finding and the complete reconciliation entry verbatim through the same author or executor path, followed by another correction re-review;
- `maintained` with `prior_disposition: decline` retains that decline and does not reopen the correction cycle.

Escalate when the same ID with `prior_disposition: apply` returns `maintained` in two consecutive correction re-reviews, the disposition is `user_decision_required`, user-held authority is needed, an irreversible action awaits authorization, or required inputs are genuinely unusable. Progress after no `maintained` entry with `prior_disposition: apply` remains, every other actionable finding has a disposition, and every `user_decision_required` item has a recorded user decision.

Handoffs contain this exact set:

- the original review target identifier;
- initial reviewer inputs unchanged when re-reviewing;
- complete `apply` finding objects verbatim, with only their orchestrator dispositions added;
- the complete reconciliation entry when a maintained `apply` finding returns to its author or executor;
- declined IDs with reasons and evidence in `prior_feedback` when the next consumer accepts reviewer reconciliation.

An author handoff contains no other orchestrator-authored semantic content.

The final user report lists every declined actionable finding with its ID, governing reason, and evidence.

## Resolved Verification Evidence

After Review Resolution completes for code-verifier output, pass one `verification_evidence` object to the next document reviewer:

- start from the latest verifier result after every applied correction and rerun;
- preserve its `summary`, `inventoryCoverage`, and `limitations` unchanged;
- preserve each remaining discrepancy unchanged and add its `disposition`, plus `dispositionReason` and `dispositionEvidence` for a decline;
- include remaining discrepancies only after each carries a resolved `decline` disposition; applied corrections are represented by the latest verifier result.

The document reviewer consumes this resolved evidence but does not own verifier-disposition convergence. Update and reverse-engineer flows may pass the current verifier result as `verification_evidence` before correction resolution when that result is the evidence being reviewed.
