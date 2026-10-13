# Frontend Test Implementation (React/TypeScript)

## Project Toolchain Resolution

Before writing a test, inspect package scripts, runner configuration, setup files, neighboring tests, DOM/browser environment, and network handlers. Preserve the repository's runner, imports, mock API, setup lifecycle, file naming, and test location.

- Use React Testing Library when it is the project's component-test renderer; prefer `userEvent` for user interactions.
- Use the repository's network mocking layer for API behavior. When MSW is configured, extend its handlers instead of adding runner-level fetch mocks.
- Use the configured runner's imports, module-mocking API, fake timers, and reset conventions.
- When multiple approaches coexist, follow the dominant convention in the changed feature area. If none is representative and adding or replacing tooling is outside the approved work, report the missing test-environment decision.

## Test Scope

- In UI code, logic that needs its own unit tests usually lives in shared components, hooks, and utilities with a wide blast radius. Screen behavior is owned by the narrowest test that renders the real composition.
- Configuration that changes runtime or build behavior requires executable validation.

## Test Data

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
- Test rendered output, user interactions, accessibility, and observable error states rather than component internals.

## Assertion Rules

- Use mock-call assertions only when the call contract itself is the observable boundary.
- For asynchronous UI, use the repository's established async query/wait pattern and assert the resulting user-visible state.
