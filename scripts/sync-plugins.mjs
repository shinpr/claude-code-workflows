#!/usr/bin/env node
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MARKETPLACE_PATH = join(ROOT, '.claude-plugin', 'marketplace.json')
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
}

async function loadLocalPlugins() {
  const marketplace = JSON.parse(await readFile(MARKETPLACE_PATH, 'utf8'))
  return marketplace.plugins.filter((p) => isLocalSource(p.source))
}

async function syncAll(baseDir) {
  const local = await loadLocalPlugins()
  for (const entry of local) {
    await generatePlugin(entry, baseDir)
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
