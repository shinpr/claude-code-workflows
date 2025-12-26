---
name: reverse-engineer
description: Generate PRD and Design Docs from existing codebase through discovery, generation, verification, and review workflow
---

**Command Context**: Reverse engineering workflow to create documentation from existing code

Target: $ARGUMENTS

**TodoWrite**: Register phases first, then steps within each phase as you enter it.

## Step 0: Initial Configuration

### 0.1 Scope Confirmation

Use AskUserQuestion to confirm:
1. **Target path**: Which directory/module to document
2. **Depth**: PRD only, or PRD + Design Docs
3. **Reference Architecture**: layered / mvc / clean / hexagonal / none
4. **Human review**: Yes (recommended) / No (fully autonomous)

### 0.2 Output Configuration

- PRD output: `docs/prd/` or existing PRD directory
- Design Doc output: `docs/design/` or existing design directory
- Verify directories exist, create if needed

## Workflow Overview

```
Phase 1: PRD Generation
  Step 1: Scope Discovery (all units)
  Step 2-5: Per-unit loop (Generation → Verification → Review → Revision)

Phase 2: Design Doc Generation (if requested)
  Step 6: Scope Discovery (all components per PRD)
  Step 7-10: Per-component loop (Generation → Verification → Review → Revision)
```

**Context Passing**: Pass structured JSON output between steps. Use `$STEP_N_OUTPUT` placeholder notation.

## Phase 1: PRD Generation

**Register in TodoWrite**:
- Step 1: PRD Scope Discovery
- Per-unit processing (Steps 2-5 for each unit)

### Step 1: PRD Scope Discovery

**Task invocation**:
```
subagent_type: scope-discoverer
prompt: |
  Discover PRD targets in the codebase.

  scope_type: prd
  target_path: $USER_TARGET_PATH
  reference_architecture: $USER_RA_CHOICE
  focus_area: $USER_FOCUS_AREA (if specified)
```

**Store output as**: `$STEP_1_OUTPUT`

**Quality Gate**:
- At least one PRD unit discovered → proceed
- No units discovered → ask user for hints

**Human Review Point** (if enabled): Present discovered units for confirmation.

### Step 2-5: Per-Unit Processing

**Complete Steps 2→3→4→5 for each unit before proceeding to the next unit.**

#### Step 2: PRD Generation

**Task invocation**:
```
subagent_type: prd-creator
prompt: |
  Create reverse-engineered PRD for the following feature.

  Operation Mode: reverse-engineer
  External Scope Provided: true

  Feature: $UNIT_NAME (from $STEP_1_OUTPUT)
  Description: $UNIT_DESCRIPTION
  Related Files: $UNIT_RELATED_FILES
  Entry Points: $UNIT_ENTRY_POINTS

  Skip independent scope discovery. Use provided scope data.
  Create final version PRD based on code investigation within specified scope.
```

**Store output as**: `$STEP_2_OUTPUT` (PRD path)

#### Step 3: Code Verification

**Task invocation**:
```
subagent_type: code-verifier
prompt: |
  Verify consistency between PRD and code implementation.

  doc_type: prd
  document_path: $STEP_2_OUTPUT
  code_paths: $UNIT_RELATED_FILES (from $STEP_1_OUTPUT)
  verbose: false
```

**Store output as**: `$STEP_3_OUTPUT`

**Quality Gate**:
- consistencyScore >= 70 → proceed to review
- consistencyScore < 70 → flag for detailed review

#### Step 4: Review

**Required Input**: $STEP_3_OUTPUT (verification JSON from Step 3)

**Task invocation**:
```
subagent_type: document-reviewer
prompt: |
  Review the following PRD considering code verification findings.

  doc_type: PRD
  target: $STEP_2_OUTPUT
  mode: composite

  ## Code Verification Results
  $STEP_3_OUTPUT

  ## Additional Review Focus
  - Alignment between PRD claims and verification evidence
  - Resolution recommendations for each discrepancy
  - Completeness of undocumented feature coverage
```

**Store output as**: `$STEP_4_OUTPUT`

#### Step 5: Revision (conditional)

