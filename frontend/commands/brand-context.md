---
description: Inject brand-specific design system into brand-system-guide skill
---

**Command Context**: Collect project-specific brand guidelines and update brand-system-guide/SKILL.md.

## Execution Process

### 1. Current State Verification

! ls -la skills/brand-system-guide/SKILL.md
! cat package.json | grep -E '"name":|"description":'

### 2. Brand Context Collection

Interact with the user to collect the following information:

```
【Brand Identity】
1. What is your brand's core positioning?
   Examples: "Professional and trustworthy" "Playful and innovative" "Minimalist and elegant"

2. What emotions should the UI evoke?
   Examples: "Confidence and clarity" "Excitement and creativity" "Calm and focus"

【Color System】
3. Primary brand color (hex or description)?
   Examples: "#0066CC" "Deep blue" "Vibrant orange"

4. Secondary/accent colors?
   Examples: "#FF6B35 for CTAs" "Soft green for success states"

5. Light/Dark mode preference?
   - Light mode only
   - Dark mode only
   - Both (specify primary)

【Typography】
6. Primary font family (or style preference)?
   Examples: "Inter" "System fonts" "Serif for headings, sans-serif for body"

7. Typography scale/sizing approach?
   Examples: "Compact for data-dense UI" "Generous for reading-focused"

【Design System Integration】
8. Component library in use?
   Examples: "Shadcn UI" "MUI" "Custom components" "None yet"

9. Existing brand assets or guidelines?
   Examples: "Figma brand kit" "PDF style guide" "None - starting fresh"

【Accessibility Requirements】
10. WCAG compliance level?
    - Level A (minimum)
    - Level AA (recommended)
    - Level AAA (strict)
```

**Think deeply**: From the collected information, understand the brand's visual identity and construct a design system guide focused on implementable specifications.

### 3. Generate brand-system-guide/SKILL.md

## AI Execution Accuracy Maximization Criteria

Generated brand-system-guide/SKILL.md must follow these criteria:

### Principles of Description

1. **Implementable specifications**: Include exact values (hex codes, pixel sizes, ratios)
2. **AI-decidable**: Use measurable criteria ("sufficient contrast" → "4.5:1 minimum ratio")
3. **Code-ready**: Provide CSS variables, Tailwind classes, or component props
4. **Visual examples**: Include HTML/CSS snippets for common patterns

### Responsibility Boundaries

brand-system-guide's single responsibility is "visual design system specifications" only:

- ✅ Include: Colors, typography, spacing, component styling, accessibility guidelines
- ❌ Exclude: Business logic, API design, state management, project context

### Structure

```markdown
---
name: brand-system-guide
description: [Brand name] design system - colors, typography, components, and accessibility standards.
---

# Brand System Guide

## Brand Positioning

- **Core identity**: [Brand personality in 1-2 sentences]
- **Design philosophy**: [Key design principles]

## Color System

### Primary Colors

| Name | Value | Usage |
|------|-------|-------|
| Primary | #XXXXXX | Main actions, links |
| Primary Foreground | #XXXXXX | Text on primary |

### Semantic Colors

| Name | Value | Usage |
|------|-------|-------|
| Success | #XXXXXX | Confirmations |
| Error | #XXXXXX | Errors, destructive |
| Warning | #XXXXXX | Cautions |

### CSS Variables

\`\`\`css
:root {
  --primary: #XXXXXX;
  --primary-foreground: #XXXXXX;
  /* ... */
}
\`\`\`

## Typography

### Font Stack

- **Headings**: [Font family]
- **Body**: [Font family]
- **Mono**: [Font family]

### Scale

| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| h1 | Xrem | 700 | 1.2 |
| body | Xrem | 400 | 1.5 |

## Component Patterns

### Buttons

\`\`\`html
<!-- Primary Button -->
<button class="...">Action</button>
\`\`\`

### Cards, Forms, etc.

## Accessibility

- **Contrast requirements**: [Ratio]
- **Focus indicators**: [Specification]
- **Touch targets**: [Minimum size]
```

### 4. Verify Integration

After generating, verify:
- [ ] All colors have sufficient contrast ratios
- [ ] CSS variables are valid
- [ ] Component examples render correctly
- [ ] Accessibility requirements are measurable

**Scope**: Update brand-system-guide/SKILL.md only. Project context and technical specifications are the responsibility of other skill files.
