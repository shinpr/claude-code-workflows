# [Feature Name] UI Specification

## Overview

[Purpose and scope of this UI Specification in 2-3 sentences]

### Target PRD
- PRD path: [docs/prd/xxx-prd.md | "N/A — based on requirement-analyzer output"]
- Feature scope: [Which PRD requirements this UI Spec covers | Summary of analyzed requirements]

### Design Source
| Source | Path | Version |
|--------|------|---------|
| Prototype code | [docs/ui-spec/assets/xxx/] | [commit SHA / tag] |

## Prototype Management

Prototype code is an **attachment** to this UI Spec. The canonical specification is always this document + the Design Doc.

- **Attachment path**: [docs/ui-spec/assets/{feature-name}/]
- **Version identification**: [commit SHA / tag]
- **Compliance premise**: [e.g., design system compliance, component library usage]
- **Relationship to canonical spec**: Differences between prototype and this spec are resolved in favor of this document. Prototype serves as visual/behavioral reference only.

## AC Traceability (Prototype)

Map PRD acceptance criteria to prototype references. Skip this section if no prototype is provided.

| AC ID | AC Summary | Screen / State | Prototype Reference (element ID / path) | Adoption Decision |
|-------|-----------|----------------|----------------------------------------|-------------------|
| AC-001 | [EARS AC summary] | [Screen / state name] | [element or file reference] | Adopted / Not adopted / On hold |

## Screen List and Transitions

### Screen List

| Screen ID | Screen Name | Description | Entry Condition |
|-----------|------------|-------------|-----------------|
| S-01 | [Screen name] | [Purpose] | [How user reaches this screen] |

### Transition Conditions

| Source | Destination | Trigger | Guard Condition |
|--------|------------|---------|-----------------|
| S-01 | S-02 | [User action] | [Precondition if any] |

## Component Decomposition

### Component Tree

```
[Page/Screen]
  +-- [Container Component]
  |   +-- [Presentational Component A]
  |   +-- [Presentational Component B]
  +-- [Container Component]
      +-- [Presentational Component C]
```

### Component: [ComponentName]

#### State x Display Matrix

| State | Default | Loading | Empty | Error | Partial |
|-------|---------|---------|-------|-------|---------|
| Display | [Normal display] | [Specific pattern: e.g., Skeleton of `ExistingComponent` / Spinner from `ui/Spinner`] | [Empty state message + CTA: e.g., "No items yet" + `Button` "Create first item"] | [Error message + recovery: e.g., `Alert` variant="error" + `Button` "Retry"] | [Cached display + `Banner` "Connection lost, showing cached data"] |

#### Interaction Definition

| AC ID | EARS Condition | User Action | System Response | State Transition | Error Handling |
|-------|---------------|-------------|-----------------|-----------------|----------------|
| AC-001 | When [trigger] | [Click / input / etc.] | [Expected behavior] | [From state -> To state] | [Retry / Reset / Fallback] |

### Component: [ComponentName2]

[Repeat State x Display Matrix and Interaction Definition for each component]

## Design Tokens and Component Map

### Environment Constraints

- Target browsers: [e.g., Chrome 120+, Safari 17+]
- Theme support: [e.g., light/dark, system preference]

#### Responsive Behavior

| Breakpoint | Width | Key Changes |
|-----------|-------|-------------|
| Mobile | [e.g., < 768px] | [e.g., single column, hamburger nav, 14px body text] |
| Tablet | [e.g., 768px - 1023px] | [e.g., 2-column grid, collapsed sidebar] |
| Desktop | [e.g., ≥ 1024px] | [e.g., full layout, expanded nav, sidebar visible] |

### Existing Component Reuse Map

| UI Element | Decision | Existing Component | Notes |
|-----------|----------|-------------------|-------|
| [Button] | Reuse | [components/ui/Button] | [No modifications needed] |
| [DataTable] | Extend | [components/ui/Table] | [Add sorting support] |
| [FeatureCard] | New | - | [No similar component exists] |

### Design Tokens

