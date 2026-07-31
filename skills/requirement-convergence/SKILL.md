---
name: requirement-convergence
description: Separates the outcome a change must produce from the requirements proposed to reach it, records what the user excluded, and bands cost from structure. Use when a requirement enters a workflow, before design begins.
---

# Requirement Convergence

## Purpose

Requirements arrive bloated, ambiguous, or aimed at the wrong outcome. A capable model reconciles all three into a coherent plan and builds it faithfully — delivering exactly what was asked for when what was asked for was wrong.

This skill converges **what to build**. How to build it, and which documents the change requires, are settled after the what is.

## Convergence Fields

| Field | Pass condition |
|-------|----------------|
| `outcome` | One observable result. A requirement that does not serve it is excess. |
| `requirements[]` | Every item labeled `current-state`, `desired-future`, or `speculative`. |
| `nonGoals[]` | Authored by the user, or the user stated there are none. |
| `cost` | A band with the structural evidence that places it, plus the unknowns that remain. |

`cost` is a rough band, not the effort estimate a work plan schedules against; requirements cannot support person-days. Its unknowns carry more decision weight than its size.

Each field carries a readiness label: `ready`, `weak`, or `weak-but-explicit` (weak, and the user agreed to leave it unresolved). Only the user sets `weak-but-explicit`. Requirements are converged when every applicable field is `ready` or `weak-but-explicit`.

Judgment rules per field: [references/criteria.md](references/criteria.md).

## Hearing Protocol

Eliciting requires user interaction, so the orchestrator owns it. It runs after the analysis that produced the scope facts, because the orchestrator investigates nothing itself.

Register these steps before starting and record each step's evidence as it completes:

| Step | Action | Completion evidence |
|------|--------|---------------------|
| 1 | State the scope facts the analysis produced, then separately what they imply for the requirement | Facts listed with the analysis output they came from |
| 2 | Ask about the fields below `ready`, at most two questions per message | One question per field below `ready` |
| 3 | Record each answer as that field's value | The value uses wording the user supplied, not wording the hearing offered |
| 4 | Re-ask once when a recorded value still fails its pass condition, then mark the field `weak-but-explicit` when the user agrees to leave the second answer as it stands | Two recorded answers, or the user's agreement to stop |
| 5 | Hand the record to the step that judges the fields | An updated record returned from that step |

Step 3's evidence is what keeps the hearing reviewable: a value restating the hearing's own candidates fails it, so the user's judgment survives however the question was put.

## Storage Protocol

| Carrier | Holds | Written by |
|---------|-------|------------|
| The convergence record in the judging step's output | Every field with its readiness label | Whichever step judged them |
| PRD `Success Criteria` and `Future / Out of Scope` | `outcome`; `nonGoals` and `speculative` requirements with origin `user` | The agent that owns the PRD |
| Design Doc `Requirement Convergence` | The same when no PRD exists, and the fields left `weak-but-explicit` in every case | The agent that owns the Design Doc |

A flow that produces neither document carries the record in its own context to the next step.

## Reference Protocol (For Downstream Consumers)

1. Read the convergence record from the prompt.
2. Treat `nonGoals` and `speculative` requirements as excluded from the current change. A `speculative` item becomes buildable only after the user promotes it to `desired-future`.
3. Treat a `weak-but-explicit` field as a recorded open question rather than a settled decision, and escalate when the work depends on resolving it.

## Quality Checklist

- [ ] Scope facts were presented before questions were asked
- [ ] `nonGoals` came from the user, or the user stated there are none
- [ ] Every applicable field is `ready`, or `weak-but-explicit` by the user's agreement

## References

- [references/criteria.md](references/criteria.md) — judgment rules per field, cost inputs, challenge intensity, solution-in-disguise test
