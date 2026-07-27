---
name: integration-e2e-testing
description: Integration and E2E test design principles, ROI calculation, test skeleton specification, and review criteria. Use when designing integration tests, E2E tests, or reviewing test quality.
---

# Integration and E2E Testing Principles

## References

**E2E test design**: See [references/e2e-design.md](references/e2e-design.md) for UI Spec-driven E2E test candidate selection and browser test architecture. The reference uses Playwright as the default browser harness; substitute the project's standard when different.

## Test Type Definition and Standard Budgets

| Test Type | Purpose | Scope | External Deps | Standard Budget per Input Design Doc | Implementation Timing |
|-----------|---------|-------|---------------|-------------------|----------------------|
| Integration | Verify component interactions in-process | Partial system integration (in-process modules; for UI components, the framework's in-process renderer e.g., RTL+MSW for React/TS) | Mocked or in-process | MAX 3 | Created alongside implementation |
| fixture-e2e | Verify UI behavior in a browser with deterministic fixtures | Full UI flow with mocked backend / fixture-driven state | Mocked / fixture only — no live services | MAX 3 | Created alongside the UI feature |
| service-integration-e2e | Verify critical user journeys against a running local stack | Full system across services | Live local services or stubs | MAX 1-2 | Executed only in the final phase |

**Lane selection (E2E only)**:
- Default lane for user-facing UI journeys is **fixture-e2e** — it runs a real browser against deterministic fixtures, catches the bugs that unit/integration tests miss (button no-op, state never updates, navigation breaks), and runs in CI without infrastructure setup
- Add **service-integration-e2e** only when the journey's correctness depends on real cross-service behavior (data persistence, transactional consistency, external service contracts) that cannot be faked safely

One input Design Doc is one budget scope: apply each lane budget once across all ACs and candidates in that document. The two E2E lanes are budgeted independently — having a fixture-e2e for a journey does not consume the service-integration-e2e budget and vice versa. Treat the numbers above as enforced standard budgets. Exceed a budget only when an accepted requirement or a distinct failure mode cannot be proved by a selected test; annotate that exception and why consolidation cannot cover it.

## Behavior-First Principle

### Include (High ROI)
- Business logic correctness (calculations, state transitions, data transformations)
- Data integrity and persistence behavior
- User-visible functionality completeness
- Error handling behavior (what user sees/experiences)

### Redirect to Other Test Types
- External service connections → Verify via contract/interface tests
- Performance metrics → Verify via dedicated load testing
- Implementation details → Verify observable behavior instead
- UI layout specifics → Verify information availability instead

**Principle**: Test = User-observable behavior verifiable in isolated CI environment

## ROI Calculation

ROI is used to **rank candidates within the same test type** (integration candidates against each other, E2E candidates against each other). Cross-type comparison is unnecessary because integration and E2E budgets are selected independently.

Score every input before calculating ROI. For the three numeric inputs, use only `0`, `5`, or `10`; do not interpolate intermediate values. Legal Requirement remains boolean:

| Input | Scale |
|---|---|
| Business Value | 0 = no user/business outcome; 5 = meaningful but non-critical outcome; 10 = core, revenue, safety, or data-integrity outcome |
| User Frequency | 0 = unreachable/obsolete; 5 = regular subset of users or runs; 10 = dominant journey or execution path |
| Legal Requirement | `true` only when an accepted legal, regulatory, contractual, or audit requirement applies; otherwise `false` |
| Defect Detection | 0 = duplicates existing proof; 5 = covers a distinct branch/state; 10 = uniquely detects a critical boundary or cross-service failure |

```
ROI Score = Business Value × User Frequency + Legal Requirement × 10 + Defect Detection
              (range: 0–120)
```

Higher ROI Score = higher priority within its test type. For equal scores, order by Legal Requirement (`true` first), then higher Defect Detection, Business Value, User Frequency, and finally source AC order. No normalization or capping is applied — the raw score is used directly for ranking. Deduplication is a separate step that removes candidates entirely; it does not modify scores.

### ROI Thresholds by Lane

The two E2E lanes have different ownership costs and use independent standard thresholds.

| Lane | ROI threshold | Rationale |
|------|---------------|-----------|
| fixture-e2e | ROI ≥ 20 (beyond reserved slot) | Cost is comparable to integration tests once the harness exists; the floor avoids filling MAX 3 with low-signal tests when fewer would suffice |
| service-integration-e2e | ROI > 50 (beyond reserved slot) | Live-service setup, state cleanup, and failure diagnosis add material ownership cost; reserve for journeys whose value cannot be proven any other way |

Reserved slot rules (see Multi-Step User Journey Definition below) apply per lane and override the threshold (the reserved candidate is emitted regardless of its ROI score). Below-floor candidates beyond the reserved slot are not emitted unless an accepted requirement or distinct uncovered failure mode justifies an exception. Leave budget intentionally unfilled rather than padding with low-value tests; record any threshold or budget exception in the skeleton and generation report.

### ROI Calculation Examples

| Scenario | BV | Freq | Legal | Defect | ROI Score | Test Type | Selection Outcome |
|----------|----|------|-------|--------|-----------|-----------|-------------------|
| Core checkout UI flow | 10 | 10 | true | 10 | 120 | fixture-e2e | Selected (reserved slot: user-facing multi-step journey, browser-level verification with fixtures) |
| Core checkout against live payment service | 10 | 10 | true | 10 | 120 | service-integration-e2e | Selected (real-service correctness above ROI threshold) |
| Dismiss button updates UI state | 5 | 10 | false | 5 | 55 | fixture-e2e | Selected (rank 2 of 3 fixture-e2e budget) |
| Payment error message display | 5 | 5 | false | 5 | 30 | fixture-e2e | Selected (rank 3 of 3 fixture-e2e budget) |
| Optional filter toggle | 5 | 5 | false | 0 | 25 | fixture-e2e | Removed during deduplication (duplicates existing proof) |
| Payment retry against real provider | 5 | 5 | false | 5 | 30 | service-integration-e2e | Below ROI threshold (30 < 50), not selected |
| DB persistence check | 10 | 5 | false | 10 | 60 | Integration | Selected (rank 1 of 3) |
| Pure data transformation | 5 | 5 | false | 5 | 30 | Unit | Not selected (push down to unit test) |

## Multi-Step User Journey Definition

A candidate qualifies as a **multi-step user journey** when ALL of the following are true:

1. **2+ distinct interaction boundaries** are traversed in sequence to complete a user goal. What counts as a boundary depends on the system type:
   - Web: distinct routes/pages
   - Mobile native: distinct screens/views
   - CLI: distinct command invocations or interactive prompts
   - API: distinct API calls forming a transaction (e.g., create → confirm → finalize)
2. **State carries across steps** — data produced or actions taken in one step affect what the next step accepts or displays
3. **The journey has a completion point** — a final state the user or caller reaches (e.g., confirmation page, saved record, API success response, completed workflow)

### User-Facing vs Service-Internal Journeys

Multi-step journeys are classified for reserved-slot eligibility:

| Classification | Condition | Reserved Slot Eligibility | Example |
|---|---|---|---|
| **User-facing** | A human user directly triggers and observes the steps (via UI, CLI, or direct API interaction) | Eligible — defaults to **fixture-e2e** reserved slot. Add a service-integration-e2e reserved slot only when the journey's correctness depends on real cross-service behavior | Web checkout flow, CLI setup wizard, mobile onboarding |
| **Service-internal** | Steps are triggered by backend services without direct user interaction | Not eligible for reserved slot — use integration tests. Service-integration-e2e through normal ROI > 50 path is still valid when full-system verification is warranted | Async job pipeline, service-to-service saga, scheduled batch processing |

This classification applies only to the reserved-slot rule and the E2E Gap Check. Other selection follows lane-specific ROI rules above.

Use this definition when evaluating E2E test candidates and E2E gap detection.

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
ROI: [score]
```

**`@lane` selection rule**:
- `integration` — Component interaction in-process, no browser (e.g., RTL+MSW for React/TS, in-process module/handler integration in any language)
- `fixture-e2e` — Browser-level UI verification with mocked backend / fixture-driven state
- `service-integration-e2e` — Browser-level or end-to-end verification against running local services or stubs

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

The test runner or framework in the project determines the appropriate file extension. Repos that already use a single `*.e2e.test.*` convention may keep it as long as each file declares `@lane:` in its header — the lane annotation is the source of truth for routing and budget accounting.

## Review Criteria

### Skeleton and Implementation Consistency

| Check | Failure Condition |
|-------|-------------------|
| Behavior Verification | No assertion for "observable result" in the implemented test |
| Verification Item Coverage | Listed items not all covered by assertions |
| Mock Boundary | Internal components mocked in integration test |

### Implementation Quality

| Check | Failure Condition |
|-------|-------------------|
| AAA Structure | Arrange/Act/Assert separation unclear |
| Independence | State sharing between tests, order dependency |
| Reproducibility | Date/random dependency, varying results |
| Readability | Test name doesn't match verification content |

### Route Parity for Shared Mutations

When multiple routes reach the same mutation, compare validation, classification, resource bounds, and read/parse/mutation/reporting order. Each difference requires an authoritative requirement, design contract, or explicit test claim; otherwise require a test exposing the bypass or inconsistent outcome.

## Quality Standards

### Required
- Each test verifies one behavior
- Clear AAA (Arrange-Act-Assert) structure
- No test interdependencies
- Deterministic execution
