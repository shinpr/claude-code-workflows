# External Resource Hearing and Storage

Producer-side protocol. Load this when capturing or updating external-resource records. Running it requires AskUserQuestion, so it belongs to the session that can ask the user directly.

## When to Hear

| Condition | Action |
|-----------|--------|
| `docs/project-context/external-resources.md` does not exist | Run full hearing for the relevant domain(s) |
| File exists and covers the current decision | Use it without an update question |
| User or caller identifies changed environment facts | Run diff-only hearing for the named axes |
| A relevant axis is absent | Hear only the missing axis |
| Access failure or contradictory current evidence indicates possible staleness | Ask via AskUserQuestion: "Update external-resources.md? (no / yes-full / yes-diff-only)". On `yes-full` run full hearing; on `yes-diff-only` hear the named stale axes; on `no` preserve the file and report the limitation |

## Domain Routing

Load the domain reference matching the current task:

| Task type | References to load |
|-----------|--------------------|
| Frontend (UI work) | [frontend.md](frontend.md) |
| Backend (server / data work) | [backend.md](backend.md) |
| API contract work | [api.md](api.md) |
| Infrastructure / deployment | [infra.md](infra.md) |
| Fullstack | Load only the references whose frontend, backend/data, API-contract, or infrastructure responsibilities are affected by the confirmed scope; a fullstack label alone does not activate infrastructure |

Each domain reference defines the axes and the question template.

## Two-Phase Hearing

1. **Structured hearing** — for each axis selected by the When to Hear and Domain Routing rules, present the user with AskUserQuestion using the choices listed in its domain reference (always include "Not applicable" as an option). For each non-N/A axis, follow up with an access-method question (URL / MCP name / file path / command).

2. **Self-declaration for a full hearing** — after the structured axes for all selected domains are complete, present one integrated AskUserQuestion: "Are there any other external resources for this work that the structured questions did not cover? If yes, describe them in your next message." If the user describes additional resources, append them to the storage file under an "Additional resources" subsection. A diff-only or missing-axis hearing ends after its named axes because the existing project record already completed self-declaration.

For a full hearing, the two phases are sequential and self-declaration runs even if the user answered "Not applicable" to every structured axis.

## Storage Protocol

After hearing completes:

1. Build the project-tier content from the answers. Use [template.md](template.md) as the structure.
2. Write to `docs/project-context/external-resources.md`. Create the directory if absent.
3. When the calling workflow has a target UI Spec or Design Doc, also append or update the document's `## External Resources Used` section with the feature-tier subset (label references + feature-specific identifiers only).
4. Report the file paths back to the calling workflow.

## Quality Checklist

- [ ] Each axis answered has both a presence indicator and an access method, or is marked "Not applicable"
- [ ] A full hearing ran self-declaration even when all structured axes were "Not applicable"; a diff-only or missing-axis hearing stayed within its named axes
- [ ] Project-tier entries hold the environment facts (URL, MCP name, file path, command)
- [ ] Feature-tier rows hold a project-tier label and the feature-specific identifier
- [ ] When the project file already existed, each write traces to an explicit changed fact, a missing relevant axis, or a confirmed stale-evidence update decision
