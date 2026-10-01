# Lite Mode

Lite Mode is a user-selected trade of intermediate assurance for lower cost. As an explicit user instruction, it takes precedence over recipe steps, checklists, gates, and stop-point triggers that require the calls it omits. Every other phase, stop point, and rule applies unchanged.

## Omitted Calls

| Call | Lite Mode behavior |
|---|---|
| code-verifier | Omit. The step that consumes its result proceeds without it; document-reviewer receives no `verification_evidence`. |
| design-sync | Omit. A stop point that follows it occurs when its preceding step completes. |
| security-reviewer | Omit. code-reviewer alone forms the post-implementation review set. |
| Per-task quality fixer in a Work Plan task set | Omit per-task cycle step 3. When step 2 would proceed to step 3, proceed to step 4. Run the Final Quality Run instead. |

A single-cycle flow without a Work Plan task set, such as Small, keeps its quality fixer call because that call is already the final run.

## Final Quality Run

After the last task commit and before post-implementation review, invoke the layer-appropriate quality fixer once per layer with completed tasks, passing:

- `direct_scope`: the Work Plan's outcome and exclusions
- `governing_sources`: the Work Plan path and that layer's completed task file paths
- `observable_verification`: the Operation Verification Methods of those task files
- `qualityCommand`: when supplied by the caller or recorded in those task files

Route the result as per-task cycle step 3. For `stub_detected`, return to step 1 for each owning task file with its `incompleteImplementations` items unchanged, then repeat the Final Quality Run. Retain `verification_incomplete` for the completion report. Commit the resulting fixes once through Commit Boundary Check, appending verification trailers for retained limitations. This run replaces the retained verification limitation retry.
