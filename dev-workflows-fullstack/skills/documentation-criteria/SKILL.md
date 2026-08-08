---
name: documentation-criteria
description: Determines which of PRD, ADR, UI Spec, Design Doc, and Work Plan a change requires, and where each is stored. Use when deciding documentation scope, or when creating or reviewing a technical document.
---

# Documentation Creation Criteria

This file holds the routing decision: which documents a change requires and where they live. What to write inside one is defined by its template, linked from Storage Locations.

## What Each Document Fixes

Each document fixes one class of decision that the repository alone cannot supply. An unfilled section does not disappear — it becomes a guess made later by the consumer named below, with no record of what was assumed.

- **PRD** — Fixes the business outcome and the acceptance criteria later work traces to. Its AC IDs are the traceability keys that the Design Doc, UI Spec, and test selection reuse; without them each consumer re-derives requirements from prose and the link between a test and the value it protects is lost. Implementation details belong to the Design Doc, selection rationale to an ADR, phases and task breakdown to the Work Plan.

- **ADR** — Fixes one durable technical choice and the options it beat, so later work can tell a deliberate decision from an accident. Without it a future change either re-runs the same comparison or silently reverses it. End-to-end implementation design belongs to the Design Doc, schedule and repository tasks to the Work Plan.

- **UI Spec** — Fixes screen structure, transitions, component/state contracts, and visual acceptance before components exist, so decomposition is decided once instead of per-component during implementation. Create one when those decisions remain open; reuse an approved UI Spec or go straight to the Design Doc when one evident repository-supported pattern already determines them. Technical implementation and API contracts belong to the Design Doc.

- **Design Doc** — Fixes the complete implementation design for the confirmed scope: flows, contracts, change impact, and verification strategy. Task execution treats it as the sole design authority and holds it read-only, so a gap here is filled by an implementer's local invention that no review compares against an approved decision. Technology selection rationale belongs to an ADR, schedule and assignments to the Work Plan.

- **Work Plan** — Fixes task order, dependencies, executable verification, and the earliest vertical proof point. Without it task order follows file layout rather than dependency, and integration risk moves to the end of the work. Design detail is referenced from the Design Doc rather than restated.

## Creation Decision Matrix

| Structural Scale | Base Documents | Creation Order |
|------------------|----------------|----------------|
| Small | None | Direct implementation |
| Medium | Design Doc → Work Plan | Start with Design Doc |
| Large | PRD → Design Doc → Work Plan | Continue after PRD approval |

Build one path in this order:

1. Select the base path from Structural Scale.
2. Insert an applicable UI Spec immediately before the Design Doc.
3. One or more qualifying ADR decision points insert an ADR batch immediately before the Design Doc. A qualifying decision point sets the scale floor to Medium.

## Structural Scale

Classify the decision burden, not repository layout. File count is supporting evidence only.

| Scale | Structural condition |
|-------|----------------------|
| Small | One coherent outcome has one evident repository-supported implementation within one responsibility boundary and no unresolved durable choice |
| Medium | One coherent outcome coordinates across a boundary or requires investigation of a potentially durable choice |
| Large | Multiple independently valuable outcomes require separate design decisions |

A qualifying ADR decision point sets the floor at Medium because it creates a durable decision. One coherent outcome remains Medium when it crosses multiple layers; Large requires independently valuable outcomes with separate design decisions.

## ADR Decision Filters

Apply the Choice filter, then the Durability filter, to each technical topic inside the confirmed implementation scope. Apply them independently from Structural Scale, and check existing ADRs first.

1. **Choice requires judgment** — current requirements, accepted decisions, and representative repository evidence support at least two credible, materially distinct options whose selection requires comparison.
2. **Decision is durable** — choosing among those options materially changes responsibility, dependency direction, a shared contract, persistence, a technology dependency, reversibility, or lifecycle cost that future work must preserve or understand.

Create one ADR for each topic that passes both filters, and review the complete batch together. Treat choices as one decision point when they must be selected or reconsidered together; separate independently revisitable choices.

Qualifying durable choices include:

- introducing or replacing a technology, library, platform, storage model, or external dependency;
- changing ownership, dependency direction, a trust boundary, or a shared public contract when credible alternatives exist;
- reversing or superseding an accepted architecture decision;
- choosing an irreversible or high-cost-to-reverse data or compatibility strategy.

A local contract, data-flow, state, or component change belongs in the Design Doc when it follows an accepted design, has one evident repository-supported implementation, or remains cheaply reversible. Counts of files, consumers, nesting levels, states, steps, and asynchronous operations are supporting evidence rather than ADR criteria. Only the qualifying decisions above create ADRs; generic technical concerns, operational possibilities, and rejected activities can only support that determination.

## Storage Locations

| Document | Path | Naming Convention | Template |
|----------|------|------------------|----------|
| PRD | `docs/prd/` | `[feature-name]-prd.md` | [prd-template.md](references/prd-template.md) |
| ADR | `docs/adr/` | `ADR-[4-digits]-[title].md` | [adr-template.md](references/adr-template.md) |
| UI Spec | `docs/ui-spec/` | `[feature-name]-ui-spec.md` | [ui-spec-template.md](references/ui-spec-template.md) |
| UI Spec Assets | `docs/ui-spec/assets/{feature-name}/` | Prototype code files | - |
| Design Doc | `docs/design/` | `[feature-name]-design.md` | [design-template.md](references/design-template.md) |
| Work Plan | `docs/plans/` | `YYYYMMDD-{type}-{description}.md` | [plan-template.md](references/plan-template.md) |
| Task File | `docs/plans/tasks/` | `{plan-name}-task-{number}.md` | [task-template.md](references/task-template.md) |

*Note: Work plans are excluded by `.gitignore`

## References

Each template defines the content, structural elements, and diagram criteria for its document: [prd-template.md](references/prd-template.md), [adr-template.md](references/adr-template.md), [ui-spec-template.md](references/ui-spec-template.md), [design-template.md](references/design-template.md), [plan-template.md](references/plan-template.md), [task-template.md](references/task-template.md)
