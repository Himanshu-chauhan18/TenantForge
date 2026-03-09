import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import { Layers, ChevronRight, Save, Loader2, Sparkles, Puzzle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Toggle } from '~/components/toggle'
import { Checkbox } from '~/components/checkbox'
import type { Org } from './types'

// ─── Local types ──────────────────────────────────────────────────────────────
interface ModuleAddon {
  id: number
  name: string
  type: 'default' | 'custom' | 'advance'
}
interface ModuleOption {
  id: number
  key: string
  label: string
  description: string | null
  isMandatory: boolean
  isComingSoon: boolean
  sortOrder: number
  addons: ModuleAddon[]
}
type AddonGroup = { label: string; items: ModuleAddon[] }

// ─── Addon grouping ───────────────────────────────────────────────────────────
function getAddonGroup(name: string): string {
  if (name.startsWith('Settings -')) return 'Settings'
  if (name.startsWith('Employee Document -')) return 'Documents'
  return 'Core'
}
function groupAddons(addons: ModuleAddon[]): AddonGroup[] {
  const ORDER = ['Core', 'Documents', 'Settings']
  const map: Record<string, ModuleAddon[]> = {}
  for (const a of addons) { ;(map[getAddonGroup(a.name)] ??= []).push(a) }
  return ORDER.filter((g) => map[g]?.length).map((g) => ({ label: g, items: map[g] }))
}

// ─── Type colours ─────────────────────────────────────────────────────────────
const TYPE_STYLE = {
  custom:  { color: 'var(--p)',      bg: 'var(--p-lt)' },
  advance: { color: 'var(--s)',      bg: 'var(--s-lt)' },
  default: { color: 'var(--text3)', bg: 'var(--bg)'   },
}

