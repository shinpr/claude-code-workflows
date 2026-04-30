---
name: recipe-reverse-engineer
description: Generate PRD and Design Docs from existing codebase through discovery, generation, verification, and review workflow
disable-model-invocation: true
---

**Context**: Reverse engineering workflow to create documentation from existing code

Target: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am an orchestrator."

**Execution Protocol**:
1. **Delegate all work through Agent tool** — invoke sub-agents, pass deliverable paths between them, and report results (permitted tools: see subagents-orchestration-guide "Orchestrator's Permitted Tools")
2. **Process one step at a time**: Execute steps sequentially within each unit (2 → 3 → 4 → 5). Each step's output is the required input for the next step. Complete all steps for one unit before starting the next
3. **Pass `$STEP_N_OUTPUT` as-is** to sub-agents — the orchestrator bridges data without processing or filtering it

**Task Registration**: Register phases first using TaskCreate, then steps within each phase as you enter it. Update status using TaskUpdate.

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
  Step 1: Scope Discovery (unified, single pass → group into PRD units → human review)
  Step 2-5: Per-unit loop (Generation → Verification → Review → Revision)

Phase 2: Design Doc Generation (if requested)
  Step 6: Design Doc Scope Mapping (reuse Step 1 results, no re-discovery)
  Step 7-10: Per-unit loop (Generation → Verification → Review → Revision)
  ※ fullstack=Yes: each unit produces backend + frontend Design Docs
```

## Phase 1: PRD Generation

**Register using TaskCreate**:
- Step 1: PRD Scope Discovery
- Per-unit processing (Steps 2-5 for each unit)

### Step 1: PRD Scope Discovery

**Agent tool invocation**:
```
subagent_type: dev-workflows:scope-discoverer
description: "Discover functional scope"
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
- `$STEP_1_OUTPUT.prdUnits` exists
- All `sourceUnits` across `prdUnits` (flattened, deduplicated) match the set of `discoveredUnits` IDs — no unit missing, no unit duplicated
- Each discovered unit's `unitInventory` has at least one non-empty category (routes, testFiles, or publicExports). Units with all three empty indicate incomplete discovery — re-run scope-discoverer with focus on that unit's relatedFiles

**Human Review Point** (if enabled): Present `$STEP_1_OUTPUT.prdUnits` with their source unit mapping. The user confirms, adjusts grouping, or excludes units from scope. This is the most important review point — incorrect grouping cascades into all downstream documents.

### Step 2-5: Per-Unit Processing

**FOR** each unit in `$STEP_1_OUTPUT.prdUnits` **(sequential, one unit at a time)**:

#### Step 2: PRD Generation

**Agent tool invocation**:
```
subagent_type: dev-workflows:prd-creator
description: "Generate PRD"
prompt: |
  Create reverse-engineered PRD for the following feature.

  Operation Mode: reverse-engineer
  External Scope Provided: true

  Feature: $PRD_UNIT_NAME (from $STEP_1_OUTPUT)
  Description: $PRD_UNIT_DESCRIPTION
  Related Files: $PRD_UNIT_COMBINED_RELATED_FILES
  Entry Points: $PRD_UNIT_COMBINED_ENTRY_POINTS

  Use provided scope as investigation starting point.
  If tracing entry points reveals files outside this scope, include them.
  Create final version PRD based on thorough code investigation.
```

**Store output as**: `$STEP_2_OUTPUT` (PRD path)

#### Step 3: Code Verification

**Prerequisite**: $STEP_2_OUTPUT (PRD path from Step 2)

**Agent tool invocation**:
```
subagent_type: dev-workflows:code-verifier
description: "Verify PRD consistency"
prompt: |
  Verify consistency between PRD and code implementation.

  doc_type: prd
  document_path: $STEP_2_OUTPUT
  verbose: false
```

Note: Omit `code_paths` — the verifier independently discovers code scope from the document, ensuring independent verification not constrained by scope-discoverer's output.

**Store output as**: `$STEP_3_OUTPUT`

**Quality Gate**:
- consistencyScore >= 70 AND verifiableClaimCount >= 20 → proceed to review
- consistencyScore >= 70 BUT verifiableClaimCount < 20 → re-run verifier (investigation too shallow)
- consistencyScore < 70 → flag for detailed review

#### Step 4: Review

**Required Input**: $STEP_3_OUTPUT (verification JSON from Step 3)

**Agent tool invocation**:
```
subagent_type: dev-workflows:document-reviewer
description: "Review PRD"
prompt: |
  Review the following PRD considering code verification findings.

  doc_type: PRD
  target: $STEP_2_OUTPUT
  mode: composite
  code_verification: $STEP_3_OUTPUT

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

**Agent tool invocation**:
```
subagent_type: dev-workflows:prd-creator
description: "Revise PRD"
prompt: |
  Update PRD based on review feedback and code verification results.

  Operation Mode: update
  Existing PRD: $STEP_2_OUTPUT

  ## Review Feedback
  $STEP_4_OUTPUT

  ## Code Verification Results
  $STEP_3_OUTPUT

  Address discrepancies by severity. Critical and major items require correction.
  Minor items: correct if straightforward, otherwise leave as-is with rationale.
