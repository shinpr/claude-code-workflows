---
name: documentation-criteria
description: Documentation creation criteria including PRD, ADR, Design Doc, and Work Plan requirements with templates. Use when creating or reviewing technical documents, or determining which documents are required.
---

# Documentation Creation Criteria

## Templates

- **[prd-template.md](references/prd-template.md)** - Product Requirements Document template
- **[adr-template.md](references/adr-template.md)** - Architecture Decision Record template
- **[design-template.md](references/design-template.md)** - Technical Design Document template
- **[plan-template.md](references/plan-template.md)** - Work Plan template
- **[task-template.md](references/task-template.md)** - Task file template for implementation tasks

## Creation Decision Matrix

| Condition | Required Documents | Creation Order |
|-----------|-------------------|----------------|
| New Feature Addition | PRD → [ADR] → Design Doc → Work Plan | After PRD approval |
| ADR Conditions Met (see below) | ADR → Design Doc → Work Plan | Start immediately |
| 6+ Files | ADR → Design Doc → Work Plan (Required) | Start immediately |
| 3-5 Files | Design Doc → Work Plan (Recommended) | Start immediately |
| 1-2 Files | None | Direct implementation |

## ADR Creation Conditions (Required if Any Apply)

### 1. Contract System Changes
- **Adding nested contracts with 3+ levels**: `Contract A { Contract B { Contract C { field: T } } }`
  - Rationale: Deep nesting has high complexity and wide impact scope
- **Changing/deleting contracts used in 3+ locations**
  - Rationale: Multiple location impacts require careful consideration
- **Contract responsibility changes** (e.g., DTO→Entity, Request→Domain)
  - Rationale: Conceptual model changes affect design philosophy

### 2. Data Flow Changes
- **Storage location changes** (DB→File, Memory→Cache)
- **Processing order changes with 3+ steps**
  - Example: "Input→Validation→Save" to "Input→Save→Async Validation"
- **Data passing method changes** (parameter passing→shared state, direct reference→event-based communication)

### 3. Architecture Changes
- Layer addition, responsibility changes, component relocation

### 4. External Dependency Changes
- Library/framework/external API introduction or replacement

### 5. Complex Implementation Logic (Regardless of Scale)
- Managing 3+ states
- Coordinating 5+ asynchronous processes

## Detailed Document Definitions

### PRD (Product Requirements Document)

**Purpose**: Define business requirements and user value

**Includes**:
- Business requirements and user value
- Success metrics and KPIs (measurable format)
- User stories and use cases
- MoSCoW prioritization (Must/Should/Could/Won't)
- MVP and Future phase separation
- User journey diagram (required)
- Scope boundary diagram (required)

**Excludes**:
- Technical implementation details (→Design Doc)
- Technical selection rationale (→ADR)
- **Implementation phases** (→Work Plan)
- **Task breakdown** (→Work Plan)

### ADR (Architecture Decision Record)

**Purpose**: Record technical decision rationale and background

**Includes**:
- Decision (what was selected)
- Rationale (why that selection was made)
- Option comparison (minimum 3 options) and trade-offs
- Architecture impact
- Principled implementation guidelines (e.g., "Use dependency injection")

**Excludes**:
- Implementation schedule, duration (→Work Plan)
- Detailed implementation procedures (→Design Doc)
- Specific code examples (→Design Doc)
- Resource assignments (→Work Plan)

### Design Document

**Purpose**: Define technical implementation methods in detail

**Includes**:
- **Existing codebase analysis** (required)
  - Implementation path mapping (both existing and new)
  - Integration point clarification (connection points with existing code even for new implementations)
- Technical implementation approach (vertical/horizontal/hybrid)
- **Technical dependencies and implementation constraints** (required implementation order)
- Interface and contract definitions
- Data flow and component design
- **E2E verification procedures at integration points**
- **Acceptance criteria (measurable format)**
- Change impact map (clearly specify direct impact/indirect impact/no ripple effect)
- Complete enumeration of integration points
- Data contract clarification
- **Agreement checklist** (agreements with stakeholders)
- **Prerequisite ADRs** (including common ADRs)

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

**Excludes**:
- Why that technology was chosen (→Reference ADR)
- When to implement, duration (→Work Plan)
- Who will implement (→Work Plan)

### Work Plan

**Purpose**: Implementation task management and progress tracking

**Includes**:
- Task breakdown and dependencies (maximum 2 levels)
- Schedule and duration estimates
- **Copy E2E verification procedures from Design Doc** (cannot delete, can add)
- **Phase 4 Quality Assurance Phase (required)**
- Progress records (checkbox format)

**Excludes**:
- Technical rationale (→ADR)
- Design details (→Design Doc)

**Phase Division Criteria**:
1. **Phase 1: Foundation Implementation** - Contract definitions, interfaces/signatures, test preparation
2. **Phase 2: Core Feature Implementation** - Business logic, unit tests
3. **Phase 3: Integration Implementation** - External connections, presentation layer
4. **Phase 4: Quality Assurance (Required)** - Acceptance criteria achievement, all tests passing, quality checks

**Three Elements of Task Completion Definition**:
1. **Implementation Complete**: Code is functional
2. **Quality Complete**: Tests, static checks, linting pass
3. **Integration Complete**: Verified connection with other components

## Creation Process

1. **Problem Analysis**: Change scale assessment, ADR condition check
2. **ADR Option Consideration** (ADR only): Compare 3+ options, specify trade-offs
3. **Creation**: Use templates, include measurable conditions
4. **Approval**: "Accepted" after review enables implementation

## Storage Locations

| Document | Path | Naming Convention | Template |
|----------|------|------------------|----------|
| PRD | `docs/prd/` | `[feature-name]-prd.md` | [prd-template.md](references/prd-template.md) |
| ADR | `docs/adr/` | `ADR-[4-digits]-[title].md` | [adr-template.md](references/adr-template.md) |
| Design Doc | `docs/design/` | `[feature-name]-design.md` | [design-template.md](references/design-template.md) |
| Work Plan | `docs/plans/` | `YYYYMMDD-{type}-{description}.md` | [plan-template.md](references/plan-template.md) |
| Task File | `docs/plans/tasks/` | `{plan-name}-task-{number}.md` | [task-template.md](references/task-template.md) |

*Note: Work plans are excluded by `.gitignore`

## ADR Status
`Proposed` → `Accepted` → `Deprecated`/`Superseded`/`Rejected`

## AI Automation Rules
- 5+ files: Suggest ADR creation
- Contract/data flow change detected: ADR mandatory
- Check existing ADRs before implementation

## Diagram Requirements

Required diagrams for each document (using mermaid notation):

| Document | Required Diagrams | Purpose |
|----------|------------------|---------|
| PRD | User journey diagram, Scope boundary diagram | Clarify user experience and scope |
| ADR | Option comparison diagram (when needed) | Visualize trade-offs |
| Design Doc | Architecture diagram, Data flow diagram | Understand technical structure |
| Work Plan | Phase structure diagram, Task dependency diagram | Clarify implementation order |

## Common ADR Relationships
1. **At creation**: Identify common technical areas (logging, error handling, async processing, etc.), reference existing common ADRs
2. **When missing**: Consider creating necessary common ADRs
3. **Design Doc**: Specify common ADRs in "Prerequisite ADRs" section
4. **Compliance check**: Verify design aligns with common ADR decisions