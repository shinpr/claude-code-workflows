---
name: llm-friendly-context
description: Clarifies inputs, outputs, success criteria, decisions, and unresolved conditions so downstream agents can execute without guessing. Use when writing or revising LLM-facing prompts, handoffs, planning artifacts, reviews, reports, or generated instructions.
---

# LLM-Friendly Context

The goal is stable downstream execution: the next agent should know what to read, what to do, what counts as success, and which unresolved decisions can change the result.

## Core Rules

1. **Use positive, executable instructions**
   - State what the next agent should do.
   - Convert quality policies into positive criteria.
   - Keep a prohibition only when it protects an irreversible boundary or shipped contract. Name the protected condition and the allowed action.
   - Example: "Preserve existing public API behavior across the documented compatibility cases."

2. **Make vague instructions concrete**
   - Replace subjective terms with observable conditions, paths, commands, schemas, examples, or decision rules.
   - Terms that often need clarification when they leave a decision to the next agent: `appropriate`, `proper`, `related`, `existing behavior`, `optional`, `as needed`, `if needed`, `per convention`, unresolved alternatives, `TBD`, `placeholder`.

3. **Specify output shape**
   - Use the sections, fields, table columns, JSON keys, or checklist items the consumer uses.
   - For handoffs, include only produced artifact paths and status fields that control the next transition.

4. **Provide necessary context**
   - Include the purpose, source artifacts, hard constraints, accepted decisions, and unresolved conditions.
   - Prefer concrete file paths and section hints over broad module names.
   - Follow references while they can change an in-scope decision, action, or verification result.

5. **Decompose complex work into verifiable steps**
   - Split work with 3+ objectives or sequential dependencies into ordered steps.
   - Each step needs a checkpoint: what evidence proves it is complete.

6. **Permit uncertainty explicitly**
   - Resolve missing operational detail from referenced artifacts and repository evidence before treating it as unresolved.
   - Record remaining uncertainty with its effect. Escalate only when it requires a user-owned product, major design, authority, or irreversible-action decision; make reversible repository-local choices within the confirmed boundary.

7. **Keep constraints proportionate**
   - Add only constraints that reduce ambiguity or preserve a real requirement.
   - Keep simple downstream tasks lightweight when the target action, context, and success criteria are already clear.
   - Apply `minimal`, `a few lines`, and explicit line estimates to the completed diff as one total budget.

## Rewrite Patterns

Use these rewrites before treating a prompt, handoff, or artifact as complete.

| Ambiguous form | Rewrite as |
|---|---|
| `optional` used as an unresolved choice | Required, omitted, or required only under a named condition |
| Multiple alternatives that the next agent must choose between | The selected option, or a deterministic decision rule |
| `as needed` / `if needed` | The triggering condition and required action |
| `per convention` | The file, function, test, or documented convention to follow |
| `related files` | Specific paths, globs, or search hints |
| `existing behavior` | The observable behavior, source file, test, API response, or UI state to preserve |
| `placeholder` | Exact temporary value/behavior, allowed dependencies, and verification expectation |
| `TBD` used as a placeholder for required information | A blocking unresolved item with owner, required input, or escalation condition |
| `appropriate` / `proper` | A measurable criterion or checklist |

## Handoff Checklist

Before sending a prompt or artifact to another agent, verify:

- [ ] The target action is explicit.
- [ ] Required input paths, source artifacts, and decision-relevant facts are named.
- [ ] Accepted decisions and constraints use one canonical wording.
- [ ] Output format or expected status fields are specified.
- [ ] Success criteria are observable.
- [ ] Ambiguous expressions have been rewritten or marked as unresolved.
- [ ] Each instruction states the allowed action; each retained prohibition names the protected condition and allowed alternative.
- [ ] The next agent can complete its scope from the supplied purpose, sources, criteria, and evidence, or return an exact user-owned decision.

## Generated Artifact Checklist

Before writing or finalizing a generated document:

- [ ] Each requirement, claim, task, test skeleton, or review finding has enough source context to trace why it exists.
- [ ] Every executable instruction names the target, action, and expected result.
- [ ] Verification steps say what to run or observe and what result proves success.
- [ ] Each instruction states the allowed action; each retained prohibition names the protected condition and allowed alternative.
- [ ] If an artifact is derived from another artifact, copied decisions stay consistent in wording and meaning.
- [ ] If downstream work is blocked by missing information, the artifact records the missing input and escalation condition.
