# Task: [Task Name]

Metadata:
- Source Work Plan Task: [P1-T1]
- Dependencies: none | [Work Plan task IDs]
- Executor lane: backend|frontend
- Rollback boundary: [copied from Work Plan]

## Implementation Outcome

[Repository change that completes the source Work Plan task.]

## Governing Sources

Preserve every directly constraining Work Plan citation unchanged so the executor reads the authoritative contract directly.

- [Design Doc path (§ section); AC IDs]
- [UI Spec or ADR path (§ section), when directly constraining]

## Target Files

- [Implementation file or responsibility]
- [Test file, when required]

## Investigation Targets

Read the smallest representative set needed to implement the task:

- [Governing document section]
- [Existing implementation]
- [Adjacent representative test]

## Investigation Notes

- [Record only facts that change implementation, scope, or verification.]

## Implementation Steps

1. Read the Investigation Targets and record relevant repository facts.
2. Add or update the focused test required by the cited verification strategy.
3. Implement the smallest repository change that completes the outcome.
4. Refactor within the same outcome while focused checks remain green.
5. Run task verification.

## Operation Verification Methods

- **Verification method**: [Governing verification method or repository command]
- **Success criteria**: [Observable result tied to cited ACs]
- **Verification level**: [L1 functional operation | L2 passing tests | L3 successful build — per implementation-approach]

## Verification Focus

Include only when the Work Plan supplies it.

- **Primary failure**: [Copied unchanged from Work Plan]
- **Observable check**: [Copied unchanged from Work Plan]

## Completion Criteria

- [ ] The cited implementation outcome is complete
- [ ] The cited ACs are satisfied
- [ ] Required focused tests pass
- [ ] Operation verification succeeds
- [ ] Verification Focus is satisfied when present

## Notes

- [Execution-relevant information only]
