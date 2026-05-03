# Storage Templates

Two templates: the project-tier file and the feature-tier section.

## Project-Tier Template

Path: `docs/project-context/external-resources.md`

```markdown
# External Resources

Last updated: YYYY-MM-DD

This file records the external resources available to this project and how to access them. AI agents and contributors consult this file when work depends on resources outside the repository. Feature-specific identifiers belong in the consuming UI Spec or Design Doc, not here — this file holds environment-stable facts only.

## Frontend

### Design Origin
- Status: <present / not applicable>
- Source type: <design tool / specification file / public documentation URL / existing implementation only>
- Location: <URL / repository path>
- Access method: <MCP name / WebFetch / file read / manual screenshot>

### Design System
- Status: <present / not applicable>
- Source type: <component library with MCP / component library with documentation URL / Storybook / internal package / no design system>
- Location: <URL / package name / repository path>
- Access method: <MCP name / WebFetch / package import>

### Guidelines
- Status: <present / not applicable>
- Source type: <project file / external URL / inline in design system / no guidelines>
- Location: <path or URL>
- Access method: <file read / WebFetch>

### Visual Verification Environment
- Status: <present / not applicable>
- Tool type: <browser automation MCP / E2E test runner / Storybook / manual>
- Entry: <MCP name / command / URL>

## Backend

### Database Schema Source
- Status: <present / not applicable>
- Source type: <migration files / schema file / database MCP / external registry>
- Location: <path or URL>
- Access method: <file read / MCP name>

### Migration History
- Status: <present / not applicable>
- Tool: <tool name>
- Location: <directory path>
- Apply trigger: <automated on deploy / manual>

### Secret Store
- Status: <present / not applicable>
- Service: <service name>
- Access method: <CLI command / MCP name / SDK call>

### Background Job Infrastructure
- Status: <present / not applicable>
- Service: <queue or scheduler name>
- Access method: <how to enqueue / inspect>

## API

### API Schema Source
- Status: <present / not applicable>
- Source type: <OpenAPI / Protobuf / GraphQL SDL / code-first>
- Location: <path or URL>
- Access method: <file read / WebFetch / introspection endpoint>

### Mock Environment
- Status: <present / not applicable>
- Source type: <generated from schema / hand-written / hosted service / live dev server>
- Entry: <command / URL>

### Authentication Method
- Status: <present / not applicable>
- Mechanism: <bearer token / API key / session cookie / mTLS>
- Credential source: <reference to secret store entry, or development-only mechanism>

### Schema Change Process
- Status: <present / not applicable>
- Process: <document path / versioning rule>

## Infrastructure

### IaC Source
- Status: <present / not applicable>
- Tool: <Terraform / Pulumi / CDK / Kubernetes manifests / native templates>
- Location: <directory path>
- Apply trigger: <CI automated / CI with approval / manual>

### Environment Configuration
- Status: <present / not applicable>
- Mechanism: <per-environment files / platform env vars / IaC workspaces / shared config>
- Environments: <list>

### Secrets in Infrastructure
- Status: <present / not applicable>
- Mechanism: <secret manager lookup / apply-time env vars / encrypted files>

### Deployment Trigger
- Status: <present / not applicable>
- Mechanism: <CI on merge / manual approval / local apply / platform auto-deploy>

## Additional Resources

Free-form list captured during the self-declaration phase. Each entry: name, purpose, location, access method.

- <name>: <purpose> — <location> — <access method>
```

Sections corresponding to domains the user marked "Not applicable" for every axis can be omitted entirely. Sections with at least one present axis must include all axes within that domain (mark unused axes as "not applicable" inline).

## Feature-Tier Template

This is the section appended to a UI Spec or Design Doc. It references project-tier entries by label and lists only feature-specific identifiers. It never duplicates URLs, MCP names, or access commands.

```markdown
## External Resources Used

This feature depends on the following resources from `docs/project-context/external-resources.md`. Refer to that file for environment access details.

| Resource (project-tier label) | Feature-specific identifier | Notes |
|-------------------------------|-----------------------------|-------|
| Design Origin | <node id / file id / specific path within the design source> | <e.g., screen name, frame id> |
| Design System | <specific components used> | <variants, customizations> |
| API Schema Source | <specific endpoints or methods> | <e.g., POST /resource, RPC name> |

Resources not used by this feature are omitted from this table. If a resource is used but no feature-specific identifier applies, write the project-tier label with "all" or "default scope" in the identifier column.
```

The feature-tier section's heading text is fixed as "External Resources Used"; the heading level follows the parent document's structure (h2 in UI Spec, h3 in Design Doc under Background and Context). The exact placement is defined by each document template (see `ui-spec-template.md` and `design-template.md`).
