---
name: recipe-front-adjust
description: Coordinate a frontend UI adjustment from external resource hearing through scale-driven plan decision, UI fact collection, and handoff to the implementation phase. Use when "UI adjustment / visual tweak / existing component update / front adjust" is mentioned, or when the user wants to refine an already-implemented UI without redoing the full design phase.
disable-model-invocation: true
---

**Context**: Dedicated to UI adjustment workflows on already-implemented features. Lighter than the full design phase but heavier than direct implementation, this recipe captures the small-but-essential preparation that adjustment work needs: external resource access, fact-grounded baseline, and a right-sized work plan.

## Orchestrator Definition

**Core Identity**: "I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Delegate all work** to sub-agents — your role is to invoke sub-agents, pass data between them, and report results.
2. **Follow the steps defined below in order**. Each step has an explicit completion gate.
3. **Hand off to the implementation phase** when adjustment preparation is complete. This recipe does not run task execution or quality fixing itself.
4. **Scope**: see Scope Boundaries below.

**CRITICAL**: This recipe ends at the implementation handoff. Do not invoke task-executor or quality-fixer from this recipe — those belong to the implementation recipe family. Doing so bypasses the readiness gates owned by that family.

## Workflow Overview

```
Adjustment request → external resource hearing (frontend domain)
                                  ↓
                     ui-codebase-analyzer (UI fact collection)
                                  ↓
                     scale judgment (documentation-criteria)
                                  ↓
            ┌────────────────────┴────────────────────┐
            ↓                                          ↓
   (1-2 files: inline)                  (3+ files: work-planner → [Stop: plan approval])
            ↓                                          ↓
            └───────────────→ implementation handoff ──┘
```

## Scope Boundaries

**Included in this skill**:
- External resource hearing per the external-resource-context skill (frontend domain)
- UI fact collection via ui-codebase-analyzer
- Scale judgment via documentation-criteria's Creation Decision Matrix
- Work plan creation via work-planner when scale warrants it
- Implementation handoff (user-facing announcement)

**Responsibility Boundary**: This skill completes when (a) the user is informed which implementation path to run, and (b) any required work plan has been approved. Task decomposition, implementation, and quality verification are out of scope and belong to the implementation phase.

**Out of scope**:
- Creating PRD, UI Spec, or Design Doc — adjustment work uses existing documents. When the requested change exceeds adjustment scope (new feature, new architecture, multi-screen redesign), escalate the user to the full frontend design phase.
- Running task-executor / quality-fixer / code-verifier / security-reviewer.

Adjustment request: $ARGUMENTS

## Execution Flow

### Step 1: External Resource Hearing
Per the external-resource-context skill, capture access methods for the frontend resources this adjustment will touch (design origin, design system, guidelines, visual verification environment).

1. **File-existence check**: Run `! ls docs/project-context/external-resources.md 2>/dev/null` to detect the project-tier file.
2. **Branch on existence**:
   - **Absent** → run the full hearing for the frontend domain (axes from `references/frontend.md` of the external-resource-context skill).
   - **Present** → AskUserQuestion: "`docs/project-context/external-resources.md` exists. Update it for this adjustment? (no / yes-full / yes-diff-only)". On `no` skip to Step 2. On `yes-full` run the full hearing. On `yes-diff-only` AskUserQuestion which axes changed and run hearing only on those.
3. **Two-phase hearing** when running hearing:
   - For each frontend axis (Design Origin, Design System, Guidelines, Visual Verification Environment), use AskUserQuestion with the choices listed in the skill's `references/frontend.md`. Always include "対象外 / not applicable" as a choice. For each non-N/A axis, follow up with an access-method question.
   - After the structured axes, AskUserQuestion once: "Are there any other frontend external resources for this adjustment that the structured questions did not cover? If yes, describe them in your next message." Append the free-form answer under "Additional resources" in the project-tier file.
4. **Persist**: Write or update `docs/project-context/external-resources.md` per the template in the skill's `references/template.md`.

**Completion gate**: `docs/project-context/external-resources.md` reflects the resources this adjustment depends on, or the user explicitly opted out of updating.

### Step 2: UI Fact Collection
Ground the adjustment in observable facts about the existing UI before deciding scope.

- Invoke **ui-codebase-analyzer** using Agent tool
  - `subagent_type: "dev-workflows-frontend:ui-codebase-analyzer"`
  - `description: "UI fact collection for adjustment"`
  - `prompt: "requirement_analysis: { affectedFiles: [files inferred from the adjustment request], scale: 'unknown', purpose: 'UI adjustment', technicalConsiderations: [] }. requirements: [adjustment request]. target_components: [components named in the request]. ui_spec_path: [path if an existing UI Spec covers the affected components, else absent]. Extract UI facts: visual structure, props patterns, CSS layout state, state x display matrix, display conditions, i18n format, accessibility, generated artifact readiness."`
