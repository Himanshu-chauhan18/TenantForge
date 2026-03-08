import { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck, Plus, Pencil, Trash2, Save,
  ChevronRight, Users, Globe, User, Settings,
  Sparkles, Puzzle,
} from 'lucide-react'
import { router } from '@inertiajs/react'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'
import type { Org, OrgModule, OrgProfile, OrgProfilePermission } from './types'

// ── CSS injected once ─────────────────────────────────────────────────────────
const ACCORDION_CSS = `
  .perm-acc-hd {
    display:grid;grid-template-columns:1fr 50px 50px 50px 50px 54px;
    align-items:center;padding:0 14px;height:36px;
    cursor:pointer;user-select:none;transition:background .15s,border-left-color .15s;
    border-left:2.5px solid transparent;
  }
  .perm-acc-hd:hover { background:var(--bg2); }
  .perm-acc-hd.open  { background:var(--p-lt);border-left-color:var(--p); }
  .perm-acc-body { overflow:hidden;transition:max-height .28s cubic-bezier(.4,0,.2,1); }
`

// ── Types ─────────────────────────────────────────────────────────────────────
interface PermMap {
  [moduleKey: string]: {
    [featureKey: string]: { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean }
  }
}
interface AddonDef   { name: string; type: string }
interface AddonGroup { label: string; items: AddonDef[] }
interface Props      { org: Org }

// ── Constants ─────────────────────────────────────────────────────────────────
const DATA_ACCESS_OPTS = [
  { value: 'all',          label: 'All Data',     desc: 'Access to all org data' },
  { value: 'organization', label: 'Organization', desc: 'Access to own org data only' },
  { value: 'self',         label: 'Self Only',    desc: 'Access to own records only' },
  { value: 'custom',       label: 'Custom',       desc: 'Custom data scope' },
]

const PROFILE_COLORS: Record<string, [string, string]> = {
  'Super Admin': ['#6366f1', '#eef2ff'],
  'HR Admin':    ['#0ea5e9', '#e0f2fe'],
  'Manager':     ['#10b981', '#d1fae5'],
  'User':        ['#f59e0b', '#fef3c7'],
}

const PERM_KEYS   = ['canView', 'canAdd', 'canEdit', 'canDelete'] as const
const PERM_LABELS: Record<string, string> = { canView: 'View', canAdd: 'Add', canEdit: 'Edit', canDelete: 'Delete' }
const EMPTY_PERM  = { canView: false, canAdd: false, canEdit: false, canDelete: false }

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  default: { label: 'Default', color: 'var(--text2)', bg: 'var(--bg2)',  icon: null },
  custom:  { label: 'Custom',  color: 'var(--p)',     bg: 'var(--p-lt)', icon: <Puzzle   size={11} /> },
  advance: { label: 'Advanced',color: 'var(--s)',     bg: 'var(--s-lt)', icon: <Sparkles size={11} /> },
}

