#!/usr/bin/env node
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MARKETPLACE_PATH = join(ROOT, '.claude-plugin', 'marketplace.json')
const SYNC_OVERRIDES_PATH = join(ROOT, '.claude-plugin', 'sync-overrides.json')
const CHECK = process.argv.slice(2).includes('--check')

function isLocalSource(source) {
  return typeof source === 'string' && source.startsWith('./')
}

function isInside(parent, child) {
  const rel = relative(parent, child)
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

async function resolveSafeSource(declaredPath, kind) {
  const allowedPrefix = `./${kind}/`
  if (typeof declaredPath !== 'string' || !declaredPath.startsWith(allowedPrefix)) {
    throw new Error(`unsafe ${kind} path (must start with ${allowedPrefix}): ${declaredPath}`)
  }
  const src = resolve(ROOT, declaredPath)
  if (!isInside(ROOT, src)) {
    throw new Error(`unsafe ${kind} path (escapes repo root): ${declaredPath}`)
  }
  await assertNoSymlinks(src, declaredPath)
  return src
}

async function assertNoSymlinks(absPath, label) {
  const st = await lstat(absPath)
  if (st.isSymbolicLink()) {
    throw new Error(`refusing to read symlinked source: ${label}`)
  }
  if (st.isDirectory()) {
    const entries = await readdir(absPath, { withFileTypes: true })
    for (const e of entries) {
      await assertNoSymlinks(join(absPath, e.name), `${label}/${e.name}`)
    }
  }
}

function pluginManifest(entry) {
  const out = {
    name: entry.name,
    description: entry.description,
    version: entry.version,
  }
  if (entry.author) out.author = entry.author
  if (entry.homepage) out.homepage = entry.homepage
  if (entry.repository) out.repository = entry.repository
  if (entry.license) out.license = entry.license
  if (entry.keywords) out.keywords = entry.keywords
  return out
}

async function generatePlugin(entry, baseDir) {
  const expectedSource = `./${entry.name}`
  if (entry.source !== expectedSource) {
    throw new Error(
      `plugin "${entry.name}" must declare source: "${expectedSource}" (got: ${JSON.stringify(entry.source)}). ` +
        'The source must equal "./" + plugin name to avoid accidentally overwriting the canonical agents/ or skills/ directories.',
    )
  }
  const targetDir = resolve(baseDir, entry.source)
  if (!isInside(baseDir, targetDir)) {
    throw new Error(`unsafe source path: ${entry.source}`)
  }

  await rm(targetDir, { recursive: true, force: true })
  await mkdir(join(targetDir, '.claude-plugin'), { recursive: true })
  await writeFile(
    join(targetDir, '.claude-plugin', 'plugin.json'),
    `${JSON.stringify(pluginManifest(entry), null, 2)}\n`,
  )

  for (const agentPath of entry.agents ?? []) {
    const src = await resolveSafeSource(agentPath, 'agents')
    const fileName = agentPath.split('/').pop()
    const dst = join(targetDir, 'agents', fileName)
    await mkdir(dirname(dst), { recursive: true })
    await cp(src, dst, { verbatimSymlinks: true })
  }

  for (const skillPath of entry.skills ?? []) {
    const src = await resolveSafeSource(skillPath, 'skills')
    const skillName = skillPath.split('/').pop()
    const dst = join(targetDir, 'skills', skillName)
    await mkdir(dirname(dst), { recursive: true })
    await cp(src, dst, { recursive: true, verbatimSymlinks: true })
  }

  await applyNamespaceRewrites(entry, targetDir)
  await applyDeprecations(entry, targetDir)
}

async function applyNamespaceRewrites(entry, targetDir) {
  const rules = entry.namespace_rewrites ?? []
  if (rules.length === 0) return
  for (const rule of rules) {
    if (typeof rule?.from !== 'string' || typeof rule?.to !== 'string') {
      throw new Error(
        `invalid namespace_rewrite in plugin "${entry.name}": both "from" and "to" must be strings`,
      )
    }
    if (!rule.from.endsWith(':') || !rule.to.endsWith(':')) {
      throw new Error(
        `invalid namespace_rewrite in plugin "${entry.name}": "from" and "to" must end with ":" (got from=${JSON.stringify(rule.from)}, to=${JSON.stringify(rule.to)})`,
      )
    }
    if (rule.from.length === 1 || rule.to.length === 1) {
      throw new Error(
        `invalid namespace_rewrite in plugin "${entry.name}": "from" and "to" must include a non-empty namespace before ":" (got from=${JSON.stringify(rule.from)}, to=${JSON.stringify(rule.to)})`,
      )
    }
  }
  // Apply longer "from" first to avoid prefix-overlap miswrites
  // (e.g. rewriting "dev-workflows:" before "dev-workflows-frontend:" would corrupt the latter).
  const ordered = [...rules].sort((a, b) => b.from.length - a.from.length)

  const files = []
  await collectMarkdownFiles(targetDir, files)
  for (const file of files) {
    const original = await readFile(file, 'utf8')
    let updated = original
    for (const rule of ordered) {
      updated = updated.split(rule.from).join(rule.to)
    }
    if (updated !== original) {
      await writeFile(file, updated)
    }
  }
}

async function collectMarkdownFiles(dir, out) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      await collectMarkdownFiles(full, out)
    } else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(full)
    }
  }
}

function skillBaseNames(entry) {
  return new Set((entry.skills ?? []).map((p) => p.split('/').pop()))
}

function agentBaseNames(entry) {
  return new Set((entry.agents ?? []).map((p) => p.split('/').pop().replace(/\.md$/, '')))
}

