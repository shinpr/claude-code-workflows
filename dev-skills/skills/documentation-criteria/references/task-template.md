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

## Hard Constraints
(Include this section only when an authoritative source constrains the implementation. Omit it when no such constraint exists.)

| Allowed action | Source |
|---|---|
| [What the implementation may do while preserving the protected boundary] | [User request / approved governing document path (§ section) / named task dependency] |

Every row requires one of the listed source types. Before treating a constraint as blocking, record in Investigation Notes the smallest option inside the current target files and existing design surface that satisfies both the required outcome and every constraint. Continue with that option when it satisfies the outcome; otherwise pass the unmet item to the existing escalation process.

## Investigation Targets
Files to read before starting implementation (file path, with optional search hint):
- [e.g., src/orders/checkout (processOrder function) — determined during task decomposition based on task nature]

## Change Category
(Include this field only when the task is a bug fix, regression, state-change, or boundary-change — populated during task decomposition. Omit otherwise.)

`Change Category: <one or more of bug-fix, regression, state-change, boundary-change — comma-separated>`

When present, the implementation sweeps the cases sharing the same path, contract, persisted state, or external boundary for the same class of defect (see Implementation Steps Red Phase).

## Binding Decisions
(Include this section when the work plan's ADR Bindings table covers this task. Omit otherwise.)

Each row is an ADR decision the implementation in this task must comply with.

| Source | Axis | Decision | Compliance Check |
|---|---|---|---|
| [docs/adr/ADR-XXXX.md (§ <Source Section>) — substitute the section name (`Decision` or `Implementation Guidance`) from the matching work plan row] | [Axis value copied verbatim from the work plan's ADR Bindings row] | [Binding decision copied from the work plan's ADR Bindings row] | [Y/N-answerable positive predicate that evaluates whether the planned/final implementation satisfies the decision] |

## Reference Contracts
(Include this section when the work plan's Reference Contract Values table covers this task. Omit otherwise.)

Each row is a DD-derived observable contract the implementation in this task must reproduce exactly. Serialized boundaries are carried by the Boundary Context (from the work plan's Connection Map), and ADR-derived structural decisions by Binding Decisions above.

| Source | Contract Type | Required Observable Value | Compliance Check |
|---|---|---|---|
| [Design Doc path (§ Section) copied from the matching work plan Reference Contract Values row] | [Contract Type copied from the work plan row: structure-order / derived-display / state-lifecycle-negative] | [Required Observable Value copied verbatim from the work plan row] | [Y/N-answerable positive predicate that evaluates whether the planned/final implementation reproduces the value] |

## Investigation Notes
(Implementation observations are appended here before implementation begins. When Binding Decisions exist, record the planned implementation approach and each Compliance Check result here.)

## Implementation Steps

Tasks that add or change executable behavior, fix a reproducible bug, or change runtime/build configuration MUST use the Red-Green-Refactor steps below. A behavior-preserving refactor replaces all three phases with `Baseline → Refactor → Verify`: confirm existing tests pass or add passing characterization tests, refactor, then rerun the same evidence. A bug that cannot be reproduced executably uses `Evidence-First Steps`: record why reproduction is impossible, name the static/contract/environment evidence, apply the fix, then verify that evidence. A non-executable deliverable uses the same steps with its acceptance evidence and named sources.

### 1. Red Phase
- [ ] Read all Investigation Targets and record key observations
- [ ] (When Change Category is set) Sweep the adjacent cases sharing the same path/contract/state/boundary for the same class of defect; fold any found within scope into the failing tests
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

## Proof Obligations
(One entry per AC, claim, deliverable claim, or applicable Failure Mode Checklist category this task covers. Select one verification mode: `red-test`, `characterization`, `alternate-evidence`, or `artifact-evidence`.)
- **Claim**: [the AC behavior, executable claim, deliverable claim, or failure-mode condition this task must prove]
- **Verification mode**: [red-test / characterization / alternate-evidence / artifact-evidence]
- **Primary failure mode**: [required for red-test: the regression the test turns red on; "N/A" otherwise]
- **Evidence requirement**: [red-test: test and failure signal / characterization: same passing evidence before and after / alternate-evidence: reproduction blocker plus static, contract, or environment evidence / artifact-evidence: named source plus artifact verification]
- **Boundary to exercise**: [public/integration boundary the evidence exercises, "in-process unit", or "N/A"]
- **State assertion**: [observable state before → action → after for state-changing claims; "N/A" otherwise]
- **Mock boundary rationale**: [which boundaries may be mocked and why; "none" when all real]
- **Residual**: [what this proof leaves unestablished, if any]

## Completion Criteria
- [ ] All required tests, validators, or evidence checks for this task pass
- [ ] Operation verified per Operation Verification Methods above
- [ ] Each Proof Obligation satisfies its Verification mode, Evidence requirement, and applicable boundary/state assertions
- [ ] Deliverables created (for research/design tasks)
- [ ] (When Binding Decisions exist) Every Compliance Check evaluates to `Y` against the final implementation, with evidence recorded in Investigation Notes (file:line, test result, or command output)
- [ ] (When Reference Contracts exist) Every Reference Contract Compliance Check evaluates to `Y` against the final implementation, with evidence recorded in Investigation Notes

## Notes
- Impact scope: [Areas where changes may propagate]
- Scope boundary: [Files to preserve unchanged — path and reason]
