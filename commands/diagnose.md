---
name: diagnose
description: Investigate problem, verify findings, and derive solutions
---

**Command Context**: Diagnosis flow to identify root cause and present solutions

Target problem: $ARGUMENTS

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

### 0.3 Reflecting in investigator Prompt

**For change failures, include the following as mandatory investigation items in prompt**:
1. Analyze cause change content in detail
2. Identify commonalities between cause change and affected area
3. Determine if cause change is a "correct fix" or "new bug" and select comparison baseline based on determination

## Diagnosis Flow Overview

```
Problem → Investigation → Quality Check → [Verification] → Solution Derivation
                              ↓
                         If simple,
                         skip Verification
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

### Step 2: Quality Check and Verification Decision

Review investigation output and assess:

**Investigation Quality Check** (verify JSON output contains the following):
- [ ] comparisonAnalysis
- [ ] causalChain for each hypothesis (reaching stop condition)
- [ ] causeCategory for each hypothesis

**If quality insufficient**: Re-run investigation specifying missing items

**Verification execution conditions (if any apply)**:
- 2 or more hypotheses have similar levels of evidence
- Only indirect evidence exists, no direct evidence
- 2 or more unexplored areas exist
- Contradicting evidence exists for hypotheses
- Problem has recurred in the past
- impactAnalysis.impactScope contains 3 or more affected locations
- impactAnalysis.recurrenceRisk is high

**Verification skip conditions (all must apply)**:
- One hypothesis is clearly dominant (direct evidence exists, no refutation)
- Almost no unexplored areas
- One-time problem (no recurrence history)

Report assessment results to user and explain reasoning if skipping verification.

### Step 3: Verification (verifier) *For complex cases

**Task tool invocation**:
```
subagent_type: verifier
prompt: Verify the following investigation results.

Investigation results: [Investigation JSON output]
```

**Expected output**: Alternative hypotheses (at least 3), Devil's Advocate evaluation, final conclusion, confidence

### Step 4: Solution Derivation (solver)

**Task tool invocation**:
```
subagent_type: solver
prompt: Derive solutions based on the following verified conclusion.

Conclusion: [Conclusion portion from verification or investigation]
Confidence: [high/medium/low]
```

**Expected output**: Multiple solutions (at least 3), tradeoff analysis, recommendation and implementation steps

### Step 5: Final Report Creation

After diagnosis completion, report to user in the following format:

```
## Diagnosis Result Summary

### Identified Cause
[Verification result conclusion]
Confidence: [high/medium/low]

### Verification Process
- Investigation scope: [Scope confirmed in investigation]
- Verification performed: [Yes/No]
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

### Remaining Uncertainty
- [Uncertainty 1]
- [Uncertainty 2]

### Post-Resolution Verification Items
- [Verification item 1]
- [Verification item 2]
```

## Completion Criteria

- [ ] Executed investigation and obtained evidence matrix, comparison analysis, and causal tracking
- [ ] Performed investigation quality check and re-ran if insufficient
- [ ] Made verification decision and reported results to user
- [ ] (If complex) Executed verification
- [ ] Executed solution derivation
- [ ] Presented final report to user
