---
name: test-implement
description: Test implementation patterns and conventions. Use when implementing unit tests, integration tests, or E2E tests, including RTL+Vitest+MSW component testing and Playwright E2E testing.
---

# Test Implementation Patterns

## Reference Selection

| Test Type | Reference | When to Use |
|-----------|-----------|-------------|
| **Unit / Integration** | [references/frontend.md](references/frontend.md) | Implementing React component tests with RTL + Vitest + MSW |
| **E2E** | [references/e2e.md](references/e2e.md) | Implementing browser-level E2E tests with Playwright |

## Common Principles

### AAA Structure
All tests follow **Arrange-Act-Assert**:
- **Arrange**: Set up preconditions and inputs
- **Act**: Execute the behavior under test
- **Assert**: Verify the expected outcome

### Test Independence
- Each test runs independently without depending on other tests
- No shared mutable state between tests
- Deterministic execution — no random or time dependencies without mocking

### Naming
- Test names describe expected behavior from user perspective
- One test verifies one behavior
