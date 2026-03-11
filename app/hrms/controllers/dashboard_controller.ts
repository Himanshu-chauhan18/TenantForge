import type { HttpContext } from '@adonisjs/core/http'
import OrganizationUser from '#models/organization_user'
import HrmsDivision from '#models/hrms_division'
import HrmsDepartment from '#models/hrms_department'
import HrmsDesignation from '#models/hrms_designation'

export default class HrmsDashboardController {
  async index({ inertia, hrmsOrg }: HttpContext) {
    const [employeeCount, divisionCount, departmentCount, designationCount] = await Promise.all([
      OrganizationUser.query().where('org_id', hrmsOrg.id).count('id as total').first(),
      HrmsDivision.query().where('org_id', hrmsOrg.id).where('is_active', true).count('id as total').first(),
      HrmsDepartment.query().where('org_id', hrmsOrg.id).where('is_active', true).count('id as total').first(),
      HrmsDesignation.query().where('org_id', hrmsOrg.id).where('is_active', true).count('id as total').first(),
    ])

    return inertia.render('hrms/dashboard/index', {
      stats: {
        employees: Number((employeeCount as any)?.$extras?.total ?? 0),
        divisions: Number((divisionCount as any)?.$extras?.total ?? 0),
        departments: Number((departmentCount as any)?.$extras?.total ?? 0),
        designations: Number((designationCount as any)?.$extras?.total ?? 0),
      },
    })
  }
}
