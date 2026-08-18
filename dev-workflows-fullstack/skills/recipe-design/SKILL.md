---
name: recipe-design
description: Execute from codebase-scoped analysis through optional ADR decisions to complete Design Doc approval
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: documentation-criteria before document routing or creation.
Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before invoking agents or resolving findings.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

## Outcome and Ownership

Coordinate the design phase from repository evidence to an approved Design Doc. The orchestrator owns requirement convergence, Structural Scale, ADR qualification, evidence selection, and Review Resolution. Named specialists own semantic investigation and artifact authorship.

The Design Doc is always the complete implementation design for Medium/Large work. A qualifying ADR batch narrows technical choices before the Design Doc, which retains the complete flow and implementation boundary.

Requirements: $ARGUMENTS

## Flow

```text
requirement source -> codebase-analyzer -> scope/decision confirmation [Stop]
                                             |
                               optional ADR batch -> batch review [Stop]
                                             |
                 Design Doc -> code-verifier -> Review Resolution
                                             |
                     document-reviewer -> design-sync -> approval [Stop]
```

Execute each dependent step after its prerequisite evidence exists. Use Review Resolution for every actionable verifier, reviewer, or design-sync finding. Wait at each `[Stop]` for explicit user confirmation.

At each `Invoke` below, build the Agent prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

## Step 1: Select the Governing Requirement Source

Use the approved PRD path when one exists. Otherwise use the confirmed requirements verbatim.

Set `confirmed_requirement_context` to the approved PRD path exactly. Only when no approved PRD exists, use the orchestrator-confirmed convergence record unchanged.

## Step 2: Collect Decision Material

Invoke `dev-workflows-fullstack:codebase-analyzer`:

```text
prd_path: [approved PRD path]
```

or, when no approved PRD exists:

```text
requirements: [confirmed requirements verbatim]
```

Invoke once for the complete confirmed scope. Require one valid JSON result and let the analyzer discover affected paths, responsibility boundaries, and cross-layer contracts. Treat its focus areas as existing-behavior safeguards, not as new requirements.

This independent discovery keeps scope and option convergence grounded in repository evidence rather than the orchestrator's unverified implementation hypothesis.

## Step 3: Confirm Scope and ADR Decisions

Execute Skill: requirement-convergence. The orchestrator builds and judges the convergence record from the user request and Step 2 evidence.

Judge all four convergence fields. Assign `cost` from Step 2 structural evidence and record its unknowns; run the hearing only for fields below `ready`.

Determine Structural Scale from outcomes and responsibility boundaries. File count is supporting evidence only.

Resolve `decisionMaterials.candidateDecisionPoints` against the governing requirement source, `reuse`, and `invalidations`. Remove a point when that evidence already converges on one sufficient approach. For each remaining item, apply documentation-criteria filters in order:

1. Choice requires judgment between at least two credible, materially distinct options inside confirmed scope.
2. The selection has durable material impact.

Record every passing item as `adrDecisionPoints`; an empty list routes directly to the Design Doc. ADR creation is limited to items that pass both filters.

Present:

- confirmed outcome and requirements;
- cost band, structural evidence, and remaining unknowns;
- exclusions;
- target responsibilities and strongest file evidence;
- Structural Scale and its boundary rationale;
- each qualifying ADR decision point with filter evidence, or `none`;
- material unknowns whose answers change the confirmed outcome or scope.

Offer proceed, or correct scope and re-run analysis. Ask a question only when its answer can change a convergence field, the confirmed outcome, or scope. Continue only when every convergence field is `ready` or `weak-but-explicit`. `[Stop: Scope confirmation]`.

## Step 4: Create and Approve an ADR Batch When Needed

When `adrDecisionPoints` is non-empty:

1. Invoke `dev-workflows-fullstack:technical-designer` once with exact inputs: `document_to_create: ADRBatch`; `confirmed_requirement_context`; `decision_points` as the ordered `adrDecisionPoints` confirmed in Step 3, unchanged; and `decision_materials` as the corresponding objects from Step 2 `decisionMaterials.candidateDecisionPoints`, copied unchanged in that order.
2. Invoke `dev-workflows-fullstack:document-reviewer` once with exact inputs: `doc_type: ADRBatch`, `targets: [all returned paths]`, and `confirmed_requirement_context`.
3. Route the reviewer verdict first: `approved` proceeds with `issues: []`; `needs_revision` applies Review Resolution, updates one ADR per path serially, and re-reviews the complete batch; `rejected` resolves the governing-source conflict before another review.
4. Present one batch decision only after an `approved` review. `[Stop: ADR batch approval]`.
5. After user approval, update each ADR status to `Accepted` and verify the changed status.

## Step 5: Create the Design Doc

Create the complete MVP implementation design from reviewed artifacts and unchanged repository evidence; this keeps the Design Doc traceable to approved sources instead of an orchestrator-authored shadow design.

Invoke `dev-workflows-fullstack:technical-designer` with exactly:

- `document_to_create: DesignDoc`;
- `confirmed_requirement_context`;
- `structural_scale`;
- `adr_paths: [accepted paths or []]`;
- `codebase_analysis: [complete Step 2 JSON unchanged]`.

The Design Doc owns the full end-to-end design and retains all applicable downstream safeguards in the documentation-criteria template.

## Step 6: Verify and Resolve Repository Claims

Keep verifier observations unchanged so corrections remain traceable to observed repository evidence instead of becoming orchestrator-authored design instructions.

Invoke `dev-workflows-fullstack:code-verifier` with `doc_type: design-doc` and the Design Doc path to verify current premises and feasibility while treating planned behavior as intent.

Apply Review Resolution to every discrepancy before document review. Send only `apply` findings to technical-designer in update mode and rerun code-verifier after a correction. Build the single `verification_evidence` object defined by Review Resolution from the latest result and continue at its convergence condition.

## Step 7: Review and Approve

Invoke `dev-workflows-fullstack:document-reviewer` with exact inputs: `doc_type: DesignDoc`, `target`, `review_context: creation`, the original user requirements verbatim as `requirements_verbatim`, `confirmed_requirement_context`, `codebase_analysis`, and `verification_evidence` from Step 6.

- `approved`: continue.
- `needs_revision`: apply Review Resolution, update through technical-designer, then rerun Steps 6-7 for the affected boundary.
- `rejected`: resolve the governing-source conflict; ask the user only when it changes the product outcome or a major approved decision.

Invoke `dev-workflows-fullstack:design-sync` for consistency with other Design Docs and apply Review Resolution to actionable conflicts. Report `SKIPPED` distinctly when only one Design Doc exists.

Present the Design Doc, accepted ADR paths, resolved limitations/declines, and design-sync result. `[Stop: Design approval]`.

## Completion Criteria

- Scope and Structural Scale were confirmed from outcomes and responsibility boundaries.
- ADRs exist only for decision points passing both filters, and the complete batch received one review and approval.
- A Design Doc exists regardless of whether ADRs were needed.
- Applicable existing-behavior, contract, assumption, equivalence, and verification safeguards reached the Design Doc.
- Review Resolution routed only `needs_revision` issues into correction work.
- All stop points received explicit user confirmation.
