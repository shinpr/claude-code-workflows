# [ADR Number] [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded | Rejected]

A created ADR starts at `Proposed` and advances `Proposed` → `Accepted` → `Deprecated`/`Superseded`/`Rejected`.

## Context

[Describe the background and reasons why this decision is needed. Include the essence of the problem, current challenges, and constraints]

## Decision Point

- **Question**: [The technical choice requiring comparison and selection]
- **Why a decision exists**: [Evidence for at least two credible, materially distinct options]
- **Scope boundary**: [Confirmed requirement or existing contract this decision serves]

## Decision

[Describe the actual decision made. Aim for specific and clear descriptions]

### Decision Details

| Item | Content |
|------|---------|
| **Decision** | [The decision in one sentence] |
| **Why this** | [Why this option over alternatives (1-3 lines)] |
| **Known unknowns** | [Uncertainty that changes implementation or verification; otherwise N/A] |
| **Reconsider when** | [Observable condition that changes the option comparison; otherwise N/A] |

## Rationale

[Explain why this decision was made and why it is the best option compared to alternatives]

### Options Considered

Compare credible, materially distinct options supported by current requirements and repository evidence. The evidence determines how many options exist, and relative evidence-backed cost is sufficient. Add a Mermaid option-comparison diagram only when the relationship between options stays unclear in the table below.

| Option | Confirmed product value | Repository fit | Total complexity | Maintainability | Material trade-offs | Reversibility |
|--------|-------------------------|----------------|------------------|-----------------|---------------------|---------------|
| [Option 1] | [value required now] | [fit and evidence] | [materially different activated surfaces and lifecycle costs] | [fit with ownership and representative patterns] | [trade-offs] | [cost and conditions to reverse] |
| [Option 2] | [value required now] | [fit and evidence] | [materially different activated surfaces and lifecycle costs] | [fit with ownership and representative patterns] | [trade-offs] | [cost and conditions to reverse] |

**Selected**: [The smallest sufficient option whose total complexity is justified by confirmed product value and repository evidence]

## Consequences

### Positive Consequences

- [List positive impacts on the project or system]

### Negative Consequences

- [List negative impacts or trade-offs that need to be accepted]

### Neutral Consequences

[List decision-relevant neutral changes, or N/A]

## Architecture Impact

[Describe how this decision affects existing architecture: (1) components that change, (2) new dependencies introduced, (3) architectural constraints added or removed]

## Related Information

- [Links to related ADRs, documents, issues, PRs, etc.]
