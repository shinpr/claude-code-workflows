---
name: documentation-criteria
description: Documentation creation criteria including PRD, ADR, Design Doc, and Work Plan requirements with templates. Use when creating or reviewing technical documents, or determining which documents are required.
---

# Documentation Creation Criteria

## Templates

- **[prd-template.md](references/prd-template.md)** - Product Requirements Document template
- **[adr-template.md](references/adr-template.md)** - Architecture Decision Record template
- **[ui-spec-template.md](references/ui-spec-template.md)** - UI Specification template (frontend/fullstack features)
- **[design-template.md](references/design-template.md)** - Technical Design Document template
- **[plan-template.md](references/plan-template.md)** - Work Plan template
- **[task-template.md](references/task-template.md)** - Task file template for implementation tasks

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

Apply both filters in order to each technical topic inside the confirmed implementation scope:

1. **Choice requires judgment** — current requirements, accepted decisions, and representative repository evidence support at least two credible, materially distinct options whose selection requires comparison.
2. **Decision is durable** — choosing among those options materially changes responsibility, dependency direction, a shared contract, persistence, a technology dependency, reversibility, or lifecycle cost that future work must preserve or understand.

Create one ADR for each topic that passes both filters. Treat choices as one decision point when they must be selected or reconsidered together; separate independently revisitable choices.

Qualifying durable choices include:

- introducing or replacing a technology, library, platform, storage model, or external dependency;
- changing ownership, dependency direction, a trust boundary, or a shared public contract when credible alternatives exist;
- reversing or superseding an accepted architecture decision;
- choosing an irreversible or high-cost-to-reverse data or compatibility strategy.

A local contract, data-flow, state, or component change belongs in the Design Doc when it follows an accepted design, has one evident repository-supported implementation, or remains cheaply reversible. Counts of files, consumers, nesting levels, states, steps, and asynchronous operations are supporting evidence rather than ADR criteria. Only the qualifying decisions above create ADRs; generic technical concerns, operational possibilities, and rejected activities can only support that determination.

## Detailed Document Definitions

### PRD (Product Requirements Document)

**Purpose**: Define business requirements and user value

**Includes**:
- Business requirements and user value
- Success metrics and KPIs (each metric specifies a numeric target and measurement method)
- User stories and use cases
- Converged MVP requirements
- Acceptance criteria with sequential IDs (AC-001, AC-002, ...) for downstream traceability
- Future and Out of Scope capabilities with reasons
- User journey or scope boundary diagram when prose does not make the material flow or boundary clear

**Scope**: Business requirements, user value, success metrics, user stories, and prioritization only. Implementation details belong in Design Doc, technical selection rationale in ADR, phases and task breakdown in Work Plan.

### ADR (Architecture Decision Record)

**Purpose**: Record one durable technical choice that required comparison

**Includes**:
- The technical decision point and confirmed scope it serves
- Every credible, materially distinct option supported by current evidence
- Requirement and repository fit, current-scope benefit, lifecycle cost, maintainability, and material trade-offs
- The smallest sufficient selected option and reconsideration conditions
- Consequences and architecture impact

**Scope**: One qualifying decision point and the evidence needed to understand its selection. An ADR narrows the technical solution space; confirmed requirements remain the implementation scope. End-to-end implementation design belongs in the Design Doc when activated by confirmed scope. External release execution and organizational rollout are not moved into another artifact merely because they are excluded from the ADR; schedule and repository implementation tasks belong in the Work Plan when applicable.

### UI Specification

**Purpose**: Define UI structure, screen transitions, component decomposition, and interaction design for frontend features

Create a UI Spec when screen structure, transitions, component/state interaction, or visual acceptance criteria remain to be designed. Reuse an approved UI Spec or proceed with the Design Doc when one evident repository-supported pattern already determines those decisions.

**Includes**:
- Screen list and transition conditions
- Component decomposition with a state x display matrix for states required by approved behavior, preserved behavior, or repository rules
- Interaction definitions linked to confirmed acceptance criteria (EARS format), preserving PRD AC IDs when present
- Prototype management (code-based prototypes as attachments, not source of truth)
- Acceptance-criteria traceability from the confirmed requirement context to screens/components
- Existing component reuse map and design tokens
- Visual acceptance criteria (golden states, layout constraints)
- Accessibility requirements (keyboard, screen reader, contrast)

**Scope**: Screen structure, transitions, component decomposition, interaction design, and visual acceptance criteria only. Technical implementation and API contracts belong in Design Doc, test implementation in test skeleton generation output, schedule in Work Plan.

**Required Structural Elements**:
- Each in-scope interactive component records the applicable state/display and interaction contract
- Acceptance-criteria traceability table mapping confirmed criteria to screens/states, preserving existing IDs
- Screen list with transition conditions
- Existing component reuse map (reuse/extend/new decisions)

**Prototype Code Handling**:
- Prototype code provided by user is placed in `docs/ui-spec/assets/{feature-name}/`
- Prototype code supports the UI Spec as an attachment
- UI Spec + Design Doc are the canonical specifications

