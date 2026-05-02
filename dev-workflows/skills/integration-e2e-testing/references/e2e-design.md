# E2E Test Design (Browser Harness)

This reference uses Playwright as the default example throughout because it is the standard E2E browser harness assumed by these workflows. Adapt patterns to the project's chosen framework when different (Cypress, Selenium, etc.); the lane definitions, ROI rules, and budgets remain the same.

## Two E2E Lanes

E2E tests in this workflow split into two lanes (see parent skill Test Type Definition):

| Lane | When | ROI gate | Cost |
|------|------|----------|------|
| **fixture-e2e** | UI journey verification with deterministic fixtures (mocked backend / fixture data) | None — selected by ranking within MAX 3 budget | Comparable to integration; runs in CI without infrastructure setup |
| **service-integration-e2e** | Journey correctness depends on real cross-service behavior (data persistence, transactional consistency, external contracts) | ROI > 50 (beyond reserved slot) | 3-10× higher than integration; reserved for what cannot be faked safely |

Both lanes typically use Playwright; the difference is whether the backend is mocked / fixture-driven or running for real.

## When to Create E2E Tests

E2E candidates target **critical user journeys** that span multiple pages or require real browser interaction. Pick the lane based on whether real services are required for the verification.

### Candidate Sources

| Source | What to Extract |
|--------|----------------|
| **Design Doc ACs** | User journeys with EARS "When" keyword spanning multiple screens |
| **UI Spec Screen Transitions** | Multi-step flows (e.g., form wizard, checkout) |
| **UI Spec State x Display Matrix** | Error/empty/loading states requiring browser-level verification |
| **UI Spec Interaction Definitions** | Complex interactions (drag-drop, keyboard navigation, responsive behavior) |

### Selection Criteria

**Include** (high E2E ROI):
- Multi-page user journeys (login → dashboard → action → confirmation)
- Flows requiring real browser APIs (navigation, cookies, localStorage)
- Accessibility verification requiring actual DOM rendering
- Responsive behavior across viewports

**Use integration tests instead when**:
- Testing single-component state changes → in-process component renderer (e.g., RTL for React/TS)
- Testing API response handling → in-process API mock + component renderer (e.g., MSW + RTL for React/TS)
- Testing pure data transformations → unit tests

## UI Spec to E2E Test Mapping

When a UI Spec exists, use it as the primary source for E2E test design:

1. **Extract screen transitions** → Each multi-step transition = 1 E2E candidate
2. **Check state x display matrix** → Error states requiring navigation = E2E candidate
3. **Review interaction definitions** → Browser-dependent interactions = E2E candidate
4. **Cross-reference with Design Doc ACs** → Ensure E2E candidates map to acceptance criteria

### Mapping Template

```
Screen Transition: [Screen A] → [Screen B] → [Screen C]
AC Reference: AC-{id}
User Journey: [Description of what the user accomplishes]
Lane: fixture-e2e | service-integration-e2e
Preconditions: [Auth state, data state — note whether these are fixture-driven or live]
Verification Points:
  - [What to assert at each step]
E2E ROI Score: [calculated score]
```

**Lane decision**: choose `fixture-e2e` by default. Promote to `service-integration-e2e` when the verification requires observing real cross-service behavior (e.g., the test asserts that data persists across a real DB write, or that an external service receives the correct payload).

## Playwright Test Architecture

### Page Object Pattern

Organize browser interactions through page objects for maintainability:

```
tests/
├── e2e/
│   ├── pages/                   # Page objects (shared across lanes)
│   ├── fixtures/                # Test fixtures and helpers (auth, seed)
│   ├── data/                    # Static fixture data for fixture-e2e
│   ├── *.fixture.e2e.test.ts    # fixture-e2e test files
│   └── *.service.e2e.test.ts    # service-integration-e2e test files
```

### Test Isolation

- Each test starts from a clean browser context
- No shared state between tests
- Use `beforeEach` for common setup (auth, navigation)
- Prefer `page.goto()` over in-test navigation for setup

### Viewport Testing

When UI Spec defines responsive behavior, test critical breakpoints:

| Breakpoint | Width | When to Test |
|-----------|-------|-------------|
| Mobile | 375px | If UI Spec defines mobile-specific interactions |
| Tablet | 768px | If UI Spec defines tablet layout differences |
| Desktop | 1280px | Default — always test |

## Budget Enforcement

Hard limits per feature (same as parent skill):
- **fixture-e2e**: MAX 3 tests, no ROI gate (selected by ranking)
- **service-integration-e2e**: MAX 1-2 tests, ROI > 50 beyond the reserved slot
- Prefer fewer, comprehensive journey tests over many granular tests in both lanes
