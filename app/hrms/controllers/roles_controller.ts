import type { HttpContext } from '@adonisjs/core/http'
import OrganizationProfile from '#models/organization_profile'
import OrganizationProfilePermission from '#models/organization_profile_permission'

export default class HrmsRolesController {
  async index({ inertia, hrmsOrg }: HttpContext) {
    const profiles = await OrganizationProfile.query()
      .where('org_id', hrmsOrg.id)
      .preload('permissions', (q) => q.preload('module'))
      .orderBy('id')

    return inertia.render('hrms/organization/roles', {
      profiles: profiles.map((p) => p.serialize()),
    })
  }
}
