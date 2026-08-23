---
name: implementation-approach
description: Implementation strategy selection framework. Use when planning implementation strategy, selecting development approach, or defining verification criteria.
---

# Implementation Strategy Selection Framework (Meta-cognitive Approach)

## Meta-cognitive Strategy Selection Process

### Phase 1: Decision-Sufficient Current State Analysis

**Core Question**: "What does the existing implementation look like?"

#### Analysis Framework
```yaml
Architecture Analysis: Responsibility separation, data flow, dependencies, technical debt
Implementation Quality Assessment: Code quality, behavior-relevant test evidence, performance, security
Historical Context Understanding: Current form rationale, past decision validity, constraint changes, requirement evolution
```

#### Meta-cognitive Question List
- What is the true responsibility of this implementation?
- Which parts are business essence and which derive from technical constraints?
- What dependencies or implicit preconditions are unclear from the code?
- What benefits and constraints does the current design bring?

Stop when another current-state fact cannot change responsibility, reuse, option validity, total complexity, a contract, or verification.

### Phase 2: Design Convergence

Complete these steps in order before selecting an implementation strategy:

1. **Existing-Surface Baseline**: Form the simplest end-to-end path that delivers the current outcome through existing responsibilities. Explicit requirements and accepted decisions are binding; suggested mechanisms remain candidates.
2. **Evidence Check**: Test that path against current requirements, verified constraints, observed in-scope problems, and evidence-backed material risks. Keep only the unmet conditions that can change the selected design.
3. **Targeted Comparison**: For each unmet condition, test reuse, derivation from existing data, on-demand computation, or responsibility at the current caller or boundary before adding design surface. Compare viable choices by total complexity across the dimensions that materially differ: user decisions, settings, modes, concepts, outputs, persistent state, implementation paths, UX, runtime, implementation, testing, documentation, and maintenance. Select the lowest-total-complexity choice that satisfies the condition.
4. **Subtraction Check**: Remove each proposed addition and re-test its governing condition. Retain it only when the confirmed outcome, a required boundary, or necessary proof becomes unmet.

Classify supporting claims as observed, inferred, or unknown. When an unknown blocks the next step, stop at the current step and name the evidence or user decision required.

Candidate paths and rejected additions remain active analysis. The durable output is the **Selected Design**: the complete chosen path plus evidence for each added design surface and the condition that fails when it is removed. An accepted ADR may retain alternatives as decision history. An implementer uses the same convergence check without producing a separate artifact.

### Phase 3: Strategy Exploration and Creation

**Core Question**: "When determining before → after, what implementation patterns or strategies should be referenced?"

#### Strategy Discovery Process
```yaml
Direct Strategy: Smallest repository-supported change that satisfies the accepted requirements and constraints
Repository Alternatives: Existing patterns that materially differ in migration, dependency order, or verification boundary
External Research: Official/current sources only when repository evidence cannot resolve a time-sensitive capability, compatibility, or dependency decision
```

#### Reference Strategy Patterns

**Legacy Handling Strategies**:
- Strangler Pattern: Gradual migration through phased replacement
- Facade Pattern: Complexity hiding through unified interface
- Adapter Pattern: Bridge with existing systems

**New Development Strategies**:
- Feature-driven Development: Vertical implementation prioritizing user value
- Foundation-driven Development: Foundation-first construction prioritizing stability
- Risk-driven Development: Prioritize addressing maximum risk elements

**Integration/Migration Strategies**:
- Proxy Pattern: Transparent feature extension
- Decorator Pattern: Phased enhancement of existing features
- Bridge Pattern: Flexibility through abstraction

Use these patterns only when their named migration or dependency problem exists. Start with the direct strategy. Compare an alternative when it would materially change risk, rollout, compatibility, or the early verification point. Keep the option set limited to patterns that produce one of those material differences.

### Phase 4: Material Risk Assessment and Control

**Core Question**: "What risks arise when applying this to existing implementation, and what's the best way to control them?"

Evaluate only risk categories for which current evidence can change the strategy, public contract, rollout, rollback, or verification boundary.

#### Conditional Risk Categories
```yaml
Technical Risks: System impact, data consistency, performance degradation, integration complexity
Operational Risks: Service availability, deployment downtime, process changes, rollback procedures
Project Risks: Schedule delays, learning costs, quality achievement, team coordination
```

