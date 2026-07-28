# E2E Test Implementation

## Browser Harness Resolution

Inspect the repository's browser-test configuration, scripts, fixtures, neighboring tests, and CI routing. Preserve the existing harness, imports, locator conventions, setup lifecycle, file naming, and test location.

When no browser harness exists, introduce one only when the accepted Design Doc or task explicitly includes that work. Otherwise return the missing harness decision.

## Lane Selection

- `fixture-e2e`: run a real browser against deterministic fixture or intercepted backend behavior.
- `service-integration-e2e`: run against the required local services or stubs when correctness depends on persistence, transactions, or cross-service contracts.

Preserve the lane selected by the skeleton. A lane change requires evidence that the original lane cannot prove the accepted behavior.

## Structure and Reuse

- Follow the repository's existing browser abstraction and paths.
- When establishing an approved new Playwright convention, use `*.fixture.e2e.test.ts` and `*.service.e2e.test.ts`, or the naming defined by the parent test skill.
- Introduce a page object when one interaction is reused across 3+ tests or a coherent workflow would otherwise be duplicated. Keep direct accessible locators for a small, local test.

## Fixture Lane

Use the repository's existing route interception or fixture-loader boundary. Fixtures are deterministic, local to the test or suite, and shaped like the real contract. The browser still exercises the actual UI, navigation, and state updates.

## Service Lane Prerequisites

Before implementation or execution, identify:

- service start and health-check commands;
- test-safe database or data target;
- deterministic seed and cleanup mechanism;
- authentication setup;
- required environment variables and external stubs.

Use the repository's existing seed and authentication mechanisms. Create per-test data with unique identifiers and clean it through the supported API, database fixture, or teardown path. When a required prerequisite is unavailable and adding it is outside approved scope, return the missing prerequisite instead of substituting fixture behavior.

## Locator and Assertion Rules

- Follow the repository's locator convention; otherwise prefer accessible role/name or label locators, then stable test IDs when no semantic locator exists.
- Assert user-observable state, navigation, accessibility, or persisted behavior named by the skeleton. Avoid assertions tied only to CSS classes or internal DOM structure.
- When the UI specification defines responsive behavior, run the affected interaction at the specified viewport; otherwise use the repository's default browser matrix.
- Each test starts from isolated state and remains independent of execution order.

## Skeleton Comment Format

Preserve the skeleton's annotations using the source language's comment syntax:

```text
AC: [acceptance criterion]
Behavior: [trigger] → [process] → [observable result]
@category: fixture-e2e | service-integration-e2e
@lane: fixture-e2e | service-integration-e2e
@dependency: none | [dependency names] | full-system
@complexity: low | medium | high
ROI: [score]
```

When `Verification items:` are present, implement and assert every listed item.
