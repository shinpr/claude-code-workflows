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

Evaluation requests, speculative ideas, and prescribed mechanisms stay in active request context as candidates. `requirements[]` and durable requirement/design documents receive only candidates explicitly promoted by the user to `desired-future`; an accepted ADR may retain evaluated options as decision history.

Flattening current state, desired future, and candidates into one requirement list makes a bloated plan look coherent because every item then reads as equally required. Label each build-relevant item; ask when its current-state or desired-future role is unclear rather than inferring it.

## nonGoals[]

Capabilities deliberately excluded from this change, authored by the user.

Present the cost band and its unknowns first, then ask what to leave out. `userAgreedNone` records that the user considered exclusions and found none — an agent cannot set it.

An adjacent capability the agent noticed stays out of both `requirements[]` and the exclusion hearing. The user need not reject a capability they did not request.

## cost

Estimate rough lifecycle cost from affected responsibilities, contract consumers, reusable behavior, state/migration needs and existing verification support. Inspect enough representative behavior to decide whether an apparent reuse or structural match actually serves the requirement. Use analyzer evidence when supplied. Stop before implementation-level investigation once further detail cannot change scope, cost band or the user decision.

Record `cost` as one evidence-supported band and its remaining unknowns. When an unresolved condition could raise the band, state that condition and the higher-band consequence in the existing cost evidence so scope confirmation exposes the trade-off. A flow declares `cost` out of scope only where its own steps say so.

## Challenge intensity

The band's only job is to select a row here, so cheap requirements stay cheap to accept.

| Band | Meaning | Challenge |
|------|---------|-----------|
| `low-reversible` | Additive, flagged, or easily deleted | Record the fields and accept the requirement |
| `medium` | Reverting would touch other work | Present cost and a lower-cost alternative when a materially distinct sufficient option exists |
| `high-irreversible` | Public contract, persisted data shape, or dependency swap | Present the trade-off; obtain a user decision when a required outcome, explicit constraint or irreversible-action authority must change |

Resolve repository-answerable uncertainty locally. Ask the user only when a remaining unknown changes required scope, constraints or authority; otherwise record its cost effect and keep independent work moving.

## Solution-in-disguise test

When a request names a mechanism rather than an outcome ("add a cache layer", "introduce a queue"), first determine whether selecting that mechanism is required to confirm the current outcome or scope. If it is, compare only the materially distinct repository-supported routes needed for that decision and include the named mechanism as one candidate. If it is not, retain the mechanism as an unelected candidate and continue without generating alternatives.
