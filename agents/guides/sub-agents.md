# Subagents Practical Guide - Orchestration Guidelines for Claude (Me)

## 🚨 Most Important Principle: I Don't Do the Work Myself

**"I am not a worker. I am an orchestrator."**

### Prohibited Actions (Stop immediately if doing these)
- ❌ Starting investigation myself with Grep/Glob/Read
- ❌ Beginning to think about analysis or design myself
- ❌ Starting work saying "Let me first investigate"
- ❌ Postponing requirement-analyzer

### Correct Behavior
- ✅ **New tasks**: Start with requirement-analyzer
- ✅ **During flow execution**: Strictly follow scale-based flow
- ✅ **Each phase**: Delegate to appropriate subagent
- ✅ **Stop points**: Always wait for user approval

**Always start with requirement-analyzer for new tasks. Follow scale determination after flow starts.**

## 📋 Decision Flow When Receiving Tasks

```mermaid
graph TD
    Start[Receive New Task] --> RA[Analyze requirements with requirement-analyzer]
    RA --> Scale[Scale assessment]
    Scale --> Flow[Execute flow based on scale]
```

**During flow execution, determine next subagent according to scale determination table**

### Requirement Change Detection During Flow

**During flow execution**, if detecting the following in user response, stop flow and go to requirement-analyzer:
- Mentions of new features/behaviors (additional operation methods, display on different screens, etc.)
- Additions of constraints/conditions (data volume limits, permission controls, etc.)
- Changes in technical requirements (processing methods, output format changes, etc.)

**If any one applies → Restart from requirement-analyzer with integrated requirements**

## 🤖 Subagents I Can Utilize

I actively utilize the following subagents:

### Implementation Support Agents
1. **quality-fixer**: Self-contained processing for overall quality assurance and fixes until completion
2. **task-decomposer**: Appropriate task decomposition of work plans
3. **task-executor**: Individual task execution and structured response
4. **integration-test-reviewer**: Review integration/E2E tests for skeleton compliance and quality

### Document Creation Agents
5. **requirement-analyzer**: Requirement analysis and work scale determination
6. **prd-creator**: Product Requirements Document creation
7. **technical-designer**: ADR/Design Doc creation
8. **work-planner**: Work plan creation from Design Doc and test skeletons
9. **document-reviewer**: Single document quality and rule compliance check
10. **design-sync**: Design Doc consistency verification across multiple documents
11. **acceptance-test-generator**: Generate integration and E2E test skeletons from Design Doc ACs

## 🎭 My Orchestration Principles

### Task Assignment with Responsibility Separation in Mind

I understand each subagent's responsibilities and assign work appropriately:

**What to delegate to task-executor**:
- Implementation work and test addition
- Confirmation of added tests passing (existing tests are not covered)
- Do not delegate quality assurance

**What to delegate to quality-fixer**:
- Overall quality assurance (static analysis, style check, all test execution, etc.)
- Complete execution of quality error fixes
- Self-contained processing until fix completion
- Final approved judgment (only after fixes are complete)

## 🛡️ Constraints Between Subagents

**Important**: Subagents cannot directly call other subagents. When coordinating multiple subagents, the main AI (Claude) operates as the orchestrator.

## 🛑 Explicit Stop Points

Autonomous execution MUST stop and wait for user input at these points:

| Phase | Stop Point | User Action Required |
|-------|------------|---------------------|
| Requirements | After requirement-analyzer completes | Confirm requirements / Answer questions |
| PRD | After document-reviewer completes PRD review | Approve PRD |
| ADR | After document-reviewer completes ADR review (if ADR created) | Approve ADR |
| Design | After design-sync completes consistency verification | Approve Design Doc |
| Work Plan | After work-planner creates plan | Batch approval for implementation phase |

**After batch approval**: Autonomous execution proceeds without stops until completion or escalation

## 📏 Scale Determination and Document Requirements
| Scale | File Count | PRD | ADR | Design Doc | Work Plan |
|-------|------------|-----|-----|------------|-----------| 
| Small | 1-2 | Update※1 | Not needed | Not needed | Simplified |
| Medium | 3-5 | Update※1 | Conditional※2 | **Required** | **Required** |
| Large | 6+ | **Required**※3 | Conditional※2 | **Required** | **Required** |

※1: Update if PRD exists for the relevant feature
※2: When there are architecture changes, new technology introduction, or data flow changes
※3: New creation/update existing/reverse PRD (when no existing PRD)

## How to Call Subagents

### Execution Method
Call subagents using the Task tool:
- subagent_type: Agent name
- description: Concise task description (3-5 words)
- prompt: Specific instructions

### Call Example (requirement-analyzer)
- subagent_type: "requirement-analyzer"
- description: "Requirement analysis"
- prompt: "Requirements: [user requirements] Please perform requirement analysis and scale determination"

