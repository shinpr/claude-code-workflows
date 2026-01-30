---
name: update-doc
description: Update existing design documents (Design Doc / PRD / ADR) with review
---

**Command Context**: This command is dedicated to updating existing design documents.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**First Action**: Register Steps 1-6 to TodoWrite before any execution.

**Execution Protocol**:
1. **Delegate all work** to sub-agents (NEVER edit documents yourself)
2. **Execute update flow**:
   - Identify target → Clarify changes → Update document → Review → Consistency check
   - **Stop at every `[Stop: ...]` marker** → Wait for user approval before proceeding
3. **Scope**: Complete when updated document receives approval

**CRITICAL**: NEVER skip document-reviewer or stopping points.

## Workflow Overview

```
Target document → [Stop: Confirm changes]
                        ↓
              technical-designer / prd-creator (update mode)
                        ↓
              document-reviewer → [Stop: Review approval]
                        ↓ (Design Doc only)
              design-sync → [Stop: Final approval]
```

## Scope Boundaries

**Included in this command**:
- Existing document identification and selection
- Change content clarification with user
- Document update with appropriate agent (update mode)
- Document review with document-reviewer
- Consistency verification with design-sync (Design Doc only)

**NOT included**:
- New requirement analysis (use /design for new documents)
- Work planning or implementation (use /plan or /task after this command)

**Responsibility Boundary**: This command completes with updated document approval.

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
| No documents found | Report and end (suggest /design instead) |

### Step 2: Document Type Determination

Determine type from document path:

| Path Pattern | Type | Update Agent | Notes |
|-------------|------|--------------|-------|
| `docs/design/*.md` | Design Doc | technical-designer | - |
| `docs/prd/*.md` | PRD | prd-creator | - |
| `docs/adr/*.md` | ADR | technical-designer | Minor changes: update existing file; Major changes: create new ADR file |

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

Invoke document-reviewer:
```
subagent_type: document-reviewer
description: "Review updated document"
prompt: |
  Review the following updated document.

  doc_type: [Design Doc / PRD / ADR]
  target: [path from Step 1]
  mode: standard

  Focus on:
  - Consistency of updated sections with rest of document
  - No contradictions introduced by changes
  - Completeness of change history
```

**On review result**:
- Approved → Proceed to Step 6
- Needs revision → Return to Step 4 with reviewer feedback (max 2 iterations)
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
  - B: End command and address conflicts separately

## Error Handling

| Error | Action |
|-------|--------|
| Target document not found | Report and end (suggest /design instead) |
| Sub-agent update fails | Log failure, present error to user, retry once |
| Review rejects after 2 revisions | Stop loop, flag for human intervention |
| design-sync detects conflicts | Present to user for resolution decision |

## Completion Criteria

- [ ] Identified target document
- [ ] Clarified change content with user
- [ ] Updated document with appropriate agent (update mode)
- [ ] Executed document-reviewer and addressed feedback
- [ ] Executed design-sync for consistency verification (Design Doc only)
- [ ] Obtained user approval for updated document

## Output Example
Document update completed.
- Updated document: docs/design/[document-name].md
- Approval status: User approved

**Important**: This command ends with document approval. Does not propose transition to next phase.
