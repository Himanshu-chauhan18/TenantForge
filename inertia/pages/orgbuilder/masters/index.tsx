import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  Database, Plus, Pencil, Search, X, RefreshCw,
  ChevronDown, Puzzle, Sparkles, Package,
  ShieldAlert, Zap, BookOpen, SlidersHorizontal,
} from 'lucide-react'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Addon {
  id: number
  moduleId: number
  name: string
  type: 'default' | 'custom' | 'advance'
  sortOrder: number
  isActive: boolean
}

interface Mod {
  id: number
  key: string
  label: string
  description: string | null
  isMandatory: boolean
  isActive: boolean
  isComingSoon: boolean
  sortOrder: number
  addons: Addon[]
}

interface Props {
  modules: Mod[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'modules', label: 'Modules' },
  { key: 'addons',  label: 'Add-ons' },
]

const TYPE_OPTS = [
  { value: 'default', label: 'Default' },
  { value: 'custom',  label: 'Custom' },
  { value: 'advance', label: 'Advanced' },
]

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  default: { label: 'Default',  icon: <Package   size={10} />, color: 'var(--text2)',  bg: 'var(--bg2)',  border: 'var(--border)'  },
  custom:  { label: 'Custom',   icon: <Puzzle    size={10} />, color: 'var(--p)',      bg: 'var(--p-lt)', border: 'var(--p-mid)'   },
  advance: { label: 'Advanced', icon: <Sparkles  size={10} />, color: '#d97706',      bg: '#fef3c7',     border: '#fde68a'        },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MastersIndex({ modules }: Props) {
  const urlObj     = new URL(window.location.href)
  const currentTab = (urlObj.searchParams.get('tab') || 'modules') as 'modules' | 'addons'

  // ── Tab slider ────────────────────────────────────────────────────────────
  const tabSegRef  = useRef<HTMLDivElement>(null)
  const tabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [slider, setSlider] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const seg = tabSegRef.current
    const btn = tabBtnRefs.current[currentTab]
    if (!seg || !btn) return
    const sr = seg.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setSlider({ left: br.left - sr.left, width: br.width, ready: true })
  }, [currentTab])

  function handleTab(key: string) {
    router.get('/orgbuilder/masters', { tab: key }, { preserveState: true, replace: true })
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  // ── Search filters ────────────────────────────────────────────────────────
  const [modSearch,   setModSearch]   = useState('')
  const [addonSearch, setAddonSearch] = useState('')
  const [addonModFilter, setAddonModFilter] = useState('')
  const [addonTypeFilter, setAddonTypeFilter] = useState('')
  const [modFilterOpen,  setModFilterOpen]  = useState(false)
  const [typeFilterOpen, setTypeFilterOpen] = useState(false)
  const modFilterRef  = useRef<HTMLButtonElement>(null)
  const typeFilterRef = useRef<HTMLButtonElement>(null)

  // ── Module CRUD ───────────────────────────────────────────────────────────
  const [addModOpen,  setAddModOpen]  = useState(false)
  const [editModOpen, setEditModOpen] = useState(false)
  const [editModTarget, setEditModTarget] = useState<Mod | null>(null)
  const [modProcessing, setModProcessing] = useState(false)

  const emptyModForm = () => ({ label: '', key: '', description: '', isMandatory: false, isActive: true, isComingSoon: false, sortOrder: '' })
  const [addModForm,  setAddModForm]  = useState(emptyModForm())
  const [editModForm, setEditModForm] = useState(emptyModForm())
  const [modErrors,   setModErrors]   = useState<Record<string, string>>({})

  // Auto-generate key from label in add form
  useEffect(() => {
    if (addModOpen) setAddModForm((f) => ({ ...f, key: slugify(f.label) }))
  }, [addModForm.label, addModOpen])

  function validateModForm(f: typeof addModForm) {
    const e: Record<string, string> = {}
    if (!f.label.trim()) e.label = 'Required'
    if (!f.key.trim())   e.key   = 'Required'
    setModErrors(e)
    return Object.keys(e).length === 0
  }

  function handleAddMod() {
    if (!validateModForm(addModForm)) return
    setModProcessing(true)
    router.post('/orgbuilder/masters/modules', {
      label: addModForm.label.trim(),
      key: slugify(addModForm.key),
      description: addModForm.description.trim() || null,
      isMandatory: addModForm.isMandatory,
      isActive: addModForm.isActive,
      isComingSoon: addModForm.isComingSoon,
      sortOrder: addModForm.sortOrder ? Number(addModForm.sortOrder) : 999,
    }, {
      onSuccess: () => { setAddModOpen(false); setAddModForm(emptyModForm()) },
      onFinish:  () => setModProcessing(false),
    })
  }

  function openEditMod(m: Mod) {
    setEditModTarget(m)
    setEditModForm({ label: m.label, key: m.key, description: m.description ?? '', isMandatory: m.isMandatory, isActive: m.isActive, isComingSoon: m.isComingSoon, sortOrder: String(m.sortOrder) })
    setModErrors({})
    setEditModOpen(true)
  }

  function handleEditMod() {
    if (!editModTarget) return
    const e: Record<string, string> = {}
    if (!editModForm.label.trim()) e.label = 'Required'
    setModErrors(e)
    if (Object.keys(e).length > 0) return
    setModProcessing(true)
    router.put(`/orgbuilder/masters/modules/${editModTarget.id}`, {
      label: editModForm.label.trim(),
      description: editModForm.description.trim() || null,
      isMandatory: editModForm.isMandatory,
      isActive: editModForm.isActive,
      isComingSoon: editModForm.isComingSoon,
      sortOrder: editModForm.sortOrder ? Number(editModForm.sortOrder) : editModTarget.sortOrder,
    }, {
      onSuccess: () => { setEditModOpen(false); setEditModTarget(null) },
      onFinish:  () => setModProcessing(false),
    })
  }

  // ── Addon CRUD ────────────────────────────────────────────────────────────
  const [addAddonOpen,  setAddAddonOpen]  = useState(false)
  const [editAddonOpen, setEditAddonOpen] = useState(false)
  const [editAddonTarget, setEditAddonTarget] = useState<Addon | null>(null)
  const [addonProcessing, setAddonProcessing] = useState(false)

  const emptyAddonForm = () => ({ name: '', moduleId: '', type: 'default' as 'default' | 'custom' | 'advance', sortOrder: '' })
  const [addAddonForm,  setAddAddonForm]  = useState(emptyAddonForm())
  const [editAddonForm, setEditAddonForm] = useState({ name: '', type: 'default' as 'default' | 'custom' | 'advance', sortOrder: '', isActive: true })
  const [addonErrors,   setAddonErrors]   = useState<Record<string, string>>({})

  function validateAddonForm(f: { name: string; moduleId: string }) {
    const e: Record<string, string> = {}
    if (!f.name.trim())   e.name     = 'Required'
    if (!f.moduleId)      e.moduleId = 'Required'
    setAddonErrors(e)
    return Object.keys(e).length === 0
  }

  function handleAddAddon() {
    if (!validateAddonForm(addAddonForm)) return
    setAddonProcessing(true)
    router.post('/orgbuilder/masters/addons', {
      name: addAddonForm.name.trim(),
      moduleId: Number(addAddonForm.moduleId),
      type: addAddonForm.type,
      sortOrder: addAddonForm.sortOrder ? Number(addAddonForm.sortOrder) : 999,
    }, {
      onSuccess: () => { setAddAddonOpen(false); setAddAddonForm(emptyAddonForm()) },
      onFinish:  () => setAddonProcessing(false),
    })
  }

  function openEditAddon(a: Addon) {
    setEditAddonTarget(a)
    setEditAddonForm({ name: a.name, type: a.type, sortOrder: String(a.sortOrder), isActive: a.isActive })
    setAddonErrors({})
    setEditAddonOpen(true)
  }

  function handleEditAddon() {
    if (!editAddonTarget) return
    const e: Record<string, string> = {}
    if (!editAddonForm.name.trim()) e.name = 'Required'
    setAddonErrors(e)
    if (Object.keys(e).length > 0) return
    setAddonProcessing(true)
    router.put(`/orgbuilder/masters/addons/${editAddonTarget.id}`, {
      name: editAddonForm.name.trim(),
      type: editAddonForm.type,
      sortOrder: editAddonForm.sortOrder ? Number(editAddonForm.sortOrder) : editAddonTarget.sortOrder,
      isActive: editAddonForm.isActive,
    }, {
      onSuccess: () => { setEditAddonOpen(false); setEditAddonTarget(null) },
      onFinish:  () => setAddonProcessing(false),
    })
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const allAddons: (Addon & { moduleName: string })[] = modules.flatMap((m) =>
    m.addons.map((a) => ({ ...a, moduleName: m.label }))
  )

  const filteredMods = modules.filter((m) => {
    if (!modSearch) return true
    const q = modSearch.toLowerCase()
    return m.label.toLowerCase().includes(q) || m.key.toLowerCase().includes(q) || (m.description ?? '').toLowerCase().includes(q)
  })

  const filteredAddons = allAddons.filter((a) => {
    if (addonModFilter && String(a.moduleId) !== addonModFilter) return false
    if (addonTypeFilter && a.type !== addonTypeFilter) return false
    if (addonSearch) {
      const q = addonSearch.toLowerCase()
      if (!a.name.toLowerCase().includes(q) && !a.moduleName.toLowerCase().includes(q)) return false
    }
    return true
  })

  const moduleSelectOpts = modules.map((m) => ({ value: String(m.id), label: m.label, sub: m.key }))
  const modFilterOpts    = [{ value: '', label: 'All Modules' }, ...modules.map((m) => ({ value: String(m.id), label: m.label }))]
  const typeFilterOpts   = [{ value: '', label: 'All Types' }, ...TYPE_OPTS.map((o) => ({ ...o }))]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Manage Masters</div>
          <div className="ph-sub">Configure system modules and their add-ons</div>
        </div>
        {currentTab === 'modules' && (
          <button className="btn btn-p" onClick={() => { setAddModForm(emptyModForm()); setModErrors({}); setAddModOpen(true) }}>
            <Plus size={14} /> Add Module
          </button>
        )}
        {currentTab === 'addons' && (
          <button className="btn btn-p" onClick={() => { setAddAddonForm(emptyAddonForm()); setAddonErrors({}); setAddAddonOpen(true) }}>
            <Plus size={14} /> Add Add-on
          </button>
        )}
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="tab-bar">
          <div ref={tabSegRef} className="tab-seg">
            <div style={{ position: 'absolute', top: 3, bottom: 3, left: slider.left, width: slider.width, background: 'var(--surface)', borderRadius: 7, boxShadow: '0 1px 4px rgba(0,0,0,.1)', transition: slider.ready ? 'left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1)' : 'none', opacity: slider.ready ? 1 : 0, pointerEvents: 'none', zIndex: 0 }} />
            {TABS.map((t) => (
              <button key={t.key} ref={(el) => { tabBtnRefs.current[t.key] = el }} className={`tab-btn${currentTab === t.key ? ' active' : ''}`} onClick={() => handleTab(t.key)}>
                {t.label}
                <span style={{ fontSize: '.62rem', fontWeight: 700, background: currentTab === t.key ? 'var(--p-lt)' : 'var(--bg2)', color: currentTab === t.key ? 'var(--p)' : 'var(--text4)', borderRadius: 10, padding: '1px 7px', marginLeft: 3 }}>
                  {t.key === 'modules' ? modules.length : allAddons.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Modules toolbar ──────────────────────────────────────────────── */}
        {currentTab === 'modules' && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
              <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <input value={modSearch} onChange={(e) => setModSearch(e.target.value)} placeholder="Search by label or key…" />
              {modSearch && <button type="button" onClick={() => setModSearch('')}><X size={12} style={{ color: 'var(--text3)' }} /></button>}
            </div>
            <button className="btn btn-ghost" title="Refresh" onClick={() => router.reload()} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
              <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
            </button>
            <div style={{ marginLeft: 'auto', fontSize: '.76rem', color: 'var(--text3)' }}>
              {filteredMods.length} module{filteredMods.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* ── Addons toolbar ────────────────────────────────────────────────── */}
        {currentTab === 'addons' && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 280 }}>
              <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <input value={addonSearch} onChange={(e) => setAddonSearch(e.target.value)} placeholder="Search add-on name…" />
              {addonSearch && <button type="button" onClick={() => setAddonSearch('')}><X size={12} style={{ color: 'var(--text3)' }} /></button>}
            </div>
            {/* Module filter */}
            <div style={{ position: 'relative' }}>
              <button ref={modFilterRef} className="btn btn-ghost" onClick={() => setModFilterOpen((v) => !v)} style={{ height: 36, padding: '0 11px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${addonModFilter ? 'var(--p)' : 'var(--border)'}`, color: addonModFilter ? 'var(--p)' : undefined, background: addonModFilter ? 'var(--p-lt)' : undefined }}>
                <SlidersHorizontal size={12} />
                {addonModFilter ? modules.find((m) => String(m.id) === addonModFilter)?.label : 'All Modules'}
                <ChevronDown size={11} style={{ color: 'var(--text3)', transform: modFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {modFilterOpen && (
                <FilterDropdown onClose={() => setModFilterOpen(false)}>
                  {modFilterOpts.map((o) => (
                    <button key={o.value} onClick={() => { setAddonModFilter(o.value); setModFilterOpen(false) }}
                      style={{ display: 'block', width: '100%', padding: '7px 14px', fontSize: '.8rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: o.value === addonModFilter ? 'var(--p)' : 'var(--text1)', fontWeight: o.value === addonModFilter ? 700 : 400 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >{o.label}</button>
                  ))}
                </FilterDropdown>
              )}
            </div>
            {/* Type filter */}
            <div style={{ position: 'relative' }}>
              <button ref={typeFilterRef} className="btn btn-ghost" onClick={() => setTypeFilterOpen((v) => !v)} style={{ height: 36, padding: '0 11px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${addonTypeFilter ? 'var(--p)' : 'var(--border)'}`, color: addonTypeFilter ? 'var(--p)' : undefined, background: addonTypeFilter ? 'var(--p-lt)' : undefined }}>
                {addonTypeFilter ? TYPE_META[addonTypeFilter]?.label : 'All Types'}
                <ChevronDown size={11} style={{ color: 'var(--text3)', transform: typeFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {typeFilterOpen && (
                <FilterDropdown onClose={() => setTypeFilterOpen(false)}>
                  {typeFilterOpts.map((o) => (
                    <button key={o.value} onClick={() => { setAddonTypeFilter(o.value); setTypeFilterOpen(false) }}
                      style={{ display: 'block', width: '100%', padding: '7px 14px', fontSize: '.8rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: o.value === addonTypeFilter ? 'var(--p)' : 'var(--text1)', fontWeight: o.value === addonTypeFilter ? 700 : 400 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >{o.label}</button>
                  ))}
                </FilterDropdown>
              )}
            </div>
            <button className="btn btn-ghost" title="Refresh" onClick={() => router.reload()} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
              <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
            </button>
            {(addonModFilter || addonTypeFilter) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setAddonModFilter(''); setAddonTypeFilter('') }} style={{ color: 'var(--p)', fontSize: '.76rem' }}>
                <X size={11} /> Clear filters
              </button>
            )}
            <div style={{ marginLeft: 'auto', fontSize: '.76rem', color: 'var(--text3)' }}>
              {filteredAddons.length} add-on{filteredAddons.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* ── Modules Table ─────────────────────────────────────────────────── */}
        {currentTab === 'modules' && (
          <div style={{ overflowX: 'auto' }}>
            {filteredMods.length === 0 ? (
              <EmptyState icon={<Database size={36} />} title="No modules found" desc={modSearch ? 'Try a different search term.' : 'Add your first module.'} />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <Th style={{ width: 52, textAlign: 'center' }}>#</Th>
                    <Th style={{ minWidth: 120 }}>Key</Th>
                    <Th style={{ minWidth: 160 }}>Label</Th>
                    <Th>Description</Th>
                    <Th style={{ width: 100, textAlign: 'center' }}>Mandatory</Th>
                    <Th style={{ width: 80, textAlign: 'center' }}>Status</Th>
                    <Th style={{ width: 110, textAlign: 'center' }}>Coming Soon</Th>
                    <Th style={{ width: 80, textAlign: 'center' }}>Add-ons</Th>
                    <Th style={{ width: 90 }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMods.map((m, idx) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)', transition: 'background .1s' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'var(--p-lt)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)')}
                    >
                      <Td style={{ textAlign: 'center', color: 'var(--text4)', fontSize: '.72rem', fontWeight: 700 }}>{m.sortOrder}</Td>
                      <Td>
                        <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text2)', fontFamily: 'monospace' }}>{m.key}</code>
                      </Td>
                      <Td>
                        <div style={{ fontWeight: 600, color: 'var(--text1)' }}>{m.label}</div>
                      </Td>
                      <Td>
                        <span style={{ color: 'var(--text3)', fontSize: '.78rem' }}>{m.description || <span style={{ color: 'var(--text4)' }}>—</span>}</span>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        {m.isMandatory
                          ? <span className="bdg bdg-red" style={{ fontSize: '.65rem' }}><ShieldAlert size={9} style={{ marginRight: 3 }} />Mandatory</span>
                          : <span style={{ color: 'var(--text4)', fontSize: '.75rem' }}>—</span>}
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <span className={`bdg ${m.isActive ? 'bdg-green' : 'bdg-gray'}`}>
                          <span className="bdg-dot" />{m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        {m.isComingSoon
                          ? <span className="bdg bdg-blue" style={{ fontSize: '.65rem' }}><Zap size={9} style={{ marginRight: 3 }} />Soon</span>
                          : <span style={{ color: 'var(--text4)', fontSize: '.75rem' }}>—</span>}
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <button onClick={() => { handleTab('addons'); setAddonModFilter(String(m.id)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 700, color: 'var(--p)', padding: '2px 6px', borderRadius: 5 }}>
                          <Puzzle size={11} /> {m.addons.length}
                        </button>
                      </Td>
                      <Td>
                        <button onClick={() => openEditMod(m)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }}>
                          <Pencil size={11} /> Edit
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Addons Table ──────────────────────────────────────────────────── */}
        {currentTab === 'addons' && (
          <div style={{ overflowX: 'auto' }}>
            {filteredAddons.length === 0 ? (
              <EmptyState icon={<Puzzle size={36} />} title="No add-ons found" desc={addonSearch || addonModFilter || addonTypeFilter ? 'Try adjusting your filters.' : 'Add your first add-on.'} />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <Th style={{ width: 52, textAlign: 'center' }}>#</Th>
                    <Th style={{ minWidth: 200 }}>Add-on Name</Th>
                    <Th style={{ width: 110 }}>Type</Th>
                    <Th style={{ minWidth: 140 }}>Module</Th>
                    <Th style={{ width: 90, textAlign: 'center' }}>Status</Th>
                    <Th style={{ width: 90 }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAddons.map((a, idx) => {
                    const tm = TYPE_META[a.type]
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)', transition: 'background .1s' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'var(--p-lt)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)')}
                      >
                        <Td style={{ textAlign: 'center', color: 'var(--text4)', fontSize: '.72rem', fontWeight: 700 }}>{a.sortOrder}</Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 3, height: 16, borderRadius: 2, flexShrink: 0, background: tm.color }} />
                            <span style={{ fontWeight: 600, color: 'var(--text1)' }}>{a.name}</span>
                          </div>
                        </Td>
                        <Td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: tm.bg, color: tm.color, border: `1px solid ${tm.border}` }}>
                            {tm.icon} {tm.label}
                          </span>
                        </Td>
                        <Td>
                          <span style={{ fontSize: '.78rem', color: 'var(--text2)', fontWeight: 500 }}>{a.moduleName}</span>
                        </Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span className={`bdg ${a.isActive ? 'bdg-green' : 'bdg-gray'}`}>
                            <span className="bdg-dot" />{a.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </Td>
                        <Td>
                          <button onClick={() => openEditAddon(a)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }}>
                            <Pencil size={11} /> Edit
                          </button>
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ════════ ADD MODULE MODAL ════════ */}
      <Modal open={addModOpen} onClose={() => setAddModOpen(false)} title="Add Module" icon={<Database size={15} />}
        footer={<><button className="btn btn-ghost" onClick={() => setAddModOpen(false)}>Cancel</button><button className="btn btn-p" disabled={modProcessing} onClick={handleAddMod}>{modProcessing ? 'Creating…' : <><Plus size={13} /> Create Module</>}</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Module Label <span className="req">*</span></label>
            <input className="fi" value={addModForm.label} onChange={(e) => setAddModForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Payroll Management" autoFocus />
            {modErrors.label && <div className="err-msg">{modErrors.label}</div>}
          </div>
          <div className="fg">
            <label>Module Key <span className="req">*</span></label>
            <input className="fi" value={addModForm.key} onChange={(e) => setAddModForm((f) => ({ ...f, key: slugify(e.target.value) }))} placeholder="e.g. payroll" style={{ fontFamily: 'monospace', fontSize: '.84rem' }} />
            <div style={{ fontSize: '.68rem', color: 'var(--text4)', marginTop: 3 }}>Unique slug used internally. Cannot be changed later.</div>
            {modErrors.key && <div className="err-msg">{modErrors.key}</div>}
          </div>
          <div className="fg">
            <label>Description</label>
            <input className="fi" value={addModForm.description} onChange={(e) => setAddModForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
          </div>
          <div className="fg col2">
            <div className="fg">
              <label>Sort Order</label>
              <input className="fi" type="number" min={1} value={addModForm.sortOrder} onChange={(e) => setAddModForm((f) => ({ ...f, sortOrder: e.target.value }))} placeholder="999" />
            </div>
            <div className="fg" style={{ justifyContent: 'flex-end', paddingTop: 22 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ToggleRow label="Active" checked={addModForm.isActive} onChange={(v) => setAddModForm((f) => ({ ...f, isActive: v }))} />
                <ToggleRow label="Mandatory" checked={addModForm.isMandatory} onChange={(v) => setAddModForm((f) => ({ ...f, isMandatory: v }))} />
                <ToggleRow label="Coming Soon" checked={addModForm.isComingSoon} onChange={(v) => setAddModForm((f) => ({ ...f, isComingSoon: v }))} />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ════════ EDIT MODULE MODAL ════════ */}
      <Modal open={editModOpen} onClose={() => setEditModOpen(false)} title="Edit Module" icon={<Pencil size={15} />}
        footer={<><button className="btn btn-ghost" onClick={() => setEditModOpen(false)}>Cancel</button><button className="btn btn-p" disabled={modProcessing} onClick={handleEditMod}>{modProcessing ? 'Saving…' : 'Save Changes'}</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {editModTarget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <BookOpen size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <span style={{ fontSize: '.74rem', color: 'var(--text3)' }}>Key: </span>
              <code style={{ fontSize: '.74rem', color: 'var(--text2)', fontFamily: 'monospace' }}>{editModTarget.key}</code>
              <span style={{ fontSize: '.68rem', color: 'var(--text4)', marginLeft: 4 }}>(cannot be changed)</span>
            </div>
          )}
          <div className="fg">
            <label>Module Label <span className="req">*</span></label>
            <input className="fi" value={editModForm.label} onChange={(e) => setEditModForm((f) => ({ ...f, label: e.target.value }))} autoFocus />
            {modErrors.label && <div className="err-msg">{modErrors.label}</div>}
          </div>
          <div className="fg">
            <label>Description</label>
            <input className="fi" value={editModForm.description} onChange={(e) => setEditModForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
          </div>
          <div className="fg col2">
            <div className="fg">
              <label>Sort Order</label>
              <input className="fi" type="number" min={1} value={editModForm.sortOrder} onChange={(e) => setEditModForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </div>
            <div className="fg" style={{ justifyContent: 'flex-end', paddingTop: 22 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ToggleRow label="Active" checked={editModForm.isActive} onChange={(v) => setEditModForm((f) => ({ ...f, isActive: v }))} />
                <ToggleRow label="Mandatory" checked={editModForm.isMandatory} onChange={(v) => setEditModForm((f) => ({ ...f, isMandatory: v }))} />
                <ToggleRow label="Coming Soon" checked={editModForm.isComingSoon} onChange={(v) => setEditModForm((f) => ({ ...f, isComingSoon: v }))} />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ════════ ADD ADDON MODAL ════════ */}
      <Modal open={addAddonOpen} onClose={() => setAddAddonOpen(false)} title="Add Add-on" icon={<Puzzle size={15} />}
        footer={<><button className="btn btn-ghost" onClick={() => setAddAddonOpen(false)}>Cancel</button><button className="btn btn-p" disabled={addonProcessing} onClick={handleAddAddon}>{addonProcessing ? 'Creating…' : <><Plus size={13} /> Create Add-on</>}</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Module <span className="req">*</span></label>
            <SelectSearch
              value={addAddonForm.moduleId}
              onChange={(v) => setAddAddonForm((f) => ({ ...f, moduleId: v || '' }))}
              options={moduleSelectOpts}
              placeholder="Select module…"
            />
            {addonErrors.moduleId && <div className="err-msg">{addonErrors.moduleId}</div>}
          </div>
          <div className="fg">
            <label>Add-on Name <span className="req">*</span></label>
            <input className="fi" value={addAddonForm.name} onChange={(e) => setAddAddonForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Settings - Holidays" autoFocus />
            {addonErrors.name && <div className="err-msg">{addonErrors.name}</div>}
          </div>
          <div className="fg col2">
            <div className="fg">
              <label>Type</label>
              <SelectSearch
                value={addAddonForm.type}
                onChange={(v) => setAddAddonForm((f) => ({ ...f, type: (v || 'default') as 'default' | 'custom' | 'advance' }))}
                options={TYPE_OPTS}
                placeholder="Select type…"
              />
            </div>
            <div className="fg">
              <label>Sort Order</label>
              <input className="fi" type="number" min={1} value={addAddonForm.sortOrder} onChange={(e) => setAddAddonForm((f) => ({ ...f, sortOrder: e.target.value }))} placeholder="999" />
            </div>
          </div>
        </div>
      </Modal>

      {/* ════════ EDIT ADDON MODAL ════════ */}
      <Modal open={editAddonOpen} onClose={() => setEditAddonOpen(false)} title="Edit Add-on" icon={<Pencil size={15} />}
        footer={<><button className="btn btn-ghost" onClick={() => setEditAddonOpen(false)}>Cancel</button><button className="btn btn-p" disabled={addonProcessing} onClick={handleEditAddon}>{addonProcessing ? 'Saving…' : 'Save Changes'}</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {editAddonTarget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <Puzzle size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <span style={{ fontSize: '.74rem', color: 'var(--text3)' }}>Module: </span>
              <span style={{ fontSize: '.74rem', color: 'var(--text2)', fontWeight: 600 }}>{allAddons.find((a) => a.id === editAddonTarget.id)?.moduleName}</span>
            </div>
          )}
          <div className="fg">
            <label>Add-on Name <span className="req">*</span></label>
            <input className="fi" value={editAddonForm.name} onChange={(e) => setEditAddonForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            {addonErrors.name && <div className="err-msg">{addonErrors.name}</div>}
          </div>
          <div className="fg col2">
            <div className="fg">
              <label>Type</label>
              <SelectSearch
                value={editAddonForm.type}
                onChange={(v) => setEditAddonForm((f) => ({ ...f, type: (v || 'default') as 'default' | 'custom' | 'advance' }))}
                options={TYPE_OPTS}
                placeholder="Select type…"
              />
            </div>
            <div className="fg">
              <label>Sort Order</label>
              <input className="fi" type="number" min={1} value={editAddonForm.sortOrder} onChange={(e) => setEditAddonForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </div>
          </div>
          <ToggleRow label="Active" checked={editAddonForm.isActive} onChange={(v) => setEditAddonForm((f) => ({ ...f, isActive: v }))} />
        </div>
      </Modal>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', whiteSpace: 'nowrap', ...style }}>
      {children}
    </th>
  )
}

function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '11px 14px', verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  )
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text4)' }}>
      <div style={{ opacity: .18, color: 'var(--text3)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '.78rem' }}>{desc}</div>
    </div>
  )
}

function FilterDropdown({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  return (
    <div ref={ref} style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, minWidth: 180, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,.12)', zIndex: 200, overflow: 'hidden' }}>
      {children}
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{ width: 34, height: 18, borderRadius: 99, background: checked ? 'var(--p)' : 'var(--border2)', position: 'relative', transition: 'background .2s', cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
      </div>
      <span style={{ fontSize: '.8rem', color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
    </label>
  )
}
