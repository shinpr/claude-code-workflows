---
name: typescript-rules
description: React/TypeScript frontend development rules including type safety, component design, state management, and error handling. Use when implementing React components, TypeScript code, or frontend features.
---

# TypeScript Development Rules (Frontend)

## Basic Principles

- **Aggressive Refactoring** - Prevent technical debt and maintain health
- **Delete code when no current caller exists** - YAGNI principle (Kent Beck)

## Comment Writing Rules
- **Function Description Focus**: Describe what the code "does"
- **Timeless content only**: Record decisions and rationale; leave chronological history to version control
- **Conciseness**: Keep explanations to necessary minimum

## Type Safety

**Absolute Rule**: Replace every `any` with `unknown`, generics, or union types. `any` disables type checking and causes runtime errors.

**any Type Alternatives (Priority Order)**
1. **unknown Type + Type Guards**: Use for validating external input (API responses, localStorage, URL parameters)
2. **Generics**: When type flexibility is needed
3. **Union Types・Intersection Types**: Combinations of multiple types
4. **Type Assertions (Last Resort)**: Only when type is certain

**Type Guard Implementation Pattern**
```typescript
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value && 'name' in value
}
```

**Modern Type Features**
- **satisfies Operator**: `const config = { apiUrl: '/api' } satisfies Config` - Preserves inference
- **const Assertion**: `const ROUTES = { HOME: '/' } as const satisfies Routes` - Immutable and type-safe
- **Branded Types**: `type UserId = string & { __brand: 'UserId' }` - Distinguish meaning
- **Template Literal Types**: `type EventName = \`on\${Capitalize<string>}\`` - Express string patterns with types

**Type Safety in Frontend Implementation**
- **React Props/State**: TypeScript manages types, unknown unnecessary
- **External API Responses**: Always receive as `unknown`, validate with type guards
- **localStorage/sessionStorage**: Treat as `unknown`, validate
- **URL Parameters**: Treat as `unknown`, validate
- **Form Input (Controlled Components)**: Type-safe with React synthetic events

**Type Safety in Data Flow**
- **Frontend → Backend**: Props/State (Type Guaranteed) → API Request (Serialization)
- **Backend → Frontend**: API Response (`unknown`) → Type Guard → State (Type Guaranteed)

**Type Complexity Management**
- **Props Design**:
  - Props count: 3-7 props ideal (consider component splitting if exceeds 10)
  - Optional Props: 50% or less (consider default values or Context if excessive)
  - Nesting: Up to 2 levels (flatten deeper structures)
- Type Assertions: Review design if used 3+ times
- **External API Types**: Relax constraints and define according to reality (convert appropriately internally)

## Coding Conventions

**Component Design Criteria**
- **Function components only**: Official React recommendation, optimizable by modern tooling (Exception: Error Boundary requires class component)
- **Custom Hooks**: Standard pattern for logic reuse and dependency injection
- **Component Hierarchy**: Use the project's adopted component architecture. When the project uses Atomic Design: Atoms → Molecules → Organisms → Templates → Pages. When the project uses Feature-based, Container-Presenter, or another structure: follow that structure consistently and document the chosen layering in the project README or design doc
- **Co-location**: Place tests, styles, and related files alongside components

**Server/Client Boundary (RSC frameworks only — e.g., Next.js App Router)**
- Default to server components for data fetching and rendering; isolate interactivity behind a `"use client"` boundary at the smallest scope that needs it
- Keep browser-only APIs (`window`, `localStorage`, event handlers) inside client components; calling them in a server component breaks the render
- N/A for client-only SPAs (e.g., Vite) — skip when the project has no server-component runtime

**State Management Patterns**
- **Local State**: `useState` for component-specific state
- **Context API**: For sharing state across component tree (theme, auth, etc.)
- **Custom Hooks**: Encapsulate state logic and side effects
- **Server State**: React Query or SWR for API data caching

**Data Flow Principles**
- **Single Source of Truth**: Each piece of state has one authoritative source
- **Unidirectional Flow**: Data flows top-down via props
- **Immutable Updates**: Use immutable patterns for state updates

```typescript
// Immutable state update — always create new arrays/objects
setUsers(prev => [...prev, newUser])
```

**Function Design**
- **0-2 parameters maximum**: Use object for 3+ parameters
  ```typescript
  function createUser({ name, email, role }: CreateUserParams) {}
  ```

**Props Design (Props-driven Approach)**
- Props are the interface: Define all necessary information as props
- Pass all data dependencies as props; use Context only for cross-cutting concerns (theme, auth, locale)
- Type-safe: Always define Props type explicitly

