# Review Resolution

Use this protocol when a deliverable reviewer or verifier returns findings that can route correction or progression. Verification output used as evidence by a downstream specialist remains part of that specialist handoff.

Preserve reviewer/verifier evidence ownership so each gate converges on the governing sources; orchestrator reinterpretation would create unreviewed requirements and make approval or reconciliation non-terminal.

## Verdict Gate

Route a document-reviewer result in this order:

- a `rejected` verdict first resolves its governing-source conflict through source precedence or the parent workflow's requirement or authority gate before another review, regardless of its issue set.
- an empty actionable issue set completes the review; downstream consumers receive the reviewed artifact path and pre-existing governing evidence only.
- a non-empty actionable issue set continues to section 1.

After `rejected` precedence, issue evidence governs routing when `approved` or `needs_revision` differs from the issue set. A completed review creates no author correction or downstream semantic input.

For verifier, design-sync, code-reviewer, security-reviewer, and integration-test-reviewer results, enter section 1 only for the status or findings that their caller contract routes to correction.

Use the result producer's declared verification mode:

- **Reconciliation reviewer**: document-reviewer, code-reviewer, security-reviewer, and integration-test-reviewer accept `prior_feedback` and return `prior_feedback_reconciliation` after correction.
- **Fresh verifier**: code-verifier and design-sync independently report the current state from their original inputs. After a correction is applied from a fresh verifier's result, rerun that verifier and adjudicate the current result; a decline-only result is complete.

## 1. Assess Every Finding

Before assigning a disposition, inspect the relevant parts of the current deliverable, cited repository evidence, and governing sources, treating reviewer assertions as evidence to verify.

When evidence shows that the confirmed outcome, desired-future requirements, and non-goals cannot all remain true and the user must choose which value boundary changes, leave Review Resolution and apply the parent workflow's Requirement Change Detection. When correction requires authorization for an irreversible external action, leave Review Resolution and apply the parent workflow's authority gate. These workflow stops are not finding dispositions.

The orchestrator records one disposition for every actionable finding:

| Disposition | Use when |
|---|---|
| `apply` | Leaving the current deliverable unchanged would prevent the confirmed outcome, violate a binding requirement, design decision, or repository rule, leave required correctness or verification unsupported, or commit downstream work to added design surface whose total complexity lacks current evidence. |
| `decline` | Leaving the current deliverable unchanged still achieves the confirmed outcome and satisfies binding constraints and required correctness and verification; the finding instead proposes added scope, a reversed exclusion, optional hardening or generic cleanup, duplicate proof, depends on a property outside the reviewer's declared artifact boundary, or concerns other work outside that boundary. |

A confirmed security risk, implementation divergence, or governing-source contradiction receives `apply` when correction preserves the confirmed value boundaries; cost alone leaves that classification unchanged. Technical design, contract, or implementation changes are correction work rather than user decisions when those boundaries remain true.

For each finding record:

- stable finding ID;
- disposition;
- governing basis and concrete evidence;
- the reason when `decline`.

The disposition controls routing. For `apply`, forward the complete reviewer finding object exactly as returned, preserving every field and value, and add only the `apply` disposition. This verbatim transfer keeps correction grounded in reviewed evidence; an orchestrator-authored paraphrase or supplement would become an unreviewed requirement. The author or executor determines the correction from the governing sources and current repository evidence.

Only findings with `apply`, and maintained `apply` findings under section 3, enter an author or executor handoff.

## 2. Revise and Reconsider

Select the existing correction owner from the accepted state each finding requires:

- use the owning document author when the implementation already satisfies the confirmed value boundaries and the technical artifact must change;
- use the executor when the implementation must change to reach the accepted state.

For a mixed set, complete author-owned corrections first and re-evaluate executor-owned findings against the corrected governing artifact. Pass complete `apply` finding objects verbatim with their dispositions to the selected owner. Invoke a document author as a fresh update call with the original target and those findings; the artifact supplies unaffected context. When an executor is used, preserve its original `task_file` or four direct-scope fields and add the findings as `correction_findings`; correction remains inside the original execution scope.

