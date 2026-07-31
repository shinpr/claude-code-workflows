# Hearing Technique

Rules for reaching convergence with the user. These control *when* to converge, not the order of questions.

## Converge last

Use free-form questions while the user is still defining the requirement. Bounded choices (AskUserQuestion) belong after the fields are ready enough to decide between them.

Options an agent generates become the user's answer. For `outcome` and `nonGoals` — the fields whose value is the user's own judgment — ask free-form and let the user write the answer.

## Question budget

Ask one or two questions at a time. A batch of questions returns a batch of shallow answers.

Ask only about fields that are `weak` or `missing`. A field the codebase facts already resolved is `ready`.

## Push back once

When an answer leaves a field `weak`, name the blocked field and why, and ask for a sharper answer.

When the second answer is still weak, offer `weak-but-explicit`: record it as an open question and move on. The hearing has a budget too — an unbounded hearing is its own waste.

## Facts before interpretation

Present what the code shows separately from what it implies for the requirement. Mixing the two produces questions the user cannot act on, which is how a requirements step becomes noise instead of signal.
