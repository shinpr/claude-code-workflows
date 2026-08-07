---
name: ai-development-guide
description: Applies language-agnostic and backend technical decision criteria, anti-pattern detection, debugging, and quality gates. Use when reviewing general/backend implementation choices, code smells, failures, or implementation completeness.
---

# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection

## Value-First Engineering

Explore broadly, then converge on the lowest-lifecycle-cost solution that delivers the required user, operator, or maintainer value while keeping the system correct and maintainable.
- Resolve verified problems within confirmed scope or dependencies required for the outcome; report other findings with evidence for a scope decision.
- Introduce capabilities, infrastructure, abstractions, or speculative edge-case handling when a current outcome, verified constraint, or evidence-backed material risk requires them.
- Treat behavior-preserving maintenance inside the confirmed responsibility as current maintainer value when repository evidence shows it reduces change ambiguity, duplicate ownership, defect risk, or future implementation and verification cost without expanding observable product scope.

## Technical Anti-patterns (Red Flag Patterns)

Pause the affected decision and review the design when detecting the following patterns:

### Code Quality Anti-patterns
1. **Writing similar code 3 or more times** - Violates Rule of Three
2. **Multiple responsibilities mixed in a single file** - Violates Single Responsibility Principle (SRP)
3. **Defining same content in multiple files** - Violates DRY principle
4. **Making changes without checking dependencies** - Potential for unexpected impacts
5. **Disabling code with comments** - Should use version control
6. **Error suppression** - Hiding problems creates technical debt
7. **Bypassing safety mechanisms (type systems, validation, contracts)** - Circumventing language's correctness guarantees

### Design Anti-patterns
- **"Make it work for now" thinking** - Accumulation of technical debt
- **Patchwork implementation** - Unplanned additions to existing code
- **Optimistic implementation of uncertain technology** - Designing unknown elements assuming "it'll probably work"
- **Symptomatic fixes** - Surface-level fixes that don't solve root causes
- **Unplanned large-scale changes** - Lack of incremental approach

## Fail-Fast Fallback Design Principles

### Core Principle
Make all errors visible and traceable with full context. Prioritize primary code reliability over fallback implementations. Excessive fallback mechanisms mask errors and make debugging difficult.

### Implementation Guidelines

#### Default Approach
- **Give every failure an explicit outcome**: propagate it, translate it to the boundary's error contract, or recover through an accepted fallback
- **Make failures explicit**: Errors should be visible and traceable
- **Preserve error context**: Include original error information when re-throwing

#### When Fallbacks Are Acceptable
- **Accepted recovery contract**: A requirement, Design Doc, existing boundary contract, or project policy defines why degraded behavior is preferable to failure
- **Business-critical continuity**: When partial functionality is better than none
- **Graceful degradation paths**: Clearly defined degraded service levels

#### Layer Responsibilities
- **Infrastructure Layer**:
  - Preserve the original cause and operational context
  - Propagate, translate, or return the failure in the form required by the caller's boundary contract
  - Perform infrastructure-owned cleanup or retry only when that boundary owns it; business recovery decisions remain in the application layer

- **Application Layer**:
  - Make business-driven error handling decisions
  - Implement fallbacks only when an accepted recovery contract defines the degraded outcome
  - Make fallback activation observable through the project's established logging, metrics, or user-visible state when diagnosis or recovery requires it

### Error Masking Detection

**Review Triggers** (require design review):
- Writing the 3rd error handler in the same feature; review whether recovery ownership is fragmented before adding it
- The same failure is caught at multiple layers without a single recovery owner
- Nested handlers obscure which state is committed, rolled back, or exposed
- A handler converts a failure to success/default output without an observable degraded-state contract
- Error handlers that return default values without logging

The third handler may remain when it covers a distinct failure mode with a documented recovery owner, state outcome, and observable signal.

