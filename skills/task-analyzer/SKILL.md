---
name: task-analyzer
description: Performs metacognitive task analysis and skill selection. Use when determining task complexity, selecting appropriate skills, or estimating work scale.
---

# Task Analyzer

Provides metacognitive task analysis and skill selection guidance.

## Skills Index

See **[skills-index.yaml](references/skills-index.yaml)** for available skills metadata.

## Task Analysis Process

### 1. Understand Task Essence

Identify the fundamental purpose beyond surface-level work:

| Surface Work | Fundamental Purpose |
|--------------|---------------------|
| "Fix this bug" | Problem solving, root cause analysis |
| "Implement this feature" | Feature addition, value delivery |
| "Refactor this code" | Quality improvement, maintainability |
| "Update this file" | Change management, consistency |

**Action**: Map the user request to one row in the Surface Work → Fundamental Purpose table above. If no row matches, state the fundamental purpose explicitly before proceeding.

### 2. Estimate Task Scale

| Scale | File Count | Indicators |
|-------|------------|------------|
| Small | 1-2 | Single function/component change |
| Medium | 3-5 | Multiple related components |
| Large | 6+ | Cross-cutting concerns, architecture impact |

**Scale affects skill priority:**
- Scale >= Large → include documentation-criteria with priority high, preserving the repository's 6+ file planning contract
- Scale >= Large and the task changes executable system behavior or requires dependency/phase strategy → also include implementation-approach with priority high
- Scale >= Large but the task is research, documentation-only, or mechanical → include implementation-approach only when an implementation strategy decision is actually required
- Scale = Small → select task-type essential skills only and target a maximum of 3; exceed 3 when another skill directly governs a named risk, language, or output contract

### 3. Identify Task Type

| Type | Characteristics | Key Skills |
|------|-----------------|------------|
| Implementation | New code, features | coding-principles, testing-principles |
| Fix | Bug resolution | ai-development-guide, testing-principles |
| Refactoring | Structure improvement | coding-principles, ai-development-guide |
| Design | Architecture decisions | documentation-criteria, implementation-approach |
| Quality | Testing, review | testing-principles, integration-e2e-testing |

### 4. Tag-Based Skill Matching

Extract relevant tags from task description and match against skills-index.yaml:

```yaml
Task: "Implement user authentication with tests"
Extracted tags: [implementation, testing, security]
Matched skills:
  - coding-principles (implementation, security)
  - testing-principles (testing)
  - ai-development-guide (implementation)
```

### 5. Implicit Relationships

Consider hidden dependencies:

| Task Involves | Also Include |
|---------------|--------------|
| Error handling | debugging, testing |
| New features | design, implementation, documentation |
| Performance | profiling, optimization, testing |
| Frontend | typescript-rules, test-implement |
| API/Integration | integration-e2e-testing |

## Output Format

Return structured analysis with skill metadata from skills-index.yaml:

```yaml
taskAnalysis:
  essence: <string>  # Fundamental purpose identified
  type: <implementation|fix|refactoring|design|quality>
  scale: <small|medium|large>
  estimatedFiles: <number>
  tags: [<string>, ...]  # Extracted from task description

selectedSkills:
  - skill: <skill-name>  # From skills-index.yaml
    priority: <high|medium|low>
    reason: <string>  # Why this skill was selected
    # Pass through metadata from skills-index.yaml
    tags: [...]
    typical-use: <string>
    size: <small|medium|large>
    sections: [...]  # All sections from yaml, unfiltered
```

**Note**: Section selection (choosing which sections are relevant) is done after reading the actual SKILL.md files.

**Consumer mapping**: `rule-advisor` consumes this intermediate shape and owns the final schema transformation: `type` → `taskType` (`quality` → `quality-improvement`; other values unchanged), `tags` → `extractedTags`, and `selectedSkills` → `selectedRules` after it reads and extracts the selected skill sections. Preserve `metaCognitiveQuestions` as a separate final field generated from the question design below.

## Skill Selection Priority

1. **Essential** - Directly related to task type
2. **Quality** - Testing and quality assurance
3. **Process** - Workflow and documentation
4. **Supplementary** - Reference and best practices

## Metacognitive Question Design

Generate up to 5 questions whose answers can change skill selection, verification, or escalation. Return no questions when none would change those decisions.

| Task Type | Question Focus |
|-----------|----------------|
| Implementation | Design validity, edge cases, performance |
| Fix | Root cause (5 Whys), impact scope, regression testing |
| Refactoring | Current problems, target state, phased plan |
| Design | Requirement clarity, future extensibility, trade-offs |

## Warning Patterns

Detect and flag these patterns:

| Pattern | Warning | Mitigation |
|---------|---------|------------|
| Large change detected | Pair with implementation-approach | Split into phases per strategy |
| Implementation task detected | Pair with testing-principles | Apply TDD from start |
| Error fix requested | Pair with ai-development-guide | Apply 5 Whys before fixing |
| Multi-file task without plan | Pair with documentation-criteria | Create work plan first |