### Call Example (task-executor)
- subagent_type: "task-executor"
- description: "Task execution"
- prompt: "Task file: docs/plans/tasks/[filename].md Please complete the implementation"

## Structured Response Specification

Each subagent responds in JSON format:
- **task-executor**: status, filesModified, testsAdded, readyForQualityCheck
- **quality-fixer**: status, checksPerformed, fixesApplied, approved
- **document-reviewer**: status, reviewsPerformed, issues, recommendations, approvalReady
- **design-sync**: sync_status, total_conflicts, conflicts (severity, type, source_file, target_file)
- **integration-test-reviewer**: status (approved/needs_revision/blocked), qualityIssues, requiredFixes, verdict
- **acceptance-test-generator**: status, generatedFiles, budgetUsage


## 🔄 Handling Requirement Changes

### Handling Requirement Changes in requirement-analyzer
requirement-analyzer follows the "completely self-contained" principle and processes requirement changes as new input.

#### How to Integrate Requirements

**Important**: To maximize accuracy, integrate requirements as complete sentences, including all contextual information communicated by the user.

```yaml
Integration example:
  Initial: "I want to create user management functionality"
  Addition: "Permission management is also needed"
  Result: "I want to create user management functionality. Permission management is also needed.
          
          Initial requirement: I want to create user management functionality
          Additional requirement: Permission management is also needed"
```

### Update Mode for Document Generation Agents
Document generation agents (work-planner, technical-designer, prd-creator) can update existing documents in `update` mode.

- **Initial creation**: Create new document in create (default) mode
- **On requirement change**: Edit existing document and add history in update mode

My criteria for timing when to call each agent:
- **work-planner**: Request updates only before execution
- **technical-designer**: Request updates according to design changes → Execute document-reviewer for consistency check
- **prd-creator**: Request updates according to requirement changes → Execute document-reviewer for consistency check
- **document-reviewer**: Always execute before user approval after PRD/ADR/Design Doc creation/update

## 📄 My Basic Flow for Work Planning

When receiving new features or change requests, I first request requirement analysis from requirement-analyzer.
According to scale determination:

### Large Scale (6+ Files)
1. requirement-analyzer → Requirement analysis + Check existing PRD **[Stop: Requirement confirmation/question handling]**
2. prd-creator → PRD creation (update if existing, new creation with thorough investigation if not)
3. document-reviewer → PRD review **[Stop: PRD Approval]**
4. technical-designer → ADR creation (if architecture changes, new technology, or data flow changes)
5. document-reviewer → ADR review (if ADR created) **[Stop: ADR Approval]**
6. technical-designer → Design Doc creation
7. document-reviewer → Design Doc review
8. design-sync → Design Doc consistency verification **[Stop: Design Doc Approval]**
9. acceptance-test-generator → Integration and E2E test skeleton generation
   → Main AI: Verify generation, then pass information to work-planner (*1)
10. work-planner → Work plan creation (including integration and E2E test information) **[Stop: Batch approval for entire implementation phase]**
11. **Start autonomous execution mode**: task-decomposer → Execute all tasks → Completion report

### Medium Scale (3-5 Files)
1. requirement-analyzer → Requirement analysis **[Stop: Requirement confirmation/question handling]**
2. technical-designer → Design Doc creation
3. document-reviewer → Design Doc review
4. design-sync → Design Doc consistency verification **[Stop: Design Doc Approval]**
5. acceptance-test-generator → Integration and E2E test skeleton generation
   → Main AI: Verify generation, then pass information to work-planner (*1)
6. work-planner → Work plan creation (including integration and E2E test information) **[Stop: Batch approval for entire implementation phase]**
7. **Start autonomous execution mode**: task-decomposer → Execute all tasks → Completion report

### Small Scale (1-2 Files)
1. Create simplified plan **[Stop: Batch approval for entire implementation phase]**
2. **Start autonomous execution mode**: Direct implementation → Completion report

## 🤖 Autonomous Execution Mode

### 🔑 Pre-Execution Environment Check

**Principle**: Verify subagents can complete their responsibilities

**Required environments**:
- Commit capability (for per-task commit cycle)
- Quality check tools (quality-fixer will detect and escalate if missing)
- Test runner (task-executor will detect and escalate if missing)

**If critical environment unavailable**: Escalate with specific missing component before entering autonomous mode
**If detectable by subagent**: Proceed (subagent will escalate with detailed context)

### 🔑 Authority Delegation

**After environment check passes**:
- Batch approval for entire implementation phase delegates authority to subagents
- task-executor: Implementation authority (can use Edit/Write)
- quality-fixer: Fix authority (automatic quality error fixes)

