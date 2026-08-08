---
name: external-resource-context
description: Records where resources outside the repository live (design source, design system, API schema, IaC source, secret store) and how design, implementation, and verification reach them. Use when work depends on an external resource, or when the user mentions design source, design system, API schema, IaC source, secret store, or canonical source.
---

# External Resource Context

## Purpose

AI agents understand the codebase but not the external resources surrounding it. This skill captures, in a deterministic location, the **access methods** to resources outside the repository so downstream work (design, planning, implementation, review) can reach them without re-asking the user.

Resources covered: design origin (where the canonical visual specification lives), design system (component library and tokens), guidelines (usage docs, accessibility rules), visual verification environment (how to confirm rendering), database schema source, migration history, secret store location, API schema source (OpenAPI / proto / GraphQL SDL), mock environment, IaC source, environment configuration.

## Storage Locations (Two-Tier)

| Tier | Location | Holds | Update Frequency |
|------|----------|-------|------------------|
| Project | `docs/project-context/external-resources.md` | Environment-stable facts: which resources exist for this project and how to access them (URL, MCP name, file path, command) | Rare — only when the project's environment changes |
| Feature | `## External Resources Used` section inside the relevant UI Spec or Design Doc | The subset of project-tier resources actually used by this feature, plus feature-specific identifiers (e.g., a specific node id within the design tool, a specific endpoint path) | Per feature |

### Single Source of Truth Rule

The project tier owns environment facts. Feature-tier sections list only feature-specific identifiers (node id within the design source, specific endpoint path within the API, specific IaC module name) and reference project-tier entries by label; URLs, MCP names, and access commands remain in the project-tier file. When the environment changes, only the project-tier file is updated.

Example feature-tier entry uses the table format defined in `references/template.md`: a row with the project-tier label in the first column and the feature-specific identifier in the second column.

## Reference Protocol (For Downstream Consumers)

Before investigating the repository for an external fact, check whether it is already recorded:

1. Read `docs/project-context/external-resources.md` (if present) to learn what is available and how to access it.
2. Read the target UI Spec or Design Doc's `## External Resources Used` section for feature-specific identifiers.
3. Use the access method declared in the project tier (e.g., the named MCP, the URL, the file path) to fetch the actual resource content.

When the file is absent or the resource is unreachable, continue from governing and repository evidence. Each consuming agent reports that limitation through its own output contract.

## Capturing and Updating Records

Capturing a record requires AskUserQuestion, so it belongs to the session that can ask the user. Follow [references/hearing.md](references/hearing.md) for the hearing conditions, domain routing, two-phase hearing, storage protocol, and quality checklist.

## Output Format

The project-tier file follows the structure in [references/template.md](references/template.md). The project-tier file's heading levels and section names are fixed so downstream agents can locate sections deterministically.

For feature-tier sections inside UI Spec or Design Doc, the heading text "External Resources Used" is fixed; the heading level matches the parent document's natural structure (h2 in UI Spec where it is a sibling of other top-level sections, h3 in Design Doc where it sits under Background and Context).

## References

- [references/hearing.md](references/hearing.md) — Hearing conditions, domain routing, storage protocol, quality checklist
- [references/frontend.md](references/frontend.md) — Frontend domain axes
- [references/backend.md](references/backend.md) — Backend domain axes
- [references/api.md](references/api.md) — API contract domain axes
- [references/infra.md](references/infra.md) — Infrastructure domain axes
- [references/template.md](references/template.md) — Project-tier and feature-tier structure templates
