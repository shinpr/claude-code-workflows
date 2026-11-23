# React with TypeScript

Apply with the frontend references of this skill and of the coding-principles and testing-principles skills. Each entry gives the React or TypeScript form of a rule they state, or a decision where this workflow departs from common React defaults. Type Boundaries applies to TypeScript targets; the other sections apply to every React target.

## Type Boundaries

- `unknown`, generics, or union types replace `any`; an unvalidated API payload is `unknown` until validated. A generated client may retain its declared type when it also enforces the contract at runtime. `any` is a type-system escape governed by the coding-principles frontend reference.
- `as` declares a type that no check establishes. Back it with a check or an existing contract at the boundary where that guarantee holds.
- Declare return types on exported APIs and important boundaries; allow inference for local implementations when the contract remains clear.

## Components and Errors

- Prefer function components and Hooks for new code. Preserve working class components unless the accepted work requires migration; a class remains valid for an Error Boundary implementation.
- An Error Boundary owns rendering failures in its child subtree, including a hook that throws during render.

## Server/Client Boundary — only for RSC frameworks

- Fetch and render on the server by default; isolate interactivity behind the smallest `"use client"` boundary that needs it.
- Keep browser-only APIs and event handlers inside client components.

## Environment

Read client-side environment variables through the project's bundler accessor and public prefix.

## Performance

When React Compiler is enabled, rely on it. Add manual `React.memo`, `useMemo`, or `useCallback` only for a measured bottleneck or a required stable identity at an external API/effect boundary.

## Tests

With React Testing Library, prefer `userEvent` for user interactions.
