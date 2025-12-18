---
name: typescript-testing
description: Frontend testing rules with Vitest, React Testing Library, and MSW. Includes coverage requirements, test design principles, and quality criteria. Use when writing frontend tests or reviewing test quality.
---

# TypeScript Testing Rules (Frontend)

## Test Framework
- **Vitest**: This project uses Vitest
- **React Testing Library**: For component testing
- **MSW (Mock Service Worker)**: For API mocking
- Test imports: `import { describe, it, expect, beforeEach, vi } from 'vitest'`
- Component test imports: `import { render, screen, fireEvent } from '@testing-library/react'`
- Mock creation: Use `vi.mock()`

## Basic Testing Policy

### Quality Requirements
- **Coverage**: Unit test coverage must be 60% or higher (Frontend standard 2025)
- **Independence**: Each test can run independently without depending on other tests
- **Reproducibility**: Tests are environment-independent and always return the same results
- **Readability**: Test code maintains the same quality as production code

### Coverage Requirements (ADR-0002 Compliant)
**Mandatory**: Unit test coverage must be 60% or higher
**Component-specific targets**:
- Atoms (Button, Text, etc.): 70% or higher
- Molecules (FormField, etc.): 65% or higher
- Organisms (Header, Footer, etc.): 60% or higher
- Custom Hooks: 65% or higher
- Utils: 70% or higher

**Metrics**: Statements, Branches, Functions, Lines

### Test Types and Scope
1. **Unit Tests (React Testing Library)**
   - Verify behavior of individual components or functions
   - Mock all external dependencies
   - Most numerous, implemented with fine granularity
   - Focus on user-observable behavior

2. **Integration Tests (React Testing Library + MSW)**
   - Verify coordination between multiple components
   - Mock APIs with MSW (Mock Service Worker)
   - No actual DB connections (backend manages DB)
   - Verify major functional flows

3. **Cross-functional Verification in E2E Tests**
   - Mandatory verification of impact on existing features when adding new features
   - Cover integration points with "High" and "Medium" impact levels from Design Doc's "Integration Point Map"
   - Verification pattern: Existing feature operation → Enable new feature → Verify continuity of existing features
   - Success criteria: No change in displayed content, rendering time within 5 seconds
   - Designed for automatic execution in CI/CD pipelines

## Red-Green-Refactor Process (Test-First Development)

**Recommended Principle**: Always start code changes with tests

**Background**:
- Ensure behavior before changes, prevent regression
- Clarify expected behavior before implementation
- Ensure safety during refactoring

**Development Steps**:
1. **Red**: Write test for expected behavior (it fails)
2. **Green**: Pass test with minimal implementation
3. **Refactor**: Improve code while maintaining passing tests

**NG Cases (Test-first not required)**:
- Pure configuration file changes (vite.config.ts, tailwind.config.js, etc.)
- Documentation-only updates (README, comments, etc.)
- Emergency production incident response (post-incident tests mandatory)

## Test Design Principles

### Test Case Structure
- Tests consist of three stages: "Arrange," "Act," "Assert"
- Clear naming that shows purpose of each test
- One test case verifies only one behavior

### Test Data Management
- Manage test data in dedicated directories or co-located with tests
- Define test-specific environment variable values
- Always mock sensitive information
- Keep test data minimal, using only data directly related to test case verification purposes

### Mock and Stub Usage Policy

✅ **Recommended: Mock external dependencies in unit tests**
- Merit: Ensures test independence and reproducibility
- Practice: Mock API calls with MSW, mock external libraries

❌ **Avoid: Actual API connections in unit tests**
- Reason: Slows test speed and causes environment-dependent problems

### Test Failure Response Decision Criteria

**Fix tests**: Wrong expected values, references to non-existent features, dependence on implementation details, implementation only for tests
**Fix implementation**: Valid specifications, business logic, important edge cases
**When in doubt**: Confirm with user

## Test Helper Utilization Rules

### Basic Principles
Use test helpers to reduce duplication and improve maintainability.

