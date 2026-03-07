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

## Locator Strategy

Prefer accessible locators in this order:
1. `page.getByRole()` — best for accessibility
2. `page.getByLabel()` — form elements
3. `page.getByText()` — visible text
4. `page.getByTestId()` — last resort

```typescript
// Preferred
await page.getByRole('button', { name: 'Submit' }).click()

// Avoid
await page.locator('#submit-btn').click()
await page.locator('.btn-primary').click()
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

E2E test skeletons follow the same annotation format as integration tests:

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
