# Review Resolution

Use this protocol when a deliverable reviewer or verifier returns findings that can route correction, progression, or escalation. Verification output used as evidence by a downstream specialist remains part of that specialist handoff.

The orchestrator treats the review result as evidence and makes the workflow decision from the governing sources.

## 1. Assess Every Finding

Before assigning a disposition, inspect the relevant parts of the current deliverable, cited repository evidence, and governing sources, treating reviewer assertions as evidence to verify.

The orchestrator records one disposition for every actionable finding:

| Disposition | Use when |
|---|---|
| `apply` | Leaving the current deliverable unchanged would prevent the confirmed outcome, violate a binding requirement, design decision, or repository rule, or leave required correctness or verification unsupported. |
| `decline` | Leaving the current deliverable unchanged still achieves the confirmed outcome and satisfies binding constraints and required correctness and verification; the finding instead proposes added scope, a reversed exclusion, optional hardening or generic cleanup, duplicate proof, or other work outside that boundary. |
| `user_decision_required` | Resolving the finding would change a confirmed product outcome, exclusion, major approved design decision, or requires authority held only by the user. |

A confirmed security risk or governing-source contradiction receives `apply` or `user_decision_required`; cost alone leaves that classification unchanged.

For each finding record:

- stable finding ID;
- disposition;
- governing basis and concrete evidence;
- expected effect on the approved outcome or verification;
- smallest correction when `apply`, or the reason when `decline`.

## 2. Revise and Reconsider

Pass `apply` findings to the author or executor. On reviewer re-review, provide `prior_feedback` as an array of `{ id, disposition, correction?, reason?, evidence }`. Re-run factual verifiers against the current artifact and adjudicate their current evidence.

The reviewer reviews the current artifact normally, then reconciles prior feedback:

- mark an applied correction `resolved` when the reviewed condition is satisfied;
- mark a declined finding `withdrawn` when current evidence and governing sources no longer support it;
- mark a finding `maintained` when current evidence still supports it, citing that evidence;
- report optional improvements through the reviewer's existing recommendation or note fields.

An independent factual verifier may repeat an observed discrepancy. The orchestrator assigns its disposition from governing evidence; a maintained finding cites current or new evidence.

## 3. Converge or Escalate

Escalate when the disposition is `user_decision_required`, user-held authority is needed, an irreversible action awaits authorization, or required inputs are genuinely unusable. Progress after no `apply` findings remain, every other actionable finding has a disposition, and every `user_decision_required` item has a recorded user decision.

Handoffs contain this exact set:

- affected paths;
- `apply` findings with basis and smallest correction;
- declined IDs with reasons and evidence in `prior_feedback` when the next consumer accepts reviewer reconciliation;
- the observable condition the next review must verify.

The final user report lists every declined actionable finding with its ID, governing reason, and evidence.
