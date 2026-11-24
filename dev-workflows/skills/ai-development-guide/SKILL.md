---
name: ai-development-guide
description: Applies technical decision criteria, anti-pattern detection, debugging, and quality gates for backend and frontend code. Use when implementing, reviewing, or diagnosing code, code smells, failures, or implementation completeness.
---

# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection

## Value-First Engineering

Inspect until the evidence identifies the lowest-total-complexity solution that delivers the required user, operator, or maintainer value while keeping the system correct and maintainable.
- Resolve verified problems within scope or dependencies required for the outcome.
- Introduce capabilities, infrastructure, abstractions, or speculative edge-case handling when a current outcome, verified constraint, or evidence-backed material risk requires them.

Judge total complexity across every activated surface: user decisions, settings, modes, concepts, outputs, persistent state, and implementation paths, together with their UX, runtime, testing, documentation, and maintenance cost. Compare only dimensions that differ between viable approaches. Prefer reuse or no new mechanism when it delivers the same required value and proof at lower total complexity.

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
- Recovery behavior that hides a failure from the boundary responsible for diagnosis or recovery

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
- Facts that several places in this repository must agree on: names, keys, paths, closed sets of values, and data shapes one side writes and another reads

**Cases to Avoid Commonalization**
- Accidental matches (coincidentally same code)
- Contracts or change reasons that evidence shows differ
- Significant readability decrease from commonalization
- Simple helpers in test code

## Common Failure Patterns and Avoidance Methods

### Pattern 1: Symptom Fixes
**Symptom**: Fixing one error or finding causes new ones, or the same defect returns through another path
**Cause**: Each symptom is repaired where it appeared, leaving what produced it in place
**Avoidance**: Trace the failures or findings in hand to what produces them; findings with one cause are corrected once at that cause, so no other path can produce them again

### Pattern 2: Circumventing Correctness Guarantees
**Symptom**: Bypassing safety mechanisms (type systems, validation, contracts)
**Cause**: Impulse to avoid correctness errors
**Avoidance**: Use language-appropriate safety mechanisms (static checking, runtime validation, contracts, assertions)

### Pattern 3: Implementation Without Sufficient Testing
**Symptom**: Many bugs after implementation
**Cause**: Accepted behavior left without a test that proves it
**Avoidance**: Prove each delivered behavior at the boundary where it is observed

### Pattern 4: Building on Unverified Premises
**Symptom**: Dependent work fails, or workarounds accumulate, once an assumed premise proves false
**Cause**: Treating an assumed capability, behavior, or existing implementation as fact
**Avoidance**: When an unverified premise could invalidate the chosen approach, check it by the cheapest sufficient means before building dependent work on it. When results contradict the premise, reconsider the approach before patching its parts. Keep this reasoning in the active task; it needs no separate artifact.

### Pattern 5: Insufficient Existing Code Investigation
**Symptom**: Duplicate implementations, architecture inconsistency, integration failures, adopting outdated patterns
**Cause**: Insufficient understanding of existing code before implementation; referencing only nearby files without verifying representativeness
**Avoidance Methods**:
- Before implementation, find functionality that already holds the same responsibility and the code that depends on the change, as coding-principles Reference Representativeness describes; similar functionality may share no name with the new code
- Similar functionality found → Verify that its contract, lifecycle, and repository usage are representative; reuse or extend it when compatible, otherwise record why it is not a valid model
- Existing code the change connects to or resembles has a problem, such as a fact written in two places, a state it can express but must not, or a shape the new case has to work around → Revise it in this change when the revision leaves this change's final state simpler to maintain, keeping the outcome, requirements, and non-goals unchanged: a change built around the problem keeps both the problem and the workaround. Create an ADR when the revision requires an architectural decision
- No similar functionality exists → Implement new functionality following existing design philosophy
- Preserve the evidence for each reuse, extend, separate, or revise decision in the applicable implementation or design record

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
- Extract a shared abstraction after repository evidence shows a responsibility with the same contract and change reason maintained in more than one place
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
- Treat explicit restrictions and quantities ("one", "this file", "only X") in the governing request or the outcome, desired-future requirements, and non-goals as hard boundaries; treat technical-artifact How as a correctable baseline when repository evidence invalidates it without changing those boundaries
- Treat referenced or expected paths as investigation starting points unless the governing source explicitly makes them exclusive
- Copy/move/mirror requests preserve content verbatim; edit content only when requested
- Port/translation requests preserve intent and behavior; adapt only what the destination context requires
- Include related files, symmetric locations, and adjacent behavior when evidence shows they are required by the same accepted outcome or consistency contract

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

## References

- [references/frontend.md](references/frontend.md): read when implementing, reviewing, fixing, or diagnosing frontend code in any stack
- Stack references: identify the UI framework and language of the target code from its nearest manifest, then read the file for that framework below along with the frontend references. UI code in a stack without a file follows the frontend references and representative repository patterns.
  - [references/react-typescript.md](references/react-typescript.md) — React (type sections for TypeScript): `unknown` and type-assertion boundaries, hook render errors and Error Boundary scope, server-component client boundaries, memoization only on profiler or identity evidence, and React Testing Library interactions
