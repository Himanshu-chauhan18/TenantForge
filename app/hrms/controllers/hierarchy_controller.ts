import type { HttpContext } from '@adonisjs/core/http'
import HrmsSettingsRepository from '#hrms/repositories/settings_repository'
import { hierarchyNodeValidator } from '#hrms/validators/settings_validator'
import OrganizationUser from '#models/organization_user'

const repo = new HrmsSettingsRepository()

export default class HrmsHierarchyController {
  async index({ inertia, hrmsOrg }: HttpContext) {
    const [nodes, employees] = await Promise.all([
      repo.listHierarchy(hrmsOrg.id),
      OrganizationUser.query().where('org_id', hrmsOrg.id).where('is_active', true).orderBy('full_name'),
    ])

    return inertia.render('hrms/organization/hierarchy', {
      nodes: nodes.map((n) => n.serialize()),
      employees: employees.map((e) => ({ id: e.id, fullName: e.fullName, employeeCode: e.employeeCode })),
    })
  }

  async store({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(hierarchyNodeValidator)
    await repo.createHierarchyNode(hrmsOrg.id, data as any)
    session.flash('success', 'Hierarchy node added.')
    return response.redirect('/hrms/organization/hierarchy')
  }

  async update({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(hierarchyNodeValidator)
    await repo.updateHierarchyNode(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Hierarchy node updated.')
    return response.redirect('/hrms/organization/hierarchy')
  }

  async destroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteHierarchyNode(params.id, hrmsOrg.id)
    session.flash('success', 'Node removed from hierarchy.')
    return response.redirect('/hrms/organization/hierarchy')
  }
}
