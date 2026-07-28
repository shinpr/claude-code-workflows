# Frontend Test Implementation (React/TypeScript)

## Project Toolchain Resolution

Before writing a test, inspect package scripts, runner configuration, setup files, neighboring tests, DOM/browser environment, and network handlers. Preserve the repository's runner, imports, mock API, setup lifecycle, file naming, and test location.

- Use React Testing Library when it is the project's component-test renderer; prefer `userEvent` for user interactions.
- Use the repository's network mocking layer for API behavior. When MSW is configured, extend its handlers instead of adding runner-level fetch mocks.
- Use the configured runner's imports, module-mocking API, fake timers, and reset conventions.
- When multiple approaches coexist, follow the dominant convention in the changed feature area. If none is representative and adding or replacing tooling is outside the approved work, report the missing test-environment decision.

## Test Scope

- Concentrate rigor on shared components, hooks, and utilities with a wide blast radius. Use integration or E2E coverage for higher-composition surfaces when their boundary is the behavior under test.
- For a behavior-preserving refactor, establish passing regression or characterization evidence before the change and rerun it afterward.
- Configuration that changes runtime or build behavior requires executable validation. Documentation-only changes do not require test-first development.
- Continuity tests cover existing feature behavior affected by the change; long-term performance and operational testing remain infrastructure concerns unless the accepted work includes them.

## Mock Boundary

- For network behavior, use the repository's network-level mock layer rather than mocking implementation modules.
- Mock only direct external I/O. Exercise internal utilities, business logic, and the component boundary under test through real implementations.
- Keep test data minimal and free of real sensitive values.

## Failure Classification

| Evidence | Action |
|---|---|
| Expected value or test setup contradicts the accepted contract | Fix the test |
| Implementation violates the accepted behavior or boundary | Fix the implementation |
| Both interpretations remain compatible with available requirements | Return the unresolved behavior decision |

## Helper Decision

Keep setup local until 3+ uses or a named readability/contract benefit justifies a helper. Preserve separate helpers when the scenarios have different ownership or are likely to evolve independently.

## Repository Conventions

- Preserve the repository's test location and naming. For an approved new co-located React convention, use `{ComponentName}.test.tsx`; for integration tests, use `{FeatureName}.integration.test.tsx`.
- Keep tests executable. Fix or remove tests that no longer describe accepted behavior; remove `skip` markers used only to bypass a failure.
- Test rendered output, user interactions, accessibility, and observable error states rather than component internals.

## Assertion Rules

- Use independently derived literal values by default. An approved snapshot, property, or fixture expectation may replace a literal when it provides a clearer independent oracle.
- Every test executes at least one assertion that proves the expected observable behavior.
- Verify final results and state changes; use mock-call assertions only when the call contract itself is the observable boundary.
- For asynchronous UI, use the repository's established async query/wait pattern and assert the resulting user-visible state.
