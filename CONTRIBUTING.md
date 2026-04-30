# Contributing External Plugins

Thank you for your interest in contributing to Claude Code Workflows.

This marketplace has a specific focus. Please read this guide carefully before submitting.

## Our Philosophy

This marketplace exists to support the full lifecycle of building products with AI — from understanding what to build, through building it reliably, to verifying the result.

We curate plugins that make AI-assisted development **reliable and controlled** — not flashy or viral. Production-readiness and safety guardrails take priority over convenience or impressive demos.

If your plugin helps developers build better products with AI coding agents, it likely belongs here.

## What We Accept

Plugins that fall into these categories:

- **Product quality** — Tools that help validate what to build before building it (discovery, hypothesis testing, value validation)
- **Behavior control** — Detecting and correcting undesirable agent behavior (e.g., [metronome](https://github.com/shinpr/metronome))
- **Quality enforcement** — Automated checks, guardrails, or gates that prevent regressions
- **Workflow orchestration** — Structured, multi-step processes that ensure consistency
- **Governance** — Safety gates, signoff checkpoints, and audit trails that enforce accountability
- **Safety and verification** — Tools that validate outputs, catch drift, or enforce constraints

## Out of Scope

To keep the collection focused, we do not accept:

- General productivity tools (formatters, snippet generators, etc.)
- Wrappers around external APIs without a quality/safety angle
- Plugins primarily focused on UI/UX or visual output
- Unmaintained or experimental plugins without real-world usage
- Plugins that duplicate functionality already in this marketplace

## Requirements

Your plugin must:

1. **Be a working Claude Code plugin** — Installable via `/plugin install`
2. **Have a public repository** with a README explaining what it does and why
3. **Be actively maintained** — Recent commits or responsive issue activity, compatible with current Claude Code
4. **Have been tested in real projects** — Not just a concept or demo

## How to Submit

Not sure if your plugin fits? Open an issue to discuss before spending time on a PR.

1. Fork this repository
2. Add your plugin to `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "your-plugin-name",
     "source": {
       "source": "url",
       "url": "https://github.com/your-org/your-plugin.git"
     },
     "description": "One-line description of what it does",
     "category": "product-quality | behavior-control | quality-enforcement | workflow-orchestration | governance | safety-verification",
     "homepage": "https://github.com/your-org/your-plugin"
   }
   ```
3. Add a brief entry to the **External Plugins** section in `README.md`
4. [Open a Pull Request using the external plugin template](https://github.com/shinpr/claude-code-workflows/compare/main...main?template=external-plugin.md) and fill in the required information

## Review Process

1. We review submissions for concept fit first, then quality
2. We may ask questions or request changes
3. Plugins that don't align with this marketplace's focus will be declined — this is not a quality judgment on your plugin, just a scope decision
4. Accepted plugins are merged and available via `/plugin install`

## After Acceptance

- You maintain your own plugin repository. We only reference it
- If your plugin becomes unmaintained or incompatible, we may remove it from the marketplace with notice
- Breaking changes in your plugin should be communicated via your repository's releases

## Questions

If you have any questions, feel free to open an issue.

## Editing the In-Repo Plugins

The bundled plugins (`dev-workflows`, `dev-workflows-frontend`, `dev-skills`) live in subdirectories at the repo root, but those subdirectories are **generated**. The canonical sources are the top-level `agents/` and `skills/` directories — edit only there. The per-plugin curation lives in `.claude-plugin/marketplace.json` (`agents` / `skills` arrays per entry).

Setup:

```sh
pnpm install   # installs lefthook and registers the pre-commit hook
```

Requires Node.js >= 22 and `pnpm`. The pre-commit hook runs `pnpm sync` to regenerate the subdirectories and then `claude plugin validate` on each, so committing changes to `agents/`, `skills/`, or `marketplace.json` will keep everything consistent automatically. Run `pnpm sync` manually if you need to inspect the result without committing.
