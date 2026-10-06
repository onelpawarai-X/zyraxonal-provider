import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight, Check, Copy, Download, Github, Globe, Image, Mail, Music2, Search, SlidersHorizontal, Type, Video, FileText, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { catalog, models, providers, labs, labId, labName, getEntries, formatNumber, formatCost, priceOf, type Model, type Provider } from '@/lib/catalog'
import brand from '@/assets/zyraxon-logo.svg.asset.json'
import logos from '@/assets/provider-logos.json'
import apiAsset from '@/assets/api.json.asset.json'
import catalogAsset from '@/assets/catalog.json.asset.json'

type View = 'models' | 'providers' | 'labs'
type Row = { id: string; name: string; model?: Model; provider?: Provider; lab?: typeof labs[number] }
const logoMap: Record<string,string> = logos
const links = { github:'https://github.com/onelpawarai-X/ZYRAXON-AI', website:'https://zyraxonai.lovable.app', agent:'https://zyraxon-pro-x.lovable.app', portfolio:'https://onelpawarai.lovable.app', youtube:'https://www.youtube.com/@ZYRAXONAI', facebook:'https://www.facebook.com/onelpawarai', group:'https://zyraxon-group-x.lovable.app' }
function Logo({id}:{id:string}) { return logoMap[id] ? <img className="provider-logo" src={logoMap[id]} alt="" loading="lazy"/> : <Globe className="provider-logo"/> }
function Capability({value}:{value?:boolean}) { return <span className={`capability ${value ? 'yes' : ''}`}>{value ? <Check/> : null}{value === undefined ? '—' : value ? 'Yes' : 'No'}</span> }
function Modalities({values}:{values?:string[]}) { return <div className="modalities">{(values ?? ['text']).map(v => { const Icon = ({text:Type,image:Image,audio:Music2,video:Video,pdf:FileText} as Record<string,typeof Type>)[v] ?? FileText; return <span className="modality" key={v} title={v}><Icon/></span> })}</div> }
function CopyButton({text}:{text:string}) { const [copied,setCopied]=useState(false); return <Button variant="ghost" size="icon" aria-label="Copy model ID" title={copied?'Copied':'Copy model ID'} onClick={async()=>{try{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{setCopied(false)}}}>{copied?<Check/>:<Copy/>}</Button> }

export function Directory({view}:{view:View}) {
 const [query,setQuery]=useState('')
 const [labFilter,setLabFilter]=useState('')
 const [feature,setFeature]=useState('')
 const [sort,setSort]=useState({key:view==='models'?'updated':'name',desc:view==='models'})
 const [selected,setSelected]=useState<Model|null>(null)
 const [selectedProvider,setSelectedProvider]=useState<Provider|null>(null)
 const [selectedLab,setSelectedLab]=useState<typeof labs[number]|null>(null)
 const [info,setInfo]=useState<'about'|'usage'|null>(null)
 const [searchOpen,setSearchOpen]=useState(false)
 const [globalQuery,setGlobalQuery]=useState('')
 const scrollRef=useRef<HTMLDivElement>(null)
 const searchRef=useRef<HTMLInputElement>(null)
 useEffect(()=>{ const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();setSearchOpen(true)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[])
 const rows=useMemo(()=>{
  let data:Row[]=view==='models'?models.map(model=>({id:model.id,name:model.name,model})):view==='providers'?providers.map(provider=>({id:provider.id,name:provider.name,provider})):labs.map(lab=>({id:lab.id,name:lab.name,lab}))
  const q=query.toLowerCase().trim()
  data=data.filter(r=>`${r.name} ${r.id} ${r.model?labName(labId(r.model)):''}`.toLowerCase().includes(q))
  if(view==='models') data=data.filter(r=>{
   if(!r.model)return false
   return (!labFilter||labId(r.model)===labFilter)&&(!feature|| (feature==='open'?r.model.open_weights:feature==='reasoning'?r.model.reasoning:feature==='tools'?r.model.tool_call:feature==='structured'?r.model.structured_output:feature==='image'?r.model.modalities?.input?.includes('image'):true))
  })
  const val=(r:Row):string|number=>{
   const m=r.model
   if(sort.key==='name')return r.name.toLowerCase()
   if(sort.key==='lab')return m?labName(labId(m)):r.name
   if(sort.key==='count')return m?getEntries(m.id).length:r.provider?Object.keys(r.provider.models).length:r.lab?.models.length??0
   if(sort.key==='context')return m?.limit?.context??0
   if(sort.key==='output')return m?.limit?.output??0
   if(sort.key==='price')return m?priceOf(m)?.input??Infinity:0
   if(sort.key==='release')return m?.release_date??''
   if(sort.key==='updated')return m?.last_updated??''
   if(sort.key==='weights')return m?.open_weights?1:0
   return m?(m[sort.key as keyof Model]===true?1:0):0
  }
  return data.sort((a,b)=>{const x=val(a),y=val(b);const result=typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y));return (sort.desc?-result:result)||a.name.localeCompare(b.name)})
 },[view,query,labFilter,feature,sort])
 useEffect(()=>{scrollRef.current?.scrollTo({top:0})},[query,labFilter,feature,sort])
 const virtualizer=useVirtualizer({count:rows.length,getScrollElement:()=>scrollRef.current,estimateSize:()=>67,overscan:12,scrollMargin:42})
 const items=virtualizer.getVirtualItems()
 const columns=view==='models'?[['Model','name'],['Lab','lab'],['Providers','count'],['Context','context'],['Output','output'],['Input','modalities'],['Reasoning','reasoning'],['Tool call','tool_call'],['Structured','structured_output'],['Temp.','temperature'],['Weights','weights'],['Price / 1M tokens','price'],['Released','release'],['Updated','updated']]:view==='providers'?[['Provider','name'],['Models','count'],['SDK package','npm'],['API endpoint','api'],['Documentation','doc']]:[['Lab','name'],['Models','count'],['Latest model','latest'],['Open weights','weights'],['Latest release','release']]
 const setOrder=(key:string)=>setSort(old=>({key,desc:old.key===key?!old.desc:false}))
 const openRow=(row:Row)=>{if(row.model)setSelected(row.model);if(row.provider)setSelectedProvider(row.provider);if(row.lab)setSelectedLab(row.lab)}
 const openModel=(m:Model)=>{setSelectedProvider(null);setSelectedLab(null);setSelected(m)}
 const title=view==='models'?'AI models':view==='providers'?'AI providers':'AI labs'
 const results=models.filter(m=>`${m.name} ${m.id}`.toLowerCase().includes(globalQuery.toLowerCase())).slice(0,30)
 return <>
  <header className="app-header">
   <Link to="/" className="brand-link" aria-label="ZYRAXON AI home"><img src={brand.url} className="brand-logo" alt="ZYRAXON AI"/><span className="brand-divider"/><span className="brand-label">Model directory</span></Link>
   <div className="header-actions">
    <nav className="flex items-center" aria-label="Directory"><Link to="/" className={`nav-link ${view==='models'?'active':''}`}>Models</Link><Link to="/providers" className={`nav-link ${view==='providers'?'active':''}`}>Providers</Link><Link to="/labs" className={`nav-link ${view==='labs'?'active':''}`}>Labs</Link></nav>
    <Button className="header-github" variant="ghost" size="icon" asChild title="ZYRAXON AI on GitHub"><a href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github/></a></Button>
    <Button className="header-search" variant="outline" size="sm" onClick={()=>setSearchOpen(true)}><Search/> Search <span className="key-hint">⌘ K</span></Button>
    <Button variant="default" size="sm" onClick={()=>setInfo('usage')}>How to use <ArrowUpRight/></Button>
   </div>
  </header>
  <section className="intro">
   <div><div className="eyebrow">ZYRAXON AI / Intelligence index</div><h1>{title}</h1><p>{view==='models'?'An open-source database of AI models, pricing & capabilities.':view==='providers'?'The platforms powering the world’s AI models.':'The teams building the next generation of intelligence.'}</p></div>
   <div className="intro-meta"><div className="live-label"><span className="live-dot"/>Open-source model catalog</div>{formatNumber(models.length)} models <span className="mx-2">/</span> {providers.length} providers <span className="mx-2">/</span> {labs.length} labs</div>
  </section>
  <div className="catalog-toolbar">
   <label className="search-field"><Search size={15}/><input ref={searchRef} aria-label={`Search ${view}`} placeholder={`Search ${view}...`} value={query} onChange={e=>setQuery(e.target.value)}/>{query?<Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Clear search" onClick={()=>setQuery('')}><X/></Button>:<span className="key-hint">⌘ K</span>}</label>
   {view==='models'&&<><select className="filter-select" aria-label="Filter by lab" value={labFilter} onChange={e=>setLabFilter(e.target.value)}><option value="">All labs</option>{labs.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select><select className="filter-select" aria-label="Filter capabilities" value={feature} onChange={e=>setFeature(e.target.value)}><option value="">All capabilities</option><option value="reasoning">Reasoning</option><option value="tools">Tool calling</option><option value="structured">Structured output</option><option value="open">Open weights</option><option value="image">Image input</option></select></>}
   {(query||feature||labFilter)&&<Button variant="ghost" size="sm" aria-label="Reset filters" onClick={()=>{setQuery('');setFeature('');setLabFilter('')}}><X/></Button>}
   <span className="result-count">{formatNumber(rows.length)} {view}</span>
   <Button variant="ghost" size="icon" className="toolbar-download" title="Download complete catalog JSON" asChild><a href={catalogAsset.url} download="zyraxon-catalog.json" target="_blank" rel="noreferrer" aria-label="Download catalog"><Download/></a></Button>
  </div>
  <div ref={scrollRef} className="directory-scroll" role="region" aria-label={`${title} directory`} tabIndex={0}>
   <div className={`table-head ${view==='models'?'model-grid':view==='providers'?'provider-grid':'lab-grid'}`} role="row">{columns.map(([label,key],i)=><div key={key} className={i===0?'sticky-identity':''}><Button variant="ghost" onClick={()=>setOrder(key)} aria-label={`Sort by ${label}`}>{label}{sort.key===key?sort.desc?<ArrowDown/>:<ArrowUp/>:<ArrowUpDown/>}</Button></div>)}</div>
   {rows.length===0?<div className="empty-state"><Search size={25}/><span>No {view} found</span><Button variant="outline" size="sm" onClick={()=>{setQuery('');setFeature('');setLabFilter('')}}>Reset filters</Button></div>:<div style={{height:virtualizer.getTotalSize(),position:'relative'}}>
    {items.map(item=>{const row=rows[item.index];if(!row)return null;const m=row.model;const cost=m?priceOf(m):undefined;const latest=row.lab?[...row.lab.models].sort((a,b)=>(b.release_date??'').localeCompare(a.release_date??''))[0]:undefined;return <div key={row.id} data-index={item.index} className={`data-row ${view==='models'?'model-grid':view==='providers'?'provider-grid':'lab-grid'}`} style={{position:'absolute',top:0,left:0,width:'100%',transform:`translateY(${item.start-42}px)`}} role="row">
     <div className="sticky-identity"><Button variant="ghost" className="identity-button" onClick={()=>openRow(row)}><div className="model-name">{view!=='models'&&<span className="inline-flex mr-2 align-middle"><Logo id={row.id}/></span>}{row.name}</div><div className="model-id">{row.id}</div></Button></div>
     {m?<><div><Button variant="ghost" className="identity-button" onClick={()=>{const l=labs.find(l=>l.id===labId(m));if(l)setSelectedLab(l)}}><span className="lab-identity"><Logo id={labId(m)}/>{labName(labId(m))}</span></Button></div><div><Button variant="ghost" className="count-link" onClick={()=>setSelected(m)}>{getEntries(m.id).length}</Button></div><div className="mono-value">{formatNumber(m.limit?.context)}</div><div className="mono-value">{formatNumber(m.limit?.output)}</div><div><Modalities values={m.modalities?.input}/></div><div><Capability value={m.reasoning}/></div><div><Capability value={m.tool_call}/></div><div><Capability value={m.structured_output}/></div><div><Capability value={m.temperature}/></div><div><span className={`weight-label ${m.open_weights?'open':''}`}>{m.open_weights?'Open':'Closed'}</span></div><div className="price">{cost?`${formatCost(cost.input)} / ${formatCost(cost.output)}`:'—'}</div><div className="mono-value">{m.release_date??'—'}</div><div className="mono-value">{m.last_updated??'—'}</div></>:row.provider?<><div><Button variant="ghost" className="count-link" onClick={()=>setSelectedProvider(row.provider??null)}>{Object.keys(row.provider.models).length}</Button></div><div className="mono-value truncate" title={row.provider.npm}>{row.provider.npm??'—'}</div><div className="mono-value truncate" title={row.provider.api}>{row.provider.api??'—'}</div><div><a className="text-primary inline-flex items-center gap-2 text-xs" href={row.provider.doc} target="_blank" rel="noreferrer">{row.provider.doc?new URL(row.provider.doc).hostname:'—'}{row.provider.doc&&<ExternalLink size={12}/>}</a></div></>:row.lab?<><div className="mono-value">{row.lab.models.length}</div><div className="model-name">{latest?.name??'—'}</div><div className="mono-value">{row.lab.models.filter(m=>m.open_weights).length} / {row.lab.models.length}</div><div className="mono-value">{latest?.release_date??'—'}</div></>:null}
    </div>})}
   </div>}
  </div>
  <footer className="directory-footer"><div><span className="footer-brand">ZYRAXON AI</span><span className="mx-2">/</span> By onelpawarai <span className="mx-2">·</span> Bangladesh, operating globally</div><div className="footer-links"><a href={links.agent} target="_blank" rel="noreferrer">Cloud Agent <ArrowUpRight size={10} className="inline"/></a><a href={links.github} target="_blank" rel="noreferrer">GitHub</a><Button variant="ghost" className="h-auto p-0 text-[10px]" onClick={()=>setInfo('about')}>About</Button><a href="mailto:sayidilxs@gmail.com" className="footer-contact"><Mail size={12}/>Contact</a></div></footer>
  <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent className="detail-dialog">{selected&&<>
   <div className="detail-title"><Logo id={labId(selected)}/><DialogTitle>{selected.name}</DialogTitle></div><DialogDescription>{selected.description??`${labName(labId(selected))} · ${selected.family??'AI model'}`}</DialogDescription>
   <div className="flex items-center justify-between"><code className="text-xs text-muted-foreground">{selected.id}</code><CopyButton text={selected.id}/></div>
   <dl className="detail-summary"><div><dt>Context window</dt><dd>{formatNumber(selected.limit?.context)}</dd></div><div><dt>Max output</dt><dd>{formatNumber(selected.limit?.output)}</dd></div><div><dt>Release date</dt><dd>{selected.release_date??'—'}</dd></div><div><dt>Knowledge cutoff</dt><dd>{selected.knowledge??'—'}</dd></div></dl>
   <div className="flex flex-wrap gap-x-5 gap-y-3"><span>Reasoning <Capability value={selected.reasoning}/></span><span>Tool calling <Capability value={selected.tool_call}/></span><span>Structured <Capability value={selected.structured_output}/></span><span>Weights <Capability value={selected.open_weights}/></span><span>Input <Modalities values={selected.modalities?.input}/></span><span>Output <Modalities values={selected.modalities?.output}/></span></div>
   <h3 className="detail-section-title">Providers & pricing <span className="text-muted-foreground font-normal">/ USD per 1M tokens</span></h3><div className="pricing-overflow"><table className="pricing-table"><thead><tr><th>Provider</th><th>Input</th><th>Output</th><th>Cache read</th><th>Model ID</th></tr></thead><tbody>{getEntries(selected.id).map(e=><tr key={`${e.provider.id}:${e.model.id}`}><td><a href={e.provider.doc} target="_blank" rel="noreferrer" className="lab-identity"><Logo id={e.provider.id}/>{e.provider.name}</a></td><td className="font-mono">{formatCost(e.model.cost?.input)}</td><td className="font-mono">{formatCost(e.model.cost?.output)}</td><td className="font-mono">{formatCost(e.model.cost?.cache_read)}</td><td className="text-muted-foreground font-mono">{e.model.id}</td></tr>)}</tbody></table>{!getEntries(selected.id).length&&<p className="text-muted-foreground py-3">No provider endpoints listed for this model.</p>}</div>
   {!!selected.benchmarks?.length&&<><h3 className="detail-section-title">Benchmarks</h3><div className="flex flex-wrap gap-5">{selected.benchmarks.map(b=><a key={b.name} href={b.source} target="_blank" rel="noreferrer" className="text-xs">{b.name}: <strong>{b.score}</strong> {b.metric}</a>)}</div></>}
  </>}</DialogContent></Dialog>
  <Dialog open={!!selectedProvider||!!selectedLab} onOpenChange={open=>{if(!open){setSelectedProvider(null);setSelectedLab(null)}}}><DialogContent className="detail-dialog"><DialogTitle>{selectedProvider?.name??selectedLab?.name}</DialogTitle><DialogDescription>{selectedProvider?`${Object.keys(selectedProvider.models).length} provider models`:`${selectedLab?.models.length??0} models in this lab`}</DialogDescription>{selectedProvider&&<><dl className="about-list"><dt>Provider ID</dt><dd className="font-mono">{selectedProvider.id}</dd><dt>SDK package</dt><dd className="font-mono break-all">{selectedProvider.npm??'—'}</dd><dt>Environment</dt><dd className="font-mono break-all">{selectedProvider.env?.join(', ')??'—'}</dd><dt>Documentation</dt><dd><a href={selectedProvider.doc} target="_blank" rel="noreferrer">Open documentation ↗</a></dd></dl></>}<div className="search-results">{(selectedProvider?Object.values(selectedProvider.models):selectedLab?.models??[]).map(m=><Button key={m.id} variant="ghost" className="search-result" onClick={()=>openModel(catalog.models[m.canonical_model_id??m.id]??m)}><span>{m.name}<small className="block mt-1">{m.id}</small></span><ArrowUpRight/></Button>)}</div></DialogContent></Dialog>
  <Dialog open={searchOpen} onOpenChange={setSearchOpen}><DialogContent className="detail-dialog max-w-xl"><DialogTitle>Search the directory</DialogTitle><DialogDescription>ZYRAXON AI · Models, providers & labs</DialogDescription><label className="search-field w-full"><Search size={16}/><input autoFocus placeholder="Search models, providers or labs..." aria-label="Global search" value={globalQuery} onChange={e=>setGlobalQuery(e.target.value)}/></label><div className="search-results">{providers.filter(p=>globalQuery&&`${p.name} ${p.id}`.toLowerCase().includes(globalQuery.toLowerCase())).slice(0,5).map(p=><Button variant="ghost" className="search-result" key={p.id} onClick={()=>{setSearchOpen(false);setSelectedProvider(p)}}><span className="lab-identity"><Logo id={p.id}/>{p.name}</span><small>Provider</small></Button>)}{labs.filter(l=>globalQuery&&l.name.toLowerCase().includes(globalQuery.toLowerCase())).slice(0,3).map(l=><Button variant="ghost" className="search-result" key={l.id} onClick={()=>{setSearchOpen(false);setSelectedLab(l)}}><span>{l.name}</span><small>Lab</small></Button>)}{results.map(m=><Button variant="ghost" className="search-result" key={m.id} onClick={()=>{setSearchOpen(false);setSelected(m)}}><span>{m.name}<small className="block mt-1">{m.id}</small></span><ArrowUpRight/></Button>)}{results.length===0&&<p className="text-muted-foreground p-4">No models found.</p>}</div></DialogContent></Dialog>
  <Dialog open={!!info} onOpenChange={open=>{if(!open)setInfo(null)}}><DialogContent className="detail-dialog max-w-xl">{info==='about'?<><DialogTitle>ZYRAXON AI</DialogTitle><DialogDescription>All in one. Anything.</DialogDescription><img src={brand.url} alt="ZYRAXON AI" className="brand-logo"/><dl className="about-list"><dt>Author</dt><dd>onelpawarai</dd><dt>Based in</dt><dd>Bangladesh · operating globally</dd><dt>Email</dt><dd><a href="mailto:sayidilxs@gmail.com">sayidilxs@gmail.com</a></dd>{(['website','agent','portfolio','youtube','facebook','group'] as const).map(k=><div className="contents" key={k}><dt>{({website:'Website',agent:'Cloud Agent',portfolio:'Portfolio',youtube:'YouTube',facebook:'Facebook',group:'Access codes'})[k]}</dt><dd><a href={links[k]} target="_blank" rel="noreferrer">{k==='youtube'?'@ZYRAXONAI':k==='facebook'?'onelpawarai':k==='group'?'ZYRAXON Group':links[k].replace('https://','')}</a></dd></div>)}</dl><div className="border-t pt-4 mt-2 text-[10px] text-muted-foreground">Open-source model data. <a className="underline" href="/MODELS-DATA-LICENSE.txt" target="_blank" rel="noreferrer">MIT license & copyright notice</a>.</div></>:<><DialogTitle>Use with ZYRAXON AI</DialogTitle><DialogDescription>Model specifications, pricing and capabilities.</DialogDescription><h3 className="detail-section-title">The complete catalog</h3><p className="text-sm text-muted-foreground">Download provider endpoints and model metadata as JSON. Provider IDs and Model IDs remain compatible with AI SDK integrations.</p><div className="flex gap-3"><Button variant="default" size="sm" asChild><a href={catalogAsset.url} target="_blank" rel="noreferrer" download="zyraxon-catalog.json"><Download/>Catalog JSON</a></Button><Button variant="outline" size="sm" asChild><a href={apiAsset.url} target="_blank" rel="noreferrer" download="zyraxon-api.json"><Download/>Provider JSON</a></Button></div><h3 className="detail-section-title">Model lookup</h3><pre className="code-block">{'const model = catalog.models["openai/gpt-5"];\nconst provider = catalog.providers["openai"];\n\nconsole.log(model.limit.context);\nconsole.log(provider.models);'}</pre><h3 className="detail-section-title">Build with your agent</h3><div className="flex gap-3"><Button variant="outline" asChild><a href={links.agent} target="_blank" rel="noreferrer">Cloud Agent <ArrowUpRight/></a></Button><Button variant="ghost" asChild><a href={links.github} target="_blank" rel="noreferrer"><Github/>GitHub</a></Button></div><p className="text-[11px] text-muted-foreground">Catalog snapshot: October 6, 2026. Prices are USD per million tokens and may vary by provider.</p></>}</DialogContent></Dialog>
 </>
}
