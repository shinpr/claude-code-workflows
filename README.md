# Claude Code Workflows 🚀

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-purple)](https://claude.ai/code)
[![GitHub Stars](https://img.shields.io/github/stars/shinpr/claude-code-workflows?style=social)](https://github.com/shinpr/claude-code-workflows)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/shinpr/claude-code-workflows/pulls)

**End-to-end development workflows for Claude Code** - Specialized agents handle requirements, design, implementation, and quality checks so you get reviewable code, not just generated code.

---

## ⚡ Quick Start

This marketplace includes the following plugins:

**Core plugins:**
- **dev-workflows** - Backend and general-purpose development
- **dev-workflows-frontend** - React/TypeScript specialized workflows

**Optional add-ons** (enhance core plugins):
- **[claude-code-discover](https://github.com/shinpr/claude-code-discover)** - Turns feature ideas into evidence-backed PRDs
- **[metronome](https://github.com/shinpr/metronome)** - Detects shortcut-taking behavior and nudges Claude to proceed step by step
- **[linear-prism](https://github.com/shinpr/linear-prism)** - Turns requirements into structured Linear tasks — validates before decomposing, so downstream design starts clean

**Skills only** (for users with existing workflows):
- **dev-skills** - Coding best practices, testing principles, and design guidelines — no workflow recipes

These plugins provide end-to-end workflows for AI-assisted development. Choose what fits your project:

### Backend or General Development

```bash
# 1. Start Claude Code
claude

# 2. Install the marketplace
/plugin marketplace add shinpr/claude-code-workflows

# 3. Install backend plugin
/plugin install dev-workflows@claude-code-workflows

# 4. Reload plugins
/reload-plugins

# 5. Start building
/recipe-implement <your feature>
```

### Frontend Development (React/TypeScript)

```bash
# 1-2. Same as above (start Claude Code and add marketplace)

# 3. Install frontend plugin
/plugin install dev-workflows-frontend@claude-code-workflows

# 4-5. Same as above (reload plugins and start building)

# Use frontend-specific commands
/recipe-front-design <your feature>
```

### Full-Stack Development

Install both plugins to get the complete toolkit for backend and frontend work.

```bash
# Use fullstack commands for cross-layer features
/recipe-fullstack-implement "Add user authentication with JWT + login form"

# Or execute from existing fullstack work plan
/recipe-fullstack-build
```

The fullstack recipes create separate Design Docs per layer (backend + frontend), verify cross-layer consistency via design-sync, and route tasks to the appropriate executor based on filename patterns. See [Fullstack Workflow](#fullstack-workflow) for details.

### External Plugins

```bash
# Install discover (product discovery before implementation)
/plugin install discover@claude-code-workflows

# Install metronome (prevents shortcut-taking behavior)
/plugin install metronome@claude-code-workflows

# Install linear-prism (requirements → Linear tasks with quality gates)
/plugin install linear-prism@claude-code-workflows
```

### Skills Only (For Users with Existing Workflows)

If you already have your own orchestration (custom prompts, scripts, CI-driven loops) and just want the best-practice guides, use `dev-skills`. If you want Claude to plan, execute, and verify end-to-end, install `dev-workflows` instead.

- Minimal context footprint — no agents or recipe skills loaded
- Drop-in best practices without changing your workflow
- Works as a ruleset layer for your own orchestrator

> **Do not install alongside dev-workflows or dev-workflows-frontend** — duplicate skills will be silently ignored. See [details below](#warning-duplicate-skills).

```bash
# Install skills-only plugin
/plugin install dev-skills@claude-code-workflows
```

Skills auto-load when relevant — `coding-principles` activates during implementation, `testing-principles` during test writing, etc.

**Switching between plugins:**

```bash
# dev-skills → dev-workflows
/plugin uninstall dev-skills@claude-code-workflows
/plugin install dev-workflows@claude-code-workflows

# dev-workflows → dev-skills
/plugin uninstall dev-workflows@claude-code-workflows
/plugin install dev-skills@claude-code-workflows
```

<a id="warning-duplicate-skills"></a>

> **Warning:** dev-skills and dev-workflows / dev-workflows-frontend share the same skills. Installing both causes skill descriptions to appear twice in the system context. Claude Code limits skill descriptions to ~2% of the context window — exceeding this limit causes skills to be silently ignored.

---

## 🔧 How It Works

### The Workflow

```mermaid
graph TB
    A[👤 User Request] --> B[🔍 requirement-analyzer]

    B --> |"📦 Large (6+ files)"| C[📄 prd-creator]
    B --> |"📦 Medium (3-5 files)"| CA[🔬 codebase-analyzer]
    B --> |"📦 Small (1-2 files)"| E[⚡ Direct Implementation]

    C --> CA
    CA --> D[📐 technical-designer]
    D --> CV[✅ code-verifier]
    CV --> DR[📋 document-reviewer]
    DR --> DS[🔄 design-sync]
    DS --> F[🧪 acceptance-test-generator]
    F --> G[📋 work-planner]
    G --> H[✂️ task-decomposer]

    H --> I[🔨 task-executor]
    E --> I

    I --> J[✅ quality-fixer]
    J --> K[🎉 Ready to Commit]
```

### The Diagnosis Workflow

```mermaid
graph LR
    P[🐛 Problem] --> INV[🔍 investigator]
    INV --> |Failure Points| VER[⚖️ verifier]
    VER --> |Coverage Check| COV{Sufficient?}
    COV --> |Yes| SOL[💡 solver]
    COV --> |No| INV
    SOL --> |Solutions + Steps| R[📋 Report]
```

### The Reverse Engineering Workflow

```mermaid
graph TB
    subgraph Phase1[Phase 1: PRD Generation]
        CMD[📜 /recipe-reverse-engineer] --> SD[🔍 scope-discoverer unified]
        SD --> PRD[📄 prd-creator]
        PRD --> CV1[✅ code-verifier]
        CV1 --> DR1[📋 document-reviewer]
    end

    subgraph Phase2[Phase 2: Design Doc Generation]
        TD[📐 technical-designer] --> CV2[✅ code-verifier]
        CV2 --> DR2[📋 document-reviewer]
        DR2 --> DONE[📚 Complete]
    end

    DR1 --> |"All PRDs Approved (reuse scope)"| TD
```

### What Happens Behind the Scenes

1. **Analysis** - Figures out how complex your task is
2. **Codebase Understanding** - Analyzes existing code to inform design decisions
3. **Planning** - Creates the right docs (PRD, UI Spec, Design Doc, work plan) based on complexity
4. **Execution** - Specialized agents handle implementation autonomously
5. **Quality** - Runs tests, checks types, fixes errors automatically
6. **Review** - Makes sure everything matches the design
7. **Done** - Reviewed, tested, ready to commit

---

## ⚡ Workflow Recipes

All workflow entry points use the `recipe-` prefix to distinguish them from knowledge skills. Type `/recipe-` and use tab completion to see all available recipes.

### Backend & General Development (dev-workflows)

| Recipe | Purpose | When to Use |
|--------|---------|-------------|
| `/recipe-implement` | End-to-end feature development | New features, complete workflows |
| `/recipe-fullstack-implement` | End-to-end fullstack development | Cross-layer features (requires both plugins) |
| `/recipe-task` | Execute single task with precision | Bug fixes, small changes |
| `/recipe-design` | Create design documentation | Architecture planning |
| `/recipe-plan` | Generate work plan from design | Planning phase |
| `/recipe-build` | Execute from existing task plan | Resume implementation |
| `/recipe-fullstack-build` | Execute fullstack task plan | Resume cross-layer implementation (requires both plugins) |
| `/recipe-review` | Verify code against design docs | Post-implementation check |
| `/recipe-diagnose` | Investigate problems and derive solutions | Bug investigation, root cause analysis |
| `/recipe-reverse-engineer` | Generate PRD/Design Docs from existing code | Legacy system documentation, codebase understanding |
| `/recipe-add-integration-tests` | Add integration/E2E tests to existing code | Test coverage for existing implementations |
| `/recipe-update-doc` | Update existing design documents with review | Spec changes, review feedback, document maintenance |

### Frontend Development (dev-workflows-frontend)

| Recipe | Purpose | When to Use |
|--------|---------|-------------|
| `/recipe-front-design` | Create UI Spec + frontend Design Doc | React component architecture, UI Spec |
| `/recipe-front-plan` | Generate frontend work plan | Component breakdown planning |
| `/recipe-front-build` | Execute frontend task plan | Resume React implementation |
| `/recipe-front-review` | Verify code against design docs | Post-implementation check |
| `/recipe-task` | Execute single task with precision | Component fixes, small updates |
| `/recipe-diagnose` | Investigate problems and derive solutions | Bug investigation, root cause analysis |
| `/recipe-update-doc` | Update existing design documents with review | Spec changes, review feedback, document maintenance |

> **Tip**: Both plugins share `/recipe-task`, `/recipe-diagnose`, and `/recipe-update-doc`. `/recipe-update-doc` auto-detects the document's layer. If your project has frontend Design Docs, the frontend plugin is needed to update them. For reverse engineering, use `/recipe-reverse-engineer` with the fullstack option to generate both backend and frontend Design Docs in a single workflow.

---

## 📦 Specialized Agents

The workflow uses specialized agents for each stage of the development lifecycle.

### Shared Agents (Available in Both Plugins)

These agents work the same way whether you're building a REST API or a React app:

| Agent | What It Does |
|-------|--------------|
| **requirement-analyzer** | Figures out how complex your task is and picks the right workflow |
| **codebase-analyzer** | Analyzes existing codebase before design to produce focused guidance for technical-designer |
| **work-planner** | Breaks down design docs into actionable tasks |
| **task-decomposer** | Splits work into small, commit-ready chunks |
| **code-reviewer** | Checks your code against design docs to make sure nothing's missing |
| **document-reviewer** | Reviews single document quality, completeness, and rule compliance |
| **design-sync** | Verifies consistency across multiple Design Docs and detects conflicts |
| **investigator** | Maps execution paths, identifies failure points with causal chains for problem diagnosis |
| **verifier** | Validates failure points, checks path coverage using Devil's Advocate method |
| **solver** | Generates solutions with tradeoff analysis and implementation steps |
| **security-reviewer** | Reviews implementation for security compliance after all tasks complete |

### Backend-Specific Agents (dev-workflows)

| Agent | What It Does |
|-------|--------------|
| **prd-creator** | Writes product requirement docs for complex features |
| **technical-designer** | Plans architecture and tech stack decisions |
| **scope-discoverer** | Discovers functional scope from codebase for reverse engineering |
| **code-verifier** | Validates consistency between documentation and code implementation |
| **acceptance-test-generator** | Creates E2E and integration test scaffolds from requirements |
| **integration-test-reviewer** | Reviews integration/E2E tests for skeleton compliance and quality |
| **task-executor** | Implements backend features with TDD |
| **quality-fixer** | Runs tests, fixes type errors, handles linting - everything quality-related |
| **rule-advisor** | Picks the best coding rules for your current task |

### Frontend-Specific Agents (dev-workflows-frontend)

| Agent | What It Does |
|-------|--------------|
| **prd-creator** | Writes product requirement docs for complex features |
| **ui-spec-designer** | Creates UI Specifications from PRD and optional prototype code |
| **technical-designer-frontend** | Plans React component architecture and state management |
| **task-executor-frontend** | Implements React components with Testing Library |
| **code-verifier** | Validates consistency between documentation and code implementation |
| **quality-fixer-frontend** | Handles React-specific tests, TypeScript checks, and builds |
| **rule-advisor** | Picks the best coding rules for your current task |
| **design-sync** | Verifies consistency across multiple Design Docs and detects conflicts |

---

## 📚 Built-in Best Practices

The backend plugin includes proven best practices that work with any language:

- **Coding Principles** - Code quality standards
- **Testing Principles** - TDD, coverage, test patterns
- **Implementation Approach** - Design decisions and trade-offs
- **Documentation Standards** - Clear, maintainable docs

These are loaded as skills and automatically applied by agents when relevant.

The frontend plugin has React and TypeScript-specific rules built in.

---

## 🚀 What These Plugins Do

Each phase runs in a fresh agent context, so quality doesn't degrade as the task grows:

- **Analyze** → requirement-analyzer determines scale and workflow
- **Design** → technical-designer (+ ui-spec-designer for frontend) produces testable specs with acceptance criteria
- **Plan** → work-planner schedules integration by value unit, not by layer — so each phase delivers a working vertical slice
- **Implement** → task-executor builds and tests each task, quality-fixer verifies before every commit
- **Verify** → acceptance criteria trace from design through test skeletons, so nothing is left implicit

The frontend plugin adds React-specific agents (component architecture, Testing Library, TypeScript-first quality checks) and UI Spec generation from optional prototype code.

### Why UI Spec Exists

Prototypes show what the UI looks like, but not how it behaves across states, errors, and API boundaries. The gaps surface during integration — each task works alone but the whole doesn't hold up.

UI Spec bridges this by capturing component states, interactions, and acceptance criteria from the prototype. These criteria trace into the Design Doc and test skeletons, and the work plan uses them to schedule integration by value unit rather than by layer. The result is that design decisions are verified by tests, and breakage is caught early.

---

## 🎯 Typical Workflows

### Backend Feature Development

```bash
/recipe-implement "Add user authentication with JWT"

# What happens:
# 1. Analyzes your requirements
# 2. Creates design documents
# 3. Breaks down into tasks
# 4. Implements with TDD
# 5. Runs tests and fixes issues
# 6. Reviews against design docs
```

### Frontend Feature Development

```bash
/recipe-front-design "Build a user profile dashboard"

# What happens:
# 1. Analyzes requirements
# 2. Asks for prototype code (optional)
# 3. Creates UI Specification (screen structure, components, interactions)
# 4. Creates frontend Design Doc (inherits UI Spec decisions)
#
# Then run:
/recipe-front-build

# This:
# 1. Implements components with Testing Library
# 2. Writes tests for each component
# 3. Handles TypeScript types
# 4. Fixes lint and build errors
```

### Fullstack Workflow

```bash
/recipe-fullstack-implement "Add user authentication with JWT + React login form"

# What happens:
# 1. Analyzes requirements (same as /recipe-implement)
# 2. Creates PRD covering the entire feature
# 3. Asks for prototype code, creates UI Specification
# 4. Creates separate Design Docs for backend AND frontend
# 5. Verifies cross-layer consistency via design-sync
# 6. Creates work plan with vertical feature slices
# 7. Decomposes into layer-aware tasks (backend/frontend/fullstack)
# 8. Routes each task to the appropriate executor
# 9. Runs layer-appropriate quality checks
# 10. Commits vertical slices for early integration
```

> **Requires both plugins installed.** The fullstack recipes create separate Design Docs per layer and route tasks to backend or frontend executors based on filename patterns (`*-backend-task-*`, `*-frontend-task-*`). For reverse engineering existing fullstack codebases, use `/recipe-reverse-engineer` with the fullstack option.

### Quick Fixes (Both Plugins)

```bash
/recipe-task "Fix validation error message"

# Direct implementation with quality checks
# Works the same in both plugins
```

### Code Review

```bash
/recipe-review

# Checks your implementation against design docs
# Catches missing features or inconsistencies
```

### Problem Diagnosis (Both Plugins)

```bash
/recipe-diagnose "API returns 500 error on user login"

# What happens:
# 1. Investigator maps execution paths and identifies failure points
# 2. Verifier checks path coverage and validates each failure point
# 3. Re-investigates if coverage is insufficient (up to 2 iterations)
# 4. Solver generates solutions with tradeoff analysis
# 5. Presents actionable implementation steps
```

### Reverse Engineering

```bash
/recipe-reverse-engineer "src/auth module"

# What happens:
# 1. Discovers functional scope (user-value + technical) in a single pass
# 2. Generates PRD for each feature unit
# 3. Verifies PRD against actual code
# 4. Reviews and revises until consistent
# 5. Generates Design Docs with code verification
# 6. Produces complete documentation from existing code
#
# Fullstack option: generates both backend and frontend Design Docs per feature unit
```

> If you're working with undocumented legacy code, these commands are designed to make it AI-friendly by generating PRD and design docs.
> For a quick walkthrough, see: [How I Made Legacy Code AI-Friendly with Auto-Generated Docs](https://dev.to/shinpr/how-i-made-legacy-code-ai-friendly-with-auto-generated-docs-4353)

---

## 📂 Repository Structure

```
claude-code-workflows/
├── .claude-plugin/
│   └── marketplace.json        # Defines all plugins and curates per-plugin agent/skill subsets
│
├── agents/                     # Shared agents (curated per plugin via marketplace.json)
│   ├── codebase-analyzer.md     # Pre-design codebase analysis
│   ├── code-reviewer.md
│   ├── code-verifier.md        # Design verification & reverse engineering
│   ├── investigator.md         # Diagnosis workflow
│   ├── verifier.md             # Diagnosis workflow
│   ├── solver.md               # Diagnosis workflow
│   ├── scope-discoverer.md     # Reverse engineering workflow
│   ├── task-executor.md
│   ├── technical-designer.md
│   └── ...
│
├── skills/                     # Shared skills (knowledge + recipe workflows)
│   ├── recipe-implement/       # Workflow entry points (recipe-* prefix)
│   ├── recipe-design/
│   ├── recipe-diagnose/
│   ├── recipe-reverse-engineer/
│   ├── recipe-plan/
│   ├── recipe-build/
│   ├── ... (16 recipe skills total)
│
│   ├── ai-development-guide/   # Knowledge skills (auto-loaded by agents)
│   ├── coding-principles/
│   ├── testing-principles/
│   ├── implementation-approach/
│   ├── typescript-rules/       # Frontend-specific
│   └── ... (27 skills total: 16 recipes + 11 knowledge)
│
├── LICENSE
└── README.md
```

---

## 🤔 FAQ

**Q: Which plugin should I install?**

A: Depends on what you're building:
- **Backend, APIs, CLI tools, or general programming** → Install `dev-workflows`
- **React apps** → Install `dev-workflows-frontend`
- **Full-stack projects** → Install both

Both plugins can run side-by-side without conflicts.

**Q: Can I use both plugins at the same time?**

A: Yes! They're designed to work together. Install both if you're building a full-stack app. Use `/recipe-fullstack-implement` for features that span both backend and frontend — it creates separate Design Docs per layer and routes tasks to the appropriate executor automatically.

**Q: Do I need to learn special commands?**

A: Not really. For backend, just use `/recipe-implement`. For frontend, use `/recipe-front-design`. The plugins handle everything else automatically.

**Q: What if there are errors?**

A: The quality-fixer agents (one in each plugin) automatically fix most issues like test failures, type errors, and lint problems. If something can't be auto-fixed, you'll get clear guidance on what needs attention.

**Q: Is there a version for OpenAI Codex CLI?**

A: Yes! **[codex-workflows](https://github.com/shinpr/codex-workflows)** provides the same end-to-end development workflows for Codex CLI. Same concept — specialized subagents for requirements, design, implementation, and quality checks — adapted for the Codex CLI environment.

**Q: What's the difference between dev-skills and dev-workflows?**

A: `dev-skills` provides only coding best practices as skills (`coding-principles`, `testing-principles`, etc.) — no workflow recipes or agents. `dev-workflows` includes the same skills plus recipes like `/recipe-implement` and specialized agents for full orchestrated development. Use `dev-skills` if you already have your own orchestration and just want the knowledge guides. They should not be installed together. See [Skills Only](#skills-only-for-users-with-existing-workflows) for details and switching instructions.

---

## 🔌 Contributing External Plugins

This marketplace supports the full lifecycle of building products with AI — from product quality and discovery through implementation control and verification. If your plugin helps developers build better products with AI coding agents, we'd like to hear from you.

See [CONTRIBUTING.md](CONTRIBUTING.md) for submission guidelines and acceptance criteria.

---

## 📄 License

MIT License - Free to use, modify, and distribute.

See [LICENSE](LICENSE) for full details.

---

Built and maintained by [@shinpr](https://github.com/shinpr).