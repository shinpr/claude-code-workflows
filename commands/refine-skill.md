---
description: Implement user skill change requests with maximum precision optimization
---

Change request: $ARGUMENTS

**Think deeply** Extract the TRUE INTENT behind user's change request and implement with MAXIMUM PRECISION to eliminate ALL ambiguity:

## 9 Optimization Perspectives

1. Context efficiency vs execution accuracy - Maximum accuracy with minimal description
2. Deduplication - Consistency within and across skill files
3. Proper responsibility aggregation - Group related content (minimize read operations)
4. Clear decision criteria - Measurable standards
5. Transform negatives to recommendations - Recommended format (background: including NG examples)
6. Consistent notation - Unified expressions
7. Explicit prerequisites - Make implicit assumptions visible
8. Optimized description order - Most important first, exceptions last
9. Clear scope boundaries - What's covered vs what's not

## Execution Flow

### 1. Understand the Request

Question template when unspecified:

```
1. Which skill to modify?
   e.g.: typescript-rules / coding-standards / documentation-criteria

2. Select change type:
   a) Add new criteria (add new standards)
   b) Modify existing criteria (clarify ambiguous descriptions)
   c) Delete criteria (remove obsolete standards)

3. Specific changes:
   e.g.: "Add rule prohibiting 'any' type usage"
   e.g.: "Clarify error handling criteria"
   [User input]
```

### 2. Create Design Proposal

Target file identification and current state check:

```
# Tool selection criteria (measurable decisions)
if skill name is explicitly provided:
  Read: .claude/skills/{skill-name}/SKILL.md direct read
else if partial skill name known:
  Glob: .claude/skills/*{keyword}*/SKILL.md search
  Read: Check identified file's current state
else:
  Glob: .claude/skills/*/SKILL.md for full scan
  Confirm target skill selection with user
```

Design template:

```
【Current】
"Handle errors appropriately" (ambiguous: "appropriately" undefined)

【Understanding User Request】
"Want stricter error handling" → Set measurable criteria

【Proposal】
"Error handling implementation criteria:
1. try-catch required for:
   - External API calls (fetch, axios, etc.)
   - File I/O operations (fs.readFile, etc.)
   - Parsing operations (JSON.parse, parseInt, etc.)
2. Required error log items:
   - error.name (error type)
   - error.stack (location)
   - Timestamp (ISO 8601 format)
3. User notification criteria:
   - No technical details (NG: stack trace display)
   - Clear action items (recommended: "Please try again")"

Proceed with this design? (y/n)
```

### 3. Three-Pass Review Process

#### Pass 1: Add for Maximum Accuracy【Addition-Only Mode】

Declaration: "Pass 1: Addition mode execution. Deletions are prohibited."

- Convert all ambiguous expressions → measurable criteria
  Example: "large" → "100+ lines" "5+ files"
- Make all implicit prerequisites explicit
  Example: "In TypeScript environment" "Within async functions"
- Define all exceptions and edge cases
  Example: "When null/undefined" "For empty arrays"
  Report: Count added items (minimum 5 items)

#### Pass 2: Critical Modification to Reduce Redundancy【Actual Modification Mode】

Declaration: "Pass 2: Critical modification mode execution. Actually delete and consolidate redundant parts."

Modification work:

1. Critically review all Pass 1 additions
2. Apply modifications using these criteria:
   - Duplicate concepts → Consolidate
   - Overly detailed explanations → Simplify
   - Overlap with other skills → Replace with references
3. Record complete before/after diff (deletion reasons required)

Report format:

```
Modified locations: X items
Deleted/consolidated content:
- [Before]: "Detailed description"
  [After]: "Concise description"
  [Reason]: Redundancy elimination
```

#### Pass 3: Accuracy Assurance via Diff Evaluation【Restoration Decision Mode】

Declaration: "Pass 3: Diff evaluation mode execution. Review all Pass 2 modifications and restore if accuracy compromised."

Verification work:

1. Evaluate each Pass 2 modification:
   - Does deletion create implementation ambiguity? → Restore
   - Are edge cases still covered? → Restore if missing
2. Action mapping:
   - Deletions with accuracy risks → Restore
   - Valid deletions → Keep

Final confirmation (required answer):
"Are necessary and sufficient conditions present for accurate implementation of user requirements?"

Report: Number of restored items and final reduction percentage

### 4. Get Approval

Present before/after comparison for user approval.

### 5. Implementation

1. Apply changes with appropriate tool (after user approval)
2. Final verification with git diff
3. Suggest `/sync-skills` execution

## Decision Criteria Checklist

- [ ] Expressible in "if-then" format ("if X then Y")
- [ ] Measurable by numbers/counts/states (eliminate subjective judgment)
- [ ] Related content aggregated in single file (minimize read operations)
- [ ] Relationships with other skills specified (dependencies/references/delegation)
- [ ] NG examples included as background information
- [ ] All prerequisites explicitly stated

## Reduction Pattern Examples

| Pattern                | Before                                                                             | After                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Emotional expressions  | "must always"                                                                      | "execute when (background: build error if skipped)"             |
| Time expressions       | "immediately"                                                                      | "execute first after error detection"                           |
| Implicit prerequisites | "implement error handling"                                                         | "TypeScript async function error handling"                      |
| Unclear order          | "consider: A, B, C"                                                                | "Priority: 1.A (required), 2.B (recommended), 3.C (optional)"   |
| Redundant explanation  | "ensure type safety by defining types, checking types, and preventing type errors" | "type safety (define・check・prevent errors)"                   |
| Ambiguous scope        | "write tests"                                                                      | "write unit tests (see typescript-testing skill for E2E tests)" |

## Output Example

```
=== Change Implementation Complete ===

【User Request】
"Strengthen TypeScript error handling criteria"

【Changes】
Target: .claude/skills/typescript-rules/SKILL.md
Section: ## Error Handling

Before:
"Handle errors appropriately"

After (3-pass review complete):
"Error handling implementation criteria:
1. try-catch block required for:
   - External API calls (fetch, axios, etc.)
   - File I/O operations (fs.readFile, fs.writeFile, etc.)
   - Exception-prone operations (JSON.parse, parseInt, etc.)
2. Required error log items:
   - error.name (error type)
   - error.stack (location)
   - new Date().toISOString() (timestamp)
3. User-facing messages:
   - No technical details (NG: stack trace display)
   - Clear action items (recommended: "Please try again")"

【Improvement Metrics】
- Decision clarity: 0% → 100% (all measurable)
- Ambiguous expressions: 1 → 0
- NG examples included as background

Run /sync-skills for metadata synchronization.
```

## Execution Order

1. Understand user request
2. Analyze current state
3. Design changes with 9 perspectives
4. 3-pass review process
5. User approval
6. Apply changes
7. Suggest sync-skills

**Scope**: Understanding user change requests and implementing with maximum accuracy

## Error Handling

- **Skill not found**: Display available skill list
- **Large change detected**: Suggest phased implementation for 50%+ changes
