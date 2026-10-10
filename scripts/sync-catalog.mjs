#!/usr/bin/env node
// ZYRAXON AI catalog & assets sync.
// Pulls the open MIT-licensed upstream catalog, models, and provider logos.
// Writes:
//   - src/lib/catalog/snapshot.json  (build-time data for website)
//   - public/api.json                (public drop-in API, same shape as upstream)
//   - public/models.json             (drop-in replacement matching models.dev)
//   - public/providers.json          (lightweight provider list)
//   - public/logos/<id>.svg          (all provider logos including openai.svg)
//   - public/catalog-meta.json       (sync time + counts)
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const SOURCE = process.env.CATALOG_SOURCE ?? 'https://models.dev/api.json'
const MODELS_SOURCE = SOURCE.replace(/api\.json$/, 'models.json')
const LOGOS_BASE = SOURCE.replace(/api\.json$/, 'logos')

const SNAPSHOT = 'src/lib/catalog/snapshot.json'
const API = 'public/api.json'
const META = 'public/catalog-meta.json'
const LOGOS_DIR = 'public/logos'

console.log('Fetching upstream catalog from:', SOURCE)
const res = await fetch(SOURCE, { headers: { 'user-agent': 'zyraxon-ai-sync' } })
if (!res.ok) throw new Error(`Upstream fetch failed: ${res.status}`)
const upstream = await res.json()

// Safety filter: refuse obviously broken payloads
const providerIds = Object.keys(upstream)
if (providerIds.length < 50) throw new Error(`Refusing sync: only ${providerIds.length} providers`)
const providers = {}
for (const id of providerIds.sort()) {
  const p = upstream[id]
  if (!p || typeof p !== 'object' || typeof p.name !== 'string' || typeof p.models !== 'object') continue
  providers[id] = p
}

// Merge unique models for snapshot
const models = {}
const score = (m) => Object.keys(m).length + (m.cost ? 5 : 0) + (m.limit ? 3 : 0)
for (const p of Object.values(providers)) {
  for (const [key, m] of Object.entries(p.models)) {
    const id = m.id ?? key
    if (!models[id] || score(m) > score(models[id])) models[id] = { ...m, id }
  }
}
const modelCount = Object.keys(models).length
if (modelCount < 500) throw new Error(`Refusing sync: only ${modelCount} models`)

await mkdir('public', { recursive: true })
await mkdir(LOGOS_DIR, { recursive: true })

// 1. models.json (models.dev-এর হুবহু গঠন ও ডেটা)
console.log('Fetching canonical models.json from:', MODELS_SOURCE)
try {
  const r = await fetch(MODELS_SOURCE, { headers: { 'user-agent': 'zyraxon-ai-sync' } })
  if (r.ok) {
    const m = await r.json()
    if (Object.keys(m).length > 100) {
      await writeFile('public/models.json', JSON.stringify(m, null, 2))
      console.log(`Saved public/models.json (${Object.keys(m).length} canonical models)`)
    }
  } else {
    // Fallback to internal merged catalog if upstream models.json is unavailable
    await writeFile('public/models.json', JSON.stringify(models, null, 2))
  }
} catch (err) {
  console.warn('Failed to fetch upstream models.json, using fallback:', err.message)
  await writeFile('public/models.json', JSON.stringify(models, null, 2))
}

// 2. Provider Logos (e.g. openai.svg, google.svg, etc.)
console.log(`Syncing SVG logos for ${providerIds.length} providers into ${LOGOS_DIR}/...`)
let newLogos = 0
for (let i = 0; i < providerIds.length; i += 10) {
  const batch = providerIds.slice(i, i + 10)
  await Promise.all(batch.map(async (id) => {
    const targetPath = join(LOGOS_DIR, `${id}.svg`)
    const exists = await access(targetPath).then(() => true).catch(() => false)
    if (!exists) {
      try {
        const logoRes = await fetch(`${LOGOS_BASE}/${id}.svg`, {
          headers: { 'user-agent': 'zyraxon-ai-sync' }
        })
        if (logoRes.ok) {
          const svgText = await logoRes.text()
          if (svgText.includes('<svg')) {
            await writeFile(targetPath, svgText)
            newLogos++
          }
        }
      } catch {}
    }
  }))
}
console.log(`Logos sync complete. Downloaded ${newLogos} new logos.`)

// 3. Update snapshot, api.json, and providers.json
const snapshot = JSON.stringify({ providers, models })
const api = JSON.stringify(providers)

await writeFile(SNAPSHOT, snapshot)
await writeFile(API, api)

const providerList = Object.fromEntries(
  Object.entries(providers).map(([id, { models: pm, ...rest }]) => [
    id,
    { ...rest, id, model_count: Object.keys(pm).length }
  ])
)
await writeFile('public/providers.json', JSON.stringify(providerList, null, 2))

const variants = Object.values(providers).reduce((n, p) => n + Object.keys(p.models).length, 0)
await writeFile(
  META,
  JSON.stringify({
    synced_at: new Date().toISOString(),
    providers: Object.keys(providers).length,
    models: modelCount,
    variants,
    logos: providerIds.length
  }, null, 2)
)

console.log(`UPDATED providers=${Object.keys(providers).length} models=${modelCount} variants=${variants}`)