### Decision Criteria
| Mock Characteristics | Response Policy |
|---------------------|-----------------|
| **Simple and stable** | Consolidate in common helpers |
| **Complex or frequently changing** | Individual implementation |
| **Duplicated in 3+ places** | Consider consolidation |
| **Test-specific logic** | Individual implementation |

### Test Helper Usage Examples
```typescript
// ✅ Builder pattern for test data
const testUser = createTestUser({ name: 'Test User', email: 'test@example.com' })

// ✅ Custom render function with providers
function renderWithProviders(ui: React.ReactElement) {
  return render(<TestProvider>{ui}</TestProvider>)
}

// ❌ Individual implementation of duplicate complex mocks
```

## Test Implementation Conventions

### Directory Structure (Co-location Principle)
```
src/
└── components/
    └── Button/
        ├── Button.tsx
        ├── Button.test.tsx  # Co-located with component
        └── index.ts
```

**Rationale**:
- React Testing Library best practice
- ADR-0002 Co-location principle
- Easy to find and maintain tests alongside implementation

### Naming Conventions
- Test files: `{ComponentName}.test.tsx`
- Integration test files: `{FeatureName}.integration.test.tsx`
- Test suites: Names describing target components or features
- Test cases: Names describing expected behavior from user perspective

### Test Code Quality Rules

✅ **Recommended: Keep all tests always active**
- Merit: Guarantees test suite completeness
- Practice: Fix problematic tests and activate them

❌ **Avoid: test.skip() or commenting out**
- Reason: Creates test gaps and incomplete quality checks
- Solution: Completely delete unnecessary tests

## Test Granularity Principles

### Core Principle: User-Observable Behavior Only
**MUST Test**: Rendered output, user interactions, accessibility, error states
**MUST NOT Test**: Component internal state, implementation details, CSS class names

```typescript
// ✅ Test user-observable behavior
expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()

// ❌ Test implementation details
expect(component.state.count).toBe(0)
```

## Test Quality Criteria

These criteria ensure reliable, maintainable tests.

### Literal Expected Values
Use hardcoded literal values for assertions. This ensures independent verification of implementation correctness.
```typescript
expect(formatPrice(1000)).toBe('¥1,000')
expect(calculateTax(100)).toBe(10)
expect(user.role).toBe('admin')
```

### Result-Based Verification
Verify final results and outcomes. Use `toHaveBeenCalledWith` for argument verification.
```typescript
expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'test' })
expect(result).toEqual({ id: '1', status: 'success' })
expect(screen.getByText('Submitted')).toBeInTheDocument()
```

### Meaningful Assertions
Every test must include at least one `expect()` that validates observable behavior.
```typescript
it('displays error message on invalid input', () => {
  render(<Form />)
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
  expect(screen.getByText('Required field')).toBeInTheDocument()
})
```

### Appropriate Mock Scope
Mock only direct external I/O dependencies (API clients, database connections). Internal utilities should use real implementations.
```typescript
vi.mock('./api/userApi')  // External API - mock
vi.mock('./lib/database') // External I/O - mock
// Internal utils like validators/formatters - use real implementations
```

## Mock Type Safety Enforcement

### MSW (Mock Service Worker) Setup
```typescript
// ✅ Type-safe MSW handler
import { rest } from 'msw'

const handlers = [
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: '1', name: 'John' } satisfies User))
  })
]
```

### Component Mock Type Safety
```typescript
// ✅ Only required parts
type TestProps = Pick<ButtonProps, 'label' | 'onClick'>
const mockProps: TestProps = { label: 'Click', onClick: vi.fn() }

// Only when absolutely necessary, with clear justification
const mockRouter = {
  push: vi.fn()
} as unknown as Router // Complex router type structure
```

## Continuity Test Scope

Limited to verifying existing feature impact when adding new features. Long-term operations and performance testing are infrastructure responsibilities, not test scope.

## Basic React Testing Library Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button label="Click me" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```