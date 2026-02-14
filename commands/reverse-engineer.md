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
5. **Fullstack design**: Yes / No
   - Yes: For each functional unit, generate backend + frontend Design Docs
   - Note: Requires both agents (technical-designer, technical-designer-frontend)

### 0.2 Output Configuration

- PRD output: `docs/prd/` or existing PRD directory
- Design Doc output: `docs/design/` or existing design directory
- Verify directories exist, create if needed

## Workflow Overview

```
Phase 1: PRD Generation
  Step 1: Scope Discovery (unified, single pass)
  Step 2-5: Per-unit loop (Generation → Verification → Review → Revision)

Phase 2: Design Doc Generation (if requested)
  Step 6: Design Doc Scope Mapping (reuse Step 1 results, no re-discovery)
  Step 7-10: Per-unit loop (Generation → Verification → Review → Revision)
  ※ fullstack=Yes: each unit produces backend + frontend Design Docs
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
  Discover functional scope targets in the codebase.

  target_path: $USER_TARGET_PATH
  reference_architecture: $USER_RA_CHOICE
  focus_area: $USER_FOCUS_AREA (if specified)
```

**Store output as**: `$STEP_1_OUTPUT`

**Quality Gate**:
- At least one unit discovered → proceed
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
- Step 6: Design Doc Scope Mapping
- Per-unit processing (Steps 7-10 for each unit)

### Step 6: Design Doc Scope Mapping

**No additional discovery required.** Use `$STEP_1_OUTPUT` (scope discovery results) directly.

Each PRD unit from Phase 1 maps to Design Doc unit(s):
- **Standard mode (fullstack=No)**: 1 PRD unit → 1 Design Doc (using technical-designer)
- **Fullstack mode (fullstack=Yes)**: 1 PRD unit → 2 Design Docs (technical-designer + technical-designer-frontend)

Map `$STEP_1_OUTPUT` units to Design Doc generation targets, carrying forward:
- `technicalProfile.primaryModules` → Primary Files
- `technicalProfile.publicInterfaces` → Public Interfaces
- `dependencies` → Dependencies
- `relatedFiles` → Scope boundary

**Store output as**: `$STEP_6_OUTPUT`

### Step 7-10: Per-Unit Processing

**Complete Steps 7→8→9→10 for each unit before proceeding to the next unit.**

#### Step 7: Design Doc Generation

**Scope**: Document current architecture as-is. This is a documentation task, not a design improvement task.

**Standard mode (fullstack=No)**:

**Task invocation**:
```
subagent_type: technical-designer
prompt: |
  Create Design Doc for the following feature based on existing code.

  Operation Mode: create

  Feature: $UNIT_NAME (from $STEP_6_OUTPUT)
  Description: $UNIT_DESCRIPTION
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES

  Parent PRD: $APPROVED_PRD_PATH

  Document current architecture as-is.
```

**Store output as**: `$STEP_7_OUTPUT`

**Fullstack mode (fullstack=Yes)**:

For each unit, invoke BOTH:

**7a. Backend Design Doc**:
```
subagent_type: technical-designer
prompt: |
  Create a backend Design Doc for the following feature based on existing code.

  Operation Mode: create

  Feature: $UNIT_NAME (from $STEP_6_OUTPUT)
  Description: $UNIT_DESCRIPTION
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES

  Parent PRD: $APPROVED_PRD_PATH

  Focus on: API contracts, data layer, business logic, service architecture.
  Document current architecture as-is.
```

**Store output as**: `$STEP_7a_OUTPUT`

**7b. Frontend Design Doc**:
```
subagent_type: technical-designer-frontend
prompt: |
  Create a frontend Design Doc for the following feature based on existing code.

  Operation Mode: create

  Feature: $UNIT_NAME (from $STEP_6_OUTPUT)
  Description: $UNIT_DESCRIPTION
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES

  Parent PRD: $APPROVED_PRD_PATH
  Backend Design Doc: $STEP_7a_OUTPUT

  Reference backend Design Doc for API contracts.
  Focus on: component hierarchy, state management, UI interactions, data fetching.
  Document current architecture as-is.
```

**Store output as**: `$STEP_7b_OUTPUT`

#### Step 8: Code Verification

**Standard mode**: Verify `$STEP_7_OUTPUT` against `$UNIT_PRIMARY_MODULES`.

**Fullstack mode**: Verify each Design Doc separately.

**Task invocation (per Design Doc)**:
```
subagent_type: code-verifier
prompt: |
  Verify consistency between Design Doc and code implementation.

  doc_type: design-doc
  document_path: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)
  code_paths: $UNIT_PRIMARY_MODULES
  verbose: false
```

**Store output as**: `$STEP_8_OUTPUT`

#### Step 9: Review

**Required Input**: $STEP_8_OUTPUT (verification JSON from Step 8)

**Task invocation (per Design Doc)**:
```
subagent_type: document-reviewer
prompt: |
  Review the following Design Doc considering code verification findings.

  doc_type: DesignDoc
  target: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)
  mode: composite

  ## Code Verification Results
  $STEP_8_OUTPUT

  ## Parent PRD
  $APPROVED_PRD_PATH

  ## Additional Review Focus
  - Technical accuracy of documented interfaces
  - Consistency with parent PRD scope
  - Completeness of unit boundary definitions
```

**Store output as**: `$STEP_9_OUTPUT`

#### Step 10: Revision (conditional)

Same logic as Step 5, using technical-designer (or technical-designer-frontend for frontend Design Docs) with update mode.

#### Unit Completion

- [ ] Review status is "Approved" or "Approved with Conditions"
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units → Final Report.

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
| consistencyScore < 50 | Flag for mandatory human review — require explicit human approval |
| Review rejects after 2 revisions | Stop loop, flag for human intervention |
