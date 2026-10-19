---
name: integration-e2e-testing
description: Defines integration/E2E skeleton annotations, lane and file contracts, and route-parity review criteria. Use when generating or consuming test skeletons or reviewing shared mutation routes.
---

# Integration and E2E Skeleton Contracts

## Test Lanes

| Lane | Observable boundary | Dependencies |
|------|---------------------|--------------|
| `integration` | Interactions within a process, including framework-rendered UI and module/API handlers | Real participating components; mock only outside the claimed boundary |
| `fixture-e2e` | Actual UI behavior in a real browser with deterministic fixtures | Fixtures may replace dependencies outside the claimed boundary |
| `service-integration-e2e` | Outcome depends on actual cross-service interaction or persistence | Required local services and stores are real; stubs only outside that proof boundary |

## Test Skeleton Specification

### Required Comment Patterns

Each test MUST include the following annotations:

```
AC: [Original acceptance criteria text]
Behavior: [Trigger] → [Process] → [Observable Result]
@lane: integration | fixture-e2e | service-integration-e2e
@dependency: none | [component names] | full-system
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

## Test File Naming Convention

- Integration tests: `*.int.test.*` or `*.integration.test.*`
- fixture-e2e tests: `*.fixture.e2e.test.*` (or organize under `tests/e2e/fixture/`)
- service-integration-e2e tests: `*.service.e2e.test.*` (or organize under `tests/e2e/service/`)

The test runner or framework in the project determines the appropriate file extension. Repos that already use a single `*.e2e.test.*` convention may keep it as long as each file declares `@lane:` in its header — the lane annotation is the source of truth for routing.

## Route Parity for Shared Mutations

When multiple routes reach the same mutation, compare validation, classification, resource bounds, and read/parse/mutation/reporting order. A difference becomes a proof obligation when it can violate an authoritative contract or expose a material bypass in the changed boundary. Reuse existing proof or add the smallest test that detects that failure.