// ─── AddonGroupAccordion ──────────────────────────────────────────────────────
function AddonGroupAccordion({
  grp, curAddons, isOpen, onToggle, onToggleAddon, onToggleGroup,
}: {
  grp: AddonGroup; curAddons: number[]; isOpen: boolean
  onToggle: () => void; onToggleAddon: (id: number) => void; onToggleGroup: (items: ModuleAddon[]) => void
}) {
  const checked = grp.items.filter((a) => curAddons.includes(a.id)).length
  const total   = grp.items.length
  const allSel  = checked === total
  const someSel = checked > 0 && !allSel
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0
  const cbRef   = useRef<HTMLInputElement>(null)
  useEffect(() => { if (cbRef.current) cbRef.current.indeterminate = someSel }, [someSel])

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <div className={`mod-acc-hd${isOpen ? ' open' : ''}`} onClick={onToggle}>
        <ChevronRight size={12} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .22s', color: isOpen ? 'var(--p)' : 'var(--text4)', flexShrink: 0 }} />
        <span style={{ fontSize: '.72rem', fontWeight: 700, color: isOpen ? 'var(--text1)' : 'var(--text2)', flex: 1 }}>{grp.label}</span>
        <div style={{ width: 60, height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', borderRadius: 999, background: pct === 100 ? 'var(--s)' : 'var(--p)', width: `${pct}%`, transition: 'width .3s ease' }} />
        </div>
        {checked > 0 && (
          <span style={{ fontSize: '.64rem', fontWeight: 700, color: allSel ? 'var(--s)' : 'var(--p)', minWidth: 32, textAlign: 'right' }}>{checked}/{total}</span>
        )}
        <label onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', marginLeft: 6, cursor: 'pointer' }}>
          <input ref={cbRef} type="checkbox" className="ck" checked={allSel}
            onChange={() => onToggleGroup(grp.items)} onClick={(e) => e.stopPropagation()} style={{ cursor: 'pointer' }} />
        </label>
      </div>
      <div className="mod-acc-body" style={{ maxHeight: isOpen ? `${Math.ceil(grp.items.length / 2) * 40 + 12}px` : 0 }}>
        <div style={{ padding: '4px 8px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8px' }}>
          {grp.items.map((addon) => (
            <Checkbox key={addon.id} checked={curAddons.includes(addon.id)} onChange={() => onToggleAddon(addon.id)}>
              {addon.name}
            </Checkbox>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AddonTypeSection ─────────────────────────────────────────────────────────
function AddonTypeSection({
  type, label, groups, moduleId, curAddons, closedGroups,
  onToggleAccordion, onToggleAddon, onToggleGroup,
}: {
  type: 'default' | 'custom' | 'advance'; label: string; groups: AddonGroup[]
  moduleId: number; curAddons: number[]; closedGroups: Set<string>
  onToggleAccordion: (key: string) => void
  onToggleAddon: (moduleId: number, addonId: number) => void
  onToggleGroup: (moduleId: number, items: ModuleAddon[]) => void
}) {
  if (groups.length === 0) return null
  const ts            = TYPE_STYLE[type]
  const totalInType   = groups.reduce((s, g) => s + g.items.length, 0)
  const enabledInType = groups.reduce((s, g) => s + g.items.filter((a) => curAddons.includes(a.id)).length, 0)

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <div style={{ padding: '7px 14px 6px', display: 'flex', alignItems: 'center', gap: 7, background: ts.bg }}>
        {type === 'advance' && <Sparkles size={11} style={{ color: ts.color, flexShrink: 0 }} />}
        {type === 'custom'  && <Puzzle   size={11} style={{ color: ts.color, flexShrink: 0 }} />}
        <span style={{ fontSize: '.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: ts.color, flex: 1 }}>
          {label} Add-ons
        </span>
        <span style={{ fontSize: '.63rem', fontWeight: 700, color: ts.color }}>{enabledInType}/{totalInType}</span>
      </div>
      {groups.map((grp) => {
        const key = `${moduleId}:${type}:${grp.label}`
        return (
          <AddonGroupAccordion
            key={key} grp={grp} curAddons={curAddons} isOpen={!closedGroups.has(key)}
            onToggle={() => onToggleAccordion(key)}
            onToggleAddon={(id) => onToggleAddon(moduleId, id)}
            onToggleGroup={(items) => onToggleGroup(moduleId, items)}
          />
        )
      })}
    </div>
  )
}

// ─── ModuleSaveBar ────────────────────────────────────────────────────────────
function ModuleSaveBar({ isDirty, isSaving, isSaved, onSave }: {
  isDirty: boolean; isSaving: boolean; isSaved: boolean; onSave: () => void
}) {
  if (!isDirty && !isSaving && !isSaved) return null

  if (isSaved && !isDirty) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderTop: '1px solid var(--s-mid, #bbf7d0)',
        background: 'var(--s-lt)', animation: 'fadeInBar .2s ease',
      }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--s)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Check size={12} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontSize: '.76rem', fontWeight: 600, color: 'var(--s)' }}>Saved successfully</span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      padding: '10px 16px', borderTop: '1.5px solid var(--p-mid)',
      background: 'linear-gradient(90deg, var(--p-lt) 0%, var(--surface) 100%)',
      animation: 'fadeInBar .18s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--p)', flexShrink: 0, boxShadow: '0 0 0 3px var(--p-mid)' }} />
        <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--p)' }}>Unsaved changes</span>
      </div>
      <button className="btn btn-p btn-sm" disabled={isSaving} onClick={onSave} style={{ gap: 6, minWidth: 90 }}>
        {isSaving
          ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />Saving…</>
          : <><Save size={12} />Save Module</>}
      </button>
    </div>
  )
}

// ─── Main ModulesTab ──────────────────────────────────────────────────────────
interface Props { org: Org }