function resolveDeprecationTarget(entry, name, targetDir) {
  const skills = skillBaseNames(entry)
  const agents = agentBaseNames(entry)
  const inSkills = skills.has(name)
  const inAgents = agents.has(name)
  if (inSkills && inAgents) {
    throw new Error(
      `deprecation target "${name}" is ambiguous in plugin "${entry.name}" (matches both a skill and an agent)`,
    )
  }
  if (inSkills) return join(targetDir, 'skills', name, 'SKILL.md')
  if (inAgents) return join(targetDir, 'agents', `${name}.md`)
  throw new Error(
    `deprecation target "${name}" not found in plugin "${entry.name}" (check skills/agents lists for typos)`,
  )
}

async function applyDeprecations(entry, targetDir) {
  for (const dep of entry.deprecations ?? []) {
    if (typeof dep?.name !== 'string' || typeof dep?.notice !== 'string') {
      throw new Error(
        `invalid deprecation entry in plugin "${entry.name}": both "name" and "notice" must be strings`,
      )
    }
    const filePath = resolveDeprecationTarget(entry, dep.name, targetDir)
    const original = await readFile(filePath, 'utf8')
    const updated = injectDeprecationNotice(original, dep.notice, `${entry.name}:${dep.name}`)
    if (updated !== original) {
      await writeFile(filePath, updated)
    }
  }
}

function unquoteYamlDouble(value) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
  return value
}

function quoteYamlDouble(value) {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

function injectDeprecationNotice(content, notice, label) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    throw new Error(`frontmatter not found for deprecation target: ${label}`)
  }
  const fm = fmMatch[1]
  const descLineMatch = fm.match(/^description:[ \t]*(.*)$/m)
  if (!descLineMatch) {
    throw new Error(`description field not found in frontmatter for: ${label}`)
  }
  const rawValue = descLineMatch[1]
  const currentDesc = unquoteYamlDouble(rawValue)
  if (currentDesc.startsWith(notice)) {
    return content
  }
  const newValue = `${notice}${currentDesc}`
  const newLine = `description: ${quoteYamlDouble(newValue)}`
  const newFm = fm.replace(/^description:[ \t]*.*$/m, newLine)
  return content.replace(fmMatch[0], `---\n${newFm}\n---`)
}

async function loadLocalPlugins() {
  const marketplace = JSON.parse(await readFile(MARKETPLACE_PATH, 'utf8'))
  return marketplace.plugins.filter((p) => isLocalSource(p.source))
}

async function loadSyncOverrides() {
  let raw
  try {
    raw = await readFile(SYNC_OVERRIDES_PATH, 'utf8')
  } catch (e) {
    if (e.code === 'ENOENT') return {}
    throw e
  }
  const parsed = JSON.parse(raw)
  return parsed.plugins ?? {}
}

function mergeOverrides(entry, overrides) {
  const o = overrides[entry.name]
  if (!o) return entry
  return { ...entry, ...o }
}

async function syncAll(baseDir) {
  const local = await loadLocalPlugins()
  const overrides = await loadSyncOverrides()
  const knownPlugins = new Set(local.map((p) => p.name))
  for (const name of Object.keys(overrides)) {
    if (!knownPlugins.has(name)) {
      throw new Error(
        `sync-overrides.json references unknown plugin "${name}" (not declared in marketplace.json)`,
      )
    }
  }
  for (const entry of local) {
    await generatePlugin(mergeOverrides(entry, overrides), baseDir)
  }
  return local
}

async function pathExists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function listFilesRecursive(root) {
  const out = []
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = join(dir, e.name)
      if (e.isDirectory()) {
        await walk(full)
      } else if (e.isFile()) {
        out.push(relative(root, full).split(sep).join('/'))
      } else {
        out.push(`${relative(root, full).split(sep).join('/')} (non-regular: ${e.isSymbolicLink() ? 'symlink' : 'other'})`)
      }
    }
  }
  await walk(root)
  out.sort()
  return out
}

async function diffDirs(a, b) {
  const [filesA, filesB] = await Promise.all([listFilesRecursive(a), listFilesRecursive(b)])
  const diffs = []

  const setA = new Set(filesA)
  const setB = new Set(filesB)
  for (const f of filesA) {
    if (!setB.has(f)) diffs.push(`only in real: ${f}`)
  }
  for (const f of filesB) {
    if (!setA.has(f)) diffs.push(`only in expected: ${f}`)
  }

  const common = filesA.filter((f) => setB.has(f))
  for (const f of common) {
    const [bufA, bufB] = await Promise.all([readFile(join(a, f)), readFile(join(b, f))])
    if (!bufA.equals(bufB)) diffs.push(`content differs: ${f}`)
  }
  return diffs
}

async function checkDrift() {
  const tmp = await mkdtemp(join(tmpdir(), 'sync-plugins-'))
  try {
    const local = await syncAll(tmp)
    let drift = false
    for (const entry of local) {
      const real = resolve(ROOT, entry.source)
      const expected = resolve(tmp, entry.source)
      if (!(await pathExists(real))) {
        console.error(`[drift] missing subdirectory: ${entry.source}`)
        drift = true
        continue
      }
      const diffs = await diffDirs(real, expected)
      if (diffs.length > 0) {
        console.error(`[drift] ${entry.source}:`)
        for (const d of diffs) console.error(`  ${d}`)
        drift = true
      }
    }
    if (drift) {
      console.error('\nPlugin subdirectories are out of sync. Run: pnpm sync')
      process.exit(1)
    }
    console.log('All in-repo plugin subdirectories are in sync.')
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }
}

async function main() {
  if (CHECK) {
    await checkDrift()
    return
  }
  const local = await syncAll(ROOT)
  for (const entry of local) {
    console.log(`synced ${entry.name} -> ${entry.source}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
