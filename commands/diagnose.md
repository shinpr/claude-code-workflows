---
name: diagnose
description: Investigate problem, verify findings, and derive solutions
---

**Command Context**: Diagnosis flow to identify root cause and present solutions

Target problem: $ARGUMENTS

**TodoWrite Registration**: Register execution steps in TodoWrite and proceed systematically

## Diagnosis Flow Overview

```
Problem → Step1:Investigation → Step2:Complexity Assessment → [Step3:Verification] → Step4:Solution Derivation → Step5:Report
                                                    ↓
                                               If simple,
                                               skip Step3
```

**Context Separation**: Pass only structured JSON output to each step. Each step starts fresh with the JSON data only.

## Execution Steps

### Step 1: Investigation

**Task tool invocation**:
```
subagent_type: investigator
prompt: Comprehensively collect information related to the following phenomenon.

Phenomenon: [Problem reported by user]
```

**Expected output**: Evidence matrix, list of unexplored areas, investigation limitations

### Step 2: Complexity Assessment

Review Step 1 output and assess:

**Step 3 execution conditions (if any apply)**:
- 2 or more hypotheses have similar levels of evidence
- Only indirect evidence exists, no direct evidence
- 2 or more unexplored areas exist
- Contradicting evidence exists for hypotheses
- Problem has recurred in the past

**Step 3 skip conditions (all must apply)**:
- One hypothesis is clearly dominant (direct evidence exists, no refutation)
- Almost no unexplored areas
- One-time problem (no recurrence history)

Report assessment results to user and explain reasoning if skipping Step 3.

### Step 3: Verification (complex cases only)

**Task tool invocation**:
```
subagent_type: verifier
prompt: Verify the following investigation results.

Investigation results: [Step 1 JSON output]
```

**Expected output**: Alternative hypotheses (at least 3), Devil's Advocate evaluation, final conclusion, confidence

### Step 4: Solution Derivation

**Task tool invocation**:
```
subagent_type: solver
prompt: Derive solutions based on the following verified conclusion.

Conclusion: [Conclusion portion from Step 3 or Step 1]
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

- [ ] Step 1: Executed investigation and obtained evidence matrix
- [ ] Step 2: Performed complexity assessment and reported results to user
- [ ] Step 3: (If complex) Executed verification
- [ ] Step 4: Executed solution derivation
- [ ] Step 5: Presented final report to user