#### Color Roles

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Background Surface | [bg-primary] | [e.g., #FFFFFF] | [Page background] |
| Background Surface | [bg-secondary] | [e.g., #F9FAFB] | [Card, section background] |
| Text | [text-primary] | [e.g., #111827] | [Headings, body text] |
| Text | [text-secondary] | [e.g., #6B7280] | [Captions, placeholders] |
| Brand / Accent | [color-brand] | [e.g., #1A73E8] | [Primary actions, links] |
| Status | [color-success] | [e.g., #22C55E] | [Success states, confirmations] |
| Status | [color-error] | [e.g., #EF4444] | [Error states, destructive actions] |
| Border | [border-primary] | [e.g., #E5E7EB] | [Card borders, dividers] |

#### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Heading 1 | [e.g., Inter] | [e.g., 30px] | [e.g., 700] | [e.g., 1.2] | [e.g., -0.02em] |
| Heading 2 | [e.g., Inter] | [e.g., 24px] | [e.g., 600] | [e.g., 1.3] | [e.g., -0.01em] |
| Body | [e.g., Inter] | [e.g., 16px] | [e.g., 400] | [e.g., 1.5] | [e.g., 0] |
| Caption | [e.g., Inter] | [e.g., 12px] | [e.g., 400] | [e.g., 1.4] | [e.g., 0.01em] |
| Monospace | [e.g., JetBrains Mono] | [e.g., 14px] | [e.g., 400] | [e.g., 1.6] | [e.g., 0] |

#### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| [spacing-xs] | [e.g., 4px] | [Inline element gaps] |
| [spacing-sm] | [e.g., 8px] | [Compact padding] |
| [spacing-md] | [e.g., 16px] | [Default component padding] |
| [spacing-lg] | [e.g., 24px] | [Section spacing] |
| [spacing-xl] | [e.g., 40px] | [Page section separation] |

#### Elevation (Depth)

| Level | Treatment | Usage |
|-------|-----------|-------|
| 0 (Flat) | [e.g., none] | [Inline elements, text] |
| 1 (Raised) | [e.g., 0 1px 2px rgba(0,0,0,0.05)] | [Cards, buttons] |
| 2 (Floating) | [e.g., 0 4px 12px rgba(0,0,0,0.1)] | [Dropdowns, popovers] |
| 3 (Overlay) | [e.g., 0 8px 24px rgba(0,0,0,0.15)] | [Modals, dialogs] |

#### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| [radius-sm] | [e.g., 4px] | [Badges, chips] |
| [radius-md] | [e.g., 8px] | [Cards, inputs] |
| [radius-lg] | [e.g., 12px] | [Modals, panels] |
| [radius-full] | [e.g., 9999px] | [Avatars, pills] |

## Visual Acceptance

### Golden States
Define the key visual states that serve as acceptance benchmarks:

1. **[State name]**: [Description of what should be visually confirmed]
2. **[State name]**: [Description]

### Layout Constraints
- [Min/max width, height constraints]
- [Spacing rules between components]
- [Overflow behavior]

## Accessibility Requirements

### Keyboard Navigation

| Component | Tab Order | Key Binding | Behavior |
|-----------|-----------|-------------|----------|
| [Component] | [Order number] | [Enter / Space / Arrow] | [Expected behavior] |

### Screen Reader

| Component | Role | Accessible Name | Live Region |
|-----------|------|-----------------|-------------|
| [Component] | [ARIA role] | [aria-label / aria-labelledby] | [polite / assertive / none] |

### Contrast Requirements

| Element | Foreground | Background | Ratio Target |
|---------|-----------|------------|-------------|
| [Text element] | [Color] | [Color] | [4.5:1 for normal text / 3:1 for large text] |

## Open Items

| ID | Description | Owner | Deadline |
|----|-------------|-------|----------|
| TBD-01 | [Unresolved question or decision] | [Who resolves] | [Target date] |

*All TBDs must have an owner and deadline. Resolve before Design Doc creation.*

## Update History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| YYYY-MM-DD | 1.0 | Initial version | [Name] |
