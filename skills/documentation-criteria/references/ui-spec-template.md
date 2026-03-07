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
| AC-01 | [EARS AC summary] | [Screen / state name] | [element or file reference] | Adopted / Not adopted / On hold |

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
| Display | [Normal display] | [Skeleton / spinner] | [Empty state + CTA] | [Error message + recovery action] | [Cached / partial display] |

#### Interaction Definition

| AC ID | EARS Condition | User Action | System Response | State Transition | Error Handling |
|-------|---------------|-------------|-----------------|-----------------|----------------|
| AC-01 | When [trigger] | [Click / input / etc.] | [Expected behavior] | [From state -> To state] | [Retry / Reset / Fallback] |

### Component: [ComponentName2]

[Repeat State x Display Matrix and Interaction Definition for each component]

## Design Tokens and Component Map

### Environment Constraints
- Target browsers: [e.g., Chrome 120+, Safari 17+]
- Responsive breakpoints: [e.g., 768px, 1024px, 1280px]
- Theme support: [e.g., light/dark, system preference]

### Existing Component Reuse Map

| UI Element | Decision | Existing Component | Notes |
|-----------|----------|-------------------|-------|
| [Button] | Reuse | [components/ui/Button] | [No modifications needed] |
| [DataTable] | Extend | [components/ui/Table] | [Add sorting support] |
| [FeatureCard] | New | - | [No similar component exists] |

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| [color-primary] | [value] | [Primary actions] |
| [spacing-md] | [value] | [Component spacing] |

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
