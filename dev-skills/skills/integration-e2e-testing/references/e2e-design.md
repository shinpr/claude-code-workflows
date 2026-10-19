# E2E Test Design (Browser Harness)

This reference uses Playwright as the default browser harness. Adapt patterns to the project's chosen framework when different (Cypress, Selenium, etc.); the parent skill's proof selection remains applicable.

Use the parent skill's proof selection and lanes. Browser fixture tests observe browser behavior; service-integration tests add real dependencies only when the claim requires them. Apply the parent skill’s major-UI-flow coverage check; select only browser proof not already supplied by existing tests.

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

**Candidate boundaries** (retain only when required and not already proven):
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
Selection evidence: [required claim and why cheaper proof is insufficient]
```

**Lane decision**: choose `fixture-e2e` by default. Promote to `service-integration-e2e` when the verification requires observing real cross-service behavior (e.g., the test asserts that data persists across a real DB write, or that an external service receives the correct payload).

## Coverage Check

Account for every required browser-specific claim using existing or selected proof. Consolidate overlapping journeys and states; add distinct cases only when they expose independently failing required boundaries. Empty lanes need coverage evidence, not a minimum journey count.
