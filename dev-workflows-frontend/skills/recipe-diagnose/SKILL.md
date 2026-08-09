---
name: recipe-diagnose
description: Investigate problem, verify findings, and derive solutions
disable-model-invocation: true
---

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

**Task Registration**: Register execution steps using TaskCreate and proceed systematically. Update status using TaskUpdate.

## Step 0: Problem Structuring (Before investigator invocation)

### 0.1 Problem Type Determination

| Type | Criteria |
|------|----------|
| Change Failure | Indicates some change occurred before the problem appeared |
| New Discovery | No relation to changes is indicated |

If uncertain, ask the user whether any changes were made right before the problem occurred.

### 0.2 Information Supplementation for Change Failures

If the following are unclear, **ask with AskUserQuestion** before proceeding:
- What was changed (cause change)
- What broke (affected area)
- Relationship between both (shared components, etc.)

### 0.3 Problem Essence Understanding

**Invoke rule-advisor via Agent tool**:
```
subagent_type: rule-advisor
description: "Problem essence analysis"
prompt: Identify the essence and required rules for this problem: [user-reported problem verbatim]
```

Confirm from rule-advisor output:
- `taskAnalysis.essence`: Primary purpose of the diagnosis
- `metaCognitiveGuidance.taskEssence`: Root problem beyond surface symptoms
- `selectedRules`: Applicable skill and section names
- `warningPatterns`: Patterns to avoid

Execute each selected skill by its `skill` name and apply the named sections in the context of the complete skill before constructing the investigator prompt.

### 0.4 Diagnosis Scope Envelope

Before investigation, define a semantic scope envelope from the confirmed problem and repository evidence by recording:

- phenomenon and occurrence conditions to explain
- symptom-reachable execution paths and adjacent cases that share the same path, contract, persisted state, or external boundary
- applicable evidence axes: code, history, dependencies, configuration, governing documents, and external specifications
- explicit exclusions from the user or governing artifacts
- newly discovered areas are inside the envelope only when they have one of the relationships above and evidence shows they can change the supported cause set, coverage judgment, or counter-evidence

The envelope bounds relevance. Keep every relationship above active throughout investigation, including after a plausible cause appears.

## Diagnosis Flow Overview

```
Problem → scope envelope → investigator → verifier
                         ↑                 │
                         └── named gaps ───┘

coverage closed → design decision gate when applicable → solver → Report
material evidence unavailable → limitation/block report
```

**Context Separation**: Pass only structured JSON output to each step. Each step starts fresh with the JSON data only.

## Execution Steps

Register the following using TaskCreate and execute:

### Step 1: Investigation (investigator)

**Agent tool invocation**:
```
subagent_type: investigator
description: "Investigate problem"
prompt: |
  Comprehensively collect information related to the following phenomenon.

  Phenomenon: [Problem reported by user verbatim]
  Problem essence: [exact `metaCognitiveGuidance.taskEssence` from Step 0.3]
  diagnosisScopeEnvelope: [Step 0.4 semantic scope envelope]
  Selected rules: [complete `selectedRules` from Step 0.3]
  Warning patterns: [complete `warningPatterns` from Step 0.3]

  [For change failures, additionally include:]
  Change details: [user-confirmed change-details statement verbatim]
  Affected area: [user-confirmed affected-area statement verbatim]
  Stated relationship: [user-confirmed relationship statement verbatim]
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
- [ ] Investigation accounts for each supplied `warningPatterns` item
- [ ] All nodes on mapped paths have been checked (no path was abandoned after finding the first fault)
- [ ] `scopeAccounting` accounts for every scope-envelope item as investigated, excluded with governing evidence, or unavailable with its potential effect

**If quality insufficient**: Re-run investigator specifying missing items explicitly:
```
prompt: |
  Re-investigate with focus on the following gaps:
  - Missing: [unsatisfied Step 2 Quality Check items, copied as written]

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

diagnosisScopeEnvelope: [Step 0.4 semantic scope envelope]
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

- `coverageDisposition: closed`: freeze the complete verified cause set and continue to the applicable design decision gate.
- `coverageDisposition: gaps_remaining`: return to Step 1 with only verifier's named gaps, their relevance to the cause set, and the prior investigation JSON. Keep `scopeAccounting` monotonic by preserving every accounted item. Add a gap only when new evidence identifies a distinct previously unaccounted gap within the semantic scope envelope that can materially change the supported cause set. Closing a gap or establishing that its evidence is unavailable advances convergence; renaming, splitting, or further describing the same gap preserves its existing state. When no available action can produce one of those state changes, return the attempted recovery to verifier for `evidence_unavailable`. Repeat verification after the investigation result passes Step 2.
- `coverageDisposition: evidence_unavailable`: finish with the unavailable-evidence report, including the evidence, attempted recovery, and why it can change the cause set.

Continue investigation while an available action can advance a material gap. Completion is determined by verifier-established semantic closure or by confirmation that no available action can advance the gap.

### Step 5: Design Decision Gate

After coverage is closed, inspect the verified cause set. When resolving a confirmed failure point requires reconsidering ownership, a contract, or an approved design decision, including `causeCategory: design_gap`, use AskUserQuestion:
"A verified design-level issue was detected. How should we proceed?"
- A: Attempt fix within current design
- B: Include design reconsideration

Pass `includeRedesign: true` to solver only when the user selects B. This gate remains before solution selection; investigation and verification proceed independently of the choice.

### Step 6: Solution Derivation (solver)

**Agent tool invocation**:
```
subagent_type: solver
description: "Derive solutions"
prompt: Derive solutions based on the following verified failure points.

Confirmed failure points: [verifier's conclusion.confirmedFailurePoints]
Refuted failure points: [verifier's conclusion.refutedFailurePoints]
Failure point relationships: [verifier's conclusion.failurePointRelationships]
Impact analysis: [investigator's impactAnalysis]
Coverage disposition: closed
[When set by Step 5] Include redesign: true
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