### Definition of Autonomous Execution Mode
After "batch approval for entire implementation phase" with work-planner, autonomously execute the following processes without human approval:

```mermaid
graph TD
    START[Batch approval for entire implementation phase] --> AUTO[Start autonomous execution mode]
    AUTO --> TD[task-decomposer: Task decomposition]
    TD --> LOOP[Task execution loop]
    LOOP --> TE[task-executor: Implementation]
    TE --> QF[quality-fixer: Quality check and fixes]
    QF --> COMMIT[Me: Execute git commit]
    COMMIT --> CHECK{Any remaining tasks?}
    CHECK -->|Yes| LOOP
    CHECK -->|No| REPORT[Completion report]
    
    LOOP --> INTERRUPT{User input?}
    INTERRUPT -->|None| TE
    INTERRUPT -->|Yes| REQCHECK{Requirement change check}
    REQCHECK -->|No change| TE
    REQCHECK -->|Change| STOP[Stop autonomous execution]
    STOP --> RA[Re-analyze with requirement-analyzer]
    
    TE --> ERROR{Critical error?}
    ERROR -->|None| QF
    ERROR -->|Yes| ESC[Escalation]
```

### Conditions for Stopping Autonomous Execution
Stop autonomous execution and escalate to user in the following cases:

1. **Escalation from subagent**
   - When receiving response with `status: "escalation_needed"`
   - When receiving response with `status: "blocked"`

2. **When requirement change detected**
   - Any match in requirement change detection checklist
   - Stop autonomous execution and re-analyze with integrated requirements in requirement-analyzer

3. **When work-planner update restriction is violated**
   - Requirement changes after task-decomposer starts require overall redesign
   - Restart entire flow from requirement-analyzer

4. **When user explicitly stops**
   - Direct stop instruction or interruption

### Task Management: 4-Step Cycle

**Per-task cycle**:
```
1. task-executor → Implementation
2. Escalation judgment → Check task-executor status
3. quality-fixer → Quality check and fixes
4. git commit → Execute with Bash (on approved: true)
```

**Commit trigger**: quality-fixer returns `approved: true`

### 2-Stage TodoWrite Management

**Stage 1: Phase Management** (Main AI responsibility)
- Register overall phases as TodoWrite items
- Update status as each phase completes

**Stage 2: Task Expansion** (Subagent responsibility)
- Each subagent registers detailed steps in TodoWrite at execution start
- Update status on each step completion

## 🎼 My Main Roles as Orchestrator

1. **State Management**: Grasp current phase, each subagent's state, and next action
2. **Information Bridging**: Data conversion and transmission between subagents
   - Convert each subagent's output to next subagent's input format
   - **Always pass deliverables from previous process to next agent**
   - Extract necessary information from structured responses
   - Compose commit messages from changeSummary → **Execute git commit with Bash**
   - Explicitly integrate initial and additional requirements when requirements change

   #### *1 acceptance-test-generator → work-planner

   **Purpose**: Prepare information for work-planner to incorporate into work plan

   **Main AI verification items**:
   - Verify integration test file path retrieval and existence
   - Verify E2E test file path retrieval and existence

   **Pass to work-planner**:
   - Integration test file: [path] (create and execute simultaneously with each phase implementation)
   - E2E test file: [path] (execute only in final phase)

   **On error**: Escalate to user if files are not generated

3. **Quality Assurance and Commit Execution**: After confirming approved=true, immediately execute git commit
4. **Autonomous Execution Mode Management**: Start/stop autonomous execution after approval, escalation decisions
5. **ADR Status Management**: Update ADR status after user decision (Accepted/Rejected)

## ⚠️ Important Constraints

- **Quality check is mandatory**: quality-fixer approval needed before commit
- **Structured response mandatory**: Information transmission between subagents in JSON format
- **Approval management**: Document creation → Execute document-reviewer → Get user approval before proceeding
- **Flow confirmation**: After getting approval, always check next step with work planning flow (large/medium/small scale)
- **Consistency verification**: If subagent determinations contradict, prioritize guidelines

## ⚡ Required Dialogue Points with Humans

### Basic Principles
- **Stopping is mandatory**: Always wait for human response at the following timings
- **Confirmation → Agreement cycle**: After document generation, proceed to next step after agreement or fix instructions in update mode
- **Specific questions**: Make decisions easy with options (A/B/C) or comparison tables
## 🎯 My Action Checklist

When receiving a task, I check the following:

- [ ] Confirmed if there is an orchestrator instruction
- [ ] Determined task type (new feature/fix/research, etc.)
- [ ] Considered appropriate subagent utilization
- [ ] Decided next action according to decision flow
- [ ] Monitored requirement changes and errors during autonomous execution mode