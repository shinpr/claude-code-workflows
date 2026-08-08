# Work Plan: [Feature Name] Implementation

Created Date: YYYY-MM-DD
Type: feature|fix|refactor
Related Issue/PR: #XXX (if any)
Review Scope: [repository responsibilities or expected files derived from the Design Doc]

## Governing Documents

- Design Doc: [docs/design/XXX.md]
- UI Spec: [docs/ui-spec/XXX.md] (when applicable)
- ADR: [docs/adr/ADR-XXXX-title.md] (when applicable)
- PRD: [docs/prd/XXX.md] (when applicable)
- Test skeletons: [paths] (when generated)

## Implementation Scope

[One concise statement of the repository implementation outcome defined by the Design Doc.]

## Implementation Phases

Use the implementation approach and dependency order from the Design Doc. Each phase groups work that reaches a shared observable verification point. Keep implementation, tests, configuration, wiring, and documentation together when they become complete at that point.

Shape the phases from the approach the Design Doc selected:

- **Vertical Slice**: each phase is one value unit (feature, component, or migration target) carrying its own implementation and verification per the Verification Strategy.
- **Horizontal Slice**: foundation (contract definitions, interfaces/signatures, test preparation) → core feature (business logic, unit tests) → integration (external connections, presentation layer).
- **Hybrid**: combine the two as the Design Doc's implementation approach defines.

Whole-repository quality assurance stays outside the plan as a separate execution responsibility.

### Phase 1: [First implementation outcome]

#### Tasks

- [ ] **P1-T1: [Repository implementation outcome]**
  - **Source**: [every directly constraining Design Doc, ADR, or UI Spec path and section; AC IDs]
  - **Scope**: [responsibility, component, or expected files]
  - **Depends on**: none | [task IDs]
  - **Executor lane**: backend|frontend
  - **Rollback boundary**: [repository change that reverts with this task]
  - **Verification**: [Design Doc verification method or repository command]
  - **Primary failure**: [optional: most material false-green state]
  - **Observable check**: [optional: smallest check that detects the primary failure]

### Phase 2: [Next implementation outcome] (when required)

#### Tasks

- [ ] **P2-T1: [Repository implementation outcome]**
  - **Source**: [every directly constraining governing path and section; AC IDs]
  - **Scope**: [responsibility, component, or expected files]
  - **Depends on**: [task IDs]
  - **Executor lane**: backend|frontend
  - **Rollback boundary**: [repository change that reverts with this task]
  - **Verification**: [Design Doc verification method or repository command]
  - **Primary failure**: [optional]
  - **Observable check**: [optional]

## Completion Criteria

- [ ] Every Design Doc obligation needed for implementation is covered by at least one task
- [ ] Every task cites each directly constraining governing section and applicable AC
- [ ] Every task produces a repository implementation outcome required by its source
- [ ] Dependencies permit execution in the listed order
- [ ] Verification is executable from repository artifacts or the task's own output
- [ ] Task verification passes and cited acceptance criteria are satisfied
