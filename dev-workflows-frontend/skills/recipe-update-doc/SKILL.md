---
name: recipe-update-doc
description: Update existing design documents (Design Doc / PRD / ADR) with review
disable-model-invocation: true
---

**Context**: Dedicated to updating existing design documents.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**First Action**: Register Steps 1-6 using TaskCreate before any execution.

**Execution Protocol**:
1. **Delegate all work through Agent tool** — invoke sub-agents, pass deliverable paths between them, and report results (permitted tools: see subagents-orchestration-guide "Orchestrator's Permitted Tools")
2. **Execute update flow**:
   - Identify target → Clarify changes → Update document → Review → Consistency check
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when updated document receives approval

**CRITICAL**: Execute document-reviewer and all stopping points — each serves as a quality gate for document accuracy.

## Workflow Overview

```
Target document → [Stop: Confirm changes]
                        ↓
              technical-designer / technical-designer-frontend / prd-creator (update mode)
                        ↓ (Design Doc only)
              code-verifier → document-reviewer → [Stop: Review approval]
                        ↓ (Design Doc only)
              design-sync → [Stop: Final approval]
```

## Scope Boundaries

**Included in this skill**:
- Existing document identification and selection
- Change content clarification with user
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

```bash
# Check existing documents
ls docs/design/*.md docs/prd/*.md docs/adr/*.md 2>/dev/null | grep -v template
```

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

### Step 3: Change Content Clarification [Stop]

Use AskUserQuestion to clarify what changes are needed:
- What sections need updating
- Reason for the change (bug fix findings, spec change, review feedback, etc.)
- Expected outcome after the update

Confirm understanding of changes with user before proceeding.

### Step 4: Document Update

Invoke the update agent determined in Step 2:
```
subagent_type: [Update Agent from Step 2]
description: "Update [Type from Step 2]"
prompt: |
  Operation Mode: update
  Existing Document: [path from Step 1]

  ## Changes Required
  [Changes clarified in Step 3]

  Update the document to reflect the specified changes.
  Add change history entry.
```

### Step 5: Document Review [Stop]

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

Invoke document-reviewer:
```
subagent_type: document-reviewer
description: "Review updated document"
prompt: |
  Review the following updated document.

  doc_type: [Design Doc / PRD / ADR]
  target: [path from Step 1]
  mode: standard
  code_verification: $CODE_VERIFICATION_OUTPUT (Design Doc only, omit for PRD/ADR)

  Focus on:
  - Consistency of updated sections with rest of document
  - No contradictions introduced by changes
  - Completeness of change history
```

**Store output as**: `$STEP_5_OUTPUT`

**On review result**:
- Approved → Proceed to Step 6
- Needs revision → Return to Step 4 with the following prompt (max 2 iterations):
  ```
  subagent_type: [Update Agent from Step 2]
  description: "Revise [Type from Step 2]"
  prompt: |
    Operation Mode: update
    Existing Document: [path from Step 1]

    ## Review Feedback to Address
    $STEP_5_OUTPUT

    Address each issue raised in the review feedback.
  ```
- **After 2 rejections** → Flag for human review, present accumulated feedback to user and end

Present review result to user for approval.

### Step 6: Consistency Verification (Design Doc only) [Stop]

**Skip condition**: Document type is PRD or ADR → Proceed to completion.

For Design Doc, invoke design-sync:
```
subagent_type: design-sync
description: "Verify consistency"
prompt: |
  Verify consistency of the updated Design Doc with other design documents.

  Updated document: [path from Step 1]
```

**On consistency result**:
- No conflicts → Present result to user for final approval
- Conflicts detected → Present conflicts to user with AskUserQuestion:
  - A: Return to Step 4 to resolve conflicts in this document
  - B: End and address conflicts separately

## Error Handling

| Error | Action |
|-------|--------|
| Target document not found | Report and end (document creation is out of scope) |
| Sub-agent update fails | Log failure, present error to user, retry once |
| Review rejects after 2 revisions | Stop loop, flag for human intervention |
| design-sync detects conflicts | Present to user for resolution decision |

## Completion Criteria

- [ ] Identified target document
- [ ] Clarified change content with user
- [ ] Updated document with appropriate agent (update mode)
- [ ] Executed code-verifier before document-reviewer (Design Doc only)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification (Design Doc only)
- [ ] Obtained user approval for updated document

## Output Example
Document update completed.
- Updated document: docs/design/[document-name].md
- Approval status: User approved
