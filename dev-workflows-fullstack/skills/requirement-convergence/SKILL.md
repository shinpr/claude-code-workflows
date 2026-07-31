---
name: requirement-convergence
description: Converges what to build before design starts by separating outcome from requirement layers, recording user-authored non-goals, and grounding effort in inspected code. Use when a new feature or change request enters a workflow, or when scope, "how far do we go", or "what we are not doing" needs deciding.
---

# Requirement Convergence

## Purpose

Requirements arrive bloated, ambiguous, or aimed at the wrong outcome. A capable model reconciles all three into a coherent plan and builds it faithfully — delivering exactly what was asked for when what was asked for was wrong.

This skill converges **what to build**. `implementation-approach` Design Convergence converges **how to build it** after the what is settled.

## Scope Boundaries

**In scope**: the convergence fields, who elicits versus who judges them, the hearing technique that reaches them, and where the result persists.

**Out of scope**: opportunity discovery, hypothesis validation, and confidence scoring (product discovery workflows own these). Design and implementation decisions (`implementation-approach`). Scale and document requirements (`documentation-criteria`).

## Convergence Fields

| Field | Pass condition |
|-------|----------------|
| `outcome` | One observable result. A requirement that does not serve it is excess. |
| `requirements[]` | Every item labeled `current-state`, `desired-future`, or `speculative`. |
| `nonGoals[]` | Authored by the user, or the user stated there are none. |
| `cost` | Effort estimate whose rationale cites inspected code, plus any effort traps found. |

Each field carries a readiness label: `ready` / `weak` / `missing` / `weak-but-explicit` (weak, and the user agreed to leave it unresolved).

Requirements are converged when every field is `ready` or `weak-but-explicit`. Only the user sets `weak-but-explicit`.

Judgment rules per field: [references/criteria.md](references/criteria.md).

## Hearing Protocol

The orchestrator owns this step because it requires AskUserQuestion. Run it before requirement analysis.

1. Read the codebase for the requirement's existing behavior and affected areas. State findings as facts before interpreting them.
2. Present those facts, then ask free-form questions for fields that are `weak` or `missing`, so the user authors the answer instead of picking from agent-generated options.
3. Repeat until every field is `ready` or `weak-but-explicit`.

Convergence timing, question budget, and pushback rules: [references/dialogue.md](references/dialogue.md).

## Storage Protocol

| Carrier | Holds | Written by |
|---------|-------|------------|
| requirement-analyzer JSON | All four fields with readiness labels | requirement-analyzer (emitted in its response, not to disk) |
| PRD `Future / Out of Scope` when a PRD exists, otherwise Design Doc `Requirement Convergence` | `outcome`, `nonGoals`, and `speculative` requirements with their deferral reason | prd-creator / technical-designer |

Work that produces a PRD or Design Doc persists the result. Smaller work carries it in the JSON only.

## Reference Protocol (For Downstream Consumers)

1. Read the convergence fields from the requirement-analyzer JSON supplied in the prompt.
2. Treat `nonGoals` and `speculative` requirements as excluded from the current change. A `speculative` item becomes buildable only after the user promotes it to `desired-future`.
3. Treat a `weak-but-explicit` field as a recorded open question rather than a settled decision, and escalate when the work depends on resolving it.

## Quality Checklist

- [ ] Codebase facts were stated before questions were asked
- [ ] `nonGoals` came from the user, or the user stated there are none
- [ ] Every requirement carries a layer label
- [ ] `cost` rationale names the files inspected
- [ ] Every field is `ready` or `weak-but-explicit`

## References

- [references/criteria.md](references/criteria.md) — judgment rules per field, challenge intensity, solution-in-disguise test
- [references/dialogue.md](references/dialogue.md) — convergence timing, question budget, pushback
