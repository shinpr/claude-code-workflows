# Fullstack (Monorepo) Flow

This reference defines the orchestration flow for one feature spanning backend and frontend responsibilities.

## When This Flow Applies

- The confirmed outcome requires backend and frontend implementation.
- Separate Design Docs are needed for layer ownership and cross-layer verification.
- The orchestrator is invoked through a fullstack implementation or build recipe.

## Design Phase

### Large Structural Scale Fullstack

| Step | Owner | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer + orchestrator | Scope/cost evidence followed by orchestrator convergence and Structural Scale judgment, then the requirements hearing **[Stop]** | Confirmed requirements + scale |
| 2 | prd-creator | PRD for the complete feature | PRD |
| 3 | document-reviewer | PRD review **[Stop]** | Approval |
| 4 | codebase-analyzer | Repository decision material for the complete feature, including layer boundaries and cross-layer contracts | Analysis JSON |
| 5 | orchestrator + ui-analyzer | Determine UI Spec applicability; collect external, prototype, and UI evidence only when applicable | UI analysis or none |
| 6 | ui-spec-designer | Applicable UI Spec from PRD and UI evidence | UI Spec or none |
| 7 | document-reviewer | Applicable UI Spec review **[Stop]** | Approval or skipped |
| 8 | orchestrator + technical-designer(s) | Apply ADR filters and create one ADR per qualifying decision point | ADR paths or `[]` |
| 9 | document-reviewer | Review the complete ADR batch **[Stop when non-empty]** | Batch approval |
| 10 | technical-designer | Backend Design Doc with accepted ADR constraints | Backend Design Doc |
| 11 | technical-designer-frontend | Frontend Design Doc with backend contracts, applicable UI Spec, and accepted ADR constraints | Frontend Design Doc |
| 12 | code-verifier ×2 + orchestrator | Verify each Design Doc and apply Review Resolution | Resolved verification evidence |
| 13 | document-reviewer ×2 | Review each Design Doc with resolved verification evidence | Reviews |
| 14 | design-sync | Cross-layer consistency verification **[Stop]** | Sync status |
| 15 | acceptance-test-generator | Integration/E2E skeletons selected from cross-layer contracts | Test skeletons |
| 16 | work-planner | Work plan from both Design Docs | Work Plan |
| 17 | document-reviewer | Work Plan review **[Stop: Batch approval]** | Approval |

### Medium Structural Scale Fullstack

For Medium scale, execute Large steps 4-17 and carry the confirmed convergence record in place of a PRD; retain the conditional stops at steps 7 and 9 and the approval stops at steps 14 and 17.

## Analysis and Evidence Rules

At each Agent invocation in this flow, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

Invoke codebase-analyzer once for the complete confirmed feature. It discovers backend/frontend responsibility boundaries and their cross-layer contracts; independent discovery keeps convergence grounded in repository evidence rather than the orchestrator's unverified implementation hypothesis.

Apply the documentation-criteria UI Spec creation condition. Invoke ui-analyzer only when a UI Spec applies. External-resource and prototype inputs are then conditional: load external-resource-context when external evidence can change the current UI or verification decision, and ask for a prototype only when it resolves an approved UI decision or target ambiguity.

Use these prompt shapes:

```text
For either analyzer, pass exactly one governing source:
prd_path: [approved PRD path]
or
requirements: [confirmed requirements verbatim]

For UI analysis only, add an existing UI Spec, a decision-relevant prototype, and selected external references:
ui_spec_path: [existing UI Spec path]
prototype_path: [decision-relevant path]
external_resource_refs: [selected references or []]

UI Spec:
confirmed_requirement_context: [approved PRD path exactly; otherwise unchanged convergence record]
ui_analysis: [UI analyzer JSON]
codebase_analysis: [applicable frontend codebase evidence]
prototype_path: [decision-relevant path or absent]
external_resource_refs: [selected references or []]
```

## ADR Qualification and Batch

After scope and any applicable UI Spec approval, resolve candidate decision points from the codebase analysis against the governing source, `reuse`, and `invalidations`. Use applicable UI analysis as supporting or contradicting evidence, not as a source of technical options. Apply documentation-criteria Choice then Durability filters only to the remaining points.

