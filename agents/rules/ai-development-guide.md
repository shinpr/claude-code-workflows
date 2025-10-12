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
```
// ❌ Immediate commonalization on 1st duplication
function validateUserEmail(email) { /* ... */ }
function validateContactEmail(email) { /* ... */ }

// ✅ Commonalize on 3rd occurrence with context parameter
function validateEmail(email, context) { /* ... */ }
// context: 'user' | 'contact' | 'admin'
```

## Common Failure Patterns and Avoidance Methods

### Pattern 1: Error Fix Chain
**Symptom**: Fixing one error causes new errors
**Cause**: Surface-level fixes without understanding root cause
**Avoidance**: Identify root cause with 5 Whys before fixing

### Pattern 2: Abandoning Type Safety
**Symptom**: Bypassing language's type system or validation mechanisms
**Cause**: Impulse to avoid type/validation errors
**Avoidance**: Use language-appropriate safety mechanisms (static type checking, runtime validation, contracts, assertions)

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
Why1: Contract definitions don't match → Why2: Interface was updated
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
Pattern: Structured logging with context
{
  context: 'operation-name',
  input: { relevant, input, data },
  state: currentState,
  timestamp: current_time_ISO8601
}

Key elements:
- Operation context (what is being executed)
- Input data (what was received)
- Current state (relevant state variables)
- Timestamp (for correlation)
```

## Quality Check Workflow

Universal quality assurance phases applicable to all languages:

### Phase 1: Static Analysis
1. **Code Style Checking**: Verify adherence to style guidelines
2. **Code Formatting**: Ensure consistent formatting
3. **Unused Code Detection**: Identify dead code and unused imports/variables
4. **Static Type Checking**: Verify type correctness (for statically typed languages)
5. **Static Analysis**: Detect potential bugs, security issues, code smells

### Phase 2: Build Verification
1. **Compilation/Build**: Verify code builds successfully (for compiled languages)
2. **Dependency Resolution**: Ensure all dependencies are available and compatible
3. **Resource Validation**: Check configuration files, assets are valid

### Phase 3: Testing
1. **Unit Tests**: Run all unit tests
2. **Integration Tests**: Run integration tests
3. **Test Coverage**: Measure and verify coverage meets standards
4. **E2E Tests**: Run end-to-end tests

### Phase 4: Final Quality Gate
All checks must pass before proceeding:
- Zero static analysis errors
- Build succeeds
- All tests pass
- Coverage meets threshold

### Quality Check Pattern (Language-Agnostic)
```
Workflow:
1. Format check → 2. Lint/Style → 3. Static analysis →
4. Build/Compile → 5. Unit tests → 6. Coverage check →
7. Integration tests → 8. Final gate

Auto-fix capabilities (when available):
- Format auto-fix
- Lint auto-fix
- Import organization
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

### Granularity of Contracts and Interfaces
- Overly detailed contracts reduce maintainability
- Design interfaces that appropriately express domain
- Use abstraction mechanisms to reduce duplication

## Continuous Improvement Mindset

- **Humility**: Perfect code doesn't exist, welcome feedback
- **Courage**: Execute necessary refactoring boldly
- **Transparency**: Clearly document technical decision reasoning
