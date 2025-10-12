# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection

## Technical Anti-patterns (Red Flag Patterns)

Immediately stop and reconsider design when detecting the following patterns:

### Code Quality Anti-patterns
1. **Writing similar code 3 or more times** - Violates Rule of Three
2. **Multiple responsibilities mixed in a single file** - Violates Single Responsibility Principle (SRP)
3. **Defining same content in multiple files** - Violates DRY principle
4. **Making changes without checking dependencies** - Potential for unexpected impacts
5. **Disabling code with comments** - Should use version control
6. **Error suppression** - Hiding problems creates technical debt
7. **Bypassing type safety mechanisms** - Using unsafe casts or ignoring type checks

### Design Anti-patterns
- **"Make it work for now" thinking** - Accumulation of technical debt
- **Patchwork implementation** - Unplanned additions to existing code
- **Optimistic implementation of uncertain technology** - Designing unknown elements assuming "it'll probably work"
- **Symptomatic fixes** - Surface-level fixes that don't solve root causes
- **Unplanned large-scale changes** - Lack of incremental approach

## Fallback Design Principles

### Core Principle: Fail-Fast
Design philosophy that prioritizes improving primary code reliability over fallback implementations in distributed systems.

### Criteria for Fallback Implementation
- **Default Prohibition**: Do not implement unconditional fallbacks on errors
- **Exception Approval**: Implement only when explicitly defined in Design Doc
- **Layer Responsibilities**:
  - Infrastructure Layer: Always throw errors upward (no fallback decisions)
  - Application Layer: Implement decisions based on business requirements

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
- Areas likely requiring bulk changes
- Validation rules

**Cases to Avoid Commonalization**
- Accidental matches (coincidentally same code)
- Possibility of evolving in different directions
- Significant readability decrease from commonalization
- Simple helpers in test code

### Implementation Example
```typescript
// ❌ Immediate commonalization on 1st duplication
function validateUserEmail(email: string) { /* ... */ }
function validateContactEmail(email: string) { /* ... */ }

// ✅ Commonalize on 3rd occurrence
function validateEmail(email: string, context: 'user' | 'contact' | 'admin') { /* ... */ }
```

## Common Failure Patterns and Avoidance Methods

### Pattern 1: Error Fix Chain
**Symptom**: Fixing one error causes new errors
**Cause**: Surface-level fixes without understanding root cause
**Avoidance**: Identify root cause with 5 Whys before fixing

### Pattern 2: Abandoning Type Safety
**Symptom**: Excessive use of unsafe type casts or dynamic typing when static typing is available
**Cause**: Impulse to avoid type errors
**Avoidance**: Use language-appropriate type safety mechanisms (type guards, runtime validation, proper type annotations)

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
  Certainty: low (Reason: no examples of MCP connection found)
  Exploratory implementation: true
  Fallback: use conventional API
  ```
- For low certainty cases, create minimal verification code first

### Pattern 5: Insufficient Existing Code Investigation
**Symptom**: Duplicate implementations, architecture inconsistency, integration failures
**Cause**: Insufficient understanding of existing code before implementation
**Avoidance Methods**:
- Before implementation, always search for similar functionality (using domain, responsibility, configuration patterns as keywords)
- Similar functionality found → Use that implementation (do not create new implementation)
- Similar functionality is technical debt → Create ADR improvement proposal before implementation
- No similar functionality exists → Implement new functionality following existing design philosophy
- Record all decisions and rationale in "Existing Codebase Analysis" section of Design Doc

## Debugging Techniques

### 1. Error Analysis Procedure
1. Read error message (first line) accurately
2. Focus on first and last of stack trace
3. Identify first line where your code appears

### 2. 5 Whys - Root Cause Analysis
```
Example:
Symptom: Build error
Why1: Type/interface definitions don't match → Why2: Interface was updated
Why3: Dependency change → Why4: Package update impact
Why5: Major version upgrade with breaking changes
Root cause: Inappropriate version specification in dependency manifest
```

### 3. Minimal Reproduction Code
To isolate problems, attempt reproduction with minimal code:
- Remove unrelated parts
- Replace external dependencies with mocks
- Create minimal configuration that reproduces problem

### 4. Debug Log Output
```
Example (TypeScript):
console.log('DEBUG:', {
  context: 'user-creation',
  input: { email, name },
  state: currentState,
  timestamp: new Date().toISOString()
})

Example (Python):
logging.debug('user-creation', extra={
  'input': {'email': email, 'name': name},
  'state': current_state,
  'timestamp': datetime.now().isoformat()
})
```

## Quality Check Workflow

Language-agnostic quality assurance phases:

### Phase 1-3: Basic Checks
1. **Linting**: Check code style and common issues
2. **Formatting**: Ensure consistent code formatting
3. **Unused Code Detection**: Identify dead code
4. **Build/Compilation**: Verify code compiles (for compiled languages)

### Phase 4-6: Tests and Final Confirmation
1. **Unit Tests**: Run all unit tests
2. **Coverage**: Measure test coverage
3. **Integration Tests**: Run integration/E2E tests
4. **Final Quality Gate**: All checks must pass

### Example: TypeScript/Node.js Project
```bash
# Basic checks
npm run check          # Lint + format
npm run check:unused   # Unused exports
npm run build          # TypeScript compile

# Tests
npm test                        # Run tests
npm run test:coverage:fresh     # Coverage
npm run check:all               # All checks

# Auto-fixes
npm run format     # Format
npm run lint:fix   # Lint fixes
```

### Example: Python Project
```bash
# Basic checks
black --check .        # Format check
flake8                 # Linting
mypy .                 # Type checking

# Tests
pytest                 # Run tests
pytest --cov           # Coverage

# Auto-fixes
black .                # Format
isort .                # Import sorting
```

## Situations Requiring Technical Decisions

### Timing of Abstraction
- Extract patterns after writing concrete implementation 3 times
- Be conscious of YAGNI, implement only currently needed features
- Prioritize current simplicity over future extensibility

### Performance vs Readability
- Prioritize readability unless clear bottleneck exists
- Measure before optimizing (don't guess, measure)
- Document reason with comments when optimizing

### Granularity of Type Definitions
- Overly detailed types reduce maintainability
- Design types that appropriately express domain
- Use utility types to reduce duplication

## Continuous Improvement Mindset

- **Humility**: Perfect code doesn't exist, welcome feedback
- **Courage**: Execute necessary refactoring boldly
- **Transparency**: Clearly document technical decision reasoning
