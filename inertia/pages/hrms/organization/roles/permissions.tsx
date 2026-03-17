import { useState, useEffect, useRef } from 'react'
import { router, Link } from '@inertiajs/react'
import {
  ShieldCheck, Save, ChevronRight, Globe, User, Users, Settings,
  ArrowLeft, Puzzle, Sparkles, Lock,
} from 'lucide-react'

// ── CSS ───────────────────────────────────────────────────────────────────────

const PERM_CSS = `
  .perm-acc-hd {
    display:grid;grid-template-columns:1fr 50px 50px 50px 50px 54px;
    align-items:center;padding:0 14px;height:38px;
    cursor:pointer;user-select:none;transition:background .15s,border-left-color .15s;
    border-left:2.5px solid transparent;
  }
  .perm-acc-hd:hover { background:var(--bg2); }
  .perm-acc-hd.open  { background:var(--p-lt);border-left-color:var(--p); }
  .perm-acc-body { overflow:hidden; transition:max-height .25s cubic-bezier(.4,0,.2,1); }
`

// ── Types ─────────────────────────────────────────────────────────────────────

interface PermEntry { v: 0|1; a: 0|1; e: 0|1; d: 0|1 }
interface PermRow   { id: number; orgId: number; profileId: number; moduleId: number; permissions: Record<string, PermEntry> }

interface Profile {
  id:            number
  name:          string
  description:   string | null
  dataAccess:    'all' | 'organization' | 'self' | 'custom'
  isDefault:     boolean
  employeeCount: number
  permissions:   PermRow[]
}

interface OrgAddon  { id: number; name: string; type: string; sortOrder: number }
interface OrgModule {
  enabled:  boolean
  addonIds: Array<{ id: number; enabled: boolean }>
  module:   { id: number; key: string; label: string; sortOrder: number; addons: OrgAddon[] }
}

interface PermMap {
  [mKey: string]: { [addonName: string]: { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean } }
}

interface Props { profile: Profile; orgModules: OrgModule[]; canEdit: boolean }

// ── Constants ─────────────────────────────────────────────────────────────────

const PERM_KEYS   = ['canView', 'canAdd', 'canEdit', 'canDelete'] as const
const PERM_LABELS: Record<string, string> = { canView: 'View', canAdd: 'Add', canEdit: 'Edit', canDelete: 'Delete' }
const EMPTY_PERM  = { canView: false, canAdd: false, canEdit: false, canDelete: false }

