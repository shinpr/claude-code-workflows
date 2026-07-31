# Convergence Criteria

Judgment rules for the four convergence fields. Read when eliciting or evaluating them.

## outcome

One observable result the change must produce, not a feature list.

A requirement that cannot be traced to the outcome is excess: drop it, or have the user widen the outcome to cover it.

## requirements[] — layer separation

| Layer | Meaning | Buildable now |
|-------|---------|---------------|
| `current-state` | Behavior that already exists | No — these are facts, not work |
| `desired-future` | The change the user is asking for | Yes |
| `speculative` | An idea the user raised without deciding on | No — record with a deferral reason |

Flattening these three into one requirement list is what makes a bloated plan look coherent, because every item then reads as equally required. Label each item; ask when a label is unclear rather than inferring it.

## nonGoals[]

Capabilities deliberately excluded from this change, authored by the user.

Present the cost and reversibility findings first, then ask what to leave out. `userAgreedNone` records that the user considered exclusions and found none — an agent cannot set it.

An adjacent capability the agent noticed is a question for the user, not a non-goal.

## cost

Estimate effort after reading the code, and state the rationale with the files inspected.

Report an effort trap when inspection or research shows the requirement costs materially more than its shape suggests:

- a contract used in more call sites than the requirement implies
- a dependency whose current version lacks an assumed capability (verify with WebSearch)
- a migration or backfill the requirement needs but does not name

## Challenge intensity

Match the challenge to what a wrong decision costs, so cheap requirements stay cheap to accept.

| Cost and reversibility | Challenge |
|------------------------|-----------|
| Low cost, reversible — additive, flagged, or easily deleted | Record the fields and accept the requirement |
| Medium cost, or reverting would touch other work | Present the cost and one lower-cost alternative |
| High cost or irreversible — public contract, persisted data shape, dependency swap | Present the trade-off and require a user decision before design |

## Solution-in-disguise test

When the requirement names a mechanism rather than an outcome ("add a cache layer", "introduce a queue"), state three materially different ways to reach the same outcome.

When three exist, the named mechanism is one option among several — present them for a user decision. When the mechanism is genuinely the only route, record that and proceed.