export function ModulesTab({ org }: Props) {
  const [allModules,      setAllModules]      = useState<ModuleOption[]>([])
  const [loading,         setLoading]         = useState(true)
  const [activeModuleId,  setActiveModuleId]  = useState<number | null>(null)
  const [enabledModules,  setEnabledModules]  = useState<number[]>([])
  const [enabledAddons,   setEnabledAddons]   = useState<Record<number, number[]>>({})
  const [closedGroups,    setClosedGroups]    = useState<Set<string>>(new Set())
  const [dirtyModules,    setDirtyModules]    = useState<Set<number>>(new Set())
  const [savingModules,   setSavingModules]   = useState<Set<number>>(new Set())
  const [savedModules,    setSavedModules]    = useState<Set<number>>(new Set())

  const savedTimers  = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const tabSegRef    = useRef<HTMLDivElement>(null)
  const tabBtnRefs   = useRef<Record<number, HTMLButtonElement | null>>({})
  const [slider, setSlider] = useState({ left: 0, width: 0, ready: false })

  // ── Sliding tab indicator ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (activeModuleId === null) return
    const seg = tabSegRef.current
    const btn = tabBtnRefs.current[activeModuleId]
    if (!seg || !btn) return
    const sr = seg.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setSlider({ left: br.left - sr.left, width: br.width, ready: true })
  }, [activeModuleId, allModules])

  // ── Fetch modules ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/modules')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ModuleOption[]) => {
        setAllModules(data)
        if (data.length > 0) setActiveModuleId(data[0].id)

        const orgModMap: Record<number, { enabled: boolean; addonIds: number[] }> = {}
        for (const om of org.modules || []) {
          orgModMap[om.moduleId] = {
            enabled:  om.enabled,
            addonIds: (om.addonIds || []).filter((a) => a.enabled).map((a) => a.id),
          }
        }
        const initEnabled: number[]                = []
        const initAddons:  Record<number, number[]> = {}
        for (const mod of data) {
          const ex = orgModMap[mod.id]
          if (ex) {
            if (ex.enabled) initEnabled.push(mod.id)
            initAddons[mod.id] = ex.addonIds
          } else if (mod.isMandatory) {
            initEnabled.push(mod.id)
            initAddons[mod.id] = mod.addons.filter((a) => a.type === 'default').map((a) => a.id)
          } else {
            initAddons[mod.id] = []
          }
        }
        setEnabledModules(initEnabled)
        setEnabledAddons(initAddons)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Dirty helpers ─────────────────────────────────────────────────────────
  function markDirty(moduleId: number) {
    setDirtyModules((prev) => new Set([...prev, moduleId]))
    setSavedModules((prev) => { const n = new Set(prev); n.delete(moduleId); return n })
    if (savedTimers.current[moduleId]) clearTimeout(savedTimers.current[moduleId])
  }

  // ── Toggle handlers ───────────────────────────────────────────────────────
  function toggleModule(id: number, isMandatory: boolean) {
    if (isMandatory) return
    setEnabledModules((prev) => {
      if (prev.includes(id)) return prev.filter((k) => k !== id)
      const mod = allModules.find((m) => m.id === id)
      if (mod) {
        setEnabledAddons((p) => ({
          ...p,
          [id]: [...new Set([...(p[id] || []), ...mod.addons.filter((a) => a.type === 'default').map((a) => a.id)])],
        }))
      }
      return [...prev, id]
    })
    markDirty(id)
  }

  function toggleAddon(moduleId: number, addonId: number) {
    setEnabledAddons((prev) => {
      const cur = prev[moduleId] || []
      return { ...prev, [moduleId]: cur.includes(addonId) ? cur.filter((a) => a !== addonId) : [...cur, addonId] }
    })
    markDirty(moduleId)
  }

  function toggleGroup(moduleId: number, items: ModuleAddon[]) {
    setEnabledAddons((prev) => {
      const cur    = prev[moduleId] || []
      const ids    = items.map((a) => a.id)
      const allSel = ids.every((id) => cur.includes(id))
      return { ...prev, [moduleId]: allSel ? cur.filter((a) => !ids.includes(a)) : [...new Set([...cur, ...ids])] }
    })
    markDirty(moduleId)
  }

  function toggleAccordion(key: string) {
    setClosedGroups((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  // ── Per-module save ───────────────────────────────────────────────────────
  function handleSaveModule(mod: ModuleOption) {
    const { id } = mod
    setSavingModules((prev) => new Set([...prev, id]))
    router.put(
      `/orgbuilder/organizations/${org.id}/modules`,
      { modules: [{ moduleId: id, enabled: enabledModules.includes(id), addonIds: enabledAddons[id] || [] }] },
      {
        preserveState: true, preserveScroll: true,
        onSuccess: () => {
          setDirtyModules((prev) => { const n = new Set(prev); n.delete(id); return n })
          setSavedModules((prev) => new Set([...prev, id]))
          toast.success(`${mod.label} updated successfully.`)
          if (savedTimers.current[id]) clearTimeout(savedTimers.current[id])
          savedTimers.current[id] = setTimeout(() => {
            setSavedModules((prev) => { const n = new Set(prev); n.delete(id); return n })
          }, 2500)
        },
        onError:  () => toast.error(`Failed to update ${mod.label}. Please try again.`),
        onFinish: () => setSavingModules((prev) => { const n = new Set(prev); n.delete(id); return n }),
      }
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 48 }}>
        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--text4)' }} />
        <span style={{ fontSize: '.82rem', color: 'var(--text3)' }}>Loading modules…</span>
      </div>
    )
  }

  const enabledCount = allModules.filter((m) => enabledModules.includes(m.id)).length
  const totalDirty   = dirtyModules.size
  const activeMod    = allModules.find((m) => m.id === activeModuleId) ?? null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg) } }
        @keyframes fadeInBar { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
        .mod-acc-hd { display:flex;align-items:center;gap:8px;padding:9px 14px;cursor:pointer;user-select:none;transition:background .15s,border-left-color .15s;border-left:2.5px solid transparent; }
        .mod-acc-hd:hover { background:var(--bg); }
        .mod-acc-hd.open  { background:var(--p-lt);border-left-color:var(--p); }
        .mod-acc-body { overflow:hidden;transition:max-height .3s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div className="card">
        {/* ── Card header ── */}
        <div className="card-h">
          <div>
            <div className="card-title">Modules & Add-ons</div>
            <div style={{ fontSize: '.74rem', color: 'var(--text3)', marginTop: 2 }}>
              {enabledCount} of {allModules.length} module{allModules.length !== 1 ? 's' : ''} enabled
              {totalDirty > 0 && (
                <span style={{ marginLeft: 8, color: 'var(--p)', fontWeight: 700 }}>· {totalDirty} unsaved</span>
              )}
            </div>
          </div>
        </div>

        {allModules.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text3)', fontSize: '.82rem' }}>
            No modules configured in the system.
          </div>
        ) : (
          <>
            {/* ── Module tab bar (same sliding-pill style as page tabs) ── */}
            <div className="tab-bar" style={{ borderBottom: '1px solid var(--border)' }}>
              <div ref={tabSegRef} className="tab-seg" style={{ position: 'relative', flexWrap: 'wrap' }}>
                {/* Sliding pill */}
                {slider.ready && (
                  <div style={{
                    position: 'absolute', top: 3, bottom: 3,
                    left: slider.left, width: slider.width,
                    background: 'var(--surface)',
                    borderRadius: 6,
                    boxShadow: '0 1px 4px rgba(0,0,0,.08)',
                    transition: 'left .2s cubic-bezier(.4,0,.2,1), width .2s cubic-bezier(.4,0,.2,1)',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }} />
                )}

                {allModules.map((mod) => {
                  const isActive = activeModuleId === mod.id
                  const isDirty  = dirtyModules.has(mod.id)
                  const isSaved  = savedModules.has(mod.id) && !isDirty
                  const isEnabled = enabledModules.includes(mod.id)

                  return (
                    <button
                      key={mod.id}
                      ref={(el) => { tabBtnRefs.current[mod.id] = el }}
                      className={`tab-btn${isActive ? ' active' : ''}`}
                      onClick={() => setActiveModuleId(mod.id)}
                      style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      {/* Enabled dot */}
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: isEnabled ? 'var(--s)' : 'var(--border2)',
                        transition: 'background .2s',
                      }} />
                      {mod.label}
                      {/* Dirty / saved indicator */}
                      {isDirty && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--p)', flexShrink: 0 }} />
                      )}
                      {isSaved && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--s)', flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Active module content ── */}
            {activeMod && (() => {
              const mod        = activeMod
              const isEnabled  = enabledModules.includes(mod.id)
              const curAddons  = enabledAddons[mod.id] || []
              const isDirty    = dirtyModules.has(mod.id)
              const isSaving   = savingModules.has(mod.id)
              const isSaved    = savedModules.has(mod.id)
              const defGroups  = groupAddons(mod.addons.filter((a) => a.type === 'default'))
              const cusGroups  = groupAddons(mod.addons.filter((a) => a.type === 'custom'))
              const advGroups  = groupAddons(mod.addons.filter((a) => a.type === 'advance'))

              return (
                <div>
                  {/* Module header */}
                  <div className={`mod-head ${isEnabled ? 'enabled' : ''}`} style={{ borderRadius: 0, borderTop: 'none' }}>
                    <div className="mod-ico" style={{
                      background: isEnabled ? 'var(--p)' : mod.isComingSoon ? 'var(--bg)' : 'var(--border)',
                      color: isEnabled ? '#fff' : mod.isComingSoon ? 'var(--text4)' : 'var(--text3)',
                    }}>
                      <Layers size={14} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="mod-title">{mod.label}</div>
                      {mod.description && <div className="mod-sub">{mod.description}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      {isEnabled && mod.addons.length > 0 && (
                        <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>
                          {curAddons.length}/{mod.addons.length} add-ons
                        </span>
                      )}
                      {mod.isMandatory ? (
                        <span className="bx bx-teal bx-no-dot">Required</span>
                      ) : mod.isComingSoon ? (
                        <span className="bx bx-gray bx-no-dot">Coming Soon</span>
                      ) : (
                        <Toggle checked={isEnabled} onChange={() => toggleModule(mod.id, mod.isMandatory)} />
                      )}
                    </div>
                  </div>

                  {/* Disabled hint */}
                  {!isEnabled && !mod.isComingSoon && mod.addons.length > 0 && (
                    <div style={{ padding: '12px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 500 }}>
                        Enable this module to configure{' '}
                        <strong style={{ color: 'var(--text2)', fontWeight: 700 }}>{mod.addons.length} add-ons</strong>
                      </div>
                    </div>
                  )}

                  {/* Addon type sections */}
                  {isEnabled && mod.addons.length > 0 && (
                    <>
                      <AddonTypeSection
                        type="default" label="Default"
                        groups={defGroups} moduleId={mod.id} curAddons={curAddons}
                        closedGroups={closedGroups}
                        onToggleAccordion={toggleAccordion}
                        onToggleAddon={toggleAddon}
                        onToggleGroup={toggleGroup}
                      />
                      <AddonTypeSection
                        type="custom" label="Custom"
                        groups={cusGroups} moduleId={mod.id} curAddons={curAddons}
                        closedGroups={closedGroups}
                        onToggleAccordion={toggleAccordion}
                        onToggleAddon={toggleAddon}
                        onToggleGroup={toggleGroup}
                      />
                      <AddonTypeSection
                        type="advance" label="Advanced"
                        groups={advGroups} moduleId={mod.id} curAddons={curAddons}
                        closedGroups={closedGroups}
                        onToggleAccordion={toggleAccordion}
                        onToggleAddon={toggleAddon}
                        onToggleGroup={toggleGroup}
                      />
                    </>
                  )}

                  {isEnabled && mod.addons.length === 0 && (
                    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', fontSize: '.74rem', color: 'var(--text4)' }}>
                      No add-ons available for this module
                    </div>
                  )}

                  {/* Save bar */}
                  <ModuleSaveBar isDirty={isDirty} isSaving={isSaving} isSaved={isSaved} onSave={() => handleSaveModule(mod)} />
                </div>
              )
            })()}
          </>
        )}
      </div>
    </>
  )
}
