---
name: recipe-quality-profile
description: Proposes repository-specific quality policy for implementation and review and, after confirmation, creates or updates docs/project-context/quality.yaml. Use when asked to create or update a repository quality profile.
disable-model-invocation: true
---

Execute Skill: llm-friendly-context before proposing profile conditions or writing the profile.
Execute Skill: coding-principles to distinguish repository-owned policy from general code-quality knowledge.

## Purpose

Establish repository-specific implementation and code-review acceptance conditions with the user, then create or update `docs/project-context/quality.yaml`.

Requested policy change: $ARGUMENTS

## Profile Contract

```yaml
version: 1
review_dimensions:
  - id: stable-kebab-case-id
    applies_when: Observable condition that makes this repository rule relevant to a change.
    pass: Observable accepted state to verify.
    evidence:
      - "repository/path: section, identifier, or contract"
```

Each dimension owns one repository-specific quality decision. `applies_when` limits its implementation and review surface, `pass` defines the accepted state, and `evidence` identifies why the repository owns the rule.

## Authoring Flow

1. Use the current working repository as the target and read its `docs/project-context/quality.yaml` when present. For an existing profile, use the requested policy change as the update boundary; when none is supplied, ask for it and keep the profile unchanged.
2. Build candidates from acceptance conditions expressed or enforced by repository instructions, contributor documentation, CI, manifests and scripts, schemas and public contracts, tests, or representative implementation patterns. For an update, derive candidates only from the requested policy change and preserve unrelated dimensions.
3. For each candidate, inspect supporting and contradicting evidence wherever it can change the candidate's applicability, accepted state, or repository ownership. Separate observed repository facts from policy choices that require user confirmation.
4. Retain a candidate only when failing its `pass` condition would change implementation acceptance and every repository fact it depends on has cited evidence. Give it the narrowest useful `applies_when`, one positive observable `pass` condition, and consolidate candidates that would produce the same finding and correction. Omit a candidate when required repository evidence is unavailable and report the exact evidence needed.
5. Present proposed additions, changes, and removals, confirm that other dimensions remain unchanged, show the supporting and contradicting evidence, and state unresolved policy choices with their effect on implementation and review acceptance. Obtain explicit user confirmation of a proposal with no unresolved choices before writing.
6. Write only the confirmed profile content. Read the result and verify version `1`, unique IDs, all required fields, observable conditions, readable evidence references, and consistency with the confirmed proposal.

When no repository-specific dimension remains and no profile exists, report that repository evidence supports no profile content and leave the repository unchanged.

## Result

Before confirmation, report:

- proposed additions, changes, and removals, plus the unchanged remainder;
- supporting and contradicting evidence for each modification;
- omitted candidates and the exact missing evidence;
- policy choices requiring the user's decision and their effect on implementation and review acceptance.

After confirmation, report:

- the profile path and whether it was created, updated, or left unchanged;
- dimensions added, changed, or removed;
- evidence used for each changed dimension;
- an exact validation limitation when the result could not be verified.

## Completion Check

- [ ] Every retained dimension changes an implementation or review decision and cites repository or user-confirmed policy evidence
- [ ] Conditions are positive, observable, and limited by `applies_when`
- [ ] The profile contains repository-specific acceptance conditions only
- [ ] Supporting and contradicting evidence were compared where they could change the proposal
- [ ] The user confirmed the complete proposal before the repository write
- [ ] Dimensions outside the update boundary remain unchanged
- [ ] The written profile satisfies the Profile Contract
