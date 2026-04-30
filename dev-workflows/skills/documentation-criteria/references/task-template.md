# Task: [Task Name]

Metadata:
- Dependencies: task-01 → Deliverable: docs/plans/analysis/research-results.md
- Provides: docs/plans/analysis/api-spec.md (for research/design tasks)
- Size: Small (1-2 files)

## Implementation Content
[What this task will achieve]
*Reference dependency deliverables if applicable

## Target Files
- [ ] [Implementation file path]
- [ ] [Test file path]

## Investigation Targets
Files to read before starting implementation (file path, with optional search hint):
- [e.g., src/orders/checkout (processOrder function) — determined by task-decomposer based on task nature]

## Implementation Steps (TDD: Red-Green-Refactor)
### 1. Red Phase
- [ ] Read all Investigation Targets and record key observations
- [ ] Review dependency deliverables (if any)
- [ ] Verify/create contract definitions
- [ ] Write failing tests
- [ ] Run tests and confirm failure

### 2. Green Phase
- [ ] Add minimal implementation to pass tests
- [ ] Run only added tests and confirm they pass

### 3. Refactor Phase
- [ ] Improve code (maintain passing tests)
- [ ] Confirm added tests still pass

## Quality Assurance Mechanisms
(From work plan header — mechanisms relevant to this task's target files)
- [Tool/check name] — Enforces: [what] — Config: [path]

## Operation Verification Methods
(Derived from Verification Strategy in work plan)
- **Verification method**: [What to verify and how — e.g., "compare new implementation output against existing implementation at src/legacy/order_calc", "run endpoint against test database and verify response matches contract"]
- **Success criteria**: [Observable outcome that proves correctness — e.g., "output matches existing implementation for all input combinations", "API returns 200 with expected schema"]
- **Failure response**: [What to do if verification fails — e.g., "reassess approach before proceeding", "escalate to user"]
- **Verification level**: [L1: Functional operation as end-user feature / L2: New tests added and passing / L3: Code builds without errors]

## Completion Criteria
- [ ] All added tests pass
- [ ] Operation verified per Operation Verification Methods above
- [ ] Deliverables created (for research/design tasks)

## Notes
- Impact scope: [Areas where changes may propagate]
- Scope boundary: [Files to preserve unchanged — path and reason]
