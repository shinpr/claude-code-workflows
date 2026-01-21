---
name: project-context
description: Inject project-specific context into project-context.md
argument-hint: (no arguments - interactive setup)
---

**Command Context**: When using the boilerplate, collect project-specific context and update project-context.md.

## Execution Process

### 1. Current State Verification

! ls -la .claude/skills/project-context/SKILL.md
! cat package.json | grep -E '"name":|"description":'

### 2. Project Context Collection

Interact with the user to collect the following information:

```
【Core Project Information】
1. What problem does your project solve?
   Examples: "Manual time tracking is inefficient" "Inventory management is person-dependent"

2. Who is the system for?
   Examples: "50-member sales team" "E-commerce site operators"

3. In what situations will it be used?
   Examples: "Field staff entering daily reports" "Month-end aggregation tasks"

【Development Structure】
- Individual development / Team development (number of members)
- Development phase (Prototype / Production development / In operation)

【Critical Business Constraints】(Maximum 3)
Examples: "7-year audit log retention" "Mandatory approval workflow" "Real-time synchronization"
```

**Think deeply** From the collected information, understand the project's essence and construct context focused on single responsibility.

### 3. Generate project-context.md

## AI Execution Accuracy Maximization Criteria

Generated project-context.md must follow these criteria:

### Principles of Description

1. **Minimal yet maximally efficient**: Essential information only, eliminate redundancy
2. **AI-decidable**: Use only measurable and verifiable criteria ("quickly" → "within 5 seconds")
3. **Eliminate ambiguity**: Include specific numbers, conditions, and examples
4. **Preferred format**: Describe in "do this" form rather than "don't do that"

### Responsibility Boundaries

project-context.md's single responsibility is "project-specific contextual information" only:

- ✅ Include: Project objectives, target users, business constraints
- ❌ Exclude: Tech stack (→technical-spec.md), implementation principles (→typescript.md), architecture (→technical-spec.md)

### Structure

```markdown
# Project Context

## Project Overview

- **Problem being solved**: [Specific challenge]
- **Target users**: [Include number and attributes]
- **Usage scenarios**: [Specific situations]

## Development Structure

- **Team composition**: [Number and roles]
- **Development phase**: [Current stage]

## Business Constraints

1. [Measurable constraint]
2. [Verifiable requirement]
```

### 4. Update rules-index.yaml

Update the typical-use in the project-context section to match the project.

**Scope**: Update project-context.md only. Technology choices are the responsibility of other rule files.
