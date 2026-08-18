---
name: recipe-update-doc
description: Update existing design documents (Design Doc / PRD / ADR) with review
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Dedicated to updating existing design documents.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Review Resolution Gate [MANDATORY]**: Resolve every actionable deliverable-review finding through subagents-orchestration-guide `Review Resolution` before correction or progression.
Before the first finding disposition, read `references/review-resolution.md` from the loaded subagents-orchestration-guide skill.

**Execution Gate**: Complete Steps 1-6 in order, following only the branches activated by document type and review result. Advance only through each step's stated evidence, review convergence, or approval condition. Complete after the final approval gate and every applicable Completion Criterion is satisfied.

**Execution Protocol**:
1. **Invoke named specialists for deliverable production** — pass deliverable paths between them and validate their results (see subagents-orchestration-guide "Orchestrator Execution Boundary")
2. **Execute update flow**:
   - Identify target → Clarify changes → Update document → Review → Consistency check
   - **Stop at the `[Stop: Final approval]` marker** → Wait for user approval before completing
3. **Scope**: Complete when updated document receives approval

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

**CRITICAL**: Execute document-reviewer — it is the quality gate for document accuracy.

## Workflow Overview

```
Target document → change clarification
                        ↓
              technical-designer / technical-designer-frontend / prd-creator (update mode)
                        ↓ (Design Doc only)
              code-verifier → document-reviewer
                        ↓ (Design Doc only)
              design-sync → [Stop: Final approval]
```

## Scope Boundaries

**Included in this skill**:
- Existing document identification and selection
- Change content clarification
- Document update with appropriate agent (update mode)
- Document review with document-reviewer
- Consistency verification with design-sync (Design Doc only)

**Out of scope** (redirect to appropriate skills):
- New requirement analysis
- Work planning or implementation

**Responsibility Boundary**: This skill completes with updated document approval.

Target document: $ARGUMENTS

## Execution Flow

### Step 1: Target Document Identification

Discover the existing documents under `docs/design/`, `docs/prd/`, and `docs/adr/`.

**Decision flow**:

| Situation | Action |
|-----------|--------|
| $ARGUMENTS specifies a path | Use specified document |
| $ARGUMENTS describes a topic | Search documents matching the topic |
| Multiple candidates found | Present options with AskUserQuestion |
| No documents found | Report and end (document creation is out of scope) |

### Step 2: Document Type and Layer Determination

Determine type from document path, then determine the layer to select the correct update agent:

| Path Pattern | Type | Update Agent | Notes |
|-------------|------|--------------|-------|
| `docs/design/*.md` | Design Doc | technical-designer or technical-designer-frontend | See layer detection below |
| `docs/prd/*.md` | PRD | prd-creator | - |
| `docs/adr/*.md` | ADR | technical-designer or technical-designer-frontend | See layer detection below |

**Layer detection** (for Design Doc and ADR):
Read the document and determine its layer from content signals:
- **Frontend** (→ technical-designer-frontend): Document title/scope mentions React, components, UI, frontend; or file contains component hierarchy, state management, UI interactions
- **Backend** (→ technical-designer): All other cases (API, data layer, business logic, infrastructure)

**ADR Update Guidance**:
- **Minor changes** (clarification, typo fix, small scope adjustment): Update the existing ADR file
- **Major changes** (decision reversal, significant scope change): Create a new ADR that supersedes the original

### Step 3: Change Content Clarification

Determine which sections need updating, the reason for the change, and the expected outcome after the update. Derive them from the request and the target document. Use AskUserQuestion only for an item the request and document leave undetermined, and only when a different answer would change which sections are updated or what the update must achieve.

Pass the resulting items, covered sections, and any stated total size budget to update or revision agents. Before the next approval gate, map every diff hunk to an approved item or required consistency update; request a scope decision for unmapped or over-budget changes.

### Step 4: Document Update

Invoke the update agent determined in Step 2:
```
subagent_type: [Update Agent from Step 2]
description: "Update [Type from Step 2]"
prompt: |
  Operation Mode: update
  Existing Document: [path from Step 1]

  ## Changes Required
  [Step 3 statements for the sections to update, reason, and expected outcome, copied verbatim]

  Update the document to reflect the specified changes.
  Add change history entry.
```

### Step 5: Document Review

**For Design Doc updates only**: Before document-reviewer, invoke code-verifier:
```
subagent_type: code-verifier
description: "Verify updated Design Doc"
prompt: |
  doc_type: design-doc
  document_path: [path from Step 1]
  Verify the updated Design Doc against current codebase.

  Verification focus: Pay special attention to literal identifier referential
  integrity in the updated sections (paths, endpoints, type names, config keys).
```

**Store output as**: `$CODE_VERIFICATION_OUTPUT`

Invoke document-reviewer with the applicable exact shape:

- Design Doc: `doc_type: DesignDoc`, `target: [path from Step 1]`, `review_context: update`, and `verification_evidence: $CODE_VERIFICATION_OUTPUT`.
- PRD: `doc_type: PRD` and `target: [path from Step 1]`.
- ADR: `doc_type: ADRBatch`, `targets: [path from Step 1]`, and `review_context: update`.

For each type, review consistency of the changed sections and their dependent statements, governing requirements, and change history.

**Store output as**: `$STEP_5_OUTPUT`

**On review result**:
- Approved → Proceed to Step 6
- Needs revision → Apply the Review Resolution Gate. Return to Step 4 when `apply` findings exist, using the following prompt:
  ```
  subagent_type: [Update Agent from Step 2]
  description: "Revise [Type from Step 2]"
  prompt: |
    Operation Mode: update
    Existing Document: [path from Step 1]

    ## Adjudicated Review Findings
    [complete reviewer finding objects verbatim, with only their orchestrator dispositions added]

    Treat these findings as the complete revision scope and preserve adjacent content.
  ```
- On re-review pass `prior_feedback` as `[{id, disposition, reason?, evidence}]`
- All actionable findings are `decline` and every `user_decision_required` item is resolved → Proceed to Step 6

### Step 6: Consistency Verification and Final Approval `[Stop: Final approval]`

**For Design Doc only**, invoke design-sync first:
```
subagent_type: design-sync
description: "Verify consistency"
prompt: "source_design: [path from Step 1]"
```

When conflicts are detected, apply the Review Resolution Gate using design-sync as a fresh verifier. Return `apply` conflicts to Step 4 for the owning document, rerun design-sync after correction, retain evidenced declines as complete, and request user input for `user_decision_required` or the Gate's escalation conditions.

**For every document type**, present the updated document, the review outcome, any resolved declines, and the sync result when one ran. This is the only approval gate in the flow: wait for the user's decision before completing.

## Error Handling

| Error | Action |
|-------|--------|
| Target document not found | Report and end (document creation is out of scope) |
| Sub-agent update fails | Log failure, present error to user, retry once |

## Completion Criteria

- [ ] Identified target document
- [ ] Change content determined from the request, the document, or a question whose answer changed the update
- [ ] Updated document with appropriate agent (update mode)
- [ ] Executed code-verifier before document-reviewer (Design Doc only)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification (Design Doc only)
- [ ] Obtained user approval for updated document

## Output Example
Document update completed.
- Updated document: docs/design/[document-name].md
- Approval status: User approved

When findings were declined during review, append their IDs, governing reasons, and evidence to this completion response.
