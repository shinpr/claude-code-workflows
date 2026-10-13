# E2E Test Design (Browser Harness)

This reference uses Playwright as the default browser harness. Adapt patterns to the project's chosen framework when different (Cypress, Selenium, etc.); the lane definitions, ROI rules, and budgets remain the same.

## Two E2E Lanes

E2E tests in this workflow split into two lanes (see parent skill Test Type Definition):

| Lane | When | ROI gate | Cost |
|------|------|----------|------|
| **fixture-e2e** | UI journey verification with deterministic fixtures (mocked backend / fixture data) | ROI ≥ 20 (beyond reserved slot); selected by ranking within MAX 3 budget | Comparable to integration; runs in CI without infrastructure setup |
| **service-integration-e2e** | Journey correctness depends on real cross-service behavior (data persistence, transactional consistency, external contracts) | ROI > 50 (beyond reserved slot) | Higher setup, state-cleanup, and diagnosis cost; reserved for what cannot be faked safely |

The **reserved slot** referenced in the ROI gates is a per-lane slot for a qualifying multi-step user journey that is emitted regardless of its ROI score; it is defined in the parent skill's *Multi-Step User Journey Definition* section.

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

## Budget Enforcement

Standard budgets per input Design Doc (same as parent skill):
- **fixture-e2e**: MAX 3 tests, ROI ≥ 20 beyond the reserved slot (selected by ranking)
- **service-integration-e2e**: MAX 1-2 tests, ROI > 50 beyond the reserved slot
- Prefer fewer, comprehensive journey tests over many granular tests in both lanes
- Exceed a standard budget only for an accepted requirement or distinct uncovered failure mode, and record why the selected tests cannot be consolidated
