---
name: test-implement
description: Implements React/TypeScript unit, integration, and browser E2E tests with the repository's configured runner, mocks, setup, and browser harness. Use when creating or completing frontend tests and generated test skeletons.
---

# Test Implementation Patterns

## Reference Selection

| Test Type | Reference | When to Use |
|-----------|-----------|-------------|
| **Unit / Integration** | [references/frontend.md](references/frontend.md) | Implementing React component tests with the repository's configured runner and network mocking layer |
| **E2E** | [references/e2e.md](references/e2e.md) | Implementing browser-level E2E tests in the existing harness, or Playwright when the approved work introduces a harness |

## Common Principles

### AAA Structure
All tests follow **Arrange-Act-Assert**:
- **Arrange**: Set up preconditions and inputs
- **Act**: Execute the behavior under test
- **Assert**: Verify the expected outcome

### Test Independence
- Each test runs independently without depending on other tests
- No shared mutable state between tests
- Deterministic execution — mock random and time dependencies

### Naming
- Test names describe expected behavior from user perspective
- One test verifies one behavior