**Trigger Conditions** (any one of the following):
- Review status is "Needs Revision" or "Rejected"
- Critical discrepancies exist in `$STEP_3_OUTPUT`
- consistencyScore < 70

**Task invocation**:
```
subagent_type: prd-creator
prompt: |
  Update PRD based on review feedback.

  Operation Mode: update
  Existing PRD: $STEP_2_OUTPUT

  ## Review Feedback
  $STEP_4_OUTPUT

  ## Discrepancies to Address
  (Extract critical and major discrepancies from $STEP_3_OUTPUT)

  Apply corrections and improvements.
```

**Loop Control**: Maximum 2 revision cycles. After 2 cycles, flag for human review regardless of status.

#### Unit Completion

- [ ] Review status is "Approved" or "Approved with Conditions"
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units → Phase 2.

## Phase 2: Design Doc Generation

*Execute only if Design Docs were requested in Step 0*

**Register in TodoWrite**:
- Step 6: Design Doc Scope Discovery
- Per-component processing (Steps 7-10 for each component)

### Step 6: Design Doc Scope Discovery

For each approved PRD:

**Task invocation**:
```
subagent_type: scope-discoverer
prompt: |
  Discover Design Doc targets within PRD scope.

  scope_type: design-doc
  existing_prd: $APPROVED_PRD_PATH
  target_path: $PRD_RELATED_PATHS
  reference_architecture: $USER_RA_CHOICE
```

**Store output as**: `$STEP_6_OUTPUT`

**Quality Gate**:
- At least one component discovered → proceed
- No components → ask user for hints

### Step 7-10: Per-Component Processing

**Complete Steps 7→8→9→10 for each component before proceeding to the next component.**

#### Step 7: Design Doc Generation

**Task invocation**:
```
subagent_type: technical-designer
prompt: |
  Create Design Doc for the following component based on existing code.

  Operation Mode: create

  Component: $COMPONENT_NAME (from $STEP_6_OUTPUT)
  Responsibility: $COMPONENT_RESPONSIBILITY
  Primary Files: $COMPONENT_PRIMARY_FILES
  Public Interfaces: $COMPONENT_PUBLIC_INTERFACES
  Dependencies: $COMPONENT_DEPENDENCIES

  Parent PRD: $APPROVED_PRD_PATH

  Document current architecture. Do not propose changes.
```

**Store output as**: `$STEP_7_OUTPUT`

#### Step 8: Code Verification

**Task invocation**:
```
subagent_type: code-verifier
prompt: |
  Verify consistency between Design Doc and code implementation.

  doc_type: design-doc
  document_path: $STEP_7_OUTPUT
  code_paths: $COMPONENT_PRIMARY_FILES
  verbose: false
```

**Store output as**: `$STEP_8_OUTPUT`

#### Step 9: Review

**Required Input**: $STEP_8_OUTPUT (verification JSON from Step 8)

**Task invocation**:
```
subagent_type: document-reviewer
prompt: |
  Review the following Design Doc considering code verification findings.

  doc_type: DesignDoc
  target: $STEP_7_OUTPUT
  mode: composite

  ## Code Verification Results
  $STEP_8_OUTPUT

  ## Parent PRD
  $APPROVED_PRD_PATH

  ## Additional Review Focus
  - Technical accuracy of documented interfaces
  - Consistency with parent PRD scope
  - Completeness of component boundary definitions
```

**Store output as**: `$STEP_9_OUTPUT`

#### Step 10: Revision (conditional)

Same logic as Step 5, using technical-designer with update mode.

#### Component Completion

- [ ] Review status is "Approved" or "Approved with Conditions"
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next component. After all components → Final Report.

## Final Report

Output summary including:
- Generated documents table (Type, Name, Consistency Score, Review Status)
- Action items (critical discrepancies, undocumented features, flagged items)
- Next steps checklist

## Error Handling

| Error | Action |
|-------|--------|
| Discovery finds nothing | Ask user for project structure hints |
| Generation fails | Log failure, continue with other units, report in summary |
| consistencyScore < 50 | Flag for mandatory human review, do not auto-approve |
| Review rejects after 2 revisions | Stop loop, flag for human intervention |
