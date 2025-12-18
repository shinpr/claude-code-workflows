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
- Refactor as you go - don't accumulate technical debt
- Improve code structure incrementally
- Keep the codebase lean and focused
- Delete unused code immediately

### Readability
- Use meaningful, descriptive names for variables and functions
- Avoid abbreviations unless they are widely recognized
- Keep code self-documenting where possible
- Write code that humans can easily understand

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
- Avoid deep nesting (maximum 3 levels)

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

### Loose Coupling
- Inject external dependencies as parameters
- Avoid direct imports within functions when possible
- Depend on abstractions, not concrete implementations
- Minimize inter-module dependencies

### Parameterized Dependencies
- Pass dependencies explicitly through function parameters
- Use constructor parameter injection for class-based languages
- Use function parameters for functional/procedural approaches
- Facilitate testing through mockable dependencies

## Performance Considerations

### Optimization Approach
- **Measure first**: Profile before optimizing
- **Focus on algorithms**: Algorithmic complexity > micro-optimizations
- **Use appropriate data structures**: Choose based on access patterns
- **Resource management**: Handle memory, connections, and files properly

### When to Optimize
- After identifying actual bottlenecks
- When performance issues are measurable
- Not prematurely during initial development

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

### When NOT to Comment
- Avoid describing "how" (the code shows that)
- Don't include historical information (use version control)
- Remove commented-out code (use git to retrieve old code)
- Avoid obvious comments that restate the code

### Comment Quality
- Keep comments concise and timeless
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

## Clean Code Guidelines

### Naming Conventions
- Use domain language in names
- Be specific and descriptive
- Avoid single-letter names (except loop counters)
- Follow language-specific conventions (camelCase, snake_case, etc.)

### Code Structure
- Prefer early returns over nested conditionals
- Extract magic numbers into named constants
- Remove debug statements before committing
- Keep functions at a single level of abstraction

### Code Smells to Avoid
- Long parameter lists
- Deeply nested conditionals
- Duplicated code blocks
- Unclear variable names
- Large modules, classes, or functions

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

### General Security
- Store secrets in environment variables or secret managers
- Validate all external input
- Use parameterized queries for databases
- Follow principle of least privilege

### Data Protection
- Encrypt sensitive data at rest and in transit
- Sanitize user input
- Avoid logging sensitive information
- Use secure random generators for security-critical operations

## Documentation

### Code Documentation
- Document public APIs and interfaces
- Include usage examples for complex functionality
- Maintain README files for modules
- Keep documentation in sync with code

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
- Avoid committing debug code or secrets

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

## Continuous Learning

- Stay updated with language-specific best practices
- Learn from code reviews
- Study well-maintained open source projects
- Regularly refactor and improve existing code