# Infrastructure Domain Axes

Hearing axes for tasks that involve deployment, environment configuration, or infrastructure-as-code work.

## Axis 1: IaC Source

The canonical source of infrastructure definitions.

**AskUserQuestion choices**:
- Terraform configuration in the repository
- Pulumi or CDK code in the repository
- Kubernetes manifests / Helm charts in the repository
- Cloud-provider-native templates (e.g., CloudFormation, Bicep, Deployment Manager)
- Manual console configuration (no IaC)
- Not applicable

**Follow-up (when not N/A)**: Record the directory path. Note whether plan/apply is automated via CI or run manually.

## Axis 2: Environment Configuration

How per-environment settings (development, staging, production) differ.

**AskUserQuestion choices**:
- Per-environment configuration files in the repository (e.g., `terraform/envs/`, `config/staging.yaml`)
- Environment variables managed by the deployment platform
- Workspace or stack abstraction in the IaC tool itself
- Single shared configuration (no per-environment differences)
- Not applicable

**Follow-up (when not N/A)**: Record where environment-specific values are stored and which environments exist.

## Axis 3: Secrets in Infrastructure

How infrastructure code references secrets without exposing them.

**AskUserQuestion choices**:
- Secrets sourced from a secret manager via IaC data lookup
- Secrets injected at apply time via environment variables
- Encrypted secret files committed alongside IaC
- No secrets in infrastructure
- Not applicable

**Follow-up (when not N/A)**: Record the lookup mechanism. Cross-reference the secret store axis in `backend.md` when the same store serves both runtime and IaC.

## Axis 4: Deployment Trigger

How infrastructure and application changes reach environments.

**AskUserQuestion choices**:
- CI pipeline triggered on merge to a specific branch
- Manual approval step in CI
- Local apply by an operator
- Deployment platform's auto-deploy on push
- Not applicable

**Follow-up (when not N/A)**: Record the pipeline name or platform and the branch / tag convention that triggers each environment.

## Self-Declaration

After the structured axes, ask once: "Are there any other infrastructure external resources this work depends on that the structured questions did not cover?"

Examples that may surface only via self-declaration: state-storage backend for IaC tools, runbook documents for incident response, on-call rotation, observability dashboards, cost monitoring tools, compliance / audit logging targets.