**Before Implementing Any Fallback**:
1. Identify the accepted requirement, boundary contract, project policy, or Design Doc entry that defines this fallback
2. Document the business justification
3. Make activation observable at the boundary that owns diagnosis or recovery through one existing UI, log, or metric channel; when logging is that channel, log once with sensitive data redacted
4. Add new monitoring or alerting only when an operational requirement or project policy requires it

### Implementation Pattern

```
AVOID: Silent fallback that hides errors
    <handle error>:
        return DEFAULT_VALUE  // Error hidden, debugging impossible

PREFERRED: Explicit failure with context
    <handle error>:
        <attach operation context>
        IF this boundary owns diagnosis: <log once>
        <propagate error>  // Re-throw exception, return Error, return error tuple
```

**Adaptation**: Use language-appropriate error handling (exceptions, Result types, error tuples, etc.)

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

## Common Failure Patterns and Avoidance Methods

### Pattern 1: Error Fix Chain
**Symptom**: Fixing one error causes new errors
**Cause**: Surface-level fixes without understanding root cause
**Avoidance**: Identify root cause with 5 Whys before fixing

### Pattern 2: Circumventing Correctness Guarantees
**Symptom**: Bypassing safety mechanisms (type systems, validation, contracts)
**Cause**: Impulse to avoid correctness errors
**Avoidance**: Use language-appropriate safety mechanisms (static checking, runtime validation, contracts, assertions)

### Pattern 3: Implementation Without Sufficient Testing
**Symptom**: Many bugs after implementation
**Cause**: Ignoring Red-Green-Refactor process
**Avoidance**: Start implementation with a failing test that proves the intended behavior

### Pattern 4: Ignoring Technical Uncertainty
**Symptom**: Frequent unexpected errors when introducing new technology
**Cause**: Assuming "it should work according to official documentation" without prior investigation
**Avoidance**:
- Record certainty evaluation at the beginning of task files
  ```
  Certainty: low (Reason: no working examples found for this integration)
  Exploratory implementation: true
  Fallback: use established alternative approach
  ```
- For low certainty cases, create minimal verification code first

### Pattern 5: Insufficient Existing Code Investigation
**Symptom**: Duplicate implementations, architecture inconsistency, integration failures, adopting outdated patterns
**Cause**: Insufficient understanding of existing code before implementation; referencing only nearby files without verifying representativeness
**Avoidance Methods**:
- Before implementation, always search for similar functionality (using domain, responsibility, configuration patterns as keywords)
- Similar functionality found → Verify that its contract, lifecycle, and repository usage are representative; reuse or extend it when compatible, otherwise record why it is not a valid model
- Similar functionality is technical debt → Repair it when it blocks the current outcome, was caused by the current change, or lies in confirmed scope; otherwise report it separately. Create an ADR when the repair requires an architectural decision
- No similar functionality exists → Implement new functionality following existing design philosophy
- Record all decisions and rationale in "Existing Codebase Analysis" section of Design Doc
- **Reference representativeness check**: When adopting a pattern or dependency from nearby code, verify it is representative across the repository before adopting — nearby files alone are an insufficient basis

## Quality Assurance Mechanism Awareness

Before executing quality checks, identify what quality mechanisms exist for the change area:
- Primary detection: inspect the change area's file types, project manifest, and configuration to identify applicable quality tools
  - Check CI pipeline definitions for checks that cover the affected paths
  - Check for domain-specific linter or validator configurations (e.g., schema validators, API spec validators, configuration file linters)
  - Check for domain-specific constraints in project configuration (naming rules, length limits, format requirements)
- When a task file supplies Operation Verification Methods, run them as task-specific checks
- Include discovered domain-specific checks alongside standard quality phases below

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
1. **Implementation Feedback**: During implementation, run the smallest configured tests that exercise the changed behavior
2. **Completion Tests**: Before completion, run the repository's configured test commands; include integration or E2E suites when the change crosses their boundary, test skeletons require them, or the project quality gate includes them
3. **Test Coverage**: Use coverage as a gap signal and satisfy any project-configured threshold

