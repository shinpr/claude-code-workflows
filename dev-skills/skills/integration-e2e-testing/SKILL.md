---
name: integration-e2e-testing
description: Integration and E2E test design principles, ROI calculation, test skeleton specification, and review criteria. Use when designing integration tests, E2E tests, or reviewing test quality.
---

# Integration and E2E Testing Principles

## References

**E2E test design with Playwright**: See [references/e2e-design.md](references/e2e-design.md) for UI Spec-driven E2E test candidate selection and Playwright test architecture.

## Test Type Definition and Limits

| Test Type | Purpose | Scope | Limit per Feature | Implementation Timing |
|-----------|---------|-------|-------------------|----------------------|
| Integration | Verify component interactions | Partial system integration | MAX 3 | Created alongside implementation |
| E2E | Verify critical user journeys | Full system | MAX 1-2 | Executed in final phase only |

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

```
ROI Score = Business Value × User Frequency + Legal Requirement × 10 + Defect Detection
              (range: 0–120)
```

Higher ROI Score = higher priority within its test type. No normalization or capping is applied — the raw score is used directly for ranking. Deduplication is a separate step that removes candidates entirely; it does not modify scores.

### ROI Threshold for E2E

E2E tests have high ownership cost (creation, execution, and maintenance are each 3-10× higher than integration tests). To justify creation, an E2E candidate (beyond the must-keep reserved slot) requires **ROI Score > 50**.

### ROI Calculation Examples

| Scenario | BV | Freq | Legal | Defect | ROI Score | Test Type | Selection Outcome |
|----------|----|------|-------|--------|-----------|-----------|-------------------|
| Core checkout flow | 10 | 9 | true | 9 | 109 | E2E | Selected (reserved slot: user-facing multi-step journey) |
| Payment error handling | 8 | 3 | false | 7 | 31 | E2E | Below threshold (31 < 50), not selected |
| Profile save flow | 7 | 6 | false | 6 | 48 | E2E | Below threshold (48 < 50), not selected |
| DB persistence check | 8 | 8 | false | 8 | 72 | Integration | Selected (rank 1 of 3) |
| Error message display | 5 | 3 | false | 4 | 19 | Integration | Selected (rank 2 of 3) |
| Optional filter toggle | 3 | 4 | false | 2 | 14 | Integration | Not selected (rank 4, budget full) |

## Multi-Step User Journey Definition

A feature qualifies as containing a **multi-step user journey** when ALL of the following are true:

1. **2+ distinct interaction boundaries** are traversed in sequence to complete a user goal. What counts as a boundary depends on the system type:
   - Web: distinct routes/pages
   - Mobile native: distinct screens/views
   - CLI: distinct command invocations or interactive prompts
   - API: distinct API calls forming a transaction (e.g., create → confirm → finalize)
2. **State carries across steps** — data produced or actions taken in one step affect what the next step accepts or displays
3. **The journey has a completion point** — a final state the user or caller reaches (e.g., confirmation page, saved record, API success response, completed workflow)

### User-Facing vs Service-Internal Journeys

Multi-step journeys are further classified for E2E budget decisions:

| Classification | Condition | E2E Reserved Slot | Example |
|---|---|---|---|
| **User-facing** | A human user directly triggers and observes the steps (via UI, CLI, or direct API interaction) | Eligible | Web checkout flow, CLI setup wizard, mobile onboarding |
| **Service-internal** | Steps are triggered by backend services without direct user interaction | Not eligible (use integration tests) | Async job pipeline, service-to-service saga, scheduled batch processing |

This classification applies only to the reserved E2E slot and the E2E Gap Check. Service-internal journeys are still valid E2E candidates through the normal ROI > 50 path if they warrant full-system verification.

Use this definition when evaluating E2E test candidates and E2E gap detection.

## Test Skeleton Specification

### Required Comment Patterns

Each test MUST include the following annotations:

```
AC: [Original acceptance criteria text]
Behavior: [Trigger] → [Process] → [Observable Result]
@category: core-functionality | integration | edge-case | e2e
@dependency: none | [component names] | full-system
@complexity: low | medium | high
ROI: [score]
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
- E2E tests: `*.e2e.test.*`

The test runner or framework in the project determines the appropriate file extension.

## Review Criteria

### Skeleton and Implementation Consistency

| Check | Failure Condition |
|-------|-------------------|
| Behavior Verification | No assertion for "observable result" in skeleton |
| Verification Item Coverage | Listed items not all covered by assertions |
| Mock Boundary | Internal components mocked in integration test |

### Implementation Quality

| Check | Failure Condition |
|-------|-------------------|
| AAA Structure | Arrange/Act/Assert separation unclear |
| Independence | State sharing between tests, order dependency |
| Reproducibility | Date/random dependency, varying results |
| Readability | Test name doesn't match verification content |

## Quality Standards

### Required
- Each test verifies one behavior
- Clear AAA (Arrange-Act-Assert) structure
- No test interdependencies
- Deterministic execution