const DATA_ACCESS_LABELS: Record<string, string> = {
  all: 'All Data', organization: 'Organisation', self: 'Self Only', custom: 'Custom',
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  default: { label: 'Default',  color: 'var(--text2)', bg: 'var(--bg2)',  icon: null },
  custom:  { label: 'Custom',   color: 'var(--p)',     bg: 'var(--p-lt)', icon: <Puzzle   size={11} /> },
  advance: { label: 'Advanced', color: 'var(--s)',     bg: 'var(--s-lt)', icon: <Sparkles size={11} /> },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrgEnabledAddons(om: OrgModule): OrgAddon[] {
  const s = new Set(om.addonIds.filter((a) => a.enabled).map((a) => a.id))
  return om.module.addons.filter((a) => s.has(a.id))
}

function getAddonGroup(name: string): string {
  if (name.startsWith('Settings -'))         return 'Settings'
  if (name.startsWith('Employee Document -')) return 'Documents'
  return 'Core'
}

function groupAddons(addons: OrgAddon[]) {
  const ORDER = ['Core', 'Documents', 'Settings']
  const map: Record<string, OrgAddon[]> = {}
  for (const a of addons) (map[getAddonGroup(a.name)] ??= []).push(a)
  return ORDER.filter((g) => map[g]?.length).map((g) => ({ label: g, items: map[g] }))
}

function buildPermMap(rows: PermRow[], modules: OrgModule[]): PermMap {
  const keyById: Record<number, string>        = {}
  const nameById: Record<number, string>       = {}
  const enabledByKey: Record<string, OrgAddon[]> = {}
  for (const om of modules) {
    keyById[om.module.id] = om.module.key
    for (const a of om.module.addons) nameById[a.id] = a.name
    const s = new Set(om.addonIds.filter((a) => a.enabled).map((a) => a.id))
    enabledByKey[om.module.key] = om.module.addons.filter((a) => s.has(a.id))
  }
  const map: PermMap = {}
  for (const row of rows) {
    const mKey = keyById[row.moduleId]
    if (!mKey) continue
    map[mKey] ??= {}
    for (const [raw, entry] of Object.entries(row.permissions)) {
      if (raw === 'module') {
        for (const a of (enabledByKey[mKey] ?? [])) {
          if (!(a.name in map[mKey]))
            map[mKey][a.name] = { canView: !!entry.v, canAdd: !!entry.a, canEdit: !!entry.e, canDelete: !!entry.d }
        }
        continue
      }
      const n = nameById[Number(raw)] ?? raw
      map[mKey][n] = { canView: !!entry.v, canAdd: !!entry.a, canEdit: !!entry.e, canDelete: !!entry.d }
    }
  }
  return map
}

function mapToPayload(map: PermMap, modules: OrgModule[]) {
  const idByKey: Record<string, number>   = {}
  const idByName: Record<string, number>  = {}
  for (const om of modules) {
    idByKey[om.module.key] = om.module.id
    for (const a of om.module.addons) idByName[a.name] = a.id
  }
  return Object.entries(map).flatMap(([mKey, features]) => {
    const moduleId = idByKey[mKey]
    if (moduleId === undefined) return []
    const permissions: Record<string, PermEntry> = {}
    for (const [fKey, p] of Object.entries(features)) {
      permissions[String(idByName[fKey] ?? fKey)] = {
        v: p.canView ? 1 : 0, a: p.canAdd ? 1 : 0, e: p.canEdit ? 1 : 0, d: p.canDelete ? 1 : 0,
      }
    }
    return [{ moduleId, permissions }]
  })
}

function profileColor(name: string): [string, string] {
  const pre: Record<string, [string, string]> = {
    'Super Admin': ['#6366f1', '#eef2ff'], 'HR Admin': ['#0ea5e9', '#e0f2fe'],
    'Manager':     ['#10b981', '#d1fae5'], 'Employee': ['#f59e0b', '#fef3c7'],
  }
  if (pre[name]) return pre[name]
  const pool: [string, string][] = [['#8b5cf6','#ede9fe'],['#ec4899','#fce7f3'],['#0D9488','#ccfbf1'],['#f97316','#ffedd5'],['#ef4444','#fee2e2']]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return pool[h % pool.length]
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PermCheckbox({ checked, onChange, disabled = false, accent = false }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; accent?: boolean
}) {
  const color = accent ? '#6366f1' : 'var(--p)'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 18, height: 18, borderRadius: 4, padding: 0, outline: 'none', flexShrink: 0,
        border: `1.5px solid ${checked ? color : 'var(--border2)'}`,
        background: checked ? color : 'var(--surface)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .38 : 1,
        transition: 'background .12s, border-color .12s',
      }}
    >
      {checked && (
        <svg viewBox="0 0 10 8" width="10" height="8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function PermDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span style={{
      fontSize: '.58rem', fontWeight: 700, padding: '1px 5px', borderRadius: 3,
      background: active ? 'var(--p-lt)' : 'var(--bg2)',
      color: active ? 'var(--p)' : 'var(--text4)',
      border: `1px solid ${active ? 'var(--p-mid)' : 'var(--border)'}`,
    }}>
      {label}
    </span>
  )
}

