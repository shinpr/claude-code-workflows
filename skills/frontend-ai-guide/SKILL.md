---
name: frontend-ai-guide
description: Frontend-specific technical decision criteria, anti-patterns, debugging techniques, and quality check workflow. Use when making frontend technical decisions or performing quality assurance.
---

# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection (Frontend)

## Technical Anti-patterns (Red Flag Patterns)

Immediately stop and reconsider design when detecting the following patterns:

### Code Quality Anti-patterns
1. **Writing similar code 3 or more times** - Violates Rule of Three
2. **Multiple responsibilities mixed in a single component** - Violates Single Responsibility Principle (SRP)
3. **Defining same content in multiple components** - Violates DRY principle
4. **Making changes without checking dependencies** - Potential for unexpected impacts
5. **Disabling code with comments** - Should use version control
6. **Error suppression** - Hiding problems creates technical debt
7. **Excessive use of type assertions (as)** - Abandoning type safety
8. **Prop drilling through 3+ levels** - Should use Context API or state management
9. **Massive components (300+ lines)** - Split into smaller components

### Design Anti-patterns
- **"Make it work for now" thinking** - Accumulation of technical debt
- **Patchwork implementation** - Unplanned additions to existing components
- **Optimistic implementation of uncertain technology** - Designing unknown elements assuming "it'll probably work"
- **Symptomatic fixes** - Surface-level fixes that don't solve root causes
- **Unplanned large-scale changes** - Lack of incremental approach

## Fallback Design Principles

### Core Principle: Fail-Fast
Design philosophy that prioritizes improving primary code reliability over fallback implementations.

### Criteria for Fallback Implementation
- **Default Prohibition**: Do not implement unconditional fallbacks on errors
- **Exception Approval**: Implement only when explicitly defined in Design Doc
- **Layer Responsibilities**:
  - Component Layer: Use Error Boundary for error handling
  - Hook Layer: Implement decisions based on business requirements

### Detection of Excessive Fallbacks
- Require design review when writing the 3rd catch statement in the same feature
- Verify Design Doc definition before implementing fallbacks
- Properly log errors and make failures explicit

## Rule of Three - Criteria for Code Duplication

How to handle duplicate code based on Martin Fowler's "Refactoring":

| Duplication Count | Action | Reason |
|-------------------|--------|--------|
| 1st time | Inline implementation | Cannot predict future changes |
| 2nd time | Consider future consolidation | Pattern beginning to emerge |
| 3rd time | Implement commonalization | Pattern established |

### Criteria for Commonalization

**Cases for Commonalization**
- Business logic duplication
- Complex processing algorithms
- Component patterns (form fields, cards, etc.)
- Custom hooks
- Validation rules

**Cases to Avoid Commonalization**
- Accidental matches (coincidentally same code)
- Possibility of evolving in different directions
- Significant readability decrease from commonalization
- Simple helpers in test code

### Implementation Example
```typescript
// ❌ Immediate commonalization on 1st duplication
function UserEmailInput() { /* ... */ }
function ContactEmailInput() { /* ... */ }

// ✅ Commonalize on 3rd occurrence
function EmailInput({ context }: { context: 'user' | 'contact' | 'admin' }) { /* ... */ }
```

## Common Failure Patterns and Avoidance Methods

### Pattern 1: Error Fix Chain
**Symptom**: Fixing one error causes new errors
**Cause**: Surface-level fixes without understanding root cause
**Avoidance**: Identify root cause with 5 Whys before fixing

### Pattern 2: Abandoning Type Safety
**Symptom**: Excessive use of any type or as
**Cause**: Impulse to avoid type errors
**Avoidance**: Handle safely with unknown type and type guards

### Pattern 3: Implementation Without Sufficient Testing
**Symptom**: Many bugs after implementation
**Cause**: Ignoring Red-Green-Refactor process
**Avoidance**: Always start with failing tests

### Pattern 4: Ignoring Technical Uncertainty
**Symptom**: Frequent unexpected errors when introducing new technology
**Cause**: Assuming "it should work according to official documentation" without prior investigation
**Avoidance**:
- Record certainty evaluation at the beginning of task files
  ```
  Certainty: low (Reason: new experimental feature with limited production examples)
  Exploratory implementation: true
  Fallback: use established patterns
  ```
- For low certainty cases, create minimal verification code first

