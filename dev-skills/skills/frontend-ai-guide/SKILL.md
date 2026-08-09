---
name: frontend-ai-guide
description: Applies React/TypeScript-specific technical decision criteria, anti-pattern detection, debugging, and frontend quality gates. Use when reviewing components, hooks, browser behavior, or frontend implementation completeness.
---

# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection (Frontend)

## Value-First Engineering

Explore broadly, then converge on the lowest-lifecycle-cost solution that delivers the required user or maintainer value while keeping the UI correct and maintainable.
- Resolve verified problems within confirmed scope or dependencies required for the outcome; report other findings with evidence for a scope decision.
- Introduce state, props, variants, abstractions, or speculative edge-case handling when a current outcome, verified constraint, or evidence-backed material risk requires them.
- Treat behavior-preserving maintenance inside the confirmed responsibility as current maintainer value when repository evidence shows it reduces change ambiguity, duplicate ownership, defect risk, or future implementation and verification cost without expanding observable product scope.

## Technical Anti-patterns (Red Flag Patterns)

Pause the affected decision and review the design when detecting the following patterns:

### Code Quality Anti-patterns
1. **Duplicating one UI responsibility across independently maintained components** - Review whether the duplicated behavior or contract should have one owner
2. **Multiple responsibilities mixed in a single component** - Violates Single Responsibility Principle (SRP)
3. **Defining same content in multiple components** - Violates DRY principle
4. **Making changes without checking dependencies** - Potential for unexpected impacts
5. **Disabling code with comments** - Should use version control
6. **Error suppression** - Hiding problems creates technical debt
7. **Excessive use of type assertions (as)** - Abandoning type safety
8. **Pass-through prop chains that obscure state ownership** - Use composition, Context, or the project's state layer when intermediate components only forward values and a broader owner is clearer; retain explicit props when they preserve local ownership and broader state ownership would add coordination while responsibility remains local
9. **Components mixing independently changing responsibilities** - Split when rendering, state/data ownership, or reusable/testable behavior forms an independent responsibility; retain cohesive components when splitting would add avoidable prop/state synchronization

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
- **Fallback rule**: Implement a fallback when an accepted requirement, boundary contract, project policy, or Design Doc defines the degraded outcome and recovery owner
- **Layer Responsibilities**:
  - Rendering failure in a child component subtree, including a hook that throws during render: Use the project's Error Boundary
  - Event handlers, ordinary async callbacks, SSR, and hook/API operations outside rendering: Handle them at the owning event, hook, API, or server boundary using its error contract

### Detection of Excessive Fallbacks
- Require design review when adding a catch that duplicates or fragments an existing recovery responsibility; retain it for a distinct failure mode with a documented recovery owner and visible UI outcome
- Require design review when the same failure is caught at multiple component/hook/API layers without one recovery owner, or when nested handlers obscure the visible UI state
- Identify the accepted recovery contract before implementing a fallback
- Make fallback activation observable through one existing UI, log, or metric channel at the boundary that owns diagnosis or recovery; add a new channel only when an operational requirement or project policy requires it

## Criteria for Code Duplication

Keep concrete implementations separate while their similarity is accidental or their UI ownership differs. Consolidate when repository evidence shows one shared interaction, validation rule, visual contract, or coordinated change responsibility.

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
**Avoidance**: Start new or changed behavior and reproducible bug fixes with a failing test. For behavior-preserving refactors, confirm existing or characterization tests pass before and after the change

### Pattern 4: Ignoring Technical Uncertainty
**Symptom**: Frequent unexpected errors when introducing new technology
**Cause**: Assuming "it should work according to official documentation" without prior investigation
**Avoidance**:
- Record certainty where it controls implementation or verification decisions
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
- Similar functionality found → Verify that its props, lifecycle, design-system role, and repository usage are representative; reuse or extend it when compatible, otherwise record why it is not a valid model
- Similar functionality is technical debt → Repair it when it blocks the current outcome, was caused by the current change, or lies in confirmed scope; otherwise report it separately. Create an ADR when the repair requires an architectural decision
- No similar functionality exists → Implement new functionality following existing design philosophy
- Preserve the evidence for each reuse, extend, separate, or repair decision in the applicable implementation or design record

## Quality Check Workflow

Discover the repository's configured quality entry points and the categories they cover. Use the repository's declared package tooling and conventions and the categories below as the applicable evidence checklist.

### Applicable Check Categories

- **Lint/format** — the project's configured formatter and linter
- **Type check** — the project's configured type validation
- **Build** — the configured production or package build
- **Behavior checks** — the smallest configured tests that exercise the changed behavior, plus integration or E2E suites when the change crosses their boundary, a generated skeleton requires them, or the repository gate includes them

Follow repository-declared command composition or ordering when it exists. Otherwise choose an order that respects command dependencies and provides useful feedback. Completion requires every applicable configured check to pass.

### Troubleshooting
- **Port already in use** — stop the stale dev/preview/test process holding the port
- **Stale cache** — re-run with the project's fresh/clean-cache option
- **Dependency errors** — clean reinstall dependencies

## Situations Requiring Technical Decisions

### Timing of Abstraction
- Extract a shared abstraction after repository evidence establishes a shared UI responsibility and coordinated change pattern
- Be conscious of YAGNI, implement only currently needed features
- Prioritize current simplicity over future extensibility

### Performance vs Readability
- Prioritize readability unless the project's performance budget or a React DevTools Profiler comparison identifies a meaningful bottleneck in the affected interaction
- Measure before optimizing with React DevTools Profiler
- Document reason with comments when optimizing

### Granularity of Component/Type Definitions
- Overly detailed components/types reduce maintainability
- Design components that appropriately express UI patterns
- Use composition over inheritance

## Implementation Completeness Assurance

### Risk-Scaled Procedure for Impact Analysis

**Completion Criteria**: Complete all 3 stages. Concise search/inspection notes are sufficient for an isolated component change with no shared contract, routing, state-ownership, or build/config impact; use the structured report for cross-component or high-risk changes.

#### 1. Discovery
Search the repository for every reference to the changed component or hook, its imported functions, and its Props/State types.

#### 2. Understanding
Read the discovered files needed to establish:
- Caller's purpose and context
- Component hierarchy
- Data flow: Props → State → Event handlers → Callbacks

#### 3. Identification
For cross-component or high-risk changes, produce a structured impact report:
```
## Impact Analysis
### Direct Impact: ComponentA, ComponentB (with reasons)
### Indirect Impact: FeatureX, PageY (with integration paths)
### Processing Flow: Props → Render → Events → Callbacks
```

Proceed when the accepted scope, consumers, state flow, required adjacent changes, and applicable checks are identified.

### Unused Code Deletion Rule

When the requested change makes a component, hook, utility, document, or configuration entry obsolete, delete it after checking its consumers and generated/operational use. Preserve and report uncertain or out-of-scope cleanup, and keep unrelated dormant code outside the implementation scope.

### Existing Code Deletion Decision Flow

```
Required by the requested change? No → Preserve unless the change proves it obsolete
                               Yes → Working and compatible? Yes → Fix/extend
                                                             No → Repair or replace with migration/rollback evidence
```
