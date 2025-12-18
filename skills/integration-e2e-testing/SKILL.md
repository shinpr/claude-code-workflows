---
name: integration-e2e-testing
description: Integration and E2E test design principles, ROI calculation, test skeleton specification, and review criteria. Use when designing integration tests, E2E tests, or reviewing test quality.
---

# Integration and E2E Testing Principles

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

### Exclude (Low ROI in CI/CD)
- External service real connections → Use contract/interface verification
- Performance metrics → Non-deterministic, defer to load testing
- Implementation details → Focus on observable behavior
- UI layout specifics → Focus on information availability

**Principle**: Test = User-observable behavior verifiable in isolated CI environment

## ROI Calculation

```
ROI Score = (Business Value × User Frequency + Legal Requirement × 10 + Defect Detection)
            / (Creation Cost + Execution Cost + Maintenance Cost)
```

### Cost Table

| Test Type | Create | Execute | Maintain | Total |
|-----------|--------|---------|----------|-------|
| Unit | 1 | 1 | 1 | 3 |
| Integration | 3 | 5 | 3 | 11 |
| E2E | 10 | 20 | 8 | 38 |

## Test Skeleton Specification

### Required Comment Patterns

Each test MUST include the following annotations:

```
// AC: [Original acceptance criteria text]
// Behavior: [Trigger] → [Process] → [Observable Result]
// @category: core-functionality | integration | edge-case | e2e
// @dependency: none | [component names] | full-system
// @complexity: low | medium | high
// ROI: [score]
```

### Verification Items (Optional)

When verification points need explicit enumeration:
```
// Verification items:
// - [Item 1]
// - [Item 2]
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

### Prohibited
- Testing implementation details
- Multiple behaviors per test
- Shared mutable state
- Time-dependent assertions without mocking