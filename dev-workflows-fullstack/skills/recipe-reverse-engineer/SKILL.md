---
name: recipe-reverse-engineer
description: Generate PRD and Design Docs from existing codebase through discovery, generation, verification, and review workflow
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Reverse engineering workflow to create documentation from existing code

Target: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am an orchestrator."

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Protocol**:
1. **Invoke named specialists for deliverable production** — pass deliverable paths between them and validate their results (see subagents-orchestration-guide "Orchestrator Execution Boundary")
2. **Process one step at a time**: Execute steps sequentially within each unit (2 → 3 → 4 → 5). Each step's output is the required input for the next step. Complete all steps for one unit before starting the next
3. **Preserve evidence while bridging outputs** — copy the fields required by the next specialist in their declared form; apply Review Resolution before routing any correction

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

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
subagent_type: dev-workflows-fullstack:scope-discoverer
description: "Discover functional scope"
prompt: |
  Discover functional scope targets in the codebase.

  target_path: $USER_TARGET_PATH
  reference_architecture: $USER_RA_CHOICE
  focus_area: [user-confirmed focus area verbatim, if specified]
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
subagent_type: dev-workflows-fullstack:prd-creator
description: "Generate PRD"
prompt: |
  Create reverse-engineered PRD for the following feature.

  Operation Mode: reverse-engineer
  External Scope Provided: true

  Feature: $PRD_UNIT_NAME (current Step 1 PRD unit name unchanged)
  Description: $PRD_UNIT_DESCRIPTION (current Step 1 PRD unit description unchanged)
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
subagent_type: dev-workflows-fullstack:code-verifier
description: "Verify PRD consistency"
prompt: |
  Verify consistency between PRD and code implementation.

  doc_type: prd
  document_path: $STEP_2_OUTPUT
  unit_inventory: [the current unit's Step 1 unitInventory]
  verbose: false
```

Leave `code_paths` absent so the verifier independently locates implementation evidence. `unit_inventory` supplies the completeness baseline while repository evidence supplies the search scope.

**Store output as**: `$STEP_3_OUTPUT`

**Quality Gate**:
- `summary.status` is `blocked`, inventory coverage is missing, or counts do not balance → re-run or escalate with the exact unusable input or evidence
- Any balanced non-blocked result → proceed to review with the complete verifier output; `needs_review` / `inconsistent` and any unaccounted items become explicit review evidence

#### Step 4: Review

**Required Input**: $STEP_3_OUTPUT (verification JSON from Step 3)

**Agent tool invocation**:
```
subagent_type: dev-workflows-fullstack:document-reviewer
description: "Review PRD"
prompt: |
  Review the following PRD considering code verification findings.

  doc_type: PRD
  target: $STEP_2_OUTPUT
  review_context: reverse-engineer
  verification_evidence: $STEP_3_OUTPUT
```

**Store output as**: `$STEP_4_OUTPUT`

#### Step 5: Revision (conditional)

Pass `$STEP_3_OUTPUT` to document-reviewer as verification evidence, then apply the Review Resolution Gate to `$STEP_4_OUTPUT`. Run revision only when at least one finding is `apply`; a decline-only result completes the review, and unresolved `user_decision_required` stops for user input.

**Agent tool invocation**:
```
subagent_type: dev-workflows-fullstack:prd-creator
description: "Revise PRD"
prompt: |
  Update PRD based on review feedback and code verification results.

  Operation Mode: update
  Existing PRD: $STEP_2_OUTPUT

  ## Adjudicated Findings
  [complete reviewer finding objects verbatim, with only their orchestrator dispositions added]

  Treat these findings as the complete revision scope and preserve adjacent content.
```

**Re-validation**: After each revision, re-run code-verifier on the revised document, then re-run document-reviewer with the latest `verification_evidence` and `prior_feedback`.

#### Unit Completion

- [ ] No `apply` findings remain; every other review finding has a disposition and every `user_decision_required` item has a recorded user decision
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

In fullstack mode, partition each unit inventory by the owning path into backend and frontend target inventories. Assign a shared entry to each Design Doc whose public contract must account for it and record that shared reason; otherwise assign it once. Each Step 7 and Step 8 invocation receives its target's inventory, not the unpartitioned combined unit.

**Store output as**: `$STEP_6_OUTPUT`

### Step 7-10: Per-Unit Processing

**FOR** each unit in `$STEP_6_OUTPUT` **(sequential, one unit at a time)**:

#### Step 7: Design Doc Generation

**Scope**: Document the current architecture exactly as implemented in code.

**Standard mode (fullstack=No)**:

**Agent tool invocation**:
```
subagent_type: dev-workflows-fullstack:technical-designer
description: "Generate Design Doc"
prompt: |
  Create Design Doc for the following feature based on existing code.

  Operation Mode: reverse-engineer

  Feature: $UNIT_NAME (current Step 6 target name unchanged)
  Description: $UNIT_DESCRIPTION (current Step 6 target description unchanged)
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES
  Unit Inventory: $DESIGN_DOC_UNIT_INVENTORY

  Parent PRD: $APPROVED_PRD_PATH

  Document current architecture as-is. Use Unit Inventory as a completeness baseline — all routes and exports should be accounted for in the Design Doc.
```

**Store output as**: `$STEP_7_OUTPUT`

**Fullstack mode (fullstack=Yes)**:

For each unit, invoke 7a then 7b sequentially (7b depends on 7a output):

**7a. Backend Design Doc**:
```
subagent_type: dev-workflows-fullstack:technical-designer
description: "Generate backend Design Doc"
prompt: |
  Create a backend Design Doc for the following feature based on existing code.

  Operation Mode: reverse-engineer

  Feature: $UNIT_NAME (current Step 6 target name unchanged)
  Description: $UNIT_DESCRIPTION (current Step 6 target description unchanged)
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES
  Unit Inventory: $BACKEND_UNIT_INVENTORY

  Parent PRD: $APPROVED_PRD_PATH

  Focus on: API contracts, data layer, business logic, service architecture.
  Document current architecture as-is. Use Unit Inventory as completeness baseline.
```

**Store output as**: `$STEP_7a_OUTPUT`

**7b. Frontend Design Doc**:
```
subagent_type: dev-workflows-fullstack:technical-designer-frontend
description: "Generate frontend Design Doc"
prompt: |
  Create a frontend Design Doc for the following feature based on existing code.

  Operation Mode: reverse-engineer

  Feature: $UNIT_NAME (current Step 6 target name unchanged)
  Description: $UNIT_DESCRIPTION (current Step 6 target description unchanged)
  Primary Files: $UNIT_PRIMARY_MODULES
  Public Interfaces: $UNIT_PUBLIC_INTERFACES
  Dependencies: $UNIT_DEPENDENCIES
  Unit Inventory: $FRONTEND_UNIT_INVENTORY

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
subagent_type: dev-workflows-fullstack:code-verifier
description: "Verify Design Doc consistency"
prompt: |
  Verify consistency between Design Doc and code implementation.

  doc_type: design-doc
  document_path: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)
  unit_inventory: [the current Design Doc target's Step 6 unitInventory]
  verbose: false
```

Leave `code_paths` absent so the verifier independently discovers code scope from the document.

**Store output as**: `$STEP_8_OUTPUT`

**Verification gate (per Design Doc)**:
- `blocked`, missing `inventoryCoverage`, or unbalanced category counts → correct the invocation/input and rerun; stop for the user only when repository evidence cannot resolve the input defect.
- Any balanced non-blocked result proceeds to document review. Carry `needs_review`, `inconsistent`, and every unaccounted item as explicit verifier evidence.

#### Step 9: Review

**Required Input**: $STEP_8_OUTPUT (verification JSON from Step 8)

**Agent tool invocation (per Design Doc)**:
```
subagent_type: dev-workflows-fullstack:document-reviewer
description: "Review Design Doc"
prompt: |
  Review the following Design Doc considering code verification findings.

  doc_type: DesignDoc
  target: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)
  review_context: reverse-engineer
  verification_evidence: $STEP_8_OUTPUT

  ## Parent PRD
  $APPROVED_PRD_PATH

  ## Additional Review Focus
  - Technical accuracy of documented interfaces
  - Consistency with parent PRD scope
  - Completeness of unit boundary definitions
