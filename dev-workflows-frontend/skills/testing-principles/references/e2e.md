# UI E2E Test Implementation

UI E2E tests drive the real UI runtime: a browser for web UI, or a simulator, emulator, or device for native apps.

## Harness Resolution

Inspect the repository's E2E harness configuration, scripts, fixtures, neighboring tests, and CI routing. Preserve the existing harness, imports, element-query conventions, setup lifecycle, file naming, and test location.

When no E2E harness exists, establish one only when a test skeleton, the task's Operation Verification Methods, or an accepted requirement names UI E2E proof, selecting the lowest-surface sufficient harness from repository and applicable external evidence; otherwise prove the behavior at the cheaper observable boundary. Report an unavailable execution environment as a proof limitation rather than a user decision.

## Lane Selection

- `fixture-e2e`: drive the real UI runtime against deterministic fixture or stubbed backend behavior.
- `service-integration-e2e`: run against the required local services or stubs when correctness depends on persistence, transactions, or cross-service contracts.

Preserve the lane selected by the skeleton. A lane change requires evidence that the original lane cannot prove the accepted behavior.

## Structure and Reuse

- Follow the repository's existing E2E abstraction and paths.
- Extract a screen-level interaction helper, such as a page or screen object, when one interaction is reused across 3+ tests or a coherent workflow would otherwise be duplicated. Keep direct element queries in a small, local test.

## Fixture Lane

Replace backend behavior through the repository's existing network-stubbing or fixture-loading mechanism. Fixtures are deterministic, local to the test or suite, and shaped like the real contract. The UI runtime still exercises the actual UI, navigation, and state updates.

## Service Lane Prerequisites

Before implementation or execution, identify:

- service start and health-check commands;
- test-safe database or data target;
- deterministic seed and cleanup mechanism;
- authentication setup;
- required environment variables and external stubs.

Use the repository's existing seed and authentication mechanisms. Create per-test data with unique identifiers and clean it through the supported API, database fixture, or teardown path. When a required prerequisite is unavailable and adding it is outside approved scope, return the missing prerequisite instead of substituting fixture behavior.

## Element Query and Assertion Rules

- Follow the repository's query convention; otherwise locate elements by accessible role and name or label, then by stable test IDs when no semantic query exists.
- Assert user-observable state, navigation, accessibility, or persisted behavior named by the skeleton. Treat assertions tied only to styling classes or internal view structure as insufficient proof.
- When the UI specification defines responsive behavior, run the affected interaction at the specified viewport or device size; otherwise use the repository's default browser or device matrix.

## Skeleton Annotations

Preserve the skeleton's annotations unchanged, except `Selection evidence`, which served test selection only and is removed when the test becomes executable. When `Verification items:` are present, implement and assert every listed item.
