---
name: front-reverse-design
description: Generate frontend Design Docs from existing codebase using existing PRD
---

**Command Context**: Reverse engineering workflow to create frontend Design Docs from existing code

**Prerequisites**: PRD must exist (created via reverse-engineer or manually)

Target PRD: $ARGUMENTS

**TodoWrite**: Register phases first, then steps within each phase as you enter it.

## Step 0: Initial Configuration

### 0.1 Scope Confirmation

Use AskUserQuestion to confirm:
1. **PRD path**: Which PRD to use as basis
2. **Target path**: Which frontend directory/module to document
3. **Human review**: Yes (recommended) / No (fully autonomous)

### 0.2 Output Configuration

- Design Doc output: `docs/design/` or existing design directory
- Verify directories exist, create if needed

## Workflow Overview

```
Step 1: Scope Discovery (all frontend components per PRD)
Step 2-5: Per-component loop (Generation → Verification → Review → Revision)
```

**Context Passing**: Pass structured JSON output between steps. Use `$STEP_N_OUTPUT` placeholder notation.

## Step 1: Design Doc Scope Discovery

**Task invocation**:
```
subagent_type: scope-discoverer
prompt: |
  Discover frontend Design Doc targets within PRD scope.

  scope_type: design-doc
  existing_prd: $USER_PRD_PATH
  target_path: $USER_TARGET_PATH
  focus: frontend (React/TypeScript components, hooks, state management)
```

**Store output as**: `$STEP_1_OUTPUT`

**Quality Gate**:
- At least one component discovered → proceed
- No components → ask user for hints

**Human Review Point** (if enabled): Present discovered components for confirmation.

## Step 2-5: Per-Component Processing

**Complete Steps 2→3→4→5 for each component before proceeding to the next component.**

### Step 2: Design Doc Generation

**Task invocation**:
```
subagent_type: technical-designer-frontend
prompt: |
  Create Design Doc for the following frontend component based on existing code.

  Operation Mode: create

  Component: $COMPONENT_NAME (from $STEP_1_OUTPUT)
  Responsibility: $COMPONENT_RESPONSIBILITY
  Primary Files: $COMPONENT_PRIMARY_FILES
  Public Interfaces: $COMPONENT_PUBLIC_INTERFACES
  Dependencies: $COMPONENT_DEPENDENCIES

  Parent PRD: $USER_PRD_PATH

  Document current architecture. Do not propose changes.
```

**Store output as**: `$STEP_2_OUTPUT`

### Step 3: Code Verification

**Task invocation**:
```
subagent_type: code-verifier
prompt: |
  Verify consistency between Design Doc and code implementation.

  doc_type: design-doc
  document_path: $STEP_2_OUTPUT
  code_paths: $COMPONENT_PRIMARY_FILES
  verbose: false
```

**Store output as**: `$STEP_3_OUTPUT`

**Quality Gate**:
- consistencyScore >= 70 → proceed to review
- consistencyScore < 70 → flag for detailed review

### Step 4: Review

**Required Input**: $STEP_3_OUTPUT (verification JSON from Step 3)

**Task invocation**:
```
subagent_type: document-reviewer
prompt: |
  Review the following Design Doc considering code verification findings.

  doc_type: DesignDoc
  target: $STEP_2_OUTPUT
  mode: composite

  ## Code Verification Results
  $STEP_3_OUTPUT

  ## Parent PRD
  $USER_PRD_PATH

  ## Additional Review Focus
  - Technical accuracy of documented interfaces
  - Consistency with parent PRD scope
  - Completeness of component boundary definitions
```

**Store output as**: `$STEP_4_OUTPUT`

### Step 5: Revision (conditional)

**Trigger Conditions** (any one of the following):
- Review status is "Needs Revision" or "Rejected"
- Critical discrepancies exist in `$STEP_3_OUTPUT`
- consistencyScore < 70

**Task invocation**:
```
subagent_type: technical-designer-frontend
prompt: |
  Update Design Doc based on review feedback.

  Operation Mode: update
  Existing Design Doc: $STEP_2_OUTPUT

  ## Review Feedback
  $STEP_4_OUTPUT

  ## Discrepancies to Address
  (Extract critical and major discrepancies from $STEP_3_OUTPUT)

  Apply corrections and improvements.
```

**Loop Control**: Maximum 2 revision cycles. After 2 cycles, flag for human review regardless of status.

### Component Completion

- [ ] Review status is "Approved" or "Approved with Conditions"
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next component. After all components → Final Report.

## Final Report

Output summary including:
- Generated documents table (Component, Design Doc Path, Consistency Score, Review Status)
- Action items (critical discrepancies, undocumented features, flagged items)
- Next steps checklist

## Error Handling

| Error | Action |
|-------|--------|
| PRD not found | Ask user for correct PRD path |
| Discovery finds nothing | Ask user for project structure hints |
| Generation fails | Log failure, continue with other components, report in summary |
| consistencyScore < 50 | Flag for mandatory human review, do not auto-approve |
| Review rejects after 2 revisions | Stop loop, flag for human intervention |
