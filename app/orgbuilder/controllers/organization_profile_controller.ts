import type { HttpContext } from '@adonisjs/core/http'
import OrganizationProfile from '#models/organization_profile'
import OrganizationProfilePermission from '#models/organization_profile_permission'
import db from '@adonisjs/lucid/services/db'

// ── Default profiles seeded for every new org ─────────────────────────────────

const DEFAULT_PROFILES = [
  { name: 'Super Admin', description: 'Full access to all modules and settings', dataAccess: 'all' as const },
  { name: 'HR Admin',    description: 'Manages human resources and employee data', dataAccess: 'organization' as const },
  { name: 'Manager',    description: 'Team and project management access', dataAccess: 'organization' as const },
  { name: 'User',       description: 'Standard employee access', dataAccess: 'self' as const },
]

export default class OrganizationProfileController {
  // ── Ensure defaults exist for org ──────────────────────────────────────────

  private async ensureDefaults(orgId: number) {
    const existing = await OrganizationProfile.query().where('org_id', orgId).count('* as total')
    const total = Number(existing[0]?.$extras?.total ?? 0)
    if (total === 0) {
      await OrganizationProfile.createMany(
        DEFAULT_PROFILES.map((p) => ({ orgId, ...p }))
      )
    }
  }

  // ── GET /organizations/:id/profiles ───────────────────────────────────────

  async index({ params, response }: HttpContext) {
    const orgId = Number(params.id)
    await this.ensureDefaults(orgId)
    const profiles = await OrganizationProfile.query()
      .where('org_id', orgId)
      .preload('permissions')
      .orderBy('id', 'asc')
    return response.json(profiles.map((p) => p.serialize()))
  }

  // ── POST /organizations/:id/profiles ──────────────────────────────────────

  async store({ params, request, response, session }: HttpContext) {
    const { name, description, dataAccess } = request.only(['name', 'description', 'dataAccess'])
    const orgId = Number(params.id)

    if (!name || !String(name).trim()) {
      session.flash('flashToasts', JSON.stringify(['Profile name is required.']))
      return response.redirect().back()
    }

    const exists = await OrganizationProfile.query()
      .where('org_id', orgId)
      .whereRaw('LOWER(name) = ?', [String(name).trim().toLowerCase()])
      .first()

    if (exists) {
      session.flash('flashToasts', JSON.stringify(['A profile with this name already exists.']))
      return response.redirect().back()
    }

    const profile = await OrganizationProfile.create({
      orgId,
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      dataAccess: (['all', 'organization', 'self', 'custom'].includes(dataAccess) ? dataAccess : 'self') as 'all' | 'organization' | 'self' | 'custom',
    })

    session.flash('success', `Profile "${profile.name}" created.`)
    return response.redirect().back()
  }

  // ── PUT /organizations/:id/profiles/:profileId ────────────────────────────

  async update({ params, request, response, session }: HttpContext) {
    const profile = await OrganizationProfile.query()
      .where('id', params.profileId)
      .where('org_id', params.id)
      .first()

    if (!profile) {
      session.flash('flashToasts', JSON.stringify(['Profile not found.']))
      return response.redirect().back()
    }

    const { name, description, dataAccess } = request.only(['name', 'description', 'dataAccess'])

    if (name) profile.name = String(name).trim()
    profile.description = description ? String(description).trim() : null
    if (dataAccess && ['all', 'organization', 'self', 'custom'].includes(dataAccess)) {
      profile.dataAccess = dataAccess as 'all' | 'organization' | 'self' | 'custom'
    }
    await profile.save()

    session.flash('success', 'Profile updated.')
    return response.redirect().back()
  }

  // ── DELETE /organizations/:id/profiles/:profileId ─────────────────────────

  async destroy({ params, response, session }: HttpContext) {
    const profile = await OrganizationProfile.query()
      .where('id', params.profileId)
      .where('org_id', params.id)
      .first()

    if (!profile) {
      session.flash('flashToasts', JSON.stringify(['Profile not found.']))
      return response.redirect().back()
    }

    await OrganizationProfilePermission.query().where('profile_id', profile.id).delete()
    await profile.delete()

    session.flash('success', `Profile "${profile.name}" deleted.`)
    return response.redirect().back()
  }

  // ── PUT /organizations/:id/profiles/:profileId/permissions ────────────────
  // Body: { permissions: Array<{ moduleId: number; permissions: Record<string, {v,a,e,d}> }> }

  async updatePermissions({ params, request, response, session }: HttpContext) {
    const profile = await OrganizationProfile.query()
      .where('id', params.profileId)
      .where('org_id', params.id)
      .first()

    if (!profile) {
      session.flash('flashToasts', JSON.stringify(['Profile not found.']))
      return response.redirect().back()
    }

    const { permissions } = request.only(['permissions'])
    const perms: Array<{ moduleId: number; permissions: Record<string, { v: 0|1; a: 0|1; e: 0|1; d: 0|1 }> }> =
      Array.isArray(permissions) ? permissions : []

    const moduleIds = perms.map((p) => Number(p.moduleId))

    // Remove permission rows for modules no longer in the submitted list
    await OrganizationProfilePermission.query()
      .where('profile_id', profile.id)
      .whereNotIn('module_id', moduleIds.length > 0 ? moduleIds : [-1])
      .delete()

    // Upsert each module: INSERT or update only if permissions JSON actually changed.
    // MySQL's ON UPDATE CURRENT_TIMESTAMP fires only when a column value really changes,
    // so unchanged modules keep their original updated_at.
    for (const p of perms) {
      await db.rawQuery(
        `INSERT INTO organization_profile_permissions
           (org_id, profile_id, module_id, permissions, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           permissions = VALUES(permissions)`,
        [profile.orgId, profile.id, Number(p.moduleId), JSON.stringify(p.permissions)]
      )
    }

    session.flash('success', 'Permissions updated.')
    return response.redirect().back()
  }
}
