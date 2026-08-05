---
name: task-analyzer
description: Selects the smallest set of task-execution skills and metacognitive safeguards for standalone task and diagnosis workflows.
---

# Task Analyzer

Use [skills-index.yaml](references/skills-index.yaml) as the available skill catalog. Documentation routing and workflow Structural Scale belong to `documentation-criteria`, not this skill.

## Process

### 1. Identify Task Essence

State the observable purpose beyond the surface operation. Preserve an explicitly invoked recipe or governing artifact as the entry point.

### 2. Match Skills to Task Evidence

Extract task-evidence tags and match them to the catalog. Add a skill only when its rules change the requested action, verification, or handling of a concrete risk.

| Task evidence | Consider |
|---|---|
| Observed defect or failure | `ai-development-guide`, `testing-principles` |
| Code implementation or refactoring | `coding-principles`, `testing-principles` |
| Requested design artifact | `documentation-criteria` |
| Multiple credible implementation strategies requiring cost comparison | `implementation-approach` |
| Observable cross-boundary behavior that cannot be proven more cheaply | `integration-e2e-testing` |
| React or TypeScript frontend code | `typescript-rules` and applicable frontend testing rules |

Select in this order:

1. `governing`: defines the requested output or selected workflow.
2. `risk-control`: changes proof or handling of an activated failure mode.
3. `supplementary`: resolves a concrete remaining risk.

### 3. Generate Execution Guidance

Generate only warnings and questions that can change skill selection, verification, escalation, or the first action. Prefer the smallest evidence-gathering action that can establish the target or cause.

Task analysis does not own Structural Scale, file-count estimation, documentation requirements, approval gates, implementation phases, or subagent topology.

## Output

```yaml
taskAnalysis:
  essence: <fundamental purpose>
  extractedTags: [<task evidence tag>]
selectedRules:
  - skill: <skill name from skills-index.yaml>
    priority: <governing|risk-control|supplementary>
    reason: <how it changes execution or verification>
    sections: [<relevant section name>]
metaCognitiveGuidance:
  taskEssence: <fundamental purpose>
  pastFailures: [<applicable known failure pattern>]
  potentialPitfalls: [<task-specific risk>]
  firstStep:
    action: <smallest evidence-gathering or execution action>
    rationale: <why it comes first>
metaCognitiveQuestions: [<question that can change the approach>]
warningPatterns:
  - pattern: <applicable warning>
    mitigation: <proportionate response>
```

Return skill names and relevant section names. The consumer loads the named skills; filesystem paths, catalog metadata, and skill bodies remain at their source.

## Completion Check

- Task essence, tags, and first action are tied to the current request.
- Every selected skill changes execution, verification, or a concrete risk response.
- The selected set is the smallest sufficient set.
- Questions and warnings are task-specific and proportionate.
- Structural Scale and workflow routing remain with their owning process.