function DataAccessInfo({ value }: { value: string }) {
  const icons: Record<string, React.ReactNode> = {
    all: <Globe size={13} />, organization: <Users size={13} />, self: <User size={13} />, custom: <Settings size={13} />,
  }
  const descs: Record<string, string> = {
    all:          'This role can see and manage all data across the entire organisation.',
    organization: 'This role can see and manage data scoped to the organisation only.',
    self:         'This role can only see and manage their own personal data.',
    custom:       'Custom data scope — configure granular access rules manually.',
  }
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--p-lt)', borderRadius: 8, border: '1px solid var(--p-mid)' }}>
      <span style={{ color: 'var(--p)', flexShrink: 0, marginTop: 1 }}>{icons[value]}</span>
      <span style={{ fontSize: '.74rem', color: 'var(--text2)', lineHeight: 1.5 }}>{descs[value]}</span>
    </div>
  )
}

// ── Accordion row group ───────────────────────────────────────────────────────

function AddonGroupAccordion({ grp, mKey, isOpen, onToggle, getPerm, setPerm, setRowAll, setGroupAll, readOnly }: {
  grp:        { label: string; items: OrgAddon[] }
  mKey:       string
  isOpen:     boolean
  onToggle:   () => void
  getPerm:    (mKey: string, fKey: string) => typeof EMPTY_PERM
  setPerm:    (mKey: string, fKey: string, key: typeof PERM_KEYS[number], val: boolean) => void
  setRowAll:  (mKey: string, fKey: string, val: boolean) => void
  setGroupAll:(mKey: string, names: string[], val: boolean) => void
  readOnly:   boolean
}) {
  const cbRef   = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const names  = grp.items.map((a) => a.name)
  const allCnt = names.filter((n) => { const p = getPerm(mKey, n); return p.canView && p.canAdd && p.canEdit && p.canDelete }).length
  const anyCnt = names.filter((n) => { const p = getPerm(mKey, n); return p.canView || p.canAdd || p.canEdit || p.canDelete }).length
  const total  = names.length
  const allSel = allCnt === total
  const someSel = anyCnt > 0 && !allSel
  const pct    = total > 0 ? Math.round((anyCnt / total) * 100) : 0

  useEffect(() => { if (cbRef.current) cbRef.current.indeterminate = someSel }, [someSel])

  const mountedRef = useRef(false)
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    if (!mountedRef.current) {
      // First render — set initial height without animation
      el.style.maxHeight = isOpen ? 'none' : '0px'
      el.style.overflow  = isOpen ? 'visible' : 'hidden'
      mountedRef.current = true
      return
    }
    if (isOpen) {
      el.style.overflow  = 'hidden'
      el.style.maxHeight = el.scrollHeight + 'px'
      const onEnd = () => { el.style.maxHeight = 'none'; el.style.overflow = 'visible' }
      el.addEventListener('transitionend', onEnd, { once: true })
    } else {
      el.style.overflow  = 'hidden'
      el.style.maxHeight = el.scrollHeight + 'px'
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.maxHeight = '0px' }))
    }
  }, [isOpen])

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <div className={`perm-acc-hd${isOpen ? ' open' : ''}`} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <ChevronRight size={12} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .22s', color: isOpen ? 'var(--p)' : 'var(--text4)', flexShrink: 0 }} />
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: isOpen ? 'var(--text1)' : 'var(--text2)', whiteSpace: 'nowrap' }}>{grp.label}</span>
          <div style={{ width: 44, height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ height: '100%', borderRadius: 999, background: allSel ? 'var(--s)' : 'var(--p)', width: `${pct}%`, transition: 'width .3s' }} />
          </div>
          {anyCnt > 0 && <span style={{ fontSize: '.63rem', fontWeight: 700, color: allSel ? 'var(--s)' : 'var(--p)', flexShrink: 0 }}>{allCnt}/{total}</span>}
        </div>
        <div /><div /><div /><div />
        <div style={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
          {!readOnly && (
            <input ref={cbRef} type="checkbox" className="ck" checked={allSel}
              onChange={() => setGroupAll(mKey, names, !allSel)} style={{ cursor: 'pointer' }} />
          )}
        </div>
      </div>

      <div ref={bodyRef} className="perm-acc-body">
        {grp.items.map((addon, idx) => {
          const fKey   = addon.name
          const perm   = getPerm(mKey, fKey)
          const allOn  = perm.canView && perm.canAdd && perm.canEdit && perm.canDelete
          const isLast = idx === grp.items.length - 1
          const display = fKey.replace(/^Settings - /, '').replace(/^Employee Document - /, '')
          return (
            <div
              key={fKey}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 50px 50px 50px 50px 54px',
                padding: '0 14px', alignItems: 'center', height: 42,
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
                background: idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                transition: 'background .1s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--p-lt)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 8, minWidth: 0 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, flexShrink: 0, background: addon.type === 'advance' ? '#f59e0b' : addon.type === 'custom' ? '#0ea5e9' : 'var(--border2)' }} />
                <span style={{ fontSize: '.8rem', color: 'var(--text1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{display}</span>
              </div>
              {PERM_KEYS.map((k) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'center' }}>
                  <PermCheckbox checked={perm[k]} onChange={(v) => setPerm(mKey, fKey, k, v)} disabled={readOnly || (k !== 'canView' && !perm.canView)} />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PermCheckbox checked={allOn} onChange={(v) => setRowAll(mKey, fKey, v)} accent disabled={readOnly} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RolePermissionsPage({ profile, orgModules, canEdit }: Props) {
  const modules = orgModules
    .filter((m) => m.enabled)
    .sort((a, b) => (a.module.sortOrder ?? 999) - (b.module.sortOrder ?? 999))

  const [selectedKey,  setSelectedKey]  = useState<string | null>(modules[0]?.module?.key ?? null)
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set())
  const [permMap,      setPermMap]      = useState<PermMap>(() => buildPermMap(profile.permissions, modules))
  const [dirty,        setDirty]        = useState(false)
  const [saving,       setSaving]       = useState(false)

  const selectedMod = modules.find((m) => m.module.key === selectedKey) ?? null

  function getPerm(mKey: string, fKey: string) {
    return permMap[mKey]?.[fKey] ?? { ...EMPTY_PERM }
  }

  function setPerm(mKey: string, fKey: string, k: typeof PERM_KEYS[number], val: boolean) {
    setPermMap((prev) => {
      const mp  = { ...(prev[mKey] ?? {}) }
      const cur = mp[fKey] ?? { ...EMPTY_PERM }
      const upd = { ...cur, [k]: val }
      if (k === 'canView' && !val) { upd.canAdd = false; upd.canEdit = false; upd.canDelete = false }
      if (k !== 'canView' && val)  { upd.canView = true }
      mp[fKey] = upd
      return { ...prev, [mKey]: mp }
    })
    setDirty(true)
  }

  function setRowAll(mKey: string, fKey: string, val: boolean) {
    setPermMap((prev) => ({
      ...prev,
      [mKey]: { ...(prev[mKey] ?? {}), [fKey]: { canView: val, canAdd: val, canEdit: val, canDelete: val } },
    }))
    setDirty(true)
  }

  function setGroupAll(mKey: string, names: string[], val: boolean) {
    setPermMap((prev) => {
      const mp = { ...(prev[mKey] ?? {}) }
      for (const n of names) mp[n] = { canView: val, canAdd: val, canEdit: val, canDelete: val }
      return { ...prev, [mKey]: mp }
    })
    setDirty(true)
  }

  function modulePermSummary(mKey: string) {
    let view = false, write = false
    const om = modules.find((m) => m.module.key === mKey)
    if (!om) return { view, write }
    for (const a of getOrgEnabledAddons(om)) {
      const p = getPerm(mKey, a.name)
      if (p.canView) view = true
      if (p.canAdd || p.canEdit || p.canDelete) write = true
    }
    return { view, write }
  }

  function toggleGroup(key: string) {
    setClosedGroups((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  function savePermissions() {
    setSaving(true)
    router.put(
      `/hrms/organization/roles/${profile.id}/permissions`,
      { permissions: mapToPayload(permMap, modules) },
      {
        onSuccess: () => { setSaving(false); setDirty(false) },
        onError:   () => setSaving(false),
      }
    )
  }

  const [fg, bg] = profileColor(profile.name)

  return (
    <>
      <style>{PERM_CSS}</style>

      {/* ── Page Header ── */}
      <div className="ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href="/hrms/organization/roles"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)', flexShrink: 0, textDecoration: 'none', transition: 'background .15s, color .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-lt)'; e.currentTarget.style.color = 'var(--p)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg2)';  e.currentTarget.style.color = 'var(--text3)' }}
          >
            <ArrowLeft size={15} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="ph-title" style={{ margin: 0 }}>{profile.name}</div>
                {profile.isDefault && (
                  <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: 'var(--sky-lt)', color: 'var(--sky)', border: '1px solid rgba(3,105,161,.15)' }}>Default</span>
                )}
                {!canEdit && (
                  <span className="bx bx-gray" style={{ fontSize: '.65rem' }}>Read Only</span>
                )}
              </div>
              <div className="ph-sub" style={{ margin: 0 }}>
                {profile.description
                  ? profile.description
                  : `${DATA_ACCESS_LABELS[profile.dataAccess] ?? profile.dataAccess} · ${profile.employeeCount} employee${profile.employeeCount !== 1 ? 's' : ''}`}
              </div>
            </div>
          </div>
        </div>
        <div className="ph-right">
          {canEdit && dirty && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--p)', boxShadow: '0 0 0 3px var(--p-mid)' }} />
                <span style={{ fontSize: '.76rem', fontWeight: 600, color: 'var(--p)' }}>Unsaved changes</span>
              </div>
              <button className="btn btn-ghost" onClick={() => { setPermMap(buildPermMap(profile.permissions, modules)); setDirty(false) }}>
                Discard
              </button>
              <button className="btn btn-p" disabled={saving} onClick={savePermissions} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Profile info strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Data Access',    value: DATA_ACCESS_LABELS[profile.dataAccess] ?? profile.dataAccess, color: '#0D9488', icon: <Lock     size={15} /> },
          { label: 'Employees',      value: String(profile.employeeCount),                                 color: '#7C3AED', icon: <Users    size={15} /> },
          { label: 'Modules Enabled',value: String(modules.length),                                        color: '#0284C7', icon: <ShieldCheck size={15} /> },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: stat.color + '14', border: `1px solid ${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 800, color: 'var(--text1)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '.67rem', color: 'var(--text3)', marginTop: 2, fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
        <DataAccessInfo value={profile.dataAccess} />
      </div>

      {/* ── Main 2-panel card ── */}
      <div className="card" style={{ display: 'flex', minHeight: 520, overflow: 'hidden' }}>

        {/* ── Left: Module list ── */}
        <div style={{ width: 210, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Modules</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {modules.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: '.78rem', color: 'var(--text4)' }}>
                No modules enabled for this organisation.
              </div>
            ) : modules.map((om) => {
              const mKey     = om.module.key
              const isActive = selectedKey === mKey
              const { view, write } = modulePermSummary(mKey)
              return (
                <button
                  key={mKey}
                  onClick={() => setSelectedKey(mKey)}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    padding: '10px 14px',
                    background: isActive ? 'var(--surface)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--p)' : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background .12s',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)' }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--p)' : 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {om.module.label}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <PermDot active={view}  label="V" />
                      <PermDot active={write} label="W" />
                    </div>
                  </div>
                  {isActive && <ChevronRight size={11} style={{ color: 'var(--p)', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right: Permission grid ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {!selectedMod ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text4)' }}>
              <ShieldCheck size={36} style={{ opacity: .18 }} />
              <span style={{ fontSize: '.82rem' }}>Select a module to manage permissions</span>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>

              {/* Module header */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, background: 'var(--surface)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text1)' }}>{selectedMod.module.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 2 }}>
                    {getOrgEnabledAddons(selectedMod).length} feature{getOrgEnabledAddons(selectedMod).length !== 1 ? 's' : ''} enabled
                  </div>
                </div>
                {!readOnlyMode(canEdit) && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => { for (const a of getOrgEnabledAddons(selectedMod)) setRowAll(selectedMod.module.key, a.name, true) }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--s)', background: 'var(--s-lt)', border: '1px solid rgba(5,150,105,.2)', cursor: 'pointer' }}
                    >
                      Grant All
                    </button>
                    <button
                      onClick={() => { for (const a of getOrgEnabledAddons(selectedMod)) setRowAll(selectedMod.module.key, a.name, false) }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--text3)', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      Revoke All
                    </button>
                  </div>
                )}
              </div>

              {getOrgEnabledAddons(selectedMod).length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text4)', fontSize: '.82rem' }}>
                  No add-ons are enabled for this module.
                </div>
              ) : (['default', 'custom', 'advance'] as const).map((type) => {
                const typeAddons = getOrgEnabledAddons(selectedMod).filter((a) => a.type === type)
                if (typeAddons.length === 0) return null
                const groups = groupAddons(typeAddons)
                const meta   = TYPE_META[type]
                const mKey   = selectedMod.module.key
                const enabledCnt = typeAddons.filter((a) => {
                  const p = getPerm(mKey, a.name)
                  return p.canView || p.canAdd || p.canEdit || p.canDelete
                }).length
                return (
                  <div key={type} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', margin: '14px 18px 6px' }}>
                    {/* Type header */}
                    <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 7, background: meta.bg, borderBottom: '1px solid var(--border)' }}>
                      {meta.icon && <span style={{ color: meta.color, flexShrink: 0 }}>{meta.icon}</span>}
                      <span style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: meta.color, flex: 1 }}>
                        {meta.label} Add-ons
                      </span>
                      <span style={{ fontSize: '.65rem', fontWeight: 700, color: meta.color }}>{enabledCnt}/{typeAddons.length} granted</span>
                    </div>

                    {/* Column header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 50px 50px 50px 54px', padding: '6px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Feature</span>
                      {PERM_KEYS.map((k) => (
                        <span key={k} style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>
                          {PERM_LABELS[k].charAt(0)}
                        </span>
                      ))}
                      <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>All</span>
                    </div>

                    {groups.map((grp) => {
                      const groupKey = `${mKey}:${type}:${grp.label}`
                      return (
                        <AddonGroupAccordion
                          key={grp.label}
                          grp={grp}
                          mKey={mKey}
                          isOpen={!closedGroups.has(groupKey)}
                          onToggle={() => toggleGroup(groupKey)}
                          getPerm={getPerm}
                          setPerm={setPerm}
                          setRowAll={setRowAll}
                          setGroupAll={setGroupAll}
                          readOnly={!canEdit}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {/* Sticky save bar (only when dirty) */}
          {dirty && canEdit && (
            <div style={{
              borderTop: '1px solid var(--border)', padding: '12px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(90deg,var(--p-lt) 0%,var(--surface) 100%)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--p)', boxShadow: '0 0 0 3px var(--p-mid)' }} />
                <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--p)' }}>Unsaved changes</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setPermMap(buildPermMap(profile.permissions, modules)); setDirty(false) }}>
                  Discard
                </button>
                <button className="btn btn-p btn-sm" disabled={saving} onClick={savePermissions} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Save size={12} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// tiny helper to avoid React hook in inline expression
function readOnlyMode(canEdit: boolean) { return !canEdit }