```

**Loop Control**: Maximum 2 revision cycles. After 2 cycles, flag for human review regardless of status.

#### Unit Completion

- [ ] Review status is "Approved" or "Approved with Conditions"
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units → Phase 2.

## Phase 2: Design Doc Generation

*Execute only if Design Docs were requested in Step 0*

**Register using TaskCreate**:
- Step 6: Design Doc Scope Mapping
- Per-unit processing (Steps 7-10 for each unit)

### Step 6: Design Doc Scope Mapping

**No additional discovery required.** Use `$STEP_1_OUTPUT.discoveredUnits` (implementation-granularity units) for technical profiles. Use `$STEP_1_OUTPUT.prdUnits[].sourceUnits` to trace which discovered units belong to each PRD unit.

Each PRD unit from Phase 1 maps to Design Doc unit(s):
- **Standard mode (fullstack=No)**: 1 PRD unit → 1 Design Doc (using technical-designer)
- **Fullstack mode (fullstack=Yes)**: 1 PRD unit → 2 Design Docs (technical-designer + technical-designer-frontend)

Map `$STEP_1_OUTPUT` units to Design Doc generation targets, carrying forward:
- `technicalProfile.primaryModules` → Primary Files
- `technicalProfile.publicInterfaces` → Public Interfaces
- `dependencies` → Dependencies
- `relatedFiles` → Scope boundary
- `unitInventory` → Unit Inventory (routes, test files, public exports)

**Store output as**: `$STEP_6_OUTPUT`

### Step 7-10: Per-Unit Processing

**FOR** each unit in `$STEP_6_OUTPUT` **(sequential, one unit at a time)**:

#### Step 7: Design Doc Generation

**Scope**: Document the current architecture exactly as implemented in code.

**Standard mode (fullstack=No)**:

**Agent tool invocation**:
```
subagent_type: dev-workflows:technical-designer
description: "Generate Design Doc"
prompt: |
  Create Design Doc for the following feature based on existing code.

  Operation Mode: reverse-engineer

  Feature: $UNIT_NAME (from $STEP_6_OUTPUT)
  Description: $UNIT_DESCRIPTION
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES
  Unit Inventory: $UNIT_INVENTORY (routes, test files, public exports from scope discovery)

  Parent PRD: $APPROVED_PRD_PATH

  Document current architecture as-is. Use Unit Inventory as a completeness baseline — all routes and exports should be accounted for in the Design Doc.
```

**Store output as**: `$STEP_7_OUTPUT`

**Fullstack mode (fullstack=Yes)**:

For each unit, invoke 7a then 7b sequentially (7b depends on 7a output):

**7a. Backend Design Doc**:
```
subagent_type: dev-workflows:technical-designer
description: "Generate backend Design Doc"
prompt: |
  Create a backend Design Doc for the following feature based on existing code.

  Operation Mode: reverse-engineer

  Feature: $UNIT_NAME (from $STEP_6_OUTPUT)
  Description: $UNIT_DESCRIPTION
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES
  Unit Inventory: $UNIT_INVENTORY

  Parent PRD: $APPROVED_PRD_PATH

  Focus on: API contracts, data layer, business logic, service architecture.
  Document current architecture as-is. Use Unit Inventory as completeness baseline.
```

**Store output as**: `$STEP_7a_OUTPUT`

**7b. Frontend Design Doc**:
```
subagent_type: dev-workflows-frontend:technical-designer-frontend
description: "Generate frontend Design Doc"
prompt: |
  Create a frontend Design Doc for the following feature based on existing code.

  Operation Mode: reverse-engineer

  Feature: $UNIT_NAME (from $STEP_6_OUTPUT)
  Description: $UNIT_DESCRIPTION
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES
  Unit Inventory: $UNIT_INVENTORY

  Parent PRD: $APPROVED_PRD_PATH
  Backend Design Doc: $STEP_7a_OUTPUT

  Reference backend Design Doc for API contracts.
  Focus on: component hierarchy, state management, UI interactions, data fetching.
  Document current architecture as-is. Use Unit Inventory as completeness baseline.
```

**Store output as**: `$STEP_7b_OUTPUT`

#### Step 8: Code Verification

**Standard mode**: Verify `$STEP_7_OUTPUT`.

**Fullstack mode**: Verify each Design Doc separately.

**Agent tool invocation (per Design Doc)**:
```
subagent_type: dev-workflows:code-verifier
description: "Verify Design Doc consistency"
prompt: |
  Verify consistency between Design Doc and code implementation.

  doc_type: design-doc
  document_path: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)
  verbose: false
```

Note: Omit `code_paths` — the verifier independently discovers code scope from the document.

**Store output as**: `$STEP_8_OUTPUT`

#### Step 9: Review

**Required Input**: $STEP_8_OUTPUT (verification JSON from Step 8)

**Agent tool invocation (per Design Doc)**:
```
subagent_type: dev-workflows:document-reviewer
description: "Review Design Doc"
prompt: |
  Review the following Design Doc considering code verification findings.

  doc_type: DesignDoc
  target: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)
  mode: composite
  code_verification: $STEP_8_OUTPUT

  ## Parent PRD
  $APPROVED_PRD_PATH

  ## Additional Review Focus
  - Technical accuracy of documented interfaces
  - Consistency with parent PRD scope
  - Completeness of unit boundary definitions
```

**Store output as**: `$STEP_9_OUTPUT`

#### Step 10: Revision (conditional)

**Trigger Conditions** (same as Step 5):
- Review status is "Needs Revision" or "Rejected"
- Critical discrepancies exist in `$STEP_8_OUTPUT`
- consistencyScore < 70

**Agent tool invocation (per Design Doc)**:
```
subagent_type: dev-workflows:technical-designer (or dev-workflows-frontend:technical-designer-frontend for frontend Design Docs)
description: "Revise Design Doc"
prompt: |
  Update Design Doc based on review feedback and code verification results.

  Operation Mode: update
  Existing Design Doc: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)

  ## Review Feedback
  $STEP_9_OUTPUT

  ## Code Verification Results
  $STEP_8_OUTPUT

  Address discrepancies by severity. Critical and major items require correction.
  Minor items: correct if straightforward, otherwise leave as-is with rationale.
```

**Loop Control**: Maximum 2 revision cycles. After 2 cycles, flag for human review regardless of status.

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
