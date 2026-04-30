# E2E Test Implementation with Playwright

## Test Framework
- **Playwright Test**: `@playwright/test`
- Test imports: `import { test, expect } from '@playwright/test'`

## Test Structure

### Directory Layout
```
tests/
└── e2e/
    ├── pages/              # Page objects
    │   ├── login.page.ts
    │   └── dashboard.page.ts
    ├── fixtures/           # Test fixtures
    │   └── auth.fixture.ts
    └── *.e2e.test.ts       # Test files
```

### Naming Conventions
- Test files: `{FeatureName}.e2e.test.ts`
- Page objects: `{PageName}.page.ts`
- Fixtures: `{Purpose}.fixture.ts`

## Page Object Pattern

Encapsulate page interactions for reusability and maintainability:

```typescript
import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign in' })
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

## Test Patterns

### Basic Test
```typescript
import { test, expect } from '@playwright/test'

test('user can navigate to dashboard after login', async ({ page }) => {
  // Arrange
  await page.goto('/login')

  // Act
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Assert
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
```

### With Page Objects
```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page'
import { DashboardPage } from './pages/dashboard.page'

test('user completes purchase flow', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const dashboardPage = new DashboardPage(page)

  await page.goto('/login')
  await loginPage.login('user@example.com', 'password')
  await expect(dashboardPage.heading).toBeVisible()
})
```

### Auth Fixture
```typescript
import { test as base } from '@playwright/test'

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('/dashboard')
    await use(page)
  },
})
```

## E2E Environment Prerequisites

E2E tests require a running application with real data state. Unlike unit/integration tests, environment setup is part of E2E test implementation scope.

### Seed Data Strategy

Prepare test data via API calls or database seeding:

```typescript
// fixtures/seed.fixture.ts
import { test as base } from '@playwright/test'

export const test = base.extend<{ seededData: SeedResult }>({
  seededData: async ({ request }, use) => {
    // Arrange: Create test data via API before test
    // Example: adjust to the project's actual seeding mechanism
    const result = await request.post('/api/test/seed', {
      data: { scenario: 'e2e-user-with-subscription' }
    })
    const seedData = await result.json()

    await use(seedData)

    // Cleanup: Remove test data after test
    await request.delete(`/api/test/seed/${seedData.id}`)
  },
})
```

**Principles**:
- Use the application's existing seeding mechanism if present; create new seed endpoints only when no alternative exists
- Seed data setup belongs to test fixtures, not to a separate manual step
- Each test must be self-contained: create its own data, clean up after
- Seed data via API endpoints or direct DB access only

### Authentication Fixture

Implement auth fixtures that match the application's actual login flow:

```typescript
// fixtures/auth.fixture.ts
export const test = base.extend<{ playerPage: Page }>({
  playerPage: async ({ page, request }, use) => {
    // Use the application's existing auth endpoint — not admin backdoors
    // Example: adjust the URL and payload to match the project's actual login flow
    await request.post('/api/login', {
      data: { loginId: E2E_LOGIN_ID, password: E2E_PASSWORD }
    })
    // Transfer session to browser context
    await page.goto('/')
    await use(page)
  },
})
```

**Principles**:
- Use the application's existing authentication flow; auth fixtures must follow the same path that real users use
- Use the application's production authentication flow for E2E auth (the same endpoints real users hit)
- Store test credentials in environment variables only (`E2E_*` prefixed)
- If the auth flow requires specific user records, seed them in the fixture

### Environment Checklist

Before E2E tests can pass, verify:
- [ ] Application is running and accessible at `baseURL`
- [ ] Database has required seed data (test users, subscriptions, content)
- [ ] Authentication flow works with test credentials
- [ ] Environment variables are set (`E2E_*` prefixed)
- [ ] External services are either available or mocked via `page.route()`

When the work plan includes dedicated environment setup tasks (Phase 0), follow those tasks. When no setup tasks exist in the plan, address missing prerequisites as part of the E2E test implementation task itself.

## Locator Strategy

Prefer accessible locators in this order:
1. `page.getByRole()` — best for accessibility
2. `page.getByLabel()` — form elements
3. `page.getByText()` — visible text
4. `page.getByTestId()` — last resort

```typescript
await page.getByRole('button', { name: 'Submit' }).click()
```

## Assertions

```typescript
// Visibility
await expect(page.getByText('Success')).toBeVisible()
await expect(page.getByText('Error')).not.toBeVisible()

// Navigation
await expect(page).toHaveURL('/dashboard')
await expect(page).toHaveTitle('Dashboard')

// Element state
await expect(page.getByRole('button')).toBeEnabled()
await expect(page.getByRole('button')).toBeDisabled()

// Content
await expect(page.getByRole('heading')).toHaveText('Welcome')
```

## Viewport Testing

When UI Spec defines responsive behavior:

```typescript
test.describe('responsive navigation', () => {
  test('shows hamburger menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
    await expect(page.getByRole('navigation')).not.toBeVisible()
  })

  test('shows full navigation on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
```

## Test Isolation

- Each test starts from a clean browser context
- No shared state between tests
- Use `beforeEach` for common setup (auth, navigation)
- Prefer `page.goto()` over in-test navigation for setup steps

## Skeleton Comment Format

E2E test skeletons follow the same annotation format as integration tests (adapt comment syntax to the project's language):

```typescript
// AC: [Original acceptance criteria text]
// Behavior: [User action] → [System response] → [Observable result]
// @category: e2e
// @dependency: full-system
// @complexity: high
// ROI: [score]
test('AC1: [Description]', async ({ page }) => {
  // Arrange: [Setup description]
  // Act: [Action description]
  // Assert: [Verification description]
})
```