**Environment Variables**
- **Use the build tool's env accessor**: read client-side env through the bundler's exposed accessor — Vite via `import.meta.env`, Next.js/CRA via prefixed `process.env`. Raw, unprefixed access is `undefined` in the browser bundle
- **Only prefixed vars reach the client**: build tools expose only vars carrying their public prefix; an unprefixed var is `undefined` in the browser. The prefix differs per tool — match the project's bundler (Vite `VITE_`, Next.js public `NEXT_PUBLIC_`, CRA `REACT_APP_`)
- Centrally manage env through a typed config object with a default for every variable

```typescript
// Client-exposed env must carry the bundler's public prefix, or it is undefined in the browser.
// Vite:    import.meta.env.VITE_API_URL
// Next.js: process.env.NEXT_PUBLIC_API_URL
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000', // adjust accessor + prefix to the project's bundler
  appName: import.meta.env.VITE_APP_NAME || 'My App'
}
```

**Security (Client-side Constraints)**
- **CRITICAL**: All frontend code is public and visible in browser
- **All secrets stay server-side**: Store API keys, tokens, and secrets on the backend only
- Exclude `.env` files via `.gitignore`
- Limit error messages to non-sensitive context

```typescript
// Backend manages secrets, frontend accesses via proxy
const response = await fetch('/api/data') // Backend handles API key authentication
```

**Dependency Injection**
- **Custom Hooks for dependency injection**: Ensure testability and modularity

**Asynchronous Processing**
- Promise Handling: Always use `async/await`
- Error Handling: Always handle with `try-catch` or Error Boundary
- Type Definition: Explicitly define return value types (e.g., `Promise<Result>`)
- Effect race/cleanup: guard `useEffect` data fetches against out-of-order responses and post-unmount state updates — abort or ignore stale results (`AbortController` or a mounted flag), or use a server-state library (React Query/SWR) that cancels and dedupes. `try-catch` alone does not cover this

**Format Rules**
- Semicolon omission (follow Biome settings)
- Types in `PascalCase`, variables/functions in `camelCase`
- Imports use absolute paths (`src/`)

**Clean Code Principles**
- Delete unused code immediately
- Delete debug `console.log()`
- Delete commented-out code (retrieve from version control when needed)
- Comments explain "why" (not "what")

## Error Handling

**Absolute Rule**: Every caught error must be logged with context and either re-thrown to Error Boundary, returned as a Result error variant, or displayed as user-facing error state.

**Fail-Fast Principle**: Fail quickly on errors to prevent continued processing in invalid states
```typescript
catch (error) {
  logger.error('Processing failed', error)
  throw error // Handle with Error Boundary or higher layer
}
```

**Result Type Pattern**: Express errors with types for explicit handling
```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

// Example: Express error possibility with types
function parseUser(data: unknown): Result<User, ValidationError> {
  if (!isValid(data)) return { ok: false, error: new ValidationError() }
  return { ok: true, value: data as User }
}
```

**Custom Error Classes**
```typescript
export class AppError extends Error {
  constructor(message: string, public readonly code: string, public readonly statusCode = 500) {
    super(message)
    this.name = this.constructor.name
  }
}
// Purpose-specific: ValidationError(400), ApiError(502), NotFoundError(404)
```

**Layer-Specific Error Handling (React)**
- Error Boundary: Catch React component errors, display fallback UI
- Custom Hook: Detect business rule violations, propagate AppError as-is
- API Layer: Convert fetch errors to domain errors

**Structured Logging and Sensitive Information Protection**
Redact sensitive fields (password, token, apiKey, secret, creditCard) before logging

**Asynchronous Error Handling in React**
- Error Boundary setup mandatory: Catch rendering errors
- Use try-catch with all async/await in event handlers
- Always log and re-throw errors or display error state

## Refactoring Techniques

**Basic Policy**
- Small Steps: Maintain always-working state through gradual improvements
- Safe Changes: Minimize the scope of changes at once
- Behavior Guarantee: Ensure existing behavior remains unchanged while proceeding

**Implementation Procedure**: Understand Current State → Gradual Changes → Behavior Verification → Final Validation

**Priority**: Duplicate Code Removal > Large Function Division > Complex Conditional Branch Simplification > Type Safety Improvement

## Performance Optimization

- Automatic memoization: when React Compiler is enabled, rely on it; reach for manual `React.memo`/`useMemo`/`useCallback` only as a profiler- or identity-justified escape hatch (a measured bottleneck, or stable reference identity for third-party APIs / effect dependencies)
- State Optimization: Minimize re-renders with proper state structure
- Lazy Loading: Use `React.lazy` and `Suspense` for code splitting
- Bundle Size: Monitor via the build script against the project's budget

## Non-functional Requirements

- **Browser Compatibility**: Chrome/Firefox/Safari/Edge (latest 2 versions)
- **Rendering Time**: Within 5 seconds for major pages