---
name: recipe-diagnose
description: Investigate problem, verify findings, and derive solutions
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

**Context**: Diagnosis flow to identify root cause and present solutions

Target problem: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am an orchestrator."

**Local authority gate**: Make this recipe's workflow decisions and validate each returned result directly; delegate semantic deliverable production to the named specialist.

**Execution Method**:
- Investigation → performed by investigator
- Verification → performed by verifier
- Solution derivation → performed by solver

Orchestrator invokes sub-agents and passes structured JSON between them.

At each Agent invocation below, build the prompt as a mechanical extraction: copy the named source values into the exact fields, apply only the declared serialization, then invoke immediately.

**Execution Gate**: Each step below establishes evidence required by the next decision. Complete Steps 0-7 in order, including every required investigation and verification retry. Advance only through the current step's stated quality or coverage condition; invoke solver only after coverage is closed.

## Step 0: Diagnosis Scope Envelope (Before investigator invocation)

Define a semantic scope envelope from the reported problem and repository evidence by recording:

- the user's symptom report and corrections verbatim, with linked evidence; distinguish these from investigation interpretations
- observed and expected behavior, observed location, trigger, occurrence conditions, and onset when known; mark unresolved facts rather than selecting a location or condition by plausibility
- symptom-reachable execution paths and adjacent cases that share the same path, contract, persisted state, or external boundary
- applicable evidence axes: code, history, dependencies, configuration, governing documents, and external specifications
- explicit exclusions from the user or governing artifacts
- newly discovered areas are inside the envelope only when they have one of the relationships above and evidence shows they can change the supported cause set, coverage judgment, or counter-evidence

The envelope bounds relevance. Keep every relationship above active throughout investigation, including after a plausible cause appears.

Resolve facts that change the investigation target from available evidence. Ask the user only for a target-changing fact that the investigation cannot obtain; continue unaffected investigation.

When the user corrects the symptom's location, expected behavior, timing, or conditions, update this envelope and return to path mapping for the corrected symptom. Re-evaluate affected exclusions and failure points through investigator and verifier before invoking solver. Retain evidence that remains valid; prior coverage closure applies only to the symptom and evidence it verified. When new information only adds evidence for the same symptom, reopen only the judgments it affects.

## Diagnosis Flow Overview

```
Problem → scope envelope → investigator → verifier
                         ↑                 │
                         └── named gaps ───┘

coverage closed → design decision gate when applicable → solver → Report
material evidence unavailable → limitation/block report
```

**Context Separation**: Each specialist starts fresh with the current diagnosis scope envelope and the structured results named in its invocation. The envelope supplies the user's report independently of upstream interpretations.

## Execution Steps

### Step 1: Investigation (investigator)

**Agent tool invocation**:
```
subagent_type: investigator
description: "Investigate problem"
prompt: |
  Comprehensively collect information related to the following phenomenon.

  diagnosisScopeEnvelope: [Current Step 0 semantic scope envelope]
```

**Expected output**: scopeAccounting, pathMap (execution paths per symptom), failurePoints (faults found at each node), impactAnalysis per failure point, unexplored areas, investigation limitations

### Step 2: Investigation Quality Check

Review investigation output:

**Quality Check** (verify JSON output contains the following):
- [ ] `pathMap` exists with at least one symptom, and each symptom has at least one path with nodes listed
- [ ] Each failure point has: `location`, `upstreamDependency`, `symptomExplained`, `causalChain` (reaching a stop condition), `checkStatus`, `evidence` with a `source` citing a specific file or location
- [ ] Each failure point has `comparisonAnalysis` (normalImplementation found or explicitly null)
- [ ] `causeCategory` for each failure point is one of: typo / logic_error / missing_constraint / design_gap / external_factor
- [ ] `investigationSources` covers at least 3 distinct source types (code, history, dependency, config, document, external)
- [ ] All nodes on mapped paths have been checked (no path was abandoned after finding the first fault)
- [ ] `scopeAccounting` accounts for every scope-envelope item as investigated, excluded with governing evidence, or unavailable with its potential effect

**If quality insufficient**: Re-run investigator specifying missing items explicitly:
```
prompt: |
  Re-investigate with focus on the following gaps:
  - Missing: [unsatisfied Step 2 Quality Check items, copied as written]

  diagnosisScopeEnvelope: [Current Step 0 semantic scope envelope]

  Use these previous investigation results as context and investigate only the gaps listed above. Return one updated complete investigation JSON, retaining prior evidence that remains valid:
  [Previous investigation JSON]
```

Proceed to verifier once quality is satisfied.

### Step 3: Verification (verifier)

**Agent tool invocation**:
```
subagent_type: verifier
description: "Verify investigation results"
prompt: Verify the following investigation results against the semantic diagnosis scope envelope.

diagnosisScopeEnvelope: [Current Step 0 semantic scope envelope]
Investigation results: [Investigation JSON output]
```

