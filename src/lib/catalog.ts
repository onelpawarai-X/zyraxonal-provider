import snapshot from './catalog/snapshot.json'

export type Model = {
  id: string; name: string; description?: string; family?: string;
  attachment?: boolean; reasoning?: boolean; tool_call?: boolean;
  structured_output?: boolean; temperature?: boolean; open_weights?: boolean;
  release_date?: string; last_updated?: string; knowledge?: string; type?: string;
  modalities?: { input?: string[]; output?: string[] };
  limit?: { context?: number; input?: number; output?: number };
  cost?: { input?: number; output?: number; cache_read?: number; cache_write?: number };
  canonical_model_id?: string; license?: string;
  benchmarks?: { name: string; score: number; metric?: string; source?: string }[];
}
export type Provider = { id: string; name: string; doc?: string; api?: string; npm?: string; env?: string[]; models: Record<string, Model> }
export type Entry = { provider: Provider; model: Model }
export type Catalog = { providers: Record<string, Provider>; models: Record<string, Model> }
export const catalog = snapshot as unknown as Catalog
export const providers = Object.values(catalog.providers).sort((a,b) => a.name.localeCompare(b.name))
export const models = Object.values(catalog.models)
export const labName = (id: string) => ({ 'moonshotai': 'Moonshot AI', 'zhipuai': 'Zhipu AI', 'alibaba': 'Alibaba', 'bytedance-seed': 'ByteDance Seed', 'inclusionai': 'InclusionAI', 'meta': 'Meta', 'xai': 'xAI', 'openai': 'OpenAI', 'minimax': 'MiniMax', 'deepseek': 'DeepSeek', 'openbmb': 'OpenBMB' }[id] ?? catalog.providers[id]?.name ?? id.replace(/(^|-)(\w)/g, (_,s: string,c: string) => `${s ? ' ' : ''}${c.toUpperCase()}`))
export const labId = (model: Model) => model.id.split('/')[0] ?? model.id
export const entriesByModel = new Map<string, Entry[]>()
for (const provider of providers) {
  for (const model of Object.values(provider.models)) {
    const id = model.canonical_model_id ?? model.id
    const entries = entriesByModel.get(id) ?? []
    entries.push({ provider, model })
    entriesByModel.set(id, entries)
  }
}
export const getEntries = (id: string) => entriesByModel.get(id) ?? []
export const labs = [...new Set(models.map(labId))].map(id => ({id, name:labName(id), models:models.filter(m => labId(m) === id)})).sort((a,b) => a.name.localeCompare(b.name))
export const formatNumber = (n?: number) => n === undefined ? '—' : n.toLocaleString('en-US')
export const formatCost = (n?: number) => n === undefined ? '—' : `$${n.toFixed(n > 0 && n < .01 ? 4 : 2)}`
export const priceOf = (model: Model) => {
  const entries = getEntries(model.id).filter(e => e.model.cost?.input !== undefined)
  if (!entries.length) return model.cost
  return entries.reduce((best, e) => (e.model.cost?.input ?? Infinity) < (best.model.cost?.input ?? Infinity) ? e : best).model.cost
}
export const directoryHead = (view: string) => ({meta:[
  {title:`${view} — ZYRAXON AI`},
  {name:'description',content:`Explore AI ${view.toLowerCase()}, model specifications, capabilities and pricing. A ZYRAXON AI directory by onelpawarai.`},
  {property:'og:title',content:`${view} — ZYRAXON AI`},
  {property:'og:description',content:`Compare AI ${view.toLowerCase()} with ZYRAXON AI. Bangladesh · operating globally.`},
  {property:'og:type',content:'website'},
  {name:'twitter:card',content:'summary_large_image'},
]})