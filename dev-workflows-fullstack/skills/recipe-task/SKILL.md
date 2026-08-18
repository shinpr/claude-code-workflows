---
name: recipe-task
description: Execute tasks following appropriate rules with rule-advisor metacognition
disable-model-invocation: true
---

**Explicit User Instruction**: The user explicitly instructs and authorizes every subagent call named in this recipe. Execute each applicable call when its prerequisites are met.

Execute Skill: llm-friendly-context before writing Agent prompts, handoffs, or generated artifacts.
Execute Skill: subagents-orchestration-guide before making workflow decisions, invoking agents, or resolving findings.

# Task Execution with Metacognitive Analysis

Task: $ARGUMENTS

## Mandatory Execution Process

**Step 1: Rule Selection via rule-advisor (REQUIRED)**

Invoke rule-advisor using Agent tool:
- `subagent_type`: "dev-workflows-fullstack:rule-advisor"
- `description`: "Rule selection"
- `prompt`: "Task: $ARGUMENTS. Select appropriate rules and perform metacognitive analysis."

**Step 2: Utilize rule-advisor Output**

After receiving rule-advisor's JSON response, proceed with:

1. **Understand Task Essence** (from `taskAnalysis.essence`)
   - Focus on fundamental purpose, not surface-level work
   - Distinguish between "quick fix" vs "proper solution"

2. **Follow Selected Rules** (from `selectedRules`)
   - Execute each selected skill by its `skill` name and read it completely
   - Apply the named sections in the context of the complete skill

3. **Recognize Past Failures** (from `metaCognitiveGuidance.pastFailures`)
   - Apply countermeasures for known failure patterns
   - Use suggested alternative approaches

4. **Execute First Action** (from `metaCognitiveGuidance.firstStep`)
   - Start with recommended action
   - Use suggested tools first

**Step 3: Bind the Execution Sequence**

Before implementation, derive the smallest dependency-ordered sequence required by the rule-advisor result. Its first gate applies and maps the selected rules; its final gate verifies those rules and the requested outcome. Execute one gate at a time, advancing only when its required evidence exists. Add or reorder a gate only when new evidence changes a dependency or completion condition.

**Step 4: Execute Implementation**

Proceed with task execution following:
- Start with `metaCognitiveGuidance.firstStep` action from rule-advisor
- Selected rules from rule-advisor
- Dependency-ordered execution sequence from Step 3
- Quality standards from the selected skills and sections named by rule-advisor
- Monitor warningPatterns flags throughout execution and adjust approach when triggered
