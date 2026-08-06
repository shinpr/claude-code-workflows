---
name: testing-principles
description: Language-agnostic testing principles including TDD, test quality, coverage standards, and test design patterns. Use when writing tests, designing test strategies, or reviewing test quality.
---

# Language-Agnostic Testing Principles

## Test-Driven Development (TDD)

Use this cycle for new or changed executable behavior and reproducible bug fixes. For a behavior-preserving refactor, first confirm existing tests pass or add passing characterization tests, then refactor and rerun the same regression evidence.

RED: confirm the new test fails for the intended reason. GREEN: implement the smallest passing change. REFACTOR: improve structure while the test remains green. VERIFY: run the repository's applicable regression checks.

## Quality Requirements

- Treat coverage as a diagnostic signal for finding untested areas, not a target — a target gets gamed into trivial tests (Goodhart's Law)
- Concentrate tests on critical paths, business logic, and behavior whose regression would matter
- Prioritize meaningful assertions over the coverage number; any CI threshold is the project's config, not a quality goal in itself
- Use project-configured speed budgets when present. Otherwise treat unit tests ≥ 100ms, integration tests ≥ 1s, or a full suite ≥ 10 minutes as mandatory slow-test review triggers; retain slower tests only when their boundary/value requires it and record the reason

## Test Design Rules

- Structure each test as Arrange, one Act, and Assert; multiple assertions may prove one behavior.
- Follow the repository's test naming convention and name the condition and observable outcome.
- Exercise behavior through a public or integration boundary. Assertions verify return values, outputs, errors, or state changes rather than private implementation.
- Use independently derived literal, property, approved snapshot, or fixture expectations. An implementation-derived oracle cannot detect the same implementation defect.
- Keep each test's expected outcome unconditional. Table-driven or property-based cases are acceptable when each case is reported distinctly and uses an independent oracle.
- Cover accepted boundary and error behavior; derive cases from the contract instead of adding generic edge-case permutations.
- Each test creates and cleans up its own state, passes in isolation and any order, and controls time or randomness that affects its result.
- Keep tests executable. Fix or remove tests that no longer describe accepted behavior; restore tests disabled only to bypass a failure.

## Mock and Boundary Rules

- Mock direct external I/O boundaries; keep internal business logic and the boundary under test real.
- Use the existing application-owned adapter as the mock boundary. Introduce an adapter only when external I/O, an unstable contract, or required substitution cannot be controlled through the current design.
- Keep mock behavior limited to the contract needed by the test.

## Data Layer Testing

Mock-based tests are sufficient when data access is only a dependency of the behavior under test. Verify against the project's real database engine or its accepted equivalent when the subject is a query, repository implementation, schema constraint, or migration compatibility. Resolve the test environment from repository configuration; when no representative environment exists and adding one is outside the approved work, report the missing verification decision.

Cross-check data-access code against the schema source named in the Design Doc or repository configuration. Schema-source verification is required to prove table, column, type, constraint, or dialect compatibility; successful mocks prove behavior only at the mocked boundary.

## Verification Requirements

### Capability Probe Postconditions

A capability probe passes when it uses the consumer's boundary and asserts the exact property that consumer needs. Command success, import success, or object existence is setup evidence.

## Test Organization

Follow the repository's established test paths, runner routing, and naming. When establishing an approved new convention, separate test types only when their setup, runner, or environment differs.

## Regression Testing

- Add a regression test for every reproducible behavior bug fix. When executable reproduction is impossible, record the reason and the alternative static, contract, or environment evidence that prevents recurrence.
- Before behavior-preserving changes to uncharacterized legacy code, establish passing characterization evidence and rerun it after the change.
