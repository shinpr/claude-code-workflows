---
description: Synchronize skill metadata and optimize rule-advisor precision after skill edits
---

**Command Context**: Post-editing maintenance workflow for skill files

**Think deeply** Maximize rule-advisor execution precision through systematic synchronization:

## Execution Flow

### 1. Scan Skill Files

```bash
# Runtime skills directory
SKILLS_DIR=".claude/skills"
INDEX_FILE=".claude/skills/task-analyzer/references/skills-index.yaml"

# Analyze all skill files
find "${SKILLS_DIR}" -name "SKILL.md" -type f | sort
```

### 2. Synchronize and Optimize Metadata

#### Automatic Section Synchronization

- Extract `## ` sections from each SKILL.md
- Update sections in skills-index.yaml automatically

#### Tag Optimization

- Analyze file content for relevant keywords
- Propose addition of missing tags
- Suggest removal of obsolete tags

#### Typical-Use Enhancement

- Infer usage scenarios from file changes
- Propose more specific and actionable descriptions

#### Key-References Completion

- Detect newly introduced concepts or methodologies
- Suggest relevant reference additions

### 3. Rule-Advisor Precision Optimization

Enhance metadata quality to enable accurate skill selection by rule-advisor:

```
=== Skill Metadata Synchronization ===
Target: .claude/skills

Updates executed:
✅ Sections synchronized
  - typescript-testing: 2 sections added
  - coding-standards: 1 section updated

✅ Tags optimized
  - typescript-rules: Suggest adding [functional-programming]
  - technical-spec: Suggest removing [deprecated]

✅ Typical-use improved
  - 3 skills updated with more specific descriptions

Final result: Rule-advisor precision optimization complete
```

## 🧠 Metacognitive Points

**Essential Purpose**:

- Not mere consistency maintenance, but rule-advisor selection accuracy enhancement
- Metadata optimization as the final step of skill editing workflow

**Quality Criteria**:

- Sections must achieve 100% synchronization
- Tags must accurately reflect content
- Typical-use must specify concrete usage scenarios
- Key-references must cover current methodologies

## Change Necessity Evaluation

**EVALUATION SEQUENCE**:

- IF sections achieve 100% synchronization → OUTPUT "Synchronization verified. No updates required." THEN TERMINATE
- IF content-to-tag mapping shows zero mismatches → DETERMINE no_changes_needed = true THEN TERMINATE
- IF AND ONLY IF measurable improvements exist → GENERATE specific modification proposals WITH exact before/after values

**NOTE**: You MUST NOT force changes. When no improvements are detected, you SHALL report "No modifications necessary" and STOP execution.

## Execution Timing

- After skill file edits (mandatory)
- When adding new skill files
- After major skill revisions
- When rule-advisor selection accuracy appears degraded

## Example Output

```
=== Skill Metadata Synchronization Started ===
Target: .claude/skills (13 skills)

[1/13] typescript-rules
  ✅ sections: 7 synchronized
  💡 tags proposed: +[functional-programming, dependency-injection]
  💡 typical-use: "General TypeScript implementation" → "Type-safe implementation with modern TypeScript features"

[2/13] typescript-testing
  ✅ sections: 2 added (Test Granularity Principles, Mock Type Safety Enforcement)
  ✅ tags: No changes needed
  ✅ typical-use: Maintained

...

=== Synchronization Complete ===
Updated: 3 skills
Proposals: 5 items (approval required)

Rule-advisor precision improvement: Estimated 15% enhancement
```

**Scope**: Post-edit skill metadata synchronization and rule-advisor precision optimization.
