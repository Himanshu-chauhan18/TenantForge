import type { HttpContext } from '@adonisjs/core/http'
import { companyUpdateValidator } from '#hrms/validators/settings_validator'

export default class HrmsCompanyController {
  async show({ inertia, hrmsOrg }: HttpContext) {
    return inertia.render('hrms/organization/company', {
      company: hrmsOrg.serialize(),
    })
  }

  async update({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(companyUpdateValidator)

    // Only merge fields that were actually submitted — undefined values would
    // overwrite existing DB data with NULL when Lucid serialises them.
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    )
    hrmsOrg.merge(payload)
    await hrmsOrg.save()

    session.flash('success', 'Company details updated successfully.')
    return response.redirect('/hrms/organization/company')
  }
}
