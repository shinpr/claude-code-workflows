---
name: integration-e2e-testing
description: Integration and E2E test design principles, proof selection, test skeleton specification, and review criteria. Use when designing integration tests, E2E tests, or reviewing test quality.
---

# Integration and E2E Testing Principles

## References

**E2E test design**: See [references/e2e-design.md](references/e2e-design.md) for UI Spec-driven E2E test candidate selection.

## Proof Selection

Start with the accepted outcome, Design Doc Test Boundaries, and existing proof. For each material promise, identify the observable failure and the cheapest boundary that can detect it. Reuse existing tests; move isolated logic to unit tests and keep only interactions that require integration or E2E observation. Similar test names alone do not establish equivalent proof.

Select enough tests to prove every required boundary and independently failing state or contract. Consolidate cases that share a failure and correction. Add a test only when removing it leaves a required claim unproved or a material changed-path regression undetectable. Evaluate value from governing requirements, contracts and repository evidence against setup, maintenance and diagnosis cost. Source counts, numerical ROI, test quotas and journey length create no proof obligation. A lane may be empty when cheaper existing proof suffices; a required boundary remains selected regardless of how many tests are needed.

## Test Lanes

| Lane | Observable boundary | Dependencies |
|------|---------------------|--------------|
| `integration` | Interactions within a process, including framework-rendered UI and module/API handlers | Real participating components; mock only outside the claimed boundary |
| `fixture-e2e` | Actual UI behavior in a real browser with deterministic fixtures | Fixtures may replace dependencies outside the claimed boundary |
| `service-integration-e2e` | Outcome depends on actual cross-service interaction or persistence | Required local services and stores are real; stubs only outside that proof boundary |

Choose the smallest boundary that can detect the required failure. In-process tests suffice when they exercise the relevant interaction, state and rendering with real participating components. Select browser proof for required application wiring or browser behavior outside that exercised boundary; a component count, screen count or UI acceptance criterion alone does not select a lane. Use accepted criteria and available screen/transition tables or usage scenarios to identify the required behavior.

Generated skeletons become executable in the earliest implementation task where their proof boundary and dependencies exist. Planning preserves their paths and proof obligations; an unavailable service is an exact verification prerequisite, not a reason to substitute a fake boundary.

## Test Skeleton Specification

### Required Comment Patterns

Each test MUST include the following annotations:

```
AC: [Original acceptance criteria text]
Behavior: [Trigger] → [Process] → [Observable Result]
@category: core-functionality | integration | edge-case | fixture-e2e | service-integration-e2e
@lane: integration | fixture-e2e | service-integration-e2e
@dependency: none | [component names] | full-system
@complexity: low | medium | high
Selection evidence: [required claim, uncovered failure, and why cheaper existing proof is insufficient]
```

Use the project's comment syntax to wrap these annotations (e.g., `//` for C-family, `#` for Python/Ruby/Shell).

### Verification Items (Optional)

When verification points need explicit enumeration:
```
Verification items:
- [Item 1]
- [Item 2]
```

## EARS Format Mapping

| EARS Keyword | Test Type | Generation Approach |
|--------------|-----------|---------------------|
| **When** | Event-driven | Trigger event → verify outcome |
| **While** | State condition | Setup state → verify behavior |
| **If-then** | Branch coverage | Both condition paths verified |
| (none) | Basic functionality | Direct invocation → verify result |

## Test File Naming Convention

- Integration tests: `*.int.test.*` or `*.integration.test.*`
- fixture-e2e tests: `*.fixture.e2e.test.*` (or organize under `tests/e2e/fixture/`)
- service-integration-e2e tests: `*.service.e2e.test.*` (or organize under `tests/e2e/service/`)

The test runner or framework in the project determines the appropriate file extension. Repos that already use a single `*.e2e.test.*` convention may keep it as long as each file declares `@lane:` in its header — the lane annotation is the source of truth for routing.

## Review Criteria

### Skeleton and Implementation Consistency

| Check | Failure Condition |
|-------|-------------------|
| Behavior Verification | No assertion for "observable result" in the implemented test |
| Verification Item Coverage | Listed items not all covered by assertions |
| Mock Boundary | Internal components mocked in integration test |

### Route Parity for Shared Mutations

When multiple routes reach the same mutation, compare validation, classification, resource bounds, and read/parse/mutation/reporting order. A difference becomes a proof obligation when it can violate an authoritative contract or expose a material bypass in the changed boundary. Reuse existing proof or add the smallest test that detects that failure.
