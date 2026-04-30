---
name: recipe-diagnose
description: Investigate problem, verify findings, and derive solutions
disable-model-invocation: true
---

**Context**: Diagnosis flow to identify root cause and present solutions

Target problem: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Investigation → performed by investigator
- Verification → performed by verifier
- Solution derivation → performed by solver

Orchestrator invokes sub-agents and passes structured JSON between them.

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
prompt: Identify the essence and required rules for this problem: [Problem reported by user]
```

Confirm from rule-advisor output:
- `taskAnalysis.mainFocus`: Primary focus of the problem
- `mandatoryChecks.taskEssence`: Root problem beyond surface symptoms
- `selectedRules`: Applicable rule sections
- `warningPatterns`: Patterns to avoid

### 0.4 Reflecting in investigator Prompt

**Include the following in investigator prompt**:
1. Problem essence (taskEssence)
2. Key applicable rules summary (from selectedRules)
3. Investigation focus (investigationFocus): Convert warningPatterns to "points prone to confusion or oversight in this investigation"
4. **For change failures, additionally include**:
   - Detailed analysis of the change content
   - Commonalities between cause change and affected area
   - Determination of whether the change is a "correct fix" or "new bug" with comparison baseline selection

## Diagnosis Flow Overview

```
Problem → investigator → verifier → solver ─┐
                 ↑                          │
                 └── coverage insufficient ─┘
                      (max 2 iterations)

coverage sufficient → Report
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

  Phenomenon: [Problem reported by user]

  Problem essence: [taskEssence from Step 0.3]
  Investigation focus: [investigationFocus from Step 0.4]

  [For change failures, additionally include:]
  Change details: [What was changed]
  Affected area: [What broke]
  Shared components: [Commonalities between cause and effect]
```

**Expected output**: pathMap (execution paths per symptom), failurePoints (faults found at each node), impactAnalysis per failure point, unexplored areas, investigation limitations

### Step 2: Investigation Quality Check

Review investigation output:

**Quality Check** (verify JSON output contains the following):
- [ ] `pathMap` exists with at least one symptom, and each symptom has at least one path with nodes listed
- [ ] Each failure point has: `location`, `upstreamDependency`, `symptomExplained`, `causalChain` (reaching a stop condition), `checkStatus`, `evidence` with a `source` citing a specific file or location
- [ ] Each failure point has `comparisonAnalysis` (normalImplementation found or explicitly null)
- [ ] `causeCategory` for each failure point is one of: typo / logic_error / missing_constraint / design_gap / external_factor
- [ ] `investigationSources` covers at least 3 distinct source types (code, history, dependency, config, document, external)
- [ ] Investigation covers `investigationFocus` items (when provided in Step 0.4)
- [ ] All nodes on mapped paths have been checked (no path was abandoned after finding the first fault)

**If quality insufficient**: Re-run investigator specifying missing items explicitly:
```
prompt: |
  Re-investigate with focus on the following gaps:
  - Missing: [list specific missing items from quality check]

  Previous investigation results (for context, do not re-investigate covered areas):
  [Previous investigation JSON]
```

**design_gap Escalation**:

When investigator output contains `causeCategory: design_gap` or `recurrenceRisk: high`:
1. **Insert user confirmation before verifier execution**
2. Use AskUserQuestion:
   "A design-level issue was detected. How should we proceed?"
   - A: Attempt fix within current design
   - B: Include design reconsideration
3. If user selects B, pass `includeRedesign: true` to solver

Proceed to verifier once quality is satisfied.

### Step 3: Verification (verifier)

**Agent tool invocation**:
```
subagent_type: verifier
description: "Verify investigation results"
prompt: Verify the following investigation results.

Investigation results: [Investigation JSON output]
```

**Expected output**: Coverage check (missing paths, unchecked nodes), Devil's Advocate evaluation per failure point, failure point evaluation with checkStatus, coverage assessment

**Coverage Criteria**:
- **sufficient**: Main paths traced, all critical nodes checked, each failure point individually evaluated
- **partial**: Main paths traced, some nodes unchecked or some failure points at blocked/not_reached
- **insufficient**: Significant paths untraced, or critical nodes not investigated

### Step 4: Solution Derivation (solver)

**Agent tool invocation**:
```
subagent_type: solver
description: "Derive solutions"
prompt: Derive solutions based on the following verified failure points.

Confirmed failure points: [verifier's conclusion.confirmedFailurePoints]
Refuted failure points: [verifier's conclusion.refutedFailurePoints]
Failure point relationships: [verifier's conclusion.failurePointRelationships]
Impact analysis: [investigator's impactAnalysis]
Coverage assessment: [sufficient/partial/insufficient]
```

**Expected output**: Multiple solutions (at least 3), tradeoff analysis, recommendation and implementation steps, residual risks

**Completion condition**: coverageAssessment=sufficient

**When not reached**:
1. Return to Step 1 with unchecked areas identified by verifier as investigation targets
2. Maximum 2 additional investigation iterations
3. After 2 iterations without reaching sufficient, present user with options:
   - Continue additional investigation
   - Execute solution at current coverage level

### Step 5: Final Report Creation

**Prerequisite**: coverageAssessment=sufficient achieved

After diagnosis completion, report to user in the following format:

```
## Diagnosis Result Summary

### Identified Failure Points
[Confirmed failure points from verification results]
- Per failure point: location, symptom explained, finalStatus

### Verification Process
- Path coverage: [Paths traced and nodes checked]
- Additional investigation iterations: [0/1/2]
- Coverage assessment: [sufficient/partial/insufficient]

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

## Completion Criteria

- [ ] Executed investigator and obtained pathMap, failurePoints, and impactAnalysis
- [ ] Performed investigation quality check and re-ran if insufficient
- [ ] Executed verifier and obtained coverage assessment
- [ ] Executed solver
- [ ] Achieved coverageAssessment=sufficient (or obtained user approval after 2 additional iterations)
- [ ] Presented final report to user