**Expected output**: Scope-envelope coverage, coverage check (missing paths, unchecked nodes), Devil's Advocate evaluation per failure point, failure point evaluation with checkStatus, coverage assessment and disposition

**Coverage Criteria**:
- **sufficient / closed**: Every relevant scope-envelope item and symptom-reachable critical node is accounted for; each failure point is independently evaluated; remaining limitations cannot materially change the supported cause set
- **partial / gaps_remaining**: Named accessible gaps could materially change the supported cause set
- **insufficient / gaps_remaining**: Significant relevant paths or critical nodes remain uninvestigated
- **partial or insufficient / evidence_unavailable**: Unavailable material evidence could change the supported cause set and no available action can close that gap

### Step 4: Coverage Convergence

Branch on verifier output before invoking solver:

- `coverageDisposition: closed`: carry the complete verified cause set forward to the solution boundary, subject to Step 0's symptom and evidence updates.
- `coverageDisposition: gaps_remaining`: return to Step 1 with the current scope envelope, verifier's named gaps, their relevance to the cause set, and the prior investigation JSON. Preserve accounted items whose evidence remains valid. Investigate gaps or reopen judgments only when the current symptom or new evidence can materially change the supported cause set. Closing a gap or establishing that its evidence is unavailable advances convergence; renaming, splitting, or further describing the same gap preserves its existing state. When no available action can produce one of those state changes, return the attempted recovery to verifier for `evidence_unavailable`. Repeat verification after the investigation result passes Step 2.
- `coverageDisposition: evidence_unavailable`: finish with the unavailable-evidence report, including the evidence, attempted recovery, and why it can change the cause set.

Continue investigation while an available action can advance a material gap. Completion is determined by verifier-established semantic closure or by confirmation that no available action can advance the gap.

### Step 5: Solution Boundary

After coverage is closed, pass the complete verified cause set to solver. Ownership, contract, and technical design corrections are ordinary solution candidates when they preserve the confirmed outcome, desired-future requirements, and non-goals; detecting a design gap does not create a user decision. If evidence shows those value boundaries cannot all remain true, or a proposed remedy requires authorization for an irreversible external action, report that exact boundary with the solution evidence instead of inventing a choice.

### Step 6: Solution Derivation (solver)

**Agent tool invocation**:
```
subagent_type: solver
description: "Derive solutions"
prompt: Derive solutions based on the following verified failure points.

diagnosisScopeEnvelope: [Current Step 0 semantic scope envelope]
Confirmed failure points: [verifier's conclusion.confirmedFailurePoints]
Refuted failure points: [verifier's conclusion.refutedFailurePoints]
Failure point relationships: [verifier's conclusion.failurePointRelationships]
Impact analysis: [investigator's impactAnalysis]
Coverage disposition: closed
```

**Expected output**: Materially distinct feasible solutions derived from the complete verified cause set, tradeoff analysis, recommendation and implementation steps, residual risks

**Prerequisite**: `coverageDisposition: closed`

### Step 7: Final Report Creation

For `coverageDisposition: closed`, require `coverageAssessment: sufficient` and use the verified-solution report below.

```
## Diagnosis Result Summary

### Identified Failure Points
[Confirmed failure points from verification results]
- Per failure point: location, symptom explained, finalStatus

### Verification Process
- Path coverage: [Paths traced and nodes checked]
- Additional investigation iterations: [count and named gaps closed]
- Coverage assessment: sufficient
- Coverage disposition: closed

### Recommended Solution
[Solution derivation recommendation]

Rationale: [Selection rationale]

### Implementation Steps
1. [Step 1]
2. [Step 2]
...

### Alternatives
[Alternative description]

### Residual Risks
[solver's residualRisks]

### Post-Resolution Verification Items
- [Verification item 1]
- [Verification item 2]
```

For `coverageDisposition: evidence_unavailable`, return this limitation-only form:

```
## Diagnosis Limited by Unavailable Evidence

### Verified Findings
[Failure points and counter-evidence verified without the missing evidence]

### Material Evidence Gap
- Missing evidence: [exact evidence]
- Recovery attempted: [actions and results]
- Why unavailable: [reason]
- Possible effect on cause set: [what could be confirmed, weakened, added, or refuted]

### Coverage
- Coverage assessment: [partial/insufficient]
- Coverage disposition: evidence_unavailable
```

## Completion Criteria

- [ ] Executed investigator and obtained pathMap, failurePoints, and impactAnalysis
- [ ] Performed investigation quality check and re-ran if insufficient
- [ ] Executed verifier and obtained coverage assessment
- [ ] Closed every material scope-envelope gap or reported material evidence as unavailable
- [ ] Executed solver exactly for `coverageDisposition: closed`; completed the unavailable-evidence report for `coverageDisposition: evidence_unavailable`
- [ ] Presented final report to user