### Phase 4: Final Quality Gate
All checks must pass before proceeding:
- Zero static analysis errors
- Build succeeds
- All tests pass
- Coverage meets project-configured threshold

### Quality Check Pattern (Language-Agnostic)
```
Workflow:
1. Discover applicable project checks → 2. Run fast affected checks →
3. Run configured build/static gates → 4. Run boundary-relevant broader tests →
5. Run the project's final required gate

Auto-fix capabilities (when available):
- Format auto-fix
- Lint auto-fix
- Dependency/import organization
- Simple code smell corrections
```

## Situations Requiring Technical Decisions

### Timing of Abstraction
- Extract patterns after writing concrete implementation 3 times
- Be conscious of YAGNI, implement only currently needed features
- Prioritize current simplicity over future extensibility

### Performance vs Readability
- Prioritize readability unless profiling identifies a measurable bottleneck (e.g., response time exceeding SLA, memory exceeding allocation)
- Measure before optimizing
- Document reason with comments when optimizing

### Granularity of Contracts and Interfaces
- Overly detailed contracts reduce maintainability
- Design interfaces where each method maps to a single domain operation and parameter types use domain vocabulary
- Use abstraction mechanisms to reduce duplication

### Scope Expansion
- Apply implementation/edit instructions to the user's or task's specified scope. Escalate before expanding it.
- Treat explicit quantities and targets ("one", "this file", "only X") as boundaries
- Copy/move/mirror requests preserve content verbatim; edit content only when requested
- Port/translation requests preserve intent and behavior; adapt only what the destination context requires
- Before changing related files, symmetric locations, adjacent behavior, or adding helpful extras, escalate with the proposed expansion

## Implementation Completeness Assurance

### Impact Analysis: Risk-Scaled 3-Stage Process

Complete these stages sequentially before implementation. For an isolated change with no public contract, data-flow, integration, or configuration impact, concise notes or search evidence are sufficient. Use the structured report for cross-boundary, high-risk, or multi-consumer changes.

**1. Discovery** - Identify all affected code:
- Implementation references (imports, calls, instantiations)
- Interface dependencies (contracts, types, data structures)
- Test coverage
- Configuration (build configs, env settings, feature flags)
- Documentation (comments, docs, diagrams)

**2. Understanding** - Analyze each discovered location:
- Role and purpose in the system
- Dependency direction (consumer or provider)
- Data flow (origin → transformations → destination)
- Coupling strength

**3. Identification** - Record the affected units, risks, and implementation order at the depth required by the change. For expanded analysis, use:
```
## Impact Analysis
### Direct Impact
- [Unit]: [Reason and modification needed]

### Indirect Impact
- [System]: [Integration path → reason]

### Data Flow
[Source] → [Transformation] → [Consumer]

### Risk Assessment
- High: [Complex dependencies, fragile areas]
- Medium: [Moderate coupling, test gaps]
- Low: [Isolated, well-tested areas]

### Implementation Order
1. [Start with lowest risk or deepest dependency]
2. [...]
```

Proceed when discovery and understanding cover the files and behaviors named by the user or current task/design artifact, and the identified risks have an implementation or escalation path.

### Unused Code Deletion

When an artifact made obsolete by the requested change is detected:
- Delete it in the same change when its callers and generated/operational uses are checked
- Preserve and report it when obsolescence is uncertain or deletion would expand beyond the files and behaviors named by the user or current task/design artifact
- Keep unrelated dormant code outside the implementation scope

### Existing Code Modification

```
Required by the requested change? No → Preserve unless the change proves it obsolete
                               Yes → Working and compatible? Yes → Fix/Extend
                                                             No → Repair or replace with migration/rollback evidence
```

**Principle**: Prefer clean implementation over patching broken code