- Route layer-owned decision points to the matching technical designer.
- Route cross-layer points to technical-designer.
- Invoke each owner with `document_to_create: ADRBatch`, `confirmed_requirement_context`, its ordered confirmed `decision_points` unchanged, and the corresponding codebase-analysis `candidateDecisionPoints` objects unchanged as `decision_materials`; include an approved `ui_spec_path` only when it constrains a frontend decision.
- Invoke technical-designer batches serially: cross-layer/backend first, frontend second. Each owner allocates numbers only after the preceding batch exists.
- Collect every returned ADR path.
- Invoke document-reviewer once with `doc_type: ADRBatch` and the complete `targets` array.
- Route the reviewer verdict first: `approved` proceeds with `issues: []`; `needs_revision` applies Review Resolution, updates one ADR per owning-designer invocation serially, and repeats the complete batch review; `rejected` resolves the governing-source conflict before another review.
- Obtain one user approval after an `approved` review, then set every approved ADR to `Accepted`.
- An empty batch proceeds directly to both Design Docs.

## Layer Design Context

Create each complete layer design from reviewed artifacts and unchanged evidence; this keeps both Design Docs traceable to approved sources instead of orchestrator-authored shadow designs.

**Backend Design Doc**:

```text
document_to_create: DesignDoc
confirmed_requirement_context: [approved PRD path exactly; otherwise unchanged convergence record]
structural_scale: [confirmed scale]
adr_paths: [accepted paths or []]
codebase_analysis: [complete analysis JSON unchanged]
```

**Frontend Design Doc**:

```text
document_to_create: DesignDoc
confirmed_requirement_context: [approved PRD path exactly; otherwise unchanged convergence record]
structural_scale: [confirmed scale]
adr_paths: [accepted paths or []]
ui_spec_path: [approved UI Spec; omit when absent]
backend_design_doc: [path]
codebase_analysis: [complete analysis JSON unchanged]
ui_analysis: [complete UI analysis JSON unchanged; omit when absent]
```

Apply `code:` and `ui:` prefixes to respective Fact Disposition IDs. The frontend Design Doc references backend contracts but does not treat unverified backend claims as proof.

## Verification Resolution

Keep verifier observations unchanged so corrections remain traceable to observed evidence rather than orchestrator-authored design instructions. Invoke code-verifier once per Design Doc with `doc_type: design-doc` and no `code_paths`; apply Review Resolution independently, forward each `apply` discrepancy verbatim with only its disposition, and rerun the affected verifier. Build one `verification_evidence` object per Design Doc from the latest result. Invoke document-reviewer with `review_context: creation`, `verification_evidence`, the same unchanged `codebase_analysis` and optional unchanged `ui_analysis`, original requirements as `requirements_verbatim`, and `confirmed_requirement_context` in the exact form fixed by the orchestration guide.

After both document reviews permit approval, invoke design-sync using the frontend Design Doc as the source because it consumes backend integration contracts. Apply Review Resolution to actionable conflicts before the design approval stop.

## Test Skeleton and Work Planning

Pass both Design Docs and the applicable UI Spec to acceptance-test-generator. Empty optional lanes are valid when the generator returns its defined absence reason.

Pass both Design Docs, the applicable UI Spec, applicable PRD, and generated skeleton paths to work-planner. Compose phases around shared backend/frontend verification points. The generated skeleton file is consumed by the earliest task where its declared boundary becomes executable.

Review the Work Plan with `doc_type: WorkPlan`, apply Review Resolution through work-planner, and stop for batch approval only after the review converges.

## Task Materialization and Execution

task-decomposer follows the Work Plan and routes by executor lane:

| Filename Pattern | Executor | Quality fixer |
|------------------|----------|---------------|
| `*-backend-task-*` | task-executor | quality-fixer |
| `*-frontend-task-*` | task-executor-frontend | quality-fixer-frontend |
| shared `*-task-*` | task-executor | quality-fixer |

When changed integration/E2E tests require review, invoke integration-test-reviewer after the executor and before the quality fixer. All other execution, Review Resolution, and stop rules follow the parent orchestration guide.
