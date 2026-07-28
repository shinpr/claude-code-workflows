---
name: typescript-rules
description: React/TypeScript frontend development rules including type safety, component design, state management, and error handling. Use when implementing React components, TypeScript code, or frontend features.
---

# TypeScript Development Rules (Frontend)

## Comment Writing Rules

Code first: names and types carry meaning; a comment must add what code cannot, and one comment per decision is enough.

- Explain why a component memoizes, guards, or re-renders, not what the JSX renders.
- Record decisions and rationale; leave chronological history to version control.

## Type Safety

**Default Rule**: Prefer `unknown`, generics, or union types over `any`. Retain `any` only when an existing external, generated, or legacy public signature requires it, or when replacing it prevents the project type check from expressing a safe generic relationship. Record the declaration path or type-check result that proves the constraint. When a local adapter can preserve compatibility and expose a safer type within the user request or current task/design artifact, implement the adapter; otherwise confine `any` to the smallest adapter or public-signature boundary, document the reason, and validate untrusted data before it enters typed application code.

**Frontend Boundaries**

- React Props/State: use the declared application types.
- External API responses: treat unvalidated payloads as `unknown` and validate at the boundary. A generated client may retain its declared type when it also enforces the contract at runtime.
- `localStorage` / `sessionStorage`: handle `string | null`; treat parsed data as `unknown` until validated.
- URL parameters: handle the router or platform's nullable string shape, then parse and validate before converting to a domain type.
- Exported APIs and important boundaries: declare return types; allow inference for local implementations when the contract remains clear.

**Type Complexity Review Signals**

Use these as review prompts, not pass/fail thresholds. Existing project conventions and the component's responsibility take precedence.

- Props count: review ownership or splitting above 10.
- Optional props: review defaults or ownership when more than half are optional.
- Nested prop structures: review flattening beyond 2 levels.
- Type assertions: review the boundary when 3+ assertions are required.
- External API types: represent the actual external shape and convert at the application boundary.

## Coding Conventions

**Component and File Decisions**

- Prefer function components and Hooks for new code. Preserve working class components unless the accepted work requires migration; a class remains valid for an Error Boundary implementation.
- Reuse logic through the repository's established component, hook, or module pattern.
- Follow the project's adopted component architecture and file layout. Co-locate files only when it is established or approved as a new structure.

**Server/Client Boundary — only for RSC frameworks**

- Fetch and render on the server by default; isolate interactivity behind the smallest `"use client"` boundary that needs it.
- Keep browser-only APIs and event handlers inside client components.
- Skip these rules when the project has no server-component runtime.

**State Ownership**

- Preserve the repository's existing local, shared, and server-state ownership boundaries.
- Introduce Context, a shared-state layer, or a server-state dependency only when the accepted design requires ownership or lifecycle that the existing boundary cannot represent.
- Keep one authoritative owner for each state value and use immutable updates required by React change detection.

**Function and Props Boundaries**

- Prefer 0-2 parameters. For 3+ related values, use an object when it clarifies names or represents one domain input; preserve positional parameters when the repository convention or external API requires them.
- Declare component dependencies through typed props, hooks, Context, or injected modules according to the repository's established state and dependency boundaries.

**Environment Variables**

- Read client-side environment variables through the project's bundler accessor and public prefix.
- Validate required values through the repository's typed config layer; add a default only for an optional value or an explicitly defined local-development mode.

**Client Security**

- Keep credentials and secrets on the server; browser-delivered code and public environment variables are observable by clients.
- Exclude local environment files from version control and keep error output free of sensitive values.

**Asynchronous Processing**

- Follow the repository's promise style; use `async`/`await` when it clarifies sequencing and error propagation.
- Handle event-handler and asynchronous failures at their owning boundary. Error Boundaries cover descendant rendering failures, not ordinary callbacks or asynchronous work.
- Guard effect-driven requests against stale or post-unmount updates through the repository's cancellation or server-state mechanism.

**Formatting**

- Follow the repository's formatter, naming, module-resolution, and package-boundary configuration.
- Use an import alias only when the project configuration resolves it.

## Error Handling

Every caught error has one intentional outcome: propagate it, convert it to the repository's typed boundary result, or represent it as user-facing error state. Preserve context and log once at the boundary that owns diagnosis or recovery, with sensitive data redacted.

- Error Boundary: place it where descendant render failures have a defined UI recovery outcome.
- Custom Hook: preserve the application's existing error contract.
- API Layer: convert transport failures to the repository's established domain or boundary representation.
- Event handlers and async workflows: use the owning layer's exception, result, or UI-state contract.

## Performance Optimization

- When React Compiler is enabled, rely on it. Add manual `React.memo`, `useMemo`, or `useCallback` only for a measured bottleneck or a required stable identity at an external API/effect boundary.
- Apply code splitting or import changes when a configured bundle budget regresses, or when the accepted task names bundle size as an outcome and a repository bundle report attributes the relevant increase to the changed import. Follow the repository's existing loading pattern and verify the same signal after the change.

## Non-functional Requirements

- **Browser Compatibility**: Implement against the support policy in the PRD, Design Doc, Browserslist, or build configuration. When none is defined, preserve the repository's current transpilation/polyfill baseline and surface any new browser-dependent API as an unresolved compatibility decision.
- **Performance**: Verify against project-defined budgets and the metric representing the affected experience. When no budget exists, measure the changed path and report the observed result instead of inventing a threshold.
