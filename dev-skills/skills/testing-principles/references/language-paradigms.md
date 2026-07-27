# Testing by Language Paradigm

Read this reference when language type systems or programming paradigms change the useful test boundary.

## Type System Utilization

For languages with static type systems:

- Leverage compile-time verification for correctness.
- Focus tests on business logic and runtime behavior.
- Use the type system to prevent invalid states.

For languages with dynamic typing:

- Add runtime validation tests.
- Test data contract validation explicitly.
- Use property-based testing when it improves input coverage.

## Programming Paradigm

For functional code, test pure functions directly, test side effects at system boundaries, and use property-based tests for useful invariants.

For object-oriented code, test behavior through public interfaces, substitute dependencies at their boundaries, and verify polymorphic behavior.
