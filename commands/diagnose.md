---
name: diagnose
description: Investigate problem, verify findings, and derive solutions
---

**Command Context**: Diagnosis flow to identify root cause and present solutions

Target problem: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Investigation → performed by investigator
- Verification → performed by verifier
- Solution derivation → performed by solver

Orchestrator invokes sub-agents and passes structured JSON between them.

**TodoWrite Registration**: Register execution steps in TodoWrite and proceed systematically

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

**Invoke rule-advisor via Task tool**:
```
subagent_type: rule-advisor
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
                 └── confidence < high ─────┘
                      (max 2 iterations)

confidence=high reached → Report
```

**Context Separation**: Pass only structured JSON output to each step. Each step starts fresh with the JSON data only.

## Execution Steps

Register the following in TodoWrite and execute:

### Step 1: Investigation (investigator)

**Task tool invocation**:
```
subagent_type: investigator
prompt: Comprehensively collect information related to the following phenomenon.

Phenomenon: [Problem reported by user]
```

**Expected output**: Evidence matrix, comparison analysis results, causal tracking results, list of unexplored areas, investigation limitations

### Step 2: Investigation Quality Check

Review investigation output:

**Quality Check** (verify JSON output contains the following):
- [ ] comparisonAnalysis
- [ ] causalChain for each hypothesis (reaching stop condition)
- [ ] causeCategory for each hypothesis
- [ ] Investigation covering investigationFocus items (when provided)

**If quality insufficient**: Re-run investigator specifying missing items

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

**Task tool invocation**:
```
subagent_type: verifier
prompt: Verify the following investigation results.

Investigation results: [Investigation JSON output]
```

**Expected output**: Alternative hypotheses (at least 3), Devil's Advocate evaluation, final conclusion, confidence

**Confidence Criteria**:
- **high**: No uncertainty affecting solution selection or implementation
- **medium**: Uncertainty exists but resolvable with additional investigation
- **low**: Fundamental information gap exists

### Step 4: Solution Derivation (solver)

**Task tool invocation**:
```
subagent_type: solver
prompt: Derive solutions based on the following verified conclusion.

Causes: [verifier's conclusion.causes]
Causes relationship: [causesRelationship: independent/dependent/exclusive]
Confidence: [high/medium/low]
```

**Expected output**: Multiple solutions (at least 3), tradeoff analysis, recommendation and implementation steps, residual risks

**Completion condition**: confidence=high

**When not reached**:
1. Return to Step 1 with uncertainties identified by solver as investigation targets
2. Maximum 2 additional investigation iterations
3. After 2 iterations without reaching high, present user with options:
   - Continue additional investigation
   - Execute solution at current confidence level

### Step 5: Final Report Creation

**Prerequisite**: confidence=high achieved

After diagnosis completion, report to user in the following format:

```
## Diagnosis Result Summary

### Identified Causes
[Cause list from verification results]
- Causes relationship: [independent/dependent/exclusive]

### Verification Process
- Investigation scope: [Scope confirmed in investigation]
- Additional investigation iterations: [0/1/2]
- Alternative hypotheses count: [Number generated in verification]

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

- [ ] Executed investigator and obtained evidence matrix, comparison analysis, and causal tracking
- [ ] Performed investigation quality check and re-ran if insufficient
- [ ] Executed verifier and obtained confidence level
- [ ] Executed solver
- [ ] Achieved confidence=high (or obtained user approval after 2 additional iterations)
- [ ] Presented final report to user
