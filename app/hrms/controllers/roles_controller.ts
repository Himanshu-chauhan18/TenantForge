import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import OrganizationProfile from '#models/organization_profile'
import OrganizationProfilePermission from '#models/organization_profile_permission'
import OrganizationModule from '#models/organization_module'
import OrganizationUser from '#models/organization_user'

// ── Validators ───────────────────────────────────────────────────────────────

const profileSchema = vine.compile(
  vine.object({
    name:        vine.string().trim().minLength(1).maxLength(80),
    description: vine.string().trim().maxLength(255).optional(),
    dataAccess:  vine.enum(['all', 'organization', 'self', 'custom']),
  })
)


// ── Controller ───────────────────────────────────────────────────────────────

export default class HrmsRolesController {

  // ── index ─────────────────────────────────────────────────────────────────

  async index({ inertia, hrmsOrg, hrmsPermissions }: HttpContext) {
    const [profiles, orgModules, employees] = await Promise.all([
      OrganizationProfile.query()
        .where('org_id', hrmsOrg.id)
        .preload('permissions')
        .orderBy('id'),
      OrganizationModule.query()
        .where('org_id', hrmsOrg.id)
        .where('enabled', true)
        .preload('module', (q) =>
          q.preload('addons', (aq) => aq.where('is_active', true).orderBy('sort_order'))
        ),
      OrganizationUser.query()
        .where('org_id', hrmsOrg.id)
        .whereNotNull('profile_id')
        .select('profile_id'),
    ])

    orgModules.sort((a, b) => (a.module.sortOrder ?? 999) - (b.module.sortOrder ?? 999))

    const employeeCounts: Record<number, number> = {}
    for (const e of employees) {
      if (e.profileId) employeeCounts[e.profileId] = (employeeCounts[e.profileId] ?? 0) + 1
    }

    const serializedProfiles = profiles.map((p) => ({
      ...p.serialize(),
      employeeCount: employeeCounts[p.id] ?? 0,
      permissions:   p.permissions.map((perm) => perm.serialize()),
    }))

    const serializedModules = orgModules.map((om) => ({
      enabled:  om.enabled,
      addonIds: om.addonIds,
      module: {
        id:        om.module.id,
        key:       om.module.key,
        label:     om.module.label,
        sortOrder: om.module.sortOrder,
        addons:    om.module.addons.map((a) => ({
          id:        a.id,
          name:      a.name,
          type:      a.type,
          sortOrder: a.sortOrder,
        })),
      },
    }))

    // Whether current employee can mutate roles (add/edit/delete)
    const addonId = hrmsPermissions.addonNameIndex['Roles & Permissions']
    const canEdit = addonId ? (hrmsPermissions.addonPermissions[addonId]?.add ?? false) : false

    return inertia.render('hrms/organization/roles', {
      profiles:   serializedProfiles,
      orgModules: serializedModules,
      canEdit,
    })
  }

  // ── showPermissions ───────────────────────────────────────────────────────

  async showPermissions({ inertia, params, hrmsOrg, hrmsPermissions }: HttpContext) {
    const [profile, orgModules, employees] = await Promise.all([
      OrganizationProfile.query()
        .where('id', params.id)
        .where('org_id', hrmsOrg.id)
        .preload('permissions')
        .firstOrFail(),
      OrganizationModule.query()
        .where('org_id', hrmsOrg.id)
        .where('enabled', true)
        .preload('module', (q) =>
          q.preload('addons', (aq) => aq.where('is_active', true).orderBy('sort_order'))
        ),
      OrganizationUser.query()
        .where('org_id', hrmsOrg.id)
        .where('profile_id', params.id)
        .count('* as total'),
    ])

    orgModules.sort((a, b) => (a.module.sortOrder ?? 999) - (b.module.sortOrder ?? 999))

    const employeeCount = Number((employees[0] as any).$extras.total ?? 0)

    const serializedModules = orgModules.map((om) => ({
      enabled:  om.enabled,
      addonIds: om.addonIds,
      module: {
        id:        om.module.id,
        key:       om.module.key,
        label:     om.module.label,
        sortOrder: om.module.sortOrder,
        addons:    om.module.addons.map((a) => ({
          id:        a.id,
          name:      a.name,
          type:      a.type,
          sortOrder: a.sortOrder,
        })),
      },
    }))

    const addonId = hrmsPermissions.addonNameIndex['Roles & Permissions']
    const canEdit = addonId ? (hrmsPermissions.addonPermissions[addonId]?.add ?? false) : false

    return inertia.render('hrms/organization/roles/permissions', {
      profile: {
        ...profile.serialize(),
        employeeCount,
        permissions: profile.permissions.map((p) => p.serialize()),
      },
      orgModules: serializedModules,
      canEdit,
    })
  }