- Read the JSON output. The `analysisScope.filesAnalyzed` list, `componentStructure[]`, and `focusAreas[]` drive the scale judgment in Step 3.

**Completion gate**: ui-codebase-analyzer returned a JSON output with at least one `componentStructure` entry or `focusAreas` entry (or escalated `limitations`).

### Step 3: Scale Judgment
Determine the document and plan footprint using the Creation Decision Matrix in the documentation-criteria skill (see its `Creation Decision Matrix` section).

1. Count distinct files that the adjustment will modify, using the ui-codebase-analyzer output as the evidence base.
2. Apply the matrix to the file count:
   - **1-2 files**: Direct implementation. No work plan, no Design Doc.
   - **3-5 files**: Work plan recommended; Design Doc optional and typically not needed for adjustment work.
   - **6+ files**: Adjustment scope exceeded. Escalate to the user — this should run through the full frontend design phase, not adjustment.
3. Also escalate (regardless of file count) when any ADR Creation Condition from documentation-criteria applies (architecture changes, contract changes affecting 3+ locations, complex multi-state logic, etc.). These signal that adjustment is the wrong recipe.

**Escalation message format** (when scope exceeded): "This change touches [N] files / matches ADR condition [X]. Adjustment scope is 1-5 files without architecture changes. Recommend running the full frontend design phase first to produce UI Spec / Design Doc, then planning, then implementation."

**Completion gate**: scope is confirmed within adjustment range, or escalation has been delivered.

### Step 4: Plan Creation (Conditional)
Branch on the scale outcome from Step 3.

#### Branch A — 1-2 files
No work plan needed. Build a minimal handoff packet for the implementation phase containing:
- Adjustment request (verbatim)
- ui-codebase-analyzer focusAreas[] with `ui:` prefix preserved
- Affected files list
- External Resources Used: feature-tier subset relevant to this adjustment, referencing project-tier entries

The packet is the prompt input the user will pass to the implementation recipe in Step 5. Present the packet to the user for inspection before handoff.

#### Branch B — 3-5 files
Create a right-sized work plan. Invoke **work-planner** using Agent tool:
- `subagent_type: "dev-workflows-frontend:work-planner"`
- `description: "Adjustment work plan"`
- `prompt: "Create a work plan for this UI adjustment. Adjustment request: [verbatim]. UI codebase analysis: [ui-codebase-analyzer JSON]. External resources: [project-tier file path]. Scale: 3-5 files (no Design Doc, no ADR). Each phase should be implementable as 1-3 commits. Include a quality checklist matched to the affected components: visual verification, accessibility, i18n parity, generated artifact regeneration when relevant. Output path: docs/plans/[YYYYMMDD]-adjust-[short-description].md"`

After work-planner returns:
- Present the work plan to the user.
- **[STOP]**: Wait for plan approval or revision request. If the user requests changes, re-invoke work-planner with the revised guidance.

**Completion gate**: Branch A handoff packet is presented to the user, OR Branch B work plan is approved.

### Step 5: Implementation Handoff
Inform the user how to proceed. The exact recipe to run is announced in the user-facing message; this recipe does not invoke the implementation phase itself.

#### Branch A handoff message
```
Adjustment preparation complete (1-2 files, direct implementation).

Handoff packet:
- Adjustment request: <verbatim>
- Affected files: <list>
- UI focus areas: <ui-codebase-analyzer focusAreas summarized>
- External resources used: <feature-tier subset>

To execute: run /recipe-front-build with this packet as the request input.
```

#### Branch B handoff message
```
Adjustment preparation complete (3-5 files, work plan approved).

- Work plan: docs/plans/[plan-name].md
- External resources file: docs/project-context/external-resources.md

To execute: run /recipe-front-build (it will pick up the work plan automatically).
```

## Completion Criteria

- [ ] External resource hearing executed (project-tier file exists or update was explicitly skipped)
- [ ] ui-codebase-analyzer returned a JSON output, and its `focusAreas` were considered in the scale judgment
- [ ] Scale judgment per documentation-criteria's Creation Decision Matrix is recorded
- [ ] When 6+ files or ADR conditions detected → escalation delivered (recipe stops here)
- [ ] When 1-2 files → handoff packet presented to the user
- [ ] When 3-5 files → work plan created and approved
- [ ] Implementation handoff message delivered

## Output Example

```
Frontend adjustment preparation completed.
- External resources: docs/project-context/external-resources.md (updated|unchanged)
- UI fact collection: ui-codebase-analyzer focused on [N] components, [M] focus areas
- Scale: <1-2 files | 3-5 files>
- Work plan: <path | not required>
- Next step: <handoff message>
```
