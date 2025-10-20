---
name: task
description: Execute tasks following appropriate rules with rule-advisor metacognition
---

# Task Execution with Metacognitive Analysis

Task: $ARGUMENTS

## Mandatory Execution Process

**STEP 1: Rule Selection via rule-advisor (REQUIRED)**

Execute rule-advisor to analyze the task and select appropriate rules for: $ARGUMENTS

Provide context about current situation and prerequisites when invoking.

**STEP 2: Utilize rule-advisor Output**

After receiving rule-advisor's JSON response, proceed with:

1. **Understand Task Essence** (from `taskEssence`)
   - Focus on fundamental purpose, not surface-level work
   - Distinguish between "quick fix" vs "proper solution"

2. **Follow Selected Rules** (from `selectedRules`)
   - Review each selected rule section
   - Apply concrete procedures and guidelines

3. **Recognize Past Failures** (from `pastFailurePatterns`)
   - Avoid repeating same mistakes
   - Apply suggested countermeasures

4. **Execute First Action** (from `firstActionGuidance`)
   - Start with recommended action
   - Use suggested tools first

**STEP 3: Create Task List with TodoWrite**

Break down the task based on rule-advisor's guidance:
- Reflect `taskEssence` in task descriptions
- Apply `firstActionGuidance` to first task
- Restructure tasks considering `warningPatterns`
- Set appropriate priorities

**STEP 4: Execute Implementation**

Proceed with task execution following:
- Selected rules from rule-advisor
- TodoWrite task structure
- Quality standards from applicable rules

## Important Notes

- **Never skip rule-advisor**: This is a mandatory metacognitive step
- **Update TodoWrite after rule-advisor**: Always reflect insights in task structure
- **Follow firstActionGuidance**: Start with recommended action
- **Monitor warningPatterns**: Watch for failure patterns throughout execution