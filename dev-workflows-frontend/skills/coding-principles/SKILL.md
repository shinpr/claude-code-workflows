---
name: coding-principles
description: Language-agnostic coding principles for maintainability, readability, and quality. Use when implementing features, refactoring code, or reviewing code quality.
---

# Language-Agnostic Coding Principles

## Core Philosophy

1. **Maintainability over Speed**: Prioritize long-term code health over initial development velocity
2. **Simplicity First**: Choose the simplest solution that meets requirements (YAGNI principle)
3. **Explicit over Implicit**: Make intentions clear through code structure and naming
4. **Delete over Comment**: Remove unused code instead of commenting it out

## Code Quality

### Continuous Improvement
- Refactor related code within each change set — address style, naming, or structure issues in the files being modified
- Improve code structure incrementally
- Keep the codebase lean and focused
- Delete unused code immediately

### Readability
- Use meaningful, descriptive names drawn from the problem domain
- Use full words in names; abbreviations are acceptable only when widely recognized in the domain
- Use descriptive names; single-letter names are acceptable only for loop counters or well-known conventions (i, j, x, y)
- Extract magic numbers and strings into named constants
- Keep code self-documenting where possible

## Function Design

### Parameter Management
- **Recommended**: 0-2 parameters per function
- **For 3+ parameters**: Use objects, structs, or dictionaries to group related parameters
- **Example** (conceptual):
  ```
  // Instead of: createUser(name, email, age, city, country)
  // Use: createUser(userData)
  ```

### Single Responsibility
- Each function should do one thing well
- Keep functions small and focused (typically < 50 lines)
- Extract complex logic into separate, well-named functions
- Functions should have a single level of abstraction

### Function Organization
- Pure functions when possible (no side effects)
- Separate data transformation from side effects
- Use early returns to reduce nesting
- Keep nesting to a maximum of 3 levels; use early returns or extracted functions to flatten deeper nesting

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
- Avoid "god files" (files > 500 lines)

## Commenting Principles

### When to Comment
- **Document "what"**: Describe what the code does
- **Explain "why"**: Clarify reasoning behind decisions
- **Note limitations**: Document known constraints or edge cases
- **API documentation**: Public interfaces need clear documentation

### Comment Scope
- Comment the "what" and "why"; the code itself communicates the "how"
- Record historical context in version control commit messages, not in comments
- Delete commented-out code (retrieve from git history when needed)
- Write comments that add information beyond what the code states

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
- Functions > 50 lines
- Complex conditional logic
- Unclear naming or structure

## Testing Considerations

### Testability
- Write testable code from the start
- Avoid hidden dependencies
- Keep side effects explicit
- Design for parameterized dependencies

### Test-Driven Development
- Write tests before implementation when appropriate
- Keep tests simple and focused
- Test behavior, not implementation
- Maintain test quality equal to production code

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

### Knowledge Cutoff Supplement (2026-03)
- OWASP Top 10:2025 shifted from symptoms to root causes; added "Software Supply Chain Failures" (A03) and "Mishandling of Exceptional Conditions" (A10)
- Recent research indicates AI-generated code shows elevated rates of access control gaps — treat authentication and authorization as high-priority review targets
- OpenSSF published "Security-Focused Guide for AI Code Assistant Instructions" — recommends language-specific, actionable constraints over generic advice
- For detailed detection patterns, see `references/security-checks.md`

## Documentation

### Code Documentation
- Document public APIs and interfaces
- Include usage examples for complex functionality
- Maintain README files for modules
- Update documentation in the same commit that changes the corresponding behavior

### Architecture Documentation
- Document high-level design decisions
- Explain integration points
- Clarify data flows and boundaries
- Record trade-offs and alternatives considered

## Version Control Practices

### Commit Practices
- Make atomic, focused commits
- Write clear, descriptive commit messages
- Commit working code (passes tests)
- Commit only production-ready code; store secrets in environment variables or secret managers

### Code Review Readiness
- Self-review before requesting review
- Keep changes focused and reviewable
- Provide context in pull request descriptions
- Respond to feedback constructively

## Language-Specific Adaptations

While these principles are language-agnostic, adapt them to your specific programming language:

- **Static typing**: Use strong types when available
- **Dynamic typing**: Add runtime validation
- **OOP languages**: Apply SOLID principles
- **Functional languages**: Prefer pure functions and immutability
- **Concurrency**: Follow language-specific patterns for thread safety

