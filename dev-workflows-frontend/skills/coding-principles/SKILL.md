---
name: coding-principles
description: Language-agnostic coding principles for maintainability, readability, and quality. Use when implementing features, refactoring code, or reviewing code quality.
---

# Language-Agnostic Coding Principles

## Core Philosophy

1. **Maintainability over Speed**: Prioritize long-term code health over initial development velocity
2. **Simplicity First**: Choose the simplest solution that meets requirements (YAGNI principle)
3. **Design Convergence**: Deliver the current required outcome with the least new design surface. Selecting persistent state, public or cross-boundary contracts, behavioral modes, reusable abstractions, or component splits carries enough surface to justify the full convergence process first.
4. **Explicit over Implicit**: Make intentions clear through code structure and naming
5. **Delete over Comment**: Remove unused code instead of commenting it out

## Code Quality

### Continuous Improvement
- Refactor related code named by the user or current task/design artifact when it reduces the change's risk or maintenance cost
- Improve code structure incrementally
- Keep the codebase lean and focused
- Delete code proven obsolete by the requested change after checking its callers; report uncertain or out-of-scope cleanup separately

### Readability
- Use meaningful, descriptive names drawn from the problem domain
- Use full words in names; abbreviations are acceptable only when widely recognized in the domain
- Use descriptive names; single-letter names are acceptable only for loop counters or well-known conventions (i, j, x, y)
- Extract magic numbers and strings into named constants
- Keep code self-documenting where possible

## Function Design

### Parameter Management
- **Recommended**: 0-2 positional parameters per function
- **At 3+ parameters**: Group related values into an object, struct, or dictionary by default. Retain positional parameters only when their order is conventional and the call remains clear, or an external/public signature requires them
- Preserve external/public signatures unless the user request or current task/design artifact includes their migration

### Single Responsibility
- Each function should do one thing well
- Keep functions under 50 lines by default. At 50+ lines, perform a mandatory extraction review; retain the function only when it remains one cohesive behavior and extraction would obscure the domain flow or create artificial coupling
- Extract complex logic into separate, well-named functions
- Functions should have a single level of abstraction

### Function Organization
- Pure functions when possible (no side effects)
- Separate data transformation from side effects
- Use early returns to reduce nesting
- Keep nesting to a maximum of 3 levels by default. At deeper nesting, use early returns or extraction unless the nested form maps the domain decision more clearly; record that reason when retaining it

## Error Handling

### Error Management Principles
- **Always handle errors**: Log with context or propagate explicitly
- **Log appropriately**: Include context for debugging
- **Protect sensitive data**: Mask or exclude passwords, tokens, PII from logs
- **Fail fast**: Detect and report errors as early as possible

### Error Propagation
- Use language-appropriate error handling mechanisms
- Propagate errors to appropriate handling levels
- Provide meaningful error messages
- Include error context when re-throwing

## Dependency Management

### Loose Coupling via Parameterized Dependencies
- Inject external dependencies as parameters (constructor injection for classes, function parameters for procedural/functional code)
- Depend on abstractions, not concrete implementations
- Minimize inter-module dependencies
- Facilitate testing through mockable dependencies

## Reference Representativeness

### Verifying References Before Adoption
When adopting patterns, APIs, or dependencies from existing code:
- **IF** referencing only 2-3 nearby files → **THEN** confirm the pattern is representative by checking usage across the repository before adopting
- **IF** multiple approaches coexist in the repository → **THEN** identify the majority pattern and make a deliberate choice — selecting whichever is nearest is insufficient
- **IF** adopting an external dependency (library, plugin, SDK) → **THEN** verify repository-wide usage distribution for the same dependency; if the appropriate version cannot be determined from repository state alone, escalate
- **IF** following an existing pattern → **THEN** state the reason for following it when an alternative exists (e.g., consistency with surrounding code, avoiding breaking changes, pending coordinated update)

### Principle
Nearby code is a starting point for investigation, not a sufficient basis for adoption. Verify that what you reference is representative of the repository's conventions and current best practices before using it as a model.

## Performance Considerations

### Optimization Approach
- **Measure first**: Profile before optimizing
- **Focus on algorithms**: Algorithmic complexity > micro-optimizations
- **Use appropriate data structures**: Choose based on access patterns
- **Resource management**: Handle memory, connections, and files properly

### When to Optimize
- After identifying actual bottlenecks through profiling
- When performance issues are measurable
- Optimize only after measurable bottlenecks are identified, not during initial development

## Code Organization

### Structural Principles
- **Group related functionality**: Keep related code together
- **Separate concerns**: Domain logic, data access, presentation
- **Consistent naming**: Follow project conventions
- **Module cohesion**: High cohesion within modules, low coupling between

### File Organization
- One primary responsibility per file
- Logical grouping of related functions/classes
- Clear folder structure reflecting architecture
- Treat files over 500 lines as a mandatory decomposition review. Split when the file contains independently changing responsibilities; retain it only when it is cohesive and the proposed split would add avoidable coupling or navigation cost

## Commenting Principles

### Default: code first
Names, types, and structure are the primary medium. A comment earns its place only by carrying information the code itself cannot express. When in doubt, improve the name instead of adding a comment.

### The test for every comment
A comment is justified only if it answers one of these:
- **Why**: reasoning, trade-off, or constraint behind a non-obvious decision
- **Limitation / edge case**: a boundary a reader cannot infer from the code
- **Public API contract**: behavior, inputs, outputs of an exported interface

One comment per decision. If a comment restates what the names and control flow already show, delete it and rename instead.

### Comment Scope
- Comment the why, limits, and public contracts (per the test above); let names and structure carry everything else, including the "how"
- Record historical context in version control commit messages, not in comments
- Delete commented-out code (retrieve from git history when needed)

### Comment Quality
- Write comments that remain accurate regardless of future code changes; avoid references to dates, versions, or temporary state
- Update comments when changing code
- Use proper grammar and formatting
- Write for future maintainers

## Refactoring Approach

### Safe Refactoring
- **Small steps**: Make one change at a time
- **Maintain working state**: Keep tests passing
- **Verify behavior**: Run tests after each change
- **Incremental improvement**: Don't aim for perfection immediately

### Refactoring Triggers
- Code duplication (DRY principle)
- Functions over 50 lines, especially when they contain independently changing responsibilities or obscured control flow
- Complex conditional logic
- Unclear naming or structure

## Security Principles

### Secure Defaults
- Store credentials and secrets through environment variables or dedicated secret managers
- Use parameterized queries (prepared statements) for all database access
- Use established cryptographic libraries provided by the language or framework
- Generate security-critical values (tokens, IDs, nonces) with cryptographically secure random generators
- Encrypt sensitive data at rest and in transit using standard protocols

### Input and Output Boundaries
- Validate all external input at system entry points for expected format, type, and length
- Encode output appropriately for its rendering context (HTML, SQL, shell, URL)
- Return only information necessary for the caller in error responses; log detailed diagnostics server-side

### Access Control
- Apply authentication to all entry points that handle user data or trigger state changes
- Verify authorization for each resource access, not only at the entry point
- Grant only the permissions required for the operation (files, database connections, API scopes)
- For changes involving identity or protected resources, prioritize authentication and per-resource authorization review

For concrete detection patterns used by security review, see `references/security-checks.md`.
