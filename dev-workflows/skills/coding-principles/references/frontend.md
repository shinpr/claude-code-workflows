# Frontend (React/TypeScript) Coding Rules

Apply these with the SKILL.md principles. Each entry adds what React and TypeScript code needs beyond them; the frontend decision criteria for component responsibility, error boundaries, and profiling live in `references/frontend.md` of the ai-development-guide skill.

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

## Components and State

- Prefer function components and Hooks for new code. Preserve working class components unless the accepted work requires migration; a class remains valid for an Error Boundary implementation.
- Follow the project's adopted component architecture and file layout. Co-locate files only when it is established or approved as a new structure.
- Preserve the repository's existing local, shared, and server-state ownership boundaries. Introduce Context, a shared-state layer, or a server-state dependency only when the accepted design requires ownership or lifecycle that the existing boundary cannot represent.
- Keep one authoritative owner for each state value and use the immutable updates React change detection requires.
- Guard effect-driven requests against stale or post-unmount updates through the repository's cancellation or server-state mechanism.

## Server/Client Boundary — only for RSC frameworks

- Fetch and render on the server by default; isolate interactivity behind the smallest `"use client"` boundary that needs it.
- Keep browser-only APIs and event handlers inside client components.
- Skip these rules when the project has no server-component runtime.

## Environment and Client Security

- Read client-side environment variables through the project's bundler accessor and public prefix. Validate required values through the repository's typed config layer; add a default only for an optional value or an explicitly defined local-development mode.
- Browser-delivered code and public environment variables are observable by clients, so credentials and secrets stay on the server.

## Performance and Compatibility

- When React Compiler is enabled, rely on it. Add manual `React.memo`, `useMemo`, or `useCallback` only for a measured bottleneck or a required stable identity at an external API/effect boundary.
- Apply code splitting or import changes when a configured bundle budget regresses, or when the accepted task names bundle size as an outcome and a repository bundle report attributes the relevant increase to the changed import. Follow the repository's existing loading pattern and verify the same signal after the change.
- Implement against the browser support policy in the PRD, Design Doc, Browserslist, or build configuration. When none is defined, preserve the repository's current transpilation/polyfill baseline and surface any new browser-dependent API as an unresolved compatibility decision.
