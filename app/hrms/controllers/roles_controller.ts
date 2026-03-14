import type { HttpContext } from '@adonisjs/core/http'
import OrganizationProfile from '#models/organization_profile'
import Module from '#models/module'

export default class HrmsRolesController {
  async index({ inertia, hrmsOrg }: HttpContext) {
    const [profiles, modules] = await Promise.all([
      OrganizationProfile.query()
        .where('org_id', hrmsOrg.id)
        .preload('permissions')
        .orderBy('id'),
      Module.query().where('is_active', true).orderBy('sort_order'),
    ])

    // Build moduleId → module label map
    const moduleLabels: Record<number, string> = {}
    for (const m of modules) moduleLabels[m.id] = m.label

    const serialized = profiles.map((p) => {
      const base = p.serialize()
      return {
        ...base,
        // Flatten each permission row to { module, view, add, edit, delete }
        // using the top-level "module" key in the permissions JSON.
        permissions: p.permissions.map((perm) => {
          const label = moduleLabels[perm.moduleId] ?? `Module ${perm.moduleId}`
          const mp = perm.permissions['module']
          return {
            module: label,
            view:   Boolean(mp?.v),
            add:    Boolean(mp?.a),
            edit:   Boolean(mp?.e),
            delete: Boolean(mp?.d),
          }
        }),
      }
    })

    return inertia.render('hrms/organization/roles', {
      profiles: serialized,
    })
  }
}
