---
name: ai-development-guide
description: Applies language-agnostic and backend technical decision criteria, anti-pattern detection, debugging, and quality gates. Use when reviewing general/backend implementation choices, code smells, failures, or implementation completeness.
---

# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection

## Value-First Engineering

Inspect until the evidence identifies the lowest-total-complexity solution that delivers the required user, operator, or maintainer value while keeping the system correct and maintainable.
- Resolve verified problems within confirmed scope or dependencies required for the outcome; report other findings with evidence for a scope decision.
- Introduce capabilities, infrastructure, abstractions, or speculative edge-case handling when a current outcome, verified constraint, or evidence-backed material risk requires them.
- Treat behavior-preserving maintenance inside the confirmed responsibility as current maintainer value when repository evidence shows it reduces change ambiguity, duplicate ownership, defect risk, or future implementation and verification cost without expanding observable product scope.

Judge total complexity across every activated surface: user decisions, settings, modes, concepts, outputs, persistent state, and implementation paths, together with their UX, runtime, implementation, testing, documentation, and maintenance cost. Compare only dimensions that differ between viable approaches. Prefer reuse or no new mechanism when it delivers the same confirmed value and proof at lower total complexity.

## Technical Anti-patterns (Red Flag Patterns)

Pause the affected decision and review the design when detecting the following patterns:

### Code Quality Anti-patterns
1. **Duplicating one responsibility across independently maintained locations** - Review whether the duplicated logic has one change reason and should have one owner
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
- Adding an error handler that duplicates or fragments an existing recovery responsibility
- The same failure is caught at multiple layers without a single recovery owner
- Nested handlers obscure which state is committed, rolled back, or exposed
- A handler converts a failure to success/default output without an observable degraded-state contract
- Error handlers that return default values without logging

Another handler may remain when it covers a distinct failure mode with a documented recovery owner, state outcome, and observable signal.

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

## Criteria for Code Duplication

Keep concrete implementations separate while their apparent similarity is accidental or their change reasons differ. Consolidate when repository evidence shows the same business rule, algorithm, validation contract, or coordinated change responsibility is maintained in multiple places.

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
- Record certainty where it controls implementation or verification decisions
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
- Preserve the evidence for each reuse, extend, separate, or repair decision in the applicable implementation or design record
- **Reference representativeness check**: When adopting a pattern or dependency from nearby code, verify it is representative across the repository before adopting — nearby files alone are an insufficient basis

## Quality Assurance Mechanism Awareness

Before executing quality checks, identify what quality mechanisms exist for the change area:
- Primary detection: inspect the change area's file types, project manifest, and configuration to identify applicable quality tools
  - Check CI pipeline definitions for checks that cover the affected paths
  - Check for domain-specific linter or validator configurations (e.g., schema validators, API spec validators, configuration file linters)
  - Check for domain-specific constraints in project configuration (naming rules, length limits, format requirements)
- Run verification methods supplied by the governing work artifact as change-specific checks
- Include discovered domain-specific checks alongside standard quality phases below

## Quality Check Workflow

Discover the repository's configured quality entry points and the categories they cover. Use the categories below as the applicable evidence checklist:

- **Static checks**: formatting, linting, unused-code detection, type checking, and configured static analysis
- **Build checks**: compilation or production build, dependency resolution, and configured resource validation
- **Behavior checks**: the smallest configured tests that exercise the changed behavior, plus integration or E2E suites when the change crosses their boundary, a generated skeleton requires them, or the repository gate includes them

Follow repository-declared command composition or ordering when it exists. Otherwise choose an order that respects command dependencies and provides useful feedback. Completion requires every applicable configured check to pass.

## Situations Requiring Technical Decisions

### Timing of Abstraction
- Extract a shared abstraction after repository evidence establishes a shared responsibility and coordinated change pattern
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
- Apply implementation/edit instructions to the accepted outcome and its governing scope.
- Treat explicit restrictions and quantities ("one", "this file", "only X") in the governing request or approved artifact as hard boundaries
- Treat referenced or expected paths as investigation starting points unless the governing source explicitly makes them exclusive
- Copy/move/mirror requests preserve content verbatim; edit content only when requested
- Port/translation requests preserve intent and behavior; adapt only what the destination context requires
- Include related files, symmetric locations, and adjacent behavior when evidence shows they are required by the same accepted outcome or consistency contract; report unrelated improvements separately

## Implementation Completeness Assurance

### Impact Analysis: Risk-Scaled 3-Stage Process

Complete these stages sequentially before implementation. For an isolated change with no public contract, data-flow, integration, or configuration impact, concise notes or search evidence are sufficient. Use the structured report for cross-boundary, high-risk, or multi-consumer changes.

**1. Discovery** - Identify all affected code:
- Implementation references (imports, calls, instantiations)
- Interface dependencies (contracts, types, data structures)
- Behavior-relevant test evidence
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

Proceed when discovery and understanding cover the accepted outcome, governing boundaries, and required adjacent dependencies, and each material risk has an implementation, verification, or unresolved-decision disposition.

### Unused Code Deletion

When an artifact made obsolete by the requested change is detected:
- Delete it in the same change when its callers and generated/operational uses are checked
- Preserve and report it when obsolescence is uncertain or deletion would expand beyond the accepted outcome and governing boundaries
- Keep unrelated dormant code outside the implementation scope

### Existing Code Modification

```
Required by the requested change? No → Preserve unless the change proves it obsolete
                               Yes → Working and compatible? Yes → Fix/Extend
                                                             No → Repair or replace with migration/rollback evidence
```

**Principle**: Prefer clean implementation over patching broken code
