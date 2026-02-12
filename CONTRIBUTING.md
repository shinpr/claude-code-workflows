# Contributing External Plugins

Thank you for your interest in contributing to Claude Code Workflows.

This marketplace has a specific focus. Please read this guide carefully before submitting.

## Our Philosophy

In agentic coding, control and reliability matter more than convenience. This marketplace exists to bring together plugins that share that priority.

We curate plugins that make AI-assisted development **reliable and controlled** — not flashy or viral. Production-readiness and safety guardrails take priority over convenience or impressive demos.

If your plugin helps developers trust and control AI coding agents in production workflows, it likely belongs here.

## What We Accept

Plugins that fall into these categories:

- **Behavior control** — Detecting and correcting undesirable agent behavior (e.g., [metronome](https://github.com/shinpr/metronome))
- **Quality enforcement** — Automated checks, guardrails, or gates that prevent regressions
- **Workflow orchestration** — Structured, multi-step processes that ensure consistency
- **Safety and verification** — Tools that validate outputs, catch drift, or enforce constraints

## Out of Scope

To keep the collection focused, we do not accept:

- General productivity tools (formatters, snippet generators, etc.)
- Wrappers around external APIs without a control/safety angle
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
     "homepage": "https://github.com/your-org/your-plugin"
   }
   ```
3. Add a brief entry to the **External Plugins** section in `README.md`
4. Open a Pull Request with the following information:
   - What your plugin does
   - **Why it fits this marketplace's focus** (this is the most important part)
   - Link to your repository
   - How you've tested it in real projects

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
