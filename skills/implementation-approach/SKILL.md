---
name: implementation-approach
description: Implementation strategy selection framework. Use when planning implementation strategy, selecting development approach, or defining verification criteria.
---

# Implementation Strategy Selection Framework (Meta-cognitive Approach)

## Meta-cognitive Strategy Selection Process

### Phase 1: Comprehensive Current State Analysis

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

### Phase 2: Design Convergence

Complete these steps in order before selecting an implementation strategy:

1. **Direct MVP**: Describe the simplest end-to-end design that delivers the current required outcome using existing system capabilities. Explicit user requirements and confirmed decisions are binding; technical mechanisms framed as suggestions or options remain candidates unless confirmed as mandatory.
2. **Failure Check**: Test the Direct MVP against current requirements, verified constraints, observed problems within confirmed scope or dependencies required for the outcome, and evidence-backed material risks. Record only unmet items as `Failed Items` with their evidence; record `None` when all pass. Report problems outside that boundary separately for a scope decision.
3. **Targeted Expansion**: For each Failed Item, first test reuse, derivation from existing data, on-demand computation, or responsibility at the current caller or boundary within the existing design surface. When these fail, select the smallest sufficient addition. Record `Adopted Additions` as addition → Failed Item → evidence that lower-surface resolutions fail; an addition requires a Failed Item.
4. **Subtraction Check**: Temporarily remove each Adopted Addition and re-test its Failed Item. Keep the addition when the item becomes unmet again. Record options considered in step 3 but not adopted as `Rejected Additions` with a brief reason; record `None` when step 3 had no rejected candidate.

Classify supporting claims as observed, inferred, or unknown. When an unknown blocks the next step, stop at the current step and name the evidence or user decision required.

**Phase 2 outputs**: Direct MVP, Failed Items, Adopted Additions, and Rejected Additions. A Design Doc author records all four; an implementer uses them as the convergence check without producing a document.

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
2. A materially different alternative and reason for rejection, when one was compared
3. Controls for each material risk activated in Phase 4
4. Compatibility with each decision-relevant constraint activated in Phase 5
5. Verification level (L1/L2/L3) and integration point definition

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
2. Confirm Phase 2 records all four Design Convergence outputs, evidence for every Failed Item, and each Adopted Addition's Failed Item mapping, lower-surface insufficiency rationale, and subtraction result
3. Confirm Phase 4 records concrete controls for every evidenced material risk; no entry is required for an inapplicable category
4. Confirm Phase 5 checks every evidenced constraint that can change strategy selection or verification; no entry is required for an inapplicable category
5. Confirm Phase 7 records the selected strategy, any materially different alternative, and the early verification point

## Guidelines for Meta-cognitive Execution

1. **Leverage Known Patterns**: Use a pattern when its problem and trade-off match the observed repository state
2. **Conditional External Research**: Use official/current sources when a time-sensitive capability, compatibility, or dependency decision remains unresolved after repository inspection
3. **Apply 5 Whys**: Pursue root causes to grasp essence
4. **Multi-perspective Evaluation**: Evaluate current state, convergence, risk, and constraints before selecting the implementation approach
