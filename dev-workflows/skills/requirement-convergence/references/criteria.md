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

Present the cost band and its unknowns first, then ask what to leave out. `userAgreedNone` records that the user considered exclusions and found none — an agent cannot set it.

An adjacent capability the agent noticed is a question for the user, not a non-goal.

## cost

Cost follows structure and count, not behavior, so it is decided from these inputs alone:

| Input | How it is obtained |
|-------|--------------------|
| Number and kind of targets to change | Grep/Glob over the affected files |
| Number of boundaries crossed | Affected path composition plus import and caller tracing |
| Whether an equivalent already exists (reuse or new) | Grep for a similar name or shape |
| Whether persisted state needs converting | Whether a schema or migration path is in the change set |
| Whether verification support already exists | Glob for the area's existing test harness |
| What remains unknown | WebSearch for a dependency's current capability; anything the above cannot resolve |

Reading what the code *does* answers whether the change is correct, not what it costs, and belongs to the codebase analysis that precedes design.

Record `cost` as one band, the inputs above that place it, and the remaining unknowns. A flow declares `cost` out of scope only where its own steps say so.

## Challenge intensity

The band's only job is to select a row here, so cheap requirements stay cheap to accept.

| Band | Meaning | Challenge |
|------|---------|-----------|
| `low-reversible` | Additive, flagged, or easily deleted | Record the fields and accept the requirement |
| `medium` | Reverting would touch other work | Present the cost and one lower-cost alternative |
| `high-irreversible` | Public contract, persisted data shape, or dependency swap | Present the trade-off and require a user decision before design |

Report an unknown that would move the band up as a blocking question rather than assuming the lower band.

## Solution-in-disguise test

When the requirement names a mechanism rather than an outcome ("add a cache layer", "introduce a queue"), state three materially different ways to reach the same outcome.

When three exist, the named mechanism is one option among several — present them for a user decision. When the mechanism is genuinely the only route, record that and proceed.
