---
name: typescript-rules
description: React/TypeScript frontend development rules including type safety, component design, state management, and error handling. Use when implementing React components, TypeScript code, or frontend features.
---

# TypeScript Development Rules (Frontend)

## Basic Principles

✅ **Aggressive Refactoring** - Prevent technical debt and maintain health
❌ **Unused "Just in Case" Code** - Violates YAGNI principle (Kent Beck)

## Comment Writing Rules
- **Function Description Focus**: Describe what the code "does"
- **No Historical Information**: Do not record development history
- **Timeless**: Write only content that remains valid whenever read
- **Conciseness**: Keep explanations to necessary minimum

## Type Safety

**Absolute Rule**: any type is completely prohibited. It disables type checking and becomes a source of runtime errors.

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
- **Function Components (Mandatory)**: Official React recommendation, optimizable by modern tooling
- **Classes Prohibited**: Class components completely deprecated (Exception: Error Boundary)
- **Custom Hooks**: Standard pattern for logic reuse and dependency injection
- **Component Hierarchy**: Atoms → Molecules → Organisms → Templates → Pages
- **Co-location**: Place tests, styles, and related files alongside components

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
// ✅ Immutable state update
setUsers(prev => [...prev, newUser])

// ❌ Mutable state update
users.push(newUser)
setUsers(users)
```

**Function Design**
- **0-2 parameters maximum**: Use object for 3+ parameters
  ```typescript
  // ✅ Object parameter
  function createUser({ name, email, role }: CreateUserParams) {}
  ```

**Props Design (Props-driven Approach)**
- Props are the interface: Define all necessary information as props
- Avoid implicit dependencies: Do not depend on global state or context without necessity
- Type-safe: Always define Props type explicitly

**Environment Variables**
- **Use build tool's environment variable system**: `process.env` does not work in browsers
- Centrally manage environment variables through configuration layer
- Implement proper type safety and default value handling

```typescript
// ✅ Build tool environment variables (public values only)
const config = {
  apiUrl: import.meta.env.API_URL || 'http://localhost:3000',
  appName: import.meta.env.APP_NAME || 'My App'
}

// ❌ Does not work in frontend
const apiUrl = process.env.API_URL
```

**Security (Client-side Constraints)**
- **CRITICAL**: All frontend code is public and visible in browser
- **Never store secrets client-side**: No API keys, tokens, or secrets in environment variables
- Do not include `.env` files in Git
- Do not include sensitive information in error messages

```typescript
// ❌ Security risk: API key exposed in browser
const apiKey = import.meta.env.API_KEY
const response = await fetch(`https://api.example.com/data?key=${apiKey}`)

// ✅ Correct: Backend manages secrets, frontend accesses via proxy
const response = await fetch('/api/data') // Backend handles API key authentication
```

**Dependency Injection**
- **Custom Hooks for dependency injection**: Ensure testability and modularity

**Asynchronous Processing**
- Promise Handling: Always use `async/await`
- Error Handling: Always handle with `try-catch` or Error Boundary
- Type Definition: Explicitly define return value types (e.g., `Promise<Result>`)

**Format Rules**
- Semicolon omission (follow Biome settings)
- Types in `PascalCase`, variables/functions in `camelCase`
- Imports use absolute paths (`src/`)

**Clean Code Principles**
- ✅ Delete unused code immediately
- ✅ Delete debug `console.log()`
- ❌ Commented-out code (manage history with version control)
- ✅ Comments explain "why" (not "what")

## Error Handling

**Absolute Rule**: Error suppression prohibited. All errors must have log output and appropriate handling.

**Fail-Fast Principle**: Fail quickly on errors to prevent continued processing in invalid states
```typescript
// ❌ Prohibited: Unconditional fallback
catch (error) {
  return defaultValue // Hides error
}

// ✅ Required: Explicit failure
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
Never include sensitive information (password, token, apiKey, secret, creditCard) in logs

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

- Component Memoization: Use React.memo for expensive components
- State Optimization: Minimize re-renders with proper state structure
- Lazy Loading: Use React.lazy and Suspense for code splitting
- Bundle Size: Monitor with the `build` script and keep under 500KB

## Non-functional Requirements

- **Browser Compatibility**: Chrome/Firefox/Safari/Edge (latest 2 versions)
- **Rendering Time**: Within 5 seconds for major pages