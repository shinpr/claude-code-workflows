---
name: recipe-front-design
description: Execute from repository evidence through applicable UI Spec and optional ADR decisions to complete frontend Design Doc approval
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: documentation-criteria before document routing or creation.
Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before invoking agents or resolving findings.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

## Outcome and Ownership

Coordinate a Medium/Large frontend design from evidence to an applicable UI Spec and approved Design Doc. The orchestrator owns requirement convergence, Structural Scale, document routing, ADR qualification, evidence selection, and Review Resolution. Named specialists own semantic investigation and artifacts.

The frontend Design Doc always carries the complete implementation design. An ADR batch narrows qualifying technical choices; an applicable UI Spec owns UI structure and behavior that remain to be designed.

Requirements: $ARGUMENTS

## Flow

```text
requirement source -> codebase-analyzer -> scope/document routing confirmation [Stop]
                                               |
                             conditional UI analysis -> UI Spec review [Stop]
                                               |
                                   optional ADR batch/review [Stop]
                                               |
              Design Doc -> code-verifier/Resolution -> document-reviewer
                                               |
                               design-sync -> approval [Stop]
```

Use Review Resolution for every actionable finding. Wait at each `[Stop]` for explicit user confirmation.

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

## Step 1: Select the Governing Requirement Source

Use the approved PRD path when one exists. Otherwise use the confirmed requirements verbatim.

Set `confirmed_requirement_context` to the approved PRD path exactly. Only when no approved PRD exists, use the orchestrator-confirmed convergence record unchanged.

## Step 2: Collect Repository Decision Material

Invoke `dev-workflows-fullstack:codebase-analyzer` once for the complete confirmed scope with exactly `prd_path: [approved PRD path]`, or `requirements: [confirmed requirements verbatim]` when no approved PRD exists.

Require one valid JSON result and let the analyzer discover affected paths, responsibility boundaries, and cross-layer contracts. Treat `focusAreas` as existing-behavior safeguards rather than requirements.

This independent discovery keeps scope and option convergence grounded in repository evidence rather than the orchestrator's unverified implementation hypothesis.

## Step 3: Determine UI Spec Applicability and Resolve UI Evidence

Apply the documentation-criteria UI Spec creation condition. When it does not apply, skip UI analysis and Step 5.

When a UI Spec applies, load and apply `external-resource-context` only when an external resource can change the current UI direction, component contract, or verification boundary. Otherwise use `external_resource_refs: []`.

Ask for prototype code only when it supplies an unresolved approved UI decision or the target cannot be determined from requirements, repository UI, and recorded resources. A missing optional prototype is not a stop condition.

Invoke `dev-workflows-fullstack:ui-analyzer` with exactly one governing source:

```text
prd_path: [approved PRD path]
```

or, when no approved PRD exists:

```text
requirements: [confirmed requirements verbatim]
```

Add only an existing `ui_spec_path`, a decision-relevant `prototype_path`, and selected `external_resource_refs` or `[]`.

```text
ui_spec_path: [existing UI Spec path]
prototype_path: [decision-relevant path]
external_resource_refs: [selected references or []]
```

## Step 4: Confirm Scope and ADR Decisions

Execute Skill: requirement-convergence. Build and judge the convergence record from the governing requirement source, repository analysis, and applicable UI analysis.

Judge all four convergence fields. Assign `cost` from Step 2 structural evidence and record its unknowns; run the hearing only for fields below `ready`.

Determine Structural Scale from outcomes and responsibility boundaries; file count is supporting evidence only. Resolve candidate decision points against the governing source, `reuse`, and `invalidations`; applicable UI facts may support or contradict the remaining options. Apply documentation-criteria Choice and Durability filters only after this convergence and record passing points as `adrDecisionPoints`; an empty list is valid.

Present the confirmed outcome and requirements, cost band with its structural evidence and unknowns, exclusions, affected responsibilities, Structural Scale, UI Spec applicability, and qualifying ADR points or none. Offer proceed, or correct and re-run. Ask a question only when its answer can change a convergence field, the confirmed outcome, or scope. Continue only when every convergence field is `ready` or `weak-but-explicit`. `[Stop: Scope confirmation]`.

## Step 5: Create and Approve the UI Spec

Run this step only when Step 3 determined that a UI Spec applies.

Invoke `dev-workflows-fullstack:ui-spec-designer` with exact inputs:

```text
confirmed_requirement_context: [the value fixed in Step 1]
ui_analysis: [complete Step 3 UI analyzer JSON unchanged]
codebase_analysis: [complete Step 2 codebase-analyzer JSON unchanged]
prototype_path: [decision-relevant path from Step 3 exactly, or absent]
external_resource_refs: [selected Step 3 reference records unchanged, or []]
```