// ── Pure helpers ──────────────────────────────────────────────────────────────
function profileColor(name: string): [string, string] {
  if (PROFILE_COLORS[name]) return PROFILE_COLORS[name]
  const pool: [string, string][] = [
    ['#8b5cf6', '#ede9fe'], ['#ec4899', '#fce7f3'],
    ['#ef4444', '#fee2e2'], ['#14b8a6', '#ccfbf1'], ['#f97316', '#ffedd5'],
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return pool[h % pool.length]
}

function getAddonGroup(name: string): string {
  if (name.startsWith('Settings -'))         return 'Settings'
  if (name.startsWith('Employee Document -')) return 'Documents'
  return 'Core'
}
function groupAddons(addons: AddonDef[]): AddonGroup[] {
  const ORDER = ['Core', 'Documents', 'Settings']
  const map: Record<string, AddonDef[]> = {}
  for (const a of addons) (map[getAddonGroup(a.name)] ??= []).push(a)
  return ORDER.filter((g) => map[g]?.length).map((g) => ({ label: g, items: map[g] }))
}

function permsToMap(permissions: OrgProfilePermission[], modules: OrgModule[]): PermMap {
  // Build moduleId → moduleKey and addonId → addon name lookups
  const keyById: Record<number, string> = {}
  const addonNameById: Record<number, string> = {}
  for (const m of modules) {
    keyById[m.module.id] = m.module.key
    for (const a of m.module.addons) addonNameById[a.id] = a.name
  }

  const map: PermMap = {}
  for (const p of permissions) {
    const mKey = keyById[p.moduleId]
    if (!mKey) continue
    map[mKey] = {}
    for (const [rawKey, entry] of Object.entries(p.permissions)) {
      // "module" key stays as-is; numeric string key → resolve to addon name
      const fKey = rawKey === 'module' ? 'module' : (addonNameById[Number(rawKey)] ?? rawKey)
      map[mKey][fKey] = {
        canView:   Boolean(entry.v),
        canAdd:    Boolean(entry.a),
        canEdit:   Boolean(entry.e),
        canDelete: Boolean(entry.d),
      }
    }
  }
  return map
}

/**
 * Build a perm map from saved DB rows, then cascade module-level perms down to
 * any addons that have NO saved row yet (e.g. seeded profiles, or profiles saved
 * before the cascade feature existed). If an addon already has its own row, that
 * row is used as-is — so granular per-addon overrides are always respected.
 */
function buildPermMap(permissions: OrgProfilePermission[], modules: OrgModule[]): PermMap {
  const map = permsToMap(permissions, modules)
  for (const mod of modules) {
    if (!mod.enabled) continue
    const mKey      = mod.module.key
    const modLevel  = map[mKey]?.['module']
    if (!modLevel) continue                      // no module-level perm → nothing to cascade
    for (const addon of mod.module.addons) {
      if (map[mKey]?.[addon.name] === undefined) {
        // No saved row for this addon → inherit module-level perm
        if (!map[mKey]) map[mKey] = {}
        map[mKey][addon.name] = { ...modLevel }
      }
    }
  }
  return map
}

/** Convert local PermMap → server payload grouped by moduleId (one row per module).
 *  Addon name keys are converted back to addon_id string keys for DB storage. */
function mapToSavePerms(
  map: PermMap,
  modules: OrgModule[]
): Array<{ moduleId: number; permissions: Record<string, { v: 0|1; a: 0|1; e: 0|1; d: 0|1 }> }> {
  const idByKey: Record<string, number> = {}
  const addonIdByName: Record<string, number> = {}
  for (const m of modules) {
    idByKey[m.module.key] = m.module.id
    for (const a of m.module.addons) addonIdByName[a.name] = a.id
  }

  const result = []
  for (const [mKey, features] of Object.entries(map)) {
    const moduleId = idByKey[mKey]
    if (moduleId === undefined) continue
    const permissions: Record<string, { v: 0|1; a: 0|1; e: 0|1; d: 0|1 }> = {}
    for (const [fKey, perm] of Object.entries(features)) {
      // "module" key stays as-is; addon name → its id as string key
      const jsonKey = fKey === 'module' ? 'module' : String(addonIdByName[fKey] ?? fKey)
      permissions[jsonKey] = {
        v: perm.canView   ? 1 : 0,
        a: perm.canAdd    ? 1 : 0,
        e: perm.canEdit   ? 1 : 0,
        d: perm.canDelete ? 1 : 0,
      }
    }
    result.push({ moduleId, permissions })
  }
  return result
}

// ── Main component ────────────────────────────────────────────────────────────
export function RolesTab({ org }: Props) {
  const profiles = org.profiles || []
  const modules  = (org.modules || []).filter((m) => m.enabled)

  const [selectedId,        setSelectedId]        = useState<number | null>(profiles[0]?.id ?? null)
  const [selectedModuleKey, setSelectedModuleKey]  = useState<string | null>(modules[0]?.module?.key ?? null)
  const [closedGroups,      setClosedGroups]       = useState<Set<string>>(new Set())
  const [permMap,           setPermMap]            = useState<PermMap>(() =>
    profiles[0] ? buildPermMap(profiles[0].permissions, modules) : {}
  )
  const [permDirty, setPermDirty] = useState(false)

  const [addOpen,     setAddOpen]     = useState(false)
  const [editOpen,    setEditOpen]    = useState(false)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [addLoading,  setAddLoading]  = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [delLoading,  setDelLoading]  = useState(false)

  const [addForm,  setAddForm]  = useState({ name: '', description: '', dataAccess: 'self' as OrgProfile['dataAccess'] })
  const [editForm, setEditForm] = useState({ name: '', description: '', dataAccess: 'self' as OrgProfile['dataAccess'] })

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null
  const selectedMod     = modules.find((m) => m.module.key === selectedModuleKey) ?? null

  // Reload perm map when profile changes
  useEffect(() => {
    if (selectedProfile) {
      setPermMap(buildPermMap(selectedProfile.permissions, modules))
      setPermDirty(false)
    }
  }, [selectedId, profiles])

  // Auto-select first module
  useEffect(() => {
    if (!selectedModuleKey && modules.length > 0) setSelectedModuleKey(modules[0].module.key)
  }, [modules])

  // ── Perm helpers ────────────────────────────────────────────────────────────

  function getPerm(mKey: string, fKey: string) {
    return permMap[mKey]?.[fKey] ?? { ...EMPTY_PERM }
  }

  function getAddonNames(mKey: string): string[] {
    return modules.find((m) => m.module.key === mKey)?.module.addons.map((a) => a.name) ?? []
  }

  function setPerm(mKey: string, fKey: string, key: typeof PERM_KEYS[number], val: boolean) {
    setPermMap((prev) => {
      const modulePerms = { ...(prev[mKey] ?? {}) }

      // Update target row
      const cur     = modulePerms[fKey] ?? { ...EMPTY_PERM }
      const updated = { ...cur, [key]: val }
      if (key === 'canView' && !val) { updated.canAdd = false; updated.canEdit = false; updated.canDelete = false }
      if (key !== 'canView' && val)  { updated.canView = true }
      modulePerms[fKey] = updated

      // ── Cascade from module row to all addons ──────────────────────────────
      if (fKey === 'module') {
        for (const addonKey of getAddonNames(mKey)) {
          const addonCur = { ...(modulePerms[addonKey] ?? { ...EMPTY_PERM }) }
          if (key === 'canView') {
            if (val) {
              // View ON  → turn on view for all addons
              addonCur.canView = true
            } else {
              // View OFF → clear everything
              addonCur.canView = false; addonCur.canAdd = false; addonCur.canEdit = false; addonCur.canDelete = false
            }
          } else {
            // Add/Edit/Delete ON  → enable that perm (and view) for every addon
            // Add/Edit/Delete OFF → disable that perm for every addon
            addonCur[key] = val
            if (val) addonCur.canView = true
          }
          modulePerms[addonKey] = addonCur
        }
      }

      return { ...prev, [mKey]: modulePerms }
    })
    setPermDirty(true)
  }

  function setRowAll(mKey: string, fKey: string, val: boolean) {
    setPermMap((prev) => ({
      ...prev,
      [mKey]: { ...(prev[mKey] ?? {}), [fKey]: { canView: val, canAdd: val, canEdit: val, canDelete: val } },
    }))
    setPermDirty(true)
  }

  function setModuleAll(mKey: string, val: boolean) {
    const keys = ['module', ...getAddonNames(mKey)]
    setPermMap((prev) => {
      const next: PermMap[string] = {}
      for (const fk of keys) next[fk] = { canView: val, canAdd: val, canEdit: val, canDelete: val }
      return { ...prev, [mKey]: next }
    })
    setPermDirty(true)
  }

  function setGroupAll(mKey: string, addonNames: string[], val: boolean) {
    setPermMap((prev) => {
      const mp = { ...(prev[mKey] ?? {}) }
      for (const n of addonNames) mp[n] = { canView: val, canAdd: val, canEdit: val, canDelete: val }
      return { ...prev, [mKey]: mp }
    })
    setPermDirty(true)
  }

  function isModuleAllGranted(mKey: string): boolean {
    return ['module', ...getAddonNames(mKey)].every((fk) => {
      const p = getPerm(mKey, fk)
      return p.canView && p.canAdd && p.canEdit && p.canDelete
    })
  }

  function modulePermSummary(mKey: string) {
    const p = getPerm(mKey, 'module')
    return { view: p.canView, write: p.canAdd || p.canEdit || p.canDelete }
  }

  function toggleGroup(key: string) {
    setClosedGroups((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  function savePermissions() {
    if (!selectedProfile) return
    setSaving(true)
    router.put(
      `/organizations/${org.id}/profiles/${selectedProfile.id}/permissions`,
      { permissions: mapToSavePerms(permMap, modules) },
      {
        onSuccess: () => { setSaving(false); setPermDirty(false) },
        onError:   () => setSaving(false),
      }
    )
  }

  function handleAdd() {
    if (!addForm.name.trim()) return
    setAddLoading(true)
    router.post(`/organizations/${org.id}/profiles`, {
      name: addForm.name.trim(), description: addForm.description.trim() || undefined, dataAccess: addForm.dataAccess,
    }, {
      onSuccess: () => { setAddOpen(false); setAddForm({ name: '', description: '', dataAccess: 'self' }); setAddLoading(false) },
      onError:   () => setAddLoading(false),
    })
  }

  function openEdit(p: OrgProfile) {
    setEditForm({ name: p.name, description: p.description ?? '', dataAccess: p.dataAccess })
    setEditOpen(true)
  }

  function handleEdit() {
    if (!selectedProfile || !editForm.name.trim()) return
    setEditLoading(true)
    router.put(`/organizations/${org.id}/profiles/${selectedProfile.id}`, {
      name: editForm.name.trim(), description: editForm.description.trim() || undefined, dataAccess: editForm.dataAccess,
    }, {
      onSuccess: () => { setEditOpen(false); setEditLoading(false) },
      onError:   () => setEditLoading(false),
    })
  }

  function handleDelete() {
    if (!selectedProfile) return
    setDelLoading(true)
    router.delete(`/organizations/${org.id}/profiles/${selectedProfile.id}`, {
      onSuccess: () => {
        setDeleteOpen(false); setDelLoading(false)
        setSelectedId(profiles.find((p) => p.id !== selectedProfile.id)?.id ?? null)
      },
      onError: () => setDelLoading(false),
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', minHeight: 540, borderTop: '1px solid var(--border)' }}>
      <style>{ACCORDION_CSS}</style>

      {/* ══ PANEL 1: Profile list ══ */}
      <div style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Profiles</span>
          <button className="btn btn-p btn-sm" style={{ height: 26, padding: '0 9px', fontSize: '.7rem', display: 'inline-flex', alignItems: 'center', gap: 3 }} onClick={() => setAddOpen(true)}>
            <Plus size={10} /> Add
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {profiles.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', fontSize: '.78rem', color: 'var(--text4)' }}>No profiles yet</div>
          ) : profiles.map((p) => {
            const [fg, bg] = profileColor(p.name)
            const isSelected = selectedId === p.id
            const userCount  = (org.orgUsers || []).filter((u) => u.profileId === p.id).length
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: '9px 13px', background: isSelected ? 'var(--p-lt)' : 'transparent', borderLeft: `3px solid ${isSelected ? 'var(--p)' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 9, transition: 'background .12s' }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)' }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: isSelected ? 'var(--p)' : 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: '.67rem', color: 'var(--text4)', marginTop: 1 }}>{userCount} user{userCount !== 1 ? 's' : ''}</div>
                </div>
                {isSelected && <ChevronRight size={11} style={{ color: 'var(--p)', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ PANEL 2+3: Permission area ══ */}
      {!selectedProfile ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--text4)' }}>
          <ShieldCheck size={38} style={{ opacity: .25 }} />
          <span style={{ fontSize: '.82rem' }}>Select a profile to manage permissions</span>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Profile header */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: 'var(--surface)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text1)' }}>{selectedProfile.name}</span>
                <span className="bdg bdg-gray" style={{ fontSize: '.67rem', padding: '2px 7px' }}>
                  {DATA_ACCESS_OPTS.find((o) => o.value === selectedProfile.dataAccess)?.label ?? selectedProfile.dataAccess}
                </span>
                <span style={{ fontSize: '.7rem', color: 'var(--text4)' }}>
                  {(org.orgUsers || []).filter((u) => u.profileId === selectedProfile.id).length} user(s) assigned
                </span>
              </div>
              {selectedProfile.description && (
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 2 }}>{selectedProfile.description}</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }} onClick={() => openEdit(selectedProfile)}>
                <Pencil size={11} /> Edit
              </button>
              <button
                style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 7px', borderRadius: 6, color: 'var(--text3)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => setDeleteOpen(true)}
                onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#ef4444'; b.style.borderColor = '#fecaca'; b.style.background = 'rgba(239,68,68,.06)' }}
                onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--text3)'; b.style.borderColor = 'var(--border)'; b.style.background = 'transparent' }}
              ><Trash2 size={12} /></button>
            </div>
          </div>

          {/* Module tabs + permission content */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

            {/* ── PANEL 2: Module vertical tabs ── */}
            <div style={{ width: 168, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg)' }}>
              <div style={{ padding: '9px 12px 6px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Modules</span>
              </div>
              {modules.length === 0 ? (
                <div style={{ padding: 14, fontSize: '.75rem', color: 'var(--text4)' }}>No modules</div>
              ) : modules.map((m) => {
                const mKey     = m.module.key
                const isActive = selectedModuleKey === mKey
                const { view, write } = modulePermSummary(mKey)
                return (
                  <button
                    key={mKey}
                    onClick={() => setSelectedModuleKey(mKey)}
                    style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: '9px 12px', background: isActive ? 'var(--surface)' : 'transparent', borderLeft: `3px solid ${isActive ? 'var(--p)' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 8, transition: 'background .12s', borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)' }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.76rem', fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--p)' : 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.module.label}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                        <PermDot active={view}  label="V" />
                        <PermDot active={write} label="W" />
                      </div>
                    </div>
                    {isActive && <ChevronRight size={10} style={{ color: 'var(--p)', flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>

            {/* ── PANEL 3: Permission detail ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              {!selectedMod ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)', fontSize: '.8rem' }}>
                  Select a module
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

                  {/* Module-level access card */}
                  <div style={{ margin: '14px 16px', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '9px 14px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text1)' }}>{selectedMod.module.label} — Module Access</div>
                        <div style={{ fontSize: '.69rem', color: 'var(--text4)', marginTop: 1 }}>Top-level access for the entire module</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                        <span style={{ fontSize: '.67rem', color: 'var(--text4)' }}>Grant all</span>
                        <PermCheckbox checked={isModuleAllGranted(selectedMod.module.key)} onChange={(v) => setModuleAll(selectedMod.module.key, v)} accent />
                      </div>
                    </div>
                    <div style={{ padding: '11px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {PERM_KEYS.map((k) => {
                        const perm = getPerm(selectedMod.module.key, 'module')
                        return (
                          <PermPill key={k} label={PERM_LABELS[k]} checked={perm[k]} disabled={k !== 'canView' && !perm.canView} onChange={(v) => setPerm(selectedMod.module.key, 'module', k, v)} />
                        )
                      })}
                    </div>
                  </div>

                  {/* Addon type sections */}
                  {selectedMod.module.addons.length > 0 && (
                    <div style={{ margin: '0 16px 16px' }}>
                      {(['default', 'custom', 'advance'] as const).map((type) => {
                        const typeAddons = selectedMod.module.addons.filter((a) => a.type === type)
                        if (typeAddons.length === 0) return null
                        const groups     = groupAddons(typeAddons)
                        const meta       = TYPE_META[type]
                        const mKey       = selectedMod.module.key
                        const enabledCnt = typeAddons.filter((a) => { const p = getPerm(mKey, a.name); return p.canView || p.canAdd || p.canEdit || p.canDelete }).length
                        return (
                          <div key={type} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                            {/* Type header */}
                            <div style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7, background: meta.bg, borderBottom: '1px solid var(--border)' }}>
                              {meta.icon && <span style={{ color: meta.color, flexShrink: 0 }}>{meta.icon}</span>}
                              <span style={{ fontSize: '.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: meta.color, flex: 1 }}>
                                {meta.label} Add-ons
                              </span>
                              <span style={{ fontSize: '.63rem', fontWeight: 700, color: meta.color }}>{enabledCnt}/{typeAddons.length}</span>
                            </div>

                            {/* Column header row — same grid as data rows + group header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 50px 50px 50px 54px', padding: '5px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                              <span style={{ fontSize: '.63rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Feature</span>
                              {PERM_KEYS.map((k) => (
                                <span key={k} style={{ fontSize: '.63rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>{PERM_LABELS[k].charAt(0)}</span>
                              ))}
                              <span style={{ fontSize: '.63rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>All</span>
                            </div>

                            {/* Category groups */}
                            {groups.map((grp) => (
                              <AddonGroupAccordion
                                key={grp.label}
                                grp={grp}
                                mKey={mKey}
                                isOpen={!closedGroups.has(`${mKey}:${type}:${grp.label}`)}
                                onToggle={() => toggleGroup(`${mKey}:${type}:${grp.label}`)}
                                getPerm={getPerm}
                                setPerm={setPerm}
                                setRowAll={setRowAll}
                                setGroupAll={setGroupAll}
                              />
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Save bar */}
              {permDirty && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg,var(--p-lt) 0%,var(--surface) 100%)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--p)', boxShadow: '0 0 0 3px var(--p-mid)' }} />
                    <span style={{ fontSize: '.76rem', fontWeight: 600, color: 'var(--p)' }}>Unsaved changes</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { if (selectedProfile) { setPermMap(buildPermMap(selectedProfile.permissions, modules)); setPermDirty(false) } }}>Discard</button>
                    <button className="btn btn-p btn-sm" disabled={saving} onClick={savePermissions} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Save size={12} /> {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ ADD MODAL ════════ */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Profile" size="sm" icon={<ShieldCheck size={15} />}
        footer={<><button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn btn-p" disabled={addLoading || !addForm.name.trim()} onClick={handleAdd}>{addLoading ? 'Creating…' : <><Plus size={13} /> Create Profile</>}</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg"><label>Profile Name <span className="req">*</span></label><input className="fi" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sales Executive" autoFocus /></div>
          <div className="fg"><label>Description</label><input className="fi" value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description…" /></div>
          <div className="fg"><label>Data Access</label><SelectSearch value={addForm.dataAccess} onChange={(v) => setAddForm((f) => ({ ...f, dataAccess: v as OrgProfile['dataAccess'] }))} options={DATA_ACCESS_OPTS.map((o) => ({ value: o.value, label: o.label, sub: o.desc }))} placeholder="Select data access" /></div>
          <DataAccessInfo value={addForm.dataAccess} />
        </div>
      </Modal>

      {/* ════════ EDIT MODAL ════════ */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="sm" icon={<Pencil size={15} />}
        footer={<><button className="btn btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-p" disabled={editLoading || !editForm.name.trim()} onClick={handleEdit}>{editLoading ? 'Saving…' : 'Save Changes'}</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg"><label>Profile Name <span className="req">*</span></label><input className="fi" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="fg"><label>Description</label><input className="fi" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div className="fg"><label>Data Access</label><SelectSearch value={editForm.dataAccess} onChange={(v) => setEditForm((f) => ({ ...f, dataAccess: v as OrgProfile['dataAccess'] }))} options={DATA_ACCESS_OPTS.map((o) => ({ value: o.value, label: o.label, sub: o.desc }))} placeholder="Select data access" /></div>
          <DataAccessInfo value={editForm.dataAccess} />
        </div>
      </Modal>

      {/* ════════ DELETE MODAL ════════ */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Profile" size="sm" icon={<Trash2 size={15} />} variant="danger"
        footer={<><button className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>Cancel</button><button className="btn btn-danger" disabled={delLoading} onClick={handleDelete}><Trash2 size={13} /> {delLoading ? 'Deleting…' : 'Delete'}</button></>}
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          Delete <strong style={{ color: 'var(--text1)' }}>{selectedProfile?.name}</strong>? Users assigned to this profile will have their profile cleared. All permissions will be permanently removed.
        </p>
      </Modal>
    </div>
  )
}

// ── AddonGroupAccordion ───────────────────────────────────────────────────────

function AddonGroupAccordion({ grp, mKey, isOpen, onToggle, getPerm, setPerm, setRowAll, setGroupAll }: {
  grp: AddonGroup
  mKey: string
  isOpen: boolean
  onToggle: () => void
  getPerm: (mKey: string, fKey: string) => { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean }
  setPerm: (mKey: string, fKey: string, key: typeof PERM_KEYS[number], val: boolean) => void
  setRowAll: (mKey: string, fKey: string, val: boolean) => void
  setGroupAll: (mKey: string, names: string[], val: boolean) => void
}) {
  const cbRef    = useRef<HTMLInputElement>(null)
  const names    = grp.items.map((a) => a.name)
  const grantedCnt = names.filter((n) => { const p = getPerm(mKey, n); return p.canView && p.canAdd && p.canEdit && p.canDelete }).length
  const anyCnt   = names.filter((n) => { const p = getPerm(mKey, n); return p.canView || p.canAdd || p.canEdit || p.canDelete }).length
  const total    = names.length
  const allSel   = grantedCnt === total
  const someSel  = anyCnt > 0 && !allSel
  const pct      = total > 0 ? Math.round((anyCnt / total) * 100) : 0

  useEffect(() => {
    if (cbRef.current) cbRef.current.indeterminate = someSel
  }, [someSel])

  const rowHeight = 40
  const maxH = isOpen ? `${grp.items.length * rowHeight + 4}px` : '0px'

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      {/* Group header — same grid as data rows so "All" column aligns perfectly */}
      <div className={`perm-acc-hd${isOpen ? ' open' : ''}`} onClick={onToggle}>

        {/* Col 1: chevron + label + progress + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <ChevronRight size={12} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .22s', color: isOpen ? 'var(--p)' : 'var(--text4)', flexShrink: 0 }} />
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: isOpen ? 'var(--text1)' : 'var(--text2)', whiteSpace: 'nowrap' }}>{grp.label}</span>
          <div style={{ width: 44, height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ height: '100%', borderRadius: 999, background: allSel ? 'var(--s)' : 'var(--p)', width: `${pct}%`, transition: 'width .3s ease' }} />
          </div>
          {anyCnt > 0 && (
            <span style={{ fontSize: '.63rem', fontWeight: 700, color: allSel ? 'var(--s)' : 'var(--p)', flexShrink: 0 }}>
              {grantedCnt}/{total}
            </span>
          )}
        </div>

        {/* Cols 2–5: empty spacers (V / A / E / D columns) */}
        <div /><div /><div /><div />

        {/* Col 6: grant-all checkbox — aligns with "All" header */}
        <div style={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
          <input
            ref={cbRef}
            type="checkbox"
            className="ck"
            checked={allSel}
            onChange={() => setGroupAll(mKey, names, !allSel)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Addon rows */}
      <div className="perm-acc-body" style={{ maxHeight: maxH }}>
        {grp.items.map((addon, idx) => {
          const fKey  = addon.name
          const perm  = getPerm(mKey, fKey)
          const allOn = perm.canView && perm.canAdd && perm.canEdit && perm.canDelete
          const isLast = idx === grp.items.length - 1
          // Strip prefix for display
          const displayName = fKey.replace(/^Settings - /, '').replace(/^Employee Document - /, '')

          return (
            <div
              key={fKey}
              style={{ display: 'grid', gridTemplateColumns: '1fr 50px 50px 50px 50px 54px', padding: '0 14px', alignItems: 'center', height: rowHeight, borderBottom: isLast ? 'none' : '1px solid var(--border)', background: idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)', transition: 'background .1s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--p-lt)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)')}
            >
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 6, minWidth: 0 }}>
                <div style={{ width: 3, height: 13, borderRadius: 2, flexShrink: 0, background: addon.type === 'advance' ? '#f59e0b' : addon.type === 'custom' ? '#0ea5e9' : 'var(--border2)' }} />
                <span style={{ fontSize: '.76rem', color: 'var(--text1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
              </div>

              {/* V / A / E / D */}
              {PERM_KEYS.map((k) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'center' }}>
                  <PermCheckbox checked={perm[k]} onChange={(v) => setPerm(mKey, fKey, k, v)} disabled={k !== 'canView' && !perm.canView} />
                </div>
              ))}

              {/* All */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PermCheckbox checked={allOn} onChange={(v) => setRowAll(mKey, fKey, v)} accent />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── PermCheckbox — square with SVG tick ──────────────────────────────────────

function PermCheckbox({ checked, onChange, disabled = false, accent = false }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; accent?: boolean
}) {
  const color = accent ? '#6366f1' : 'var(--p)'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${checked ? color : 'var(--border2)'}`, background: checked ? color : 'var(--surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .38 : 1, transition: 'background .12s, border-color .12s', padding: 0, outline: 'none' }}
    >
      {checked && (
        <svg viewBox="0 0 10 8" width="10" height="8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ── PermPill — pill toggle for module-level perms ─────────────────────────────

function PermPill({ label, checked, onChange, disabled = false }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${checked ? 'var(--p)' : 'var(--border)'}`, background: checked ? 'var(--p-lt)' : 'var(--bg)', color: checked ? 'var(--p)' : 'var(--text3)', fontSize: '.75rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .4 : 1, transition: 'all .12s', outline: 'none' }}
    >
      <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${checked ? 'var(--p)' : 'var(--border2)'}`, background: checked ? 'var(--p)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <svg viewBox="0 0 10 8" width="8" height="8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      {label}
    </button>
  )
}

// ── PermDot — tiny V/W badge on module tab ────────────────────────────────────

function PermDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: active ? 'var(--p-lt)' : 'var(--bg2)', color: active ? 'var(--p)' : 'var(--text4)', border: `1px solid ${active ? 'var(--p-mid)' : 'var(--border)'}` }}>
      {label}
    </span>
  )
}

// ── DataAccessInfo ────────────────────────────────────────────────────────────

function DataAccessInfo({ value }: { value: OrgProfile['dataAccess'] }) {
  const icons: Record<string, React.ReactNode> = { all: <Globe size={13} />, organization: <Users size={13} />, self: <User size={13} />, custom: <Settings size={13} /> }
  const descs: Record<string, string> = {
    all:          'This profile can see and manage all data across the entire organization.',
    organization: 'This profile can see and manage data scoped to the organization only.',
    self:         'This profile can only see and manage their own personal data.',
    custom:       'Custom data scope — configure granular access rules manually.',
  }
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 11px', background: 'var(--p-lt)', borderRadius: 8, border: '1px solid var(--p-mid)' }}>
      <span style={{ color: 'var(--p)', flexShrink: 0, marginTop: 1 }}>{icons[value]}</span>
      <span style={{ fontSize: '.74rem', color: 'var(--text2)', lineHeight: 1.5 }}>{descs[value]}</span>
    </div>
  )
}