### Pattern 5: Insufficient Existing Code Investigation
**Symptom**: Duplicate implementations, architecture inconsistency, integration failures
**Cause**: Insufficient understanding of existing code before implementation
**Avoidance Methods**:
- Before implementation, always search for similar functionality (using domain, responsibility, component patterns as keywords)
- Similar functionality found → Use that implementation (do not create new implementation)
- Similar functionality is technical debt → Create ADR improvement proposal before implementation
- No similar functionality exists → Implement new functionality following existing design philosophy
- Record all decisions and rationale in "Existing Codebase Analysis" section of Design Doc

## Debugging Techniques

### 1. Error Analysis Procedure
1. Read error message (first line) accurately
2. Focus on first and last of stack trace
3. Identify first line where your code appears
4. Check React DevTools for component hierarchy

### 2. 5 Whys - Root Cause Analysis
```
Symptom: Component not rendering
Why1: Props are undefined → Why2: Parent component didn't pass props
Why3: Parent using old prop names → Why4: Component interface was updated
Why5: No update to parent after refactoring
Root cause: Incomplete refactoring, missing call-site updates
```

### 3. Minimal Reproduction Code
To isolate problems, attempt reproduction with minimal code:
- Remove unrelated components
- Replace API calls with mocks
- Create minimal configuration that reproduces problem
- Use React DevTools to inspect component tree

### 4. Debug Log Output
```typescript
console.log('DEBUG:', {
  context: 'user-form-submission',
  props: { email, name },
  state: currentState,
  timestamp: new Date().toISOString()
})
```

## Quality Check Workflow

Use the appropriate run command based on the `packageManager` field in package.json.

### Build Commands
- `dev` - Development server
- `build` - Production build
- `preview` - Preview production build
- `type-check` - Type check (no emit)

### Quality Check Phases

**Phase 1-3: Basic Checks**
- `check` - Biome (lint + format)
- `build` - TypeScript build

**Phase 4-5: Tests and Final Confirmation**
- `test` - Test execution
- `test:coverage:fresh` - Coverage measurement (fresh cache)
- `check:all` - Overall integrated check

### Auxiliary Commands
- `test:coverage` - Run tests with coverage
- `test:safe` - Safe test execution (with auto cleanup)
- `cleanup:processes` - Cleanup Vitest processes
- `format` - Format fixes
- `lint:fix` - Lint fixes
- `open coverage/index.html` - Check coverage report

### Troubleshooting
- **Port in use error**: Run `cleanup:processes` script
- **Cache issues**: Run `test:coverage:fresh` script
- **Dependency errors**: Clean reinstall dependencies
- **Vite preview not starting**: Check port 4173 availability

## Situations Requiring Technical Decisions

### Timing of Abstraction
- Extract patterns after writing concrete implementation 3 times
- Be conscious of YAGNI, implement only currently needed features
- Prioritize current simplicity over future extensibility

### Performance vs Readability
- Prioritize readability unless clear bottleneck exists
- Measure before optimizing (don't guess, use React DevTools Profiler)
- Document reason with comments when optimizing

### Granularity of Component/Type Definitions
- Overly detailed components/types reduce maintainability
- Design components that appropriately express UI patterns
- Use composition over inheritance

## Continuous Improvement Mindset

- **Humility**: Perfect code doesn't exist, welcome feedback
- **Courage**: Execute necessary refactoring boldly
- **Transparency**: Clearly document technical decision reasoning

## Implementation Completeness Assurance

### Required Procedure for Impact Analysis

**Completion Criteria**: Complete all 3 stages

#### 1. Discovery
```bash
Grep -n "ComponentName\|hookName" -o content
Grep -n "importedFunction" -o content
Grep -n "propsType\|StateType" -o content
```

#### 2. Understanding
**Mandatory**: Read all discovered files and include necessary parts in context:
- Caller's purpose and context
- Component hierarchy
- Data flow: Props → State → Event handlers → Callbacks

#### 3. Identification
Structured impact report (mandatory):
```
## Impact Analysis
### Direct Impact: ComponentA, ComponentB (with reasons)
### Indirect Impact: FeatureX, PageY (with integration paths)
### Processing Flow: Props → Render → Events → Callbacks
```

**Important**: Do not stop at search; execute all 3 stages

### Unused Code Deletion Rule

When unused code is detected → Will it be used?
- Yes → Implement immediately (no deferral allowed)
- No → Delete immediately (remains in Git history)

Target: Components, hooks, utilities, documentation, configuration files

### Existing Code Deletion Decision Flow

```
In use? No → Delete immediately (remains in Git history)
       Yes → Working? No → Delete + Reimplement
                     Yes → Fix
```