Invoke `dev-workflows-fullstack:document-reviewer` with exact inputs: `doc_type: UISpec` and `target` as the UI Spec path returned by ui-spec-designer, unchanged. `approved` presents the UI Spec with `issues: []`; `needs_revision` applies Review Resolution and re-reviews after correction; `rejected` resolves the governing-source conflict before another review. `[Stop: UI Spec approval]`.

## Step 6: Create and Approve an ADR Batch When Needed

When `adrDecisionPoints` is non-empty:

1. Route shared/backend-owned points to technical-designer first, then frontend-owned points to technical-designer-frontend. Invoke each owner with exact inputs: `document_to_create: ADRBatch`; `confirmed_requirement_context`; its ordered `decision_points` confirmed in Step 4, unchanged; `decision_materials` as the corresponding Step 2 `decisionMaterials.candidateDecisionPoints` objects copied unchanged in that order; and `ui_spec_path` only when the approved UI Spec constrains that owner's decision. Run owner batches serially so each batch allocates ADR numbers after the preceding batch exists.
2. Collect all returned paths and invoke `dev-workflows-fullstack:document-reviewer` once with exact inputs: `doc_type: ADRBatch`, `targets: [all paths]`, and `confirmed_requirement_context`. The reviewer follows the approved UI Spec cited by the ADRs when it can change the decision review.
3. Route the reviewer verdict first: `approved` proceeds with `issues: []`; `needs_revision` applies Review Resolution, updates one ADR per path serially, and re-reviews the complete batch; `rejected` resolves the governing-source conflict before another review.
4. Present one batch decision only after an `approved` review. `[Stop: ADR batch approval]`.
5. After user approval, set every ADR status to `Accepted` and verify the status update.

## Step 7: Create the Frontend Design Doc

Create the complete frontend MVP implementation design from reviewed artifacts and unchanged repository/UI evidence; this keeps the Design Doc traceable to approved sources instead of an orchestrator-authored shadow design.

Invoke `dev-workflows-fullstack:technical-designer-frontend` with exactly:

- `document_to_create: DesignDoc`;
- `confirmed_requirement_context`;
- `structural_scale`;
- applicable approved `ui_spec_path` exactly and selected external-resource reference records unchanged;
- `adr_paths: [accepted paths or []]`;
- `codebase_analysis: [complete Step 2 JSON unchanged]`;
- `ui_analysis: [complete Step 3 JSON unchanged; omit when absent]`.

The Design Doc owns the full component-to-service implementation and retains all applicable downstream safeguards.

## Step 8: Verify, Review, and Approve

Keep verifier observations unchanged so corrections remain traceable to observed repository evidence instead of becoming orchestrator-authored design instructions.

Invoke `dev-workflows-fullstack:code-verifier` with `doc_type: design-doc` and `document_path` as the Design Doc path returned by technical-designer-frontend, unchanged, to verify current premises and feasibility while treating planned behavior as intent. Apply Review Resolution before document review; update through technical-designer-frontend, rerun verification after an applied correction, and build one `verification_evidence` object from the latest result. Continue at the Review Resolution convergence condition.

Invoke `dev-workflows-fullstack:document-reviewer` with exact inputs: `doc_type: DesignDoc`; `target` as the returned Design Doc path unchanged; `review_context: creation`; original user requirements unchanged as `requirements_verbatim`; the Step 1 `confirmed_requirement_context` unchanged; the same unchanged `codebase_analysis` and optional `ui_analysis` supplied to the designer; and Step 8 `verification_evidence` unchanged. The reviewer follows an applicable UI Spec and accepted ADR paths cited by the Design Doc only when they can change an in-scope finding.

- `approved`: continue.
- `needs_revision`: apply Review Resolution, update through technical-designer-frontend, and rerun verification/review for the affected boundary.
- `rejected`: resolve the governing-source conflict; ask the user only when product outcome or a major approved decision must change.

Invoke `dev-workflows-fullstack:design-sync` with `source_design` as the returned Design Doc path unchanged, apply Review Resolution to actionable conflicts, and report `SKIPPED` distinctly when only one Design Doc exists.

Present the applicable UI Spec, Design Doc, accepted ADR paths, resolved limitations/declines, and sync result. `[Stop: Design approval]`.

## Completion Criteria

- External and prototype evidence was requested only when it controlled a current decision.
- Scope and Structural Scale were confirmed from outcomes and responsibility boundaries.
- ADRs exist only for points passing both filters, and the batch received one review and approval.
- An applicable UI Spec and a complete frontend Design Doc exist regardless of ADR need.
- Applicable existing UI behavior, contracts, assumptions, states, equivalence, and verification safeguards reached the Design Doc.
- Review Resolution routed only `needs_revision` issues into correction work.
- All stop points received explicit user confirmation.
