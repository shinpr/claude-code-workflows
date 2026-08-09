# Frontend Domain Axes

Hearing axes for tasks that involve UI work (component implementation, screen design, visual adjustment, design system migration).

## Axis 1: Design Origin

The canonical source of the visual specification.

**Question choices**:
- Design tool (e.g., a hosted design platform)
- Specification file in the repository (e.g., `DESIGN.md`, `docs/design/...`)
- Public documentation URL
- Existing implementation only (no separate design source)
- Not applicable

**Follow-up (when not N/A)**: How is the source accessed? Examples — URL, file path, MCP name, manual screenshot. Record the literal access mechanism.

## Axis 2: Design System

Reusable component library and design tokens.

**Question choices**:
- Component library with MCP server access
- Component library with documentation URL
- Storybook or equivalent component catalog
- Internal package without external documentation
- No design system (ad-hoc components)
- Not applicable

**Follow-up (when not N/A)**: How is the component catalog accessed? Examples — Storybook URL, package name, internal documentation path, MCP name.

## Axis 3: Guidelines

Usage guidance, accessibility rules, anti-patterns, naming conventions for UI work.

**Question choices**:
- Project-level guideline file (e.g., `DESIGN.md`, `docs/guidelines/...`)
- External documentation site
- Inline guidance in the design system catalog
- No documented guidelines
- Not applicable

**Follow-up (when not N/A)**: Where are the guidelines located? Record the path or URL. If multiple guideline files exist for different concerns (CSS, accessibility, i18n), list each.

## Axis 4: Visual Verification Environment

How rendered output is confirmed during implementation.

**Question choices**:
- End-to-end test runner with screenshot capability
- Storybook or equivalent isolated component preview
- Browser automation tool (dedicated CLI or MCP server)
- Manual browser inspection only
- Not applicable

**Follow-up (when not N/A)**: What is the entry command or URL? Examples — CLI invocation, dev-server URL, Storybook port, MCP name.

## Domain Completion

After these axes, return to the parent skill. The parent asks one integrated self-declaration question after all selected domains are complete. Frontend-specific resources such as asset/font hosting, icon libraries, experiment dashboards, or analytics dashboards can be captured in that answer.