  // ── store ─────────────────────────────────────────────────────────────────

  async store({ request, response, session, hrmsOrg }: HttpContext) {
    const data = await request.validateUsing(profileSchema)

    await OrganizationProfile.create({
      orgId:       hrmsOrg.id,
      name:        data.name,
      description: data.description ?? null,
      dataAccess:  data.dataAccess as any,
      isDefault:   false,
    })

    session.flash('success', 'Role created successfully.')
    return response.redirect().back()
  }

  // ── update ────────────────────────────────────────────────────────────────

  async update({ request, response, session, params, hrmsOrg }: HttpContext) {
    const profile = await OrganizationProfile.query()
      .where('id', params.id)
      .where('org_id', hrmsOrg.id)
      .firstOrFail()

    const data = await request.validateUsing(profileSchema)

    profile.name        = data.name
    profile.description = data.description ?? null
    profile.dataAccess  = data.dataAccess as any
    await profile.save()

    session.flash('success', 'Role updated successfully.')
    return response.redirect().back()
  }

  // ── destroy ───────────────────────────────────────────────────────────────

  async destroy({ response, session, params, hrmsOrg }: HttpContext) {
    const profile = await OrganizationProfile.query()
      .where('id', params.id)
      .where('org_id', hrmsOrg.id)
      .firstOrFail()

    if (profile.isDefault) {
      session.flash('error', 'Default roles cannot be deleted.')
      return response.redirect().back()
    }

    const assigned = await OrganizationUser.query()
      .where('org_id', hrmsOrg.id)
      .where('profile_id', profile.id)
      .count('* as total')

    const count = Number((assigned[0] as any).$extras.total ?? 0)
    if (count > 0) {
      session.flash('error', `Cannot delete — ${count} employee${count !== 1 ? 's are' : ' is'} assigned to this role.`)
      return response.redirect().back()
    }

    await OrganizationProfilePermission.query()
      .where('org_id', hrmsOrg.id)
      .where('profile_id', profile.id)
      .delete()

    await profile.delete()

    session.flash('success', 'Role deleted successfully.')
    return response.redirect().back()
  }

  // ── updatePermissions ─────────────────────────────────────────────────────

  async updatePermissions({ request, response, session, params, hrmsOrg }: HttpContext) {
    const profile = await OrganizationProfile.query()
      .where('id', params.id)
      .where('org_id', hrmsOrg.id)
      .firstOrFail()

    const { permissions } = request.only(['permissions']) as {
      permissions: Array<{ moduleId: number; permissions: Record<string, { v: 0|1; a: 0|1; e: 0|1; d: 0|1 }> }>
    }
    const rows = Array.isArray(permissions) ? permissions : []

    for (const row of rows) {
      if (!row.moduleId || typeof row.permissions !== 'object') continue
      await OrganizationProfilePermission.updateOrCreate(
        { orgId: hrmsOrg.id, profileId: profile.id, moduleId: Number(row.moduleId) },
        { permissions: row.permissions }
      )
    }

    session.flash('success', 'Permissions saved.')
    return response.redirect().back()
  }
}
