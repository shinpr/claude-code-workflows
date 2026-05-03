---
name: external-resource-context
description: Captures and persists access methods for resources outside the repository (design source, design system, API schema, IaC source, secret store) so downstream work can reach them deterministically. Use when work depends on external resources, or when the user mentions design source, design system, API schema, IaC source, secret store, or canonical source.
---

# External Resource Context

## Purpose

AI agents understand the codebase but not the external resources surrounding it. This skill captures, in a deterministic location, the **access methods** to resources outside the repository so downstream work (design, planning, implementation, review) can reach them without re-asking the user.

Resources covered: design origin (where the canonical visual specification lives), design system (component library and tokens), guidelines (usage docs, accessibility rules), visual verification environment (how to confirm rendering), database schema source, migration history, secret store location, API schema source (OpenAPI / proto / GraphQL SDL), mock environment, IaC source, environment configuration.

## Scope Boundaries

**In scope**: hearing protocol, storage location, single-source-of-truth ownership rule, reference protocol for downstream consumers.

**Out of scope**: enforcing that captured resources are correct or current — verification belongs to the agent that consumes the resource. Generating the resources themselves (e.g., creating a DESIGN.md from scratch).

## Storage Locations (Two-Tier)

| Tier | Location | Holds | Update Frequency |
|------|----------|-------|------------------|
| Project | `docs/project-context/external-resources.md` | Environment-stable facts: which resources exist for this project and how to access them (URL, MCP name, file path, command) | Rare — only when the project's environment changes |
| Feature | `## External Resources Used` section inside the relevant UI Spec or Design Doc | The subset of project-tier resources actually used by this feature, plus feature-specific identifiers (e.g., a specific node id within the design tool, a specific endpoint path) | Per feature |

### Single Source of Truth Rule

The project tier owns environment facts. Feature-tier sections list only feature-specific identifiers (node id within the design source, specific endpoint path within the API, specific IaC module name) and reference project-tier entries by label; URLs, MCP names, and access commands remain in the project-tier file. When the environment changes, only the project-tier file is updated.

Example feature-tier entry uses the table format defined in `references/template.md`: a row with the project-tier label in the first column and the feature-specific identifier in the second column.

## Hearing Protocol

### When to Hear

| Condition | Action |
|-----------|--------|
| `docs/project-context/external-resources.md` does not exist | Run full hearing for the relevant domain(s) |
| File exists | Ask the user via AskUserQuestion: "Update external-resources.md? (no / yes-full / yes-diff-only)". On `yes-full` run full hearing. On `yes-diff-only` ask the user which axes changed, hear only those. On `no` skip hearing |

### Domain Routing

Load the domain reference matching the current task:

| Task type | References to load |
|-----------|--------------------|
| Frontend (UI work) | [references/frontend.md](references/frontend.md) |
| Backend (server / data work) | [references/backend.md](references/backend.md) |
| API contract work | [references/api.md](references/api.md) |
| Infrastructure / deployment | [references/infra.md](references/infra.md) |
| Fullstack | All of the above; per-axis "Not applicable" answers are expected |

Each domain reference defines the axes and the question template.

### Two-Phase Hearing

1. **Structured hearing** — for each axis defined in the domain reference, present the user with AskUserQuestion using the choices listed there (always include "Not applicable" as an option). For each non-N/A axis, follow up with an access-method question (URL / MCP name / file path / command).

2. **Self-declaration** — after the structured axes, present a single AskUserQuestion: "Are there any other external resources for this work that the structured questions did not cover? If yes, describe them in your next message." If the user describes additional resources, append them to the storage file under an "Additional resources" subsection.

The two phases are sequential. Self-declaration runs even if the user answered "Not applicable" to every structured axis.

## Storage Protocol

After hearing completes:

1. Build the project-tier content from the answers. Use [references/template.md](references/template.md) as the structure.
2. Write to `docs/project-context/external-resources.md`. Create the directory if absent.
3. When the calling workflow has a target UI Spec or Design Doc, also append or update the document's `## External Resources Used` section with the feature-tier subset (label references + feature-specific identifiers only).
4. Report the file paths back to the calling workflow.

## Reference Protocol (For Downstream Consumers)

Agents that load this skill consult resources in this order:

1. Read `docs/project-context/external-resources.md` first (if present) to learn what is available and how to access it.
2. Read the target UI Spec or Design Doc's `## External Resources Used` section for feature-specific identifiers.
3. Use the access method declared in the project tier (e.g., the named MCP, the URL, the file path) to fetch the actual resource content.

Agents that only need to *consult* the saved file as input data (not actively hear) can read it directly without loading this skill — frontmatter declaration is reserved for agents that may need to trigger hearing or interpret the protocol semantics.

## Output Format

The project-tier file follows the structure in [references/template.md](references/template.md). The project-tier file's heading levels and section names are fixed so downstream agents can locate sections deterministically.

For feature-tier sections inside UI Spec or Design Doc, the heading text "External Resources Used" is fixed; the heading level matches the parent document's natural structure (h2 in UI Spec where it is a sibling of other top-level sections, h3 in Design Doc where it sits under Background and Context).

## Quality Checklist

- [ ] Each axis answered has both a presence indicator and an access method, or is marked "Not applicable"
- [ ] Self-declaration phase ran even when all structured axes were "Not applicable"
- [ ] Project-tier file does not contain feature-specific identifiers
- [ ] Feature-tier sections reference project-tier entries by label, not by duplicating URLs / MCP names
- [ ] When the project file already existed, the update decision (no / yes-full / yes-diff-only) was confirmed before any write

## References

- [references/frontend.md](references/frontend.md) — Frontend domain axes
- [references/backend.md](references/backend.md) — Backend domain axes
- [references/api.md](references/api.md) — API contract domain axes
- [references/infra.md](references/infra.md) — Infrastructure domain axes
- [references/template.md](references/template.md) — Project-tier and feature-tier structure templates
