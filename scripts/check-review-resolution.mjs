#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(ROOT, 'skills')
const AGENTS_DIR = join(ROOT, 'agents')
const GUIDE_PATH = join(SKILLS_DIR, 'subagents-orchestration-guide', 'SKILL.md')
const REFERENCE_PATH = join(
  SKILLS_DIR,
  'subagents-orchestration-guide',
  'references',
  'review-resolution.md',
)

const failures = []

function requireText(content, expected, label) {
  if (!content.includes(expected)) failures.push(`${label}: missing ${JSON.stringify(expected)}`)
}

async function main() {
  const guide = await readFile(GUIDE_PATH, 'utf8')
  const reference = await readFile(REFERENCE_PATH, 'utf8')

  for (const disposition of ['`apply`', '`decline`', '`user_decision_required`']) {
    requireText(reference, disposition, 'review-resolution reference')
  }
  requireText(guide, '### Review Resolution', 'orchestration guide')
  requireText(guide, 'references/review-resolution.md', 'orchestration guide')

  const reviewerFiles = [
    'code-reviewer.md',
    'document-reviewer.md',
    'integration-test-reviewer.md',
    'security-reviewer.md',
  ]
  for (const file of reviewerFiles) {
    const content = await readFile(join(AGENTS_DIR, file), 'utf8')
    requireText(content, 'prior_feedback', file)
    requireText(content, 'prior_feedback_reconciliation', file)
    requireText(content, 'prior_disposition', file)
    for (const status of ['resolved', 'withdrawn', 'maintained']) {
      requireText(content, status, file)
    }
  }

  const skillEntries = await readdir(SKILLS_DIR, { withFileTypes: true })
  const recipeFiles = skillEntries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('recipe-'))
    .map((entry) => join(SKILLS_DIR, entry.name, 'SKILL.md'))

  const reviewConsumerPattern = /document-reviewer|integration-test-reviewer|security-reviewer|code-reviewer/

  for (const file of recipeFiles) {
    const content = await readFile(file, 'utf8')
    const label = file.slice(ROOT.length + 1)

    if (content.includes('## Orchestrator Definition')) {
      requireText(content, '**Local authority gate**', label)
    }
    if (reviewConsumerPattern.test(content)) {
      requireText(content, '**Review Resolution Gate [MANDATORY]**', label)
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(`✗ ${failure}`)
    process.exit(1)
  }

  console.log(`check-review-resolution: ${recipeFiles.length} recipes and ${reviewerFiles.length} reviewer contracts pass`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
