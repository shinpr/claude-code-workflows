---
name: testing-principles
description: Language-agnostic testing principles for choosing which tests a change needs, test quality, and proof ownership, with frontend and browser E2E implementation references. Use when writing tests, deciding test scope, or reviewing test quality.
---

# Language-Agnostic Testing Principles

Tests here guarantee accepted behavior, and the next agent reads every existing test as a requirement to preserve. A brittle, duplicated, or implementation-shaped test therefore becomes a false requirement: it gets worked around, and the workaround leaves debt in the implementation. Keep the set of tests whose proof is worth its maintenance.

## Test Selection

- Prove accepted behavior by default through integration and E2E tests at the boundary users and callers observe. Add a unit test for logic whose cases one representative boundary test cannot prove, such as calculations, parsing, or branching rules.
- Each behavioral claim is owned by one test: such logic by its unit test, other behavior by the test at the narrowest integration or E2E boundary where it is observable. A test at a wider boundary or in a variant (viewport, device, role) proves what that boundary or variant adds, such as wiring, mapping, persistence, rendering, or navigation, and keeps at most one representative case of a rule owned elsewhere.
- Determine the required proof boundary from the accepted outcome before minimizing tests. An outcome delivered through an application or service entry point includes the relevant production composition, such as routing, providers, state ownership or adapters. An isolated component test or a test-built substitute composition does not prove that wiring. Reuse proof that traverses it, or select a test that will; choose the harness by what it must observe, not by component count or a lane quota. A disconnected action, lost state update or broken transition can remain invisible to tests below that boundary. Explicitly component-scoped outcomes retain their component boundary.
- Treat coverage as a diagnostic signal for finding untested areas, not a target; any CI threshold is the project's config, not a quality goal in itself.
- Use project-configured speed budgets when present. Otherwise investigate test speed only when observed feedback or CI cost is material to the current outcome; retain slower tests when their proof boundary requires it.

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

## References

- [references/frontend.md](references/frontend.md): read when writing, changing, or reviewing component, hook, or UI integration tests
- [references/e2e.md](references/e2e.md): read when writing, changing, or reviewing browser E2E tests
