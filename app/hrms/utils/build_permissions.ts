import OrganizationUser from '#models/organization_user'
import Organization from '#models/organization'
import OrganizationModule from '#models/organization_module'
import OrganizationProfile from '#models/organization_profile'
import Module from '#models/module'

export type HrmsPermEntry        = { view: boolean; add: boolean; edit: boolean; delete: boolean }
export type HrmsAddonPermissions = Record<string, HrmsPermEntry>   // keyed by addon ID string
export type HrmsAddonNameIndex   = Record<string, string>          // addonName → addonId string
export type HrmsPermissions      = Record<string, HrmsPermEntry>   // moduleKey → perm

export interface HrmsBuiltPermissions {
  profileName:      string
  hasProfile:       boolean
  permissions:      HrmsPermissions
  addonPermissions: HrmsAddonPermissions
  addonNameIndex:   HrmsAddonNameIndex
  /** Module keys sorted by DB sortOrder, filtered to org-enabled modules only */
  moduleOrder:      string[]
}

/**
 * Builds module + addon permissions for an employee.
 * Called on every authenticated request so permission changes are reflected immediately
 * without requiring the employee to re-login.
 */
export async function buildHrmsPermissions(
  employee: OrganizationUser,
  org: Organization
): Promise<HrmsBuiltPermissions> {
  let profileName = 'Employee'
  const permissions: HrmsPermissions          = {}
  const addonPermissions: HrmsAddonPermissions = {}
  const addonNameIndex: HrmsAddonNameIndex     = {}

  const [modules, orgModuleConfigs] = await Promise.all([
    Module.query()
      .where('is_active', true)
      .preload('addons', (q) => q.where('is_active', true).orderBy('sort_order', 'asc'))
      .orderBy('sort_order', 'asc'),
    OrganizationModule.query().where('org_id', org.id).where('enabled', true),
  ])

  // Build org-enabled sets. If the org has no config rows yet → no restriction.
  const orgEnabledAddonIds  = new Set<number>()
  const orgEnabledModuleIds = new Set<number>()
  const hasOrgModuleConfig  = orgModuleConfigs.length > 0
  if (hasOrgModuleConfig) {
    for (const cfg of orgModuleConfigs) {
      orgEnabledModuleIds.add(cfg.moduleId)
      for (const a of cfg.addonIds) {
        if (a.enabled) orgEnabledAddonIds.add(a.id)
      }
    }
  }

  const addonAllowed  = (id: number) => !hasOrgModuleConfig || orgEnabledAddonIds.has(id)
  const moduleAllowed = (id: number) => !hasOrgModuleConfig || orgEnabledModuleIds.has(id)

  // Build lookup maps: moduleId → moduleKey, addonId → addonName
  const keyById: Record<number, string>       = {}
  const addonNameById: Record<number, string> = {}
  for (const m of modules) {
    keyById[m.id] = m.key
    for (const a of m.addons) addonNameById[a.id] = a.name
  }

  // Module keys sorted by sortOrder, filtered to org-enabled modules
  const moduleOrder = modules
    .filter((m) => moduleAllowed(m.id))
    .map((m) => m.key)

  if (employee.profileId) {
    const profile = await OrganizationProfile.query()
      .where('id', employee.profileId)
      .preload('permissions')
      .first()

    if (profile) {
      profileName = profile.name

      for (const perm of profile.permissions) {
        const moduleKey = keyById[perm.moduleId]
        if (!moduleKey) continue
        if (!moduleAllowed(perm.moduleId)) continue

        const moduleObj = modules.find((m) => m.id === perm.moduleId)

        // First pass: process explicit addon ID keys (numeric string keys)
        for (const [rawKey, entry] of Object.entries(perm.permissions)) {
          if (rawKey === 'module') continue
          const addonId   = Number(rawKey)
          const addonName = addonNameById[addonId]
          if (!addonName) continue
          if (!addonAllowed(addonId)) continue

          const idStr = String(addonId)
          addonPermissions[idStr] = {
            view:   Boolean(entry.v),
            add:    Boolean(entry.a),
            edit:   Boolean(entry.e),
            delete: Boolean(entry.d),
          }
          addonNameIndex[addonName] = idStr
        }

        // Second pass: handle legacy "module" key — cascade to all org-enabled addons not already set
        const modulePerm = perm.permissions['module']
        if (modulePerm) {
          for (const addon of moduleObj?.addons ?? []) {
            if (!addonAllowed(addon.id)) continue
            const addonName = addonNameById[addon.id]
            if (!addonName) continue
            const idStr = String(addon.id)
            if (!(idStr in addonPermissions)) {
              addonPermissions[idStr] = {
                view:   Boolean(modulePerm.v),
                add:    Boolean(modulePerm.a),
                edit:   Boolean(modulePerm.e),
                delete: Boolean(modulePerm.d),
              }
              addonNameIndex[addonName] = idStr
            }
          }
        }

        // Derive module-level perm from the union of all its addon perms
        const derived: HrmsPermEntry = { view: false, add: false, edit: false, delete: false }
        for (const addon of moduleObj?.addons ?? []) {
          const ap = addonPermissions[String(addon.id)]
          if (!ap) continue
          if (ap.view)   derived.view   = true
          if (ap.add)    derived.add    = true
          if (ap.edit)   derived.edit   = true
          if (ap.delete) derived.delete = true
        }
        permissions[moduleKey] = derived
      }
    }
  } else {
    // No profile → full access for org-enabled modules and addons only
    for (const m of modules) {
      if (!moduleAllowed(m.id)) continue
      const moduleKey = keyById[m.id]
      if (!moduleKey) continue
      permissions[moduleKey] = { view: true, add: true, edit: true, delete: true }
      for (const addon of m.addons) {
        if (!addonAllowed(addon.id)) continue
        const addonName = addonNameById[addon.id]
        if (!addonName) continue
        addonPermissions[String(addon.id)] = { view: true, add: true, edit: true, delete: true }
        addonNameIndex[addonName] = String(addon.id)
      }
    }
  }

  return {
    profileName,
    hasProfile:       !!employee.profileId,
    permissions,
    addonPermissions,
    addonNameIndex,
    moduleOrder,
  }
}
