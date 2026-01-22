---
name: project-context
description: This skill provides project-specific context including project nature, technology stack, and implementation principles. Automatically loaded to understand project constraints and conventions. Should be customized for each project.
---

# Project Context

## Basic Configuration

### Project Nature

- **Project Type**: Claude Code-specific TypeScript project template
- **Usage Scope**: Configurable according to project requirements
- **Implementation Policy**: LLM-driven implementation, quality-focused, strict YAGNI principle adherence

### Technology Stack

- **Foundation Technologies**: TypeScript, Node.js
- **Test Framework**: Vitest
- **Quality Management**: Biome, TypeScript strict mode

## Implementation Principles

### Implementation Policy Characteristics

- **LLM-Driven Implementation**: Claude Code functions as the primary implementer
- **Quality-First Culture**: Prioritize quality over speed
- **YAGNI Principle**: Don't implement until necessary
- **Systematic Design**: Design process through ADR/Design Doc/work plans

## Customization Guide

When using this template for new projects:

1. **Add Project-Specific Information**

   - Target user characteristics
   - Business requirements and constraints
   - Technical constraint conditions

2. **Architecture Selection**

   - Select appropriate patterns from architecture skills

3. **Environment Configuration**
   - Implement environment variable management methods suitable for the project
   - Add project-specific configuration files
