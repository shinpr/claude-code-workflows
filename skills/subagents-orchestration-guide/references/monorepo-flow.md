# Fullstack (Monorepo) Flow

This reference defines the orchestration flow for projects spanning multiple layers (backend + frontend). It extends the standard orchestration guide without modifying it.

## When This Flow Applies

- Multiple Design Docs exist targeting different layers (backend, frontend)
- A single feature requires implementation across both backend and frontend
- The orchestrator is invoked via `fullstack-implement` or `fullstack-build` commands

## Design Phase

### Large Scale Fullstack (6+ Files) - 9 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | prd-creator | PRD covering entire feature (all layers) | Single PRD |
| 3 | document-reviewer | PRD review **[Stop]** | Approval |
| 4 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 5 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points) | Frontend Design Doc |
| 6 | document-reviewer ×2 | Review each Design Doc (one invocation per doc) | Reviews |
| 7 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 8 | acceptance-test-generator | Integration test skeleton from cross-layer contracts | Test skeletons |
| 9 | work-planner | Work plan from all Design Docs **[Stop: Batch approval]** | Work plan |

### Medium Scale Fullstack (3-5 Files) - 7 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 3 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points) | Frontend Design Doc |
| 4 | document-reviewer ×2 | Review each Design Doc (one invocation per doc) | Reviews |
| 5 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 6 | acceptance-test-generator | Integration test skeleton from cross-layer contracts | Test skeletons |
| 7 | work-planner | Work plan from all Design Docs **[Stop: Batch approval]** | Work plan |

### Layer Context in Design Doc Creation

When invoking technical-designer for each layer, pass explicit context. Template varies by scale:

**Large Scale (PRD available)** — Backend Design Doc:
```
Create a backend Design Doc from PRD at [path].
Focus on: API contracts, data layer, business logic, service architecture.
```

**Large Scale (PRD available)** — Frontend Design Doc:
```
Create a frontend Design Doc from PRD at [path].
Reference backend Design Doc at [path] for API contracts and Integration Points.
Focus on: component hierarchy, state management, UI interactions, data fetching.
```

**Medium Scale (no PRD)** — Backend Design Doc:
```
Create a backend Design Doc based on the following requirements:
[Pass requirement-analyzer output including purpose, affectedFiles, affectedLayers, technicalConsiderations]
Focus on: API contracts, data layer, business logic, service architecture.
```

**Medium Scale (no PRD)** — Frontend Design Doc:
```
Create a frontend Design Doc based on the following requirements:
[Pass requirement-analyzer output including purpose, affectedFiles, affectedLayers, technicalConsiderations]
Reference backend Design Doc at [path] for API contracts and Integration Points.
Focus on: component hierarchy, state management, UI interactions, data fetching.
```

### design-sync for Cross-Layer Verification

Call design-sync with `source_design` = frontend Design Doc (created last, referencing backend's Integration Points). design-sync auto-discovers other Design Docs in `docs/design/` for comparison.

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

Each task uses the standard 4-step cycle with layer-appropriate agents:

### backend-task
```
1. task-executor → Implementation
2. Escalation check
3. quality-fixer → Quality check and fixes
4. git commit (on approved: true)
```

### frontend-task
```
1. task-executor-frontend → Implementation
2. Escalation check
3. quality-fixer-frontend → Quality check and fixes
4. git commit (on approved: true)
```

### integration-test-reviewer Placement

When `testsAdded` contains `*.int.test.ts` or `*.e2e.test.ts`:
- Standard flow (integration-test-reviewer after task-executor, before quality-fixer)

## Agent Routing Summary

The orchestrator selects agents by **filename pattern matching** — no conditional inference required:

```
*-backend-task-*   → task-executor + quality-fixer
*-frontend-task-*  → task-executor-frontend + quality-fixer-frontend
```

All other orchestration rules (stop points, structured responses, escalation handling, TodoWrite management) follow the standard subagents-orchestration-guide.
