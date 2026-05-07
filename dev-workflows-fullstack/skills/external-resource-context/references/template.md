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
- Access method: <WebFetch / file read / MCP name / manual screenshot>

### Design System
- Status: <present / not applicable>
- Source type: <component library with MCP / component library with documentation URL / Storybook / internal package / no design system>
- Location: <URL / package name / repository path>
- Access method: <package import / WebFetch / MCP name>

### Guidelines
- Status: <present / not applicable>
- Source type: <project file / external URL / inline in design system / no guidelines>
- Location: <path or URL>
- Access method: <file read / WebFetch>

### Visual Verification Environment
- Status: <present / not applicable>
- Tool type: <E2E test runner / Storybook / browser automation MCP / manual>
- Entry: <CLI command / URL / MCP name>

## Backend

### Database Schema Source
- Status: <present / not applicable>
- Source type: <migration files / schema file / external registry / database MCP>
- Location: <path or URL>
- Access method: <file read / introspection command / MCP name>

### Migration History
- Status: <present / not applicable>
- Tool: <tool name>
- Location: <directory path>
- Apply trigger: <automated on deploy / manual>

### Secret Store
- Status: <present / not applicable>
- Service: <service name>
- Access method: <CLI command / SDK call / MCP name>

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
