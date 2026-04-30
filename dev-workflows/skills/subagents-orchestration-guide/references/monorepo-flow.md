# Fullstack (Monorepo) Flow

This reference defines the orchestration flow for projects spanning multiple layers (backend + frontend). It extends the standard orchestration guide without modifying it.

## When This Flow Applies

- Multiple Design Docs exist targeting different layers (backend, frontend)
- A single feature requires implementation across both backend and frontend
- The orchestrator is invoked via `fullstack-implement` or `fullstack-build` commands

## Design Phase

### Large Scale Fullstack (6+ Files) - 15 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | prd-creator | PRD covering entire feature (all layers) | Single PRD |
| 3 | document-reviewer | PRD review **[Stop]** | Approval |
| 4 | (orchestrator) | Ask user for prototype code **[Stop]** | Prototype path or none |
| 5 | ui-spec-designer | UI Spec from PRD + optional prototype | UI Spec |
| 6 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 7 | codebase-analyzer ×2 | Codebase analysis per layer (pass req-analyzer output + PRD path, filtered to layer) | Codebase guidance per layer |
| 8 | technical-designer | **Backend** Design Doc (with backend codebase-analyzer context) | Backend Design Doc |
| 9 | code-verifier | Verify **Backend** Design Doc against existing code (its result JSON is passed to step 10 as `prior_layer_verification`) | Backend verification |
| 10 | technical-designer-frontend | **Frontend** Design Doc (with frontend codebase-analyzer context + backend Design Doc + `prior_layer_verification` from step 9 + UI Spec) | Frontend Design Doc |
| 11 | code-verifier | Verify **Frontend** Design Doc against existing code | Frontend verification |
| 12 | document-reviewer ×2 | Review each Design Doc (with code-verifier results as `code_verification`) | Reviews |
| 13 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 14 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 15 | work-planner | Work plan from all Design Docs **[Stop: Batch approval]** | Work plan |

### Medium Scale Fullstack (3-5 Files) - 13 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | codebase-analyzer ×2 | Codebase analysis per layer (pass req-analyzer output, filtered to layer) | Codebase guidance per layer |
| 3 | (orchestrator) | Ask user for prototype code **[Stop]** | Prototype path or none |
| 4 | ui-spec-designer | UI Spec from requirements + optional prototype | UI Spec |
| 5 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 6 | technical-designer | **Backend** Design Doc (with backend codebase-analyzer context) | Backend Design Doc |
| 7 | code-verifier | Verify **Backend** Design Doc against existing code (its result JSON is passed to step 8 as `prior_layer_verification`) | Backend verification |
| 8 | technical-designer-frontend | **Frontend** Design Doc (with frontend codebase-analyzer context + backend Design Doc + `prior_layer_verification` from step 7 + UI Spec) | Frontend Design Doc |
| 9 | code-verifier | Verify **Frontend** Design Doc against existing code | Frontend verification |
| 10 | document-reviewer ×2 | Review each Design Doc (with code-verifier results as `code_verification`) | Reviews |
| 11 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 12 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 13 | work-planner | Work plan from all Design Docs **[Stop: Batch approval]** | Work plan |

### Parallelization in Multi-Agent Steps

Steps marked with ×2 (codebase-analyzer ×2, document-reviewer ×2) invoke the agent once per layer. These invocations are independent and can run in parallel when the orchestrator supports concurrent Agent tool calls. The two code-verifier invocations run sequentially: backend verification completes before frontend authoring begins so the frontend designer references verified backend contracts.

### Layer Context in Design Doc Creation

Use the common handoff contracts in `../SKILL.md`:
- Backend DD creation uses `HC-01` + `HC-02`
- Frontend DD creation uses `HC-01` + `HC-02` + `HC-05`
- Design Doc review uses `HC-03` + `HC-04`

Prompt templates:

**Backend Design Doc**
```text
Create a backend Design Doc from [PRD path or requirement_analysis].
Codebase analysis: [JSON from codebase-analyzer for backend layer]
Focus on: API contracts, data layer, business logic, service architecture.
```

**Frontend Design Doc**
```text
Create a frontend Design Doc from [PRD path or requirement_analysis].
Codebase analysis: [JSON from codebase-analyzer for frontend layer]
Backend Design Doc: [path]
prior_layer_verification: [JSON from code-verifier on backend Design Doc]
Reference UI Spec at [path] for component structure and state design.
Use `prior_layer_verification.discrepancies[]` as known issues to address or escalate. Do not infer verified claims beyond what the verifier output states explicitly.
Focus on: component hierarchy, state management, UI interactions, data fetching.
```

### design-sync for Cross-Layer Verification

Call design-sync with `source_design` = frontend Design Doc (created last, referencing backend's Integration Points). design-sync auto-discovers other Design Docs in `docs/design/` for comparison.

## Test Skeleton Generation Phase

Orchestrator passes all Design Docs and UI Spec to acceptance-test-generator:

```
Generate test skeletons from the following documents:
- Design Doc (backend): [path]
- Design Doc (frontend): [path]
- UI Spec: [path] (if exists)
```

## Work Planning Phase

Orchestrator passes all Design Docs to work-planner:

```
Create a work plan from the following documents:
- PRD: [path] (Large Scale only)
- Design Doc (backend): [path]
- Design Doc (frontend): [path]

Compose phases as vertical feature slices where possible — each phase should contain
both backend and frontend work for the same feature area, enabling early integration
verification per phase.
```

work-planner's existing Integration Complete criteria naturally covers cross-layer verification when given multiple Design Docs.

## Task Decomposition Phase

task-decomposer follows standard decomposition from the work plan. The key addition is the **layer-aware naming convention**:

| Filename Pattern | Meaning | Executor | Quality Fixer |
|-----------------|---------|----------|---------------|
| `{plan}-backend-task-{n}.md` | Backend only | task-executor | quality-fixer |
| `{plan}-frontend-task-{n}.md` | Frontend only | task-executor-frontend | quality-fixer-frontend |

Layer is determined from the task's **Target files** paths — this is a factual determination, not inference.

## Task Cycle

Each task follows the standard 4-step cycle from `../SKILL.md`. Only agent routing varies by layer:

| Task pattern | Executor | Quality fixer |
|-------------|----------|---------------|
| `*-backend-task-*` | `task-executor` | `quality-fixer` |
| `*-frontend-task-*` | `task-executor-frontend` | `quality-fixer-frontend` |

### integration-test-reviewer Placement

When `requiresTestReview` is `true`:
- Standard flow (integration-test-reviewer after task-executor, before quality-fixer)

All other orchestration rules follow the standard subagents-orchestration-guide.