For an applied Design Doc finding about an unverified decision-changing premise, the fresh technical-designer invocation applies its bounded self-verification gate. The finding carries the exact premise and required evidence; the designer selects existing evidence, a smaller design valid under every unresolved outcome, or a probe when all gate conditions hold. Rerun the originating verifier or reviewer after the update.

For a reconciliation reviewer, reuse the initial reviewer inputs and add `prior_feedback` as an array of `{ id, disposition, reason?, evidence }`.

The correction assessment covers exactly every received item. The reviewer completes that scope and then:

- mark an applied item `resolved` when current evidence shows that the artifact satisfies the finding and preserves the changed boundary; otherwise mark that item `maintained`, citing current evidence;
- mark a declined finding `withdrawn` when current evidence and governing sources no longer support it; otherwise mark that item `maintained`, citing current evidence;
- emit exactly one `prior_feedback_reconciliation` entry for every received ID.

Derive the correction re-review status or verdict only from these reconciliation entries. An independent factual verifier may repeat an observed discrepancy; the orchestrator assigns its disposition from governing evidence.

For a fresh verifier, rerun after at least one correction is applied from its latest result or when the caller's re-run rule requires a current-state result. The latest result replaces the prior current-state result for corrected items. Retain a prior decline when the latest result reports the materially same claim or conflict with unchanged governing evidence; adjudicate new or materially changed findings before routing. Match materially identical findings by their claim/conflict and cited source/target evidence rather than relying only on a regenerated positional ID.

## 3. Converge or Report

Resolve correction re-review entries by their recorded `prior_disposition`:

- `resolved` and `withdrawn` are complete;
- `maintained` with `prior_disposition: apply` returns the original finding and the complete reconciliation entry verbatim through the same author or executor path, followed by another correction re-review;
- `maintained` with `prior_disposition: decline` retains that decline and does not reopen the correction cycle.

For a fresh verifier, a current finding with `apply` returns through the correction path, a current finding with a retained or newly assigned `decline` is complete, and an empty actionable result is complete.

After the same `apply` finding remains material through two consecutive correction attempts, finish the correction cycle as incomplete and report the finding with its latest implementation and verification evidence. Apply the same terminal report to a required input or verification prerequisite that remains unavailable after in-scope recovery. Progress after every `apply` correction is complete and every other actionable finding has a `decline` disposition. The parent requirement and authority gates independently control their workflow stops.

Handoffs contain this exact set:

- the original review target identifier;
- initial reviewer or verifier inputs unchanged when rechecking;
- complete `apply` finding objects verbatim, with only their orchestrator dispositions added;
- the complete reconciliation entry when a maintained `apply` finding returns to its author or executor;
- declined IDs with reasons and evidence in `prior_feedback` when the next consumer accepts reviewer reconciliation; for a fresh verifier, retain those dispositions in orchestrator state and compare them with the latest result as described above.

An author handoff contains no other orchestrator-authored semantic content.

The final user report lists every declined actionable finding with its ID, governing reason, and evidence.

## Resolved Verification Evidence

After Review Resolution completes for code-verifier output, pass one `verification_evidence` object to the next document reviewer:

- start from the latest verifier result after every applied correction and rerun;
- preserve its `summary`, `inventoryCoverage`, and `limitations` unchanged;
- preserve each remaining discrepancy unchanged and add its `disposition`, plus `dispositionReason` and `dispositionEvidence` for a decline;
- include remaining discrepancies only after each carries a resolved `decline` disposition; applied corrections are represented by the latest verifier result.

The document reviewer consumes this resolved evidence but does not own verifier-disposition convergence. Update and reverse-engineer flows may pass the current verifier result as `verification_evidence` before correction resolution when that result is the evidence being reviewed.
