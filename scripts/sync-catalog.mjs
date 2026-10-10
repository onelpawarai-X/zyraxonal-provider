#!/usr/bin/env node
// ZYRAXON AI catalog sync.
// Pulls the open MIT-licensed upstream catalog, keeps provider records exactly as
// published (OpenCode included), and writes:
//   - src/lib/catalog/snapshot.json  (build-time data for the website)
//   - public/api.json                (public drop-in API, same shape as upstream)
//   - public/catalog-meta.json       (sync time + counts)
// Exits 0 with "NO_CHANGES" when nothing differs.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const SOURCE = process.env.CATALOG_SOURCE ?? 'https://models.dev/api.json'
const SNAPSHOT = 'src/lib/catalog/snapshot.json'
const API = 'public/api.json'
const META = 'public/catalog-meta.json'

const res = await fetch(SOURCE, { headers: { 'user-agent': 'zyraxon-ai-sync' } })
if (!res.ok) throw new Error(`Upstream fetch failed: ${res.status}`)
const upstream = await res.json()

// Safety filter: refuse obviously broken payloads so the live site never empties.
const providerIds = Object.keys(upstream)
if (providerIds.length < 50) throw new Error(`Refusing sync: only ${providerIds.length} providers`)
const providers = {}
for (const id of providerIds.sort()) {
  const p = upstream[id]
  if (!p || typeof p !== 'object' || typeof p.name !== 'string' || typeof p.models !== 'object') continue
  providers[id] = p
}

// Unique model list: first entry per model id, preferring the richest record.
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

const snapshot = JSON.stringify({ providers, models })
const api = JSON.stringify(providers)
let previous = ''
try { previous = await readFile(SNAPSHOT, 'utf8') } catch {}
const hash = (s) => createHash('sha256').update(s).digest('hex')
if (previous && hash(previous) === hash(snapshot)) {
  console.log('NO_CHANGES')
  process.exit(0)
}

await mkdir('public', { recursive: true })
await writeFile(SNAPSHOT, snapshot)
await writeFile(API, api)
// models.json: same as upstream /models.json when available, else our merged unique list.
let modelsJson = JSON.stringify(models)
try {
  const r = await fetch(SOURCE.replace(/api\.json$/, 'models.json'), { headers: { 'user-agent': 'zyraxon-ai-sync' } })
  if (r.ok) { const m = await r.json(); if (Object.keys(m).length >= 500) modelsJson = JSON.stringify(m) }
} catch {}
await writeFile('public/models.json', modelsJson)
// providers.json: provider list without model payloads.
const providerList = Object.fromEntries(Object.entries(providers).map(([id, { models: pm, ...rest }]) => [id, { ...rest, id, model_count: Object.keys(pm).length }]))
await writeFile('public/providers.json', JSON.stringify(providerList))
const variants = Object.values(providers).reduce((n, p) => n + Object.keys(p.models).length, 0)
await writeFile(META, JSON.stringify({ synced_at: new Date().toISOString(), providers: Object.keys(providers).length, models: modelCount, variants }, null, 2))
console.log(`UPDATED providers=${Object.keys(providers).length} models=${modelCount} variants=${variants}`)
