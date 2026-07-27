#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MARKETPLACE_PATH = join(ROOT, '.claude-plugin', 'marketplace.json')
const QUALIFIED_SUBAGENT =
  /subagent_type`?\s*:\s*(?:`?["'])?([a-z0-9][a-z0-9-]*):([a-z0-9][a-z0-9-]*)(?=[`"',)\s]|$)/gi

function isLocalPlugin(entry) {
  return typeof entry.source === 'string' && entry.source === `./${entry.name}`
}

function packagedAgentNames(entry) {
  return new Set(
    (entry.agents ?? []).map((agentPath) => basename(agentPath).replace(/\.md$/, '')),
  )
}

function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/')
}

async function recipeFiles(entry) {
  const skillsDir = join(ROOT, entry.source, 'skills')
  let directories
  try {
    directories = await readdir(skillsDir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }

  return directories
    .filter((item) => item.isDirectory() && item.name.startsWith('recipe-'))
    .map((item) => join(skillsDir, item.name, 'SKILL.md'))
    .sort()
}

function referencesIn(markdown) {
  const references = []
  for (const [index, line] of markdown.split('\n').entries()) {
    QUALIFIED_SUBAGENT.lastIndex = 0
    for (const match of line.matchAll(QUALIFIED_SUBAGENT)) {
      references.push({
        namespace: match[1],
        agent: match[2],
        line: index + 1,
      })
    }
  }
  return references
}

async function main() {
  const marketplace = JSON.parse(await readFile(MARKETPLACE_PATH, 'utf8'))
  const plugins = marketplace.plugins.filter(isLocalPlugin)
  const failures = []
  let checked = 0

  for (const plugin of plugins) {
    const localAgents = packagedAgentNames(plugin)
    for (const recipePath of await recipeFiles(plugin)) {
      const markdown = await readFile(recipePath, 'utf8')
      for (const reference of referencesIn(markdown)) {
        if (!localAgents.has(reference.agent)) continue
        checked++
        if (reference.namespace === plugin.name) continue
        failures.push({
          plugin: plugin.name,
          recipePath,
          ...reference,
        })
      }
    }
  }

  for (const failure of failures) {
    console.error(
      `✗ plugin=${failure.plugin} recipe=${displayPath(failure.recipePath)}:${failure.line} ` +
        `packagedAgent=${failure.agent} expectedNamespace=${failure.plugin} ` +
        `actualNamespace=${failure.namespace}`,
    )
  }

  if (failures.length > 0) {
    console.error(`\ncheck-agent-references: ${failures.length} invalid local agent reference(s)`)
    process.exit(1)
  }

  console.log(`check-agent-references: ${checked} local agent reference(s) use their plugin namespace`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