#### Risk Control Strategies
```yaml
Preventive Measures: Phased migration, parallel operation verification, integration/regression tests, monitoring setup
Incident Response: Rollback procedures, log/metrics preparation, communication system, service continuation procedures
```

### Phase 5: Decision-Relevant Constraint Compatibility

**Core Question**: "What are this project's constraints?"

Check only constraints evidenced by the governing requirements, repository, external contracts, or current environment that can change the selected strategy or verification boundary.

#### Conditional Constraint Categories
```yaml
Technical Constraints: Library compatibility, resource capacity, mandatory requirements, numerical targets
Temporal Constraints: Deadlines/priorities, dependencies, milestones, learning periods
Resource Constraints: Team/skills, work hours/systems, budget, external contracts
Business Constraints: Market launch timing, customer impact, regulatory compliance
```

### Phase 6: Implementation Approach Decision

Select the implementation approach that directly fits the verified dependency and delivery constraints:

#### Vertical Slice (Feature-driven)
**Characteristics**: Vertical implementation across all layers by feature unit
**Application Conditions**: Default when an end-to-end value unit can be delivered and verified independently. Data-model sharing and layer breadth are supporting evidence, not substitutes for independent deliverability
**Verification Method**: End-user value delivery at each feature completion

#### Horizontal Slice (Foundation-driven)
**Characteristics**: Phased construction by architecture layer
**Application Conditions**: Use when a common foundation blocks consumer work or must pass stability/compatibility verification before dependent slices can proceed. Materially shared dependency ownership across multiple consumers is a signal to evaluate this approach
**Verification Method**: Integrated operation verification when all foundation layers complete

#### Hybrid
**Characteristics**: Flexible combination according to project characteristics
**Application Conditions**: Use when a verified foundation step is required first and later work can proceed as independently verifiable value slices. Resolve blocking requirement ambiguity before selecting the implementation approach
**Verification Method**: Verify at appropriate L1/L2/L3 levels according to each phase's goals

### Phase 7: Decision Rationale Documentation

Record in the applicable implementation or design decision record:
1. Selected strategy name and characteristics
2. Current evidence and total-complexity basis for added design surface
3. Controls for each material risk activated in Phase 4
4. Compatibility with each decision-relevant constraint activated in Phase 5
5. Verification level (L1/L2/L3) and integration point definition

Alternatives remain active analysis unless an accepted ADR owns them as decision history.

## Verification Level Definitions

Priority for completion verification of each task:

- **L1: Functional Operation Verification** - Operates as end-user feature (e.g., search executable)
- **L2: Test Operation Verification** - New tests added and passing
- **L3: Build Success Verification** - Code builds/runs without errors

**Priority**: L1 > L2 > L3 in order of verifiability importance

## Integration Point Definitions

Define integration points according to selected strategy:
- **Strangler-based**: When switching between old and new systems for each feature
- **Feature-driven**: When users can actually use the feature
- **Foundation-driven**: When all architecture layers are ready and E2E tests pass
- **Hybrid**: When individual goals defined for each phase are achieved

## Quality Checks

1. Confirm Phase 1 identifies the current responsibility, dependency path, and historical constraints before selecting a strategy
2. Confirm Phase 2 produces one complete Selected Design and every added design surface maps to current evidence, lower-surface insufficiency, and a failed condition under subtraction
3. Confirm Phase 4 records concrete controls for every evidenced material risk; no entry is required for an inapplicable category
4. Confirm Phase 5 checks every evidenced constraint that can change strategy selection or verification; no entry is required for an inapplicable category
5. Confirm Phase 7 records the selected strategy, its total-complexity basis, and the early verification point; alternatives appear only in an accepted ADR

## Guidelines for Meta-cognitive Execution

1. **Leverage Known Patterns**: Use a pattern when its problem and trade-off match the observed repository state
2. **Conditional External Research**: Use official/current sources when a time-sensitive capability, compatibility, or dependency decision remains unresolved after repository inspection
3. **Apply 5 Whys**: Pursue root causes to grasp essence
4. **Multi-perspective Evaluation**: Evaluate current state, convergence, risk, and constraints before selecting the implementation approach