```

**Store output as**: `$STEP_9_OUTPUT`

#### Step 10: Revision (conditional)

Pass `$STEP_8_OUTPUT` to document-reviewer as verification evidence, then apply the Review Resolution Gate to `$STEP_9_OUTPUT`. Run revision only when at least one finding is `apply`; a decline-only result completes the review, and unresolved `user_decision_required` stops for user input.

**Agent tool invocation (per Design Doc)**:
```
subagent_type: dev-workflows-fullstack:technical-designer (or dev-workflows-fullstack:technical-designer-frontend for frontend Design Docs)
description: "Revise Design Doc"
prompt: |
  Update Design Doc based on review feedback and code verification results.

  Operation Mode: update
  Existing Design Doc: $STEP_7_OUTPUT (or $STEP_7a_OUTPUT / $STEP_7b_OUTPUT)

  ## Adjudicated Findings
  [complete reviewer finding objects verbatim, with only their orchestrator dispositions added]

  Treat these findings as the complete revision scope and preserve adjacent content.
```

**Re-validation**: After each revision, re-run code-verifier on the revised document, then re-run document-reviewer with the latest `verification_evidence` and `prior_feedback`.

#### Unit Completion

- [ ] No `apply` findings remain; every other review finding has a disposition and every `user_decision_required` item has a recorded user decision
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units → Final Report.

## Final Report

Output summary including:
- Generated documents table (Type, Name, Verification Status, Review Status)
- Action items (undocumented features, flagged items)
- Declined actionable findings with ID, governing reason, and evidence, when any occurred
- Next steps checklist

## Error Handling

| Error | Action |
|-------|--------|
| Discovery finds nothing | Ask user for project structure hints |
| Generation fails | Log failure, continue with other units, report in summary |
| Verification is `inconsistent` or inventory remains unaccounted after correction | Flag for mandatory human review — require explicit human approval |