### Design Document

**Purpose**: Define the complete technical implementation for the confirmed scope

**Includes**:
- **Existing codebase analysis** (required)
  - Implementation path mapping (both existing and new)
  - Integration point clarification (connection points with existing code even for new implementations)
- Technical implementation approach (vertical/horizontal/hybrid)
- **Technical dependencies and implementation constraints** (required implementation order)
- Interface and contract definitions
- Data flow and component design
- **Acceptance criteria**: the smallest representative set of observable behaviors with stable repository-verifiable pass/fail conditions
- Change impact map (clearly specify direct impact/indirect impact/no ripple effect)
- Every changed or newly relied-upon integration point
- Data contract clarification
- **Agreement checklist** (agreements with stakeholders)
- **Code inspection evidence** (inspected files/functions during investigation)
- **Field propagation map** (when fields cross component boundaries)
- **Data representation decision** (when introducing new structures)
- **Applicable standards** (explicit/implicit classification)
- **Prerequisite ADRs** (including common ADRs)
- **Verification Strategy** (required)
  - Correctness proof method (what "correct" means for this change, how it's verified, when)
  - Early verification point (first target to prove the approach works, success criteria, failure response)

**Required Structural Elements**:
```yaml
Change Impact Map:
  Change Target: [Component/Feature]
  Direct Impact: [Files/Functions]
  Indirect Impact: [Data format/Processing time]
  No Ripple Effect: [Unaffected features]

Interface Change Matrix:
  Existing: [Function/method/operation name]
  New: [Function/method/operation name]
  Conversion Required: [Yes/No]
  Compatibility Method: [Approach]
```

**Scope**: Technical implementation methods, interfaces, data flow, acceptance criteria, and verification strategy for the confirmed scope. Preserve the evidence and boundary details downstream implementation needs; omit unrelated future capability rather than reducing required design guarantees. Technology selection rationale belongs in ADR, schedule and assignments in Work Plan.

An acceptance criterion describes observable behavior rather than implementation detail. External live connections use repository-controlled contract or interface proof unless a confirmed requirement needs the live boundary. Performance thresholds require a sourced target and a reproducible benchmark; exact visual positioning requires an approved visual contract and deterministic comparison. Otherwise record the item as a non-functional constraint or omit it from automated acceptance criteria.

### Work Plan

**Purpose**: Implementation task management and progress tracking.

**Scope**: Repository implementation outcomes from approved Design Docs, task dependencies, source section and acceptance-criteria references, executable verification, optional task-level false-green focus, and progress tracking only. The Work Plan references governing documents instead of reproducing their design details.

**Phase Division Criteria** (adapt to implementation approach from Design Doc):

**When Vertical Slice selected**:
- Each phase = one value unit (feature, component, or migration target)
- Each phase includes its own implementation + verification per Verification Strategy

**When Horizontal Slice selected**:
1. **Phase 1: Foundation Implementation** - Contract definitions, interfaces/signatures, test preparation
2. **Phase 2: Core Feature Implementation** - Business logic, unit tests
3. **Phase 3: Integration Implementation** - External connections, presentation layer

**When Hybrid selected**:
- Combine vertical and horizontal as defined in Design Doc implementation approach

**All approaches**: Each phase ends at a repository-observable verification point. Whole-repository quality assurance remains a separate execution responsibility.

## Creation Process

1. **Problem Analysis**: Confirm scope, determine Structural Scale, and identify candidate technical decision points
   - Identify explicit and implicit project standards before investigation
2. **ADR Choice Check** (when candidates exist): Apply the Choice filter, then the Durability filter
3. **Creation**: Complete and review the qualifying ADR batch, then create the Design Doc with accepted ADRs as constraints
4. **Approval**: One approval covers the reviewed ADR batch; Design Doc approval enables planning or implementation

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

## ADR Status
`Proposed` → `Accepted` → `Deprecated`/`Superseded`/`Rejected`

## AI Automation Rules
- Apply the Choice filter before the Durability filter and independently from Structural Scale
- Check existing ADRs before implementation
- Create one ADR per qualifying decision point and review the complete batch together

## Diagram Requirements

Select a Mermaid diagram only when it clarifies a material relationship more effectively than prose or a compact table:

| Document | Required Diagrams | Purpose |
|----------|------------------|---------|
| PRD | User journey or scope boundary when prose does not make a material relationship clear | Clarify user experience and scope |
| ADR | Option comparison when the relationship between options is unclear in a table | Visualize trade-offs |
| UI Spec | Screen transition or component tree when material interaction or hierarchy remains unclear | Clarify screen flow and component structure |
| Design Doc | Architecture or data flow when changed relationships are not clear in prose or tables | Understand technical structure |

## Common ADR Relationships
1. **At creation**: Identify accepted common ADRs that govern the changed responsibility
2. **When missing**: Apply the same Choice and Durability filters; a generic concern alone does not justify a common ADR
3. **Design Doc**: Specify applicable common ADRs in "Prerequisite ADRs"
4. **Compliance check**: Verify the design aligns with accepted decisions
