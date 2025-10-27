# Technical Design Rules (Frontend)

## Basic Technology Stack Policy
TypeScript-based React application implementation. Architecture patterns should be selected according to project requirements and scale.

## Environment Variable Management and Security

### Environment Variable Management
- **Use build tool's environment variable system**: `process.env` does not work in browser environments
- Centrally manage environment variables through configuration layer
- Implement proper type safety with TypeScript
- Properly implement default value settings and mandatory checks

```typescript
// ✅ Build tool environment variables (public values only)
const config = {
  apiUrl: import.meta.env.API_URL || 'http://localhost:3000',
  appName: import.meta.env.APP_NAME || 'My App'
}

// ❌ Does not work in frontend
const apiUrl = process.env.API_URL
```

### Security (Client-side Constraints)
- **CRITICAL**: All frontend code is public and visible in browser
- **Never store secrets client-side**: No API keys, tokens, or secrets in environment variables
- Do not include `.env` files in Git (same as backend)
- Prohibit logging of sensitive information (passwords, tokens, personal data)
- Do not include sensitive information in error messages

**Correct Approach for Secrets**:
```typescript
// ❌ Security risk: API key exposed in browser
const apiKey = import.meta.env.API_KEY
const response = await fetch(`https://api.example.com/data?key=${apiKey}`)

// ✅ Correct: Backend manages secrets, frontend accesses via proxy
const response = await fetch('/api/data') // Backend handles API key authentication
```

## Architecture Design

### Frontend Architecture Patterns
Strictly adhere to selected project patterns. Project-specific details reference `docs/rules/architecture/`.

**React Component Architecture**:
- **Function Components**: Mandatory, class components deprecated
- **Custom Hooks**: For logic reuse and dependency injection
- **Component Hierarchy**: Atoms → Molecules → Organisms → Templates → Pages
- **Props-driven**: Components receive all necessary data via props
- **Co-location**: Place tests, styles, and related files alongside components

**State Management Patterns**:
- **Local State**: `useState` for component-specific state
- **Context API**: For sharing state across component tree (theme, auth, etc.)
- **Custom Hooks**: Encapsulate state logic and side effects
- **Server State**: React Query or SWR for API data caching

## Unified Data Flow Principles

### Client-side Data Flow
Maintain consistent data flow throughout the React application:

- **Single Source of Truth**: Each piece of state has one authoritative source
  - UI state: Component state or Context
  - Server data: API responses cached in React Query/SWR
  - Form data: Controlled components with React Hook Form

- **Unidirectional Flow**: Data flows top-down via props
  ```
  API Response → State → Props → Render → UI
  User Input → Event Handler → State Update → Re-render
  ```

- **Immutable Updates**: Use immutable patterns for state updates
  ```typescript
  // ✅ Immutable state update
  setUsers(prev => [...prev, newUser])

  // ❌ Mutable state update
  users.push(newUser)
  setUsers(users)
  ```

### Type Safety in Data Flow
- **Frontend → Backend**: Props/State (Type Guaranteed) → API Request (Serialization)
- **Backend → Frontend**: API Response (`unknown`) → Type Guard → State (Type Guaranteed)

```typescript
// ✅ Type-safe data flow
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  const data: unknown = await response.json()

  if (!isUser(data)) {
    throw new Error('Invalid user data')
  }

  return data // Type guaranteed as User
}
```

## Build and Testing

### Build Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check (no emit)
npm run type-check
```

### Testing Commands
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with coverage (fresh cache)
npm run test:coverage:fresh

# Safe test execution (with auto cleanup)
npm run test:safe

# Cleanup Vitest processes
npm run cleanup:processes
```

### Quality Check Requirements
Quality checks are mandatory upon implementation completion:

**Phase 1-3: Basic Checks**
```bash
npm run check        # Biome (lint + format)
npm run build        # TypeScript build
```

**Phase 4-5: Tests and Final Confirmation**
```bash
npm test                    # Test execution
npm run test:coverage:fresh # Coverage measurement
npm run check:all           # Overall integrated check
```

### Coverage Requirements
- **Mandatory**: Unit test coverage must be 60% or higher
- **Component-specific targets**:
  - Atoms: 70% or higher
  - Molecules: 65% or higher
  - Organisms: 60% or higher
  - Custom Hooks: 65% or higher
  - Utils: 70% or higher

### Non-functional Requirements
- **Browser Compatibility**: Chrome/Firefox/Safari/Edge (latest 2 versions)
- **Rendering Time**: Within 5 seconds for major pages
