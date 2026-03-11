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

    hrmsOrg.merge({
      name: data.name,
      about: data.about,
      industry: data.industry,
      companySize: data.companySize,
      website: data.website,
      gstNo: data.gstNo,
      phone: data.phone,
      email: data.email,
      country: data.country,
      city: data.city,
      address: data.address,
      currency: data.currency,
      timezone: data.timezone,
      dateFormat: data.dateFormat,
      timeFormat: data.timeFormat,
      fiscalName: data.fiscalName,
      fiscalStart: data.fiscalStart,
      fiscalEnd: data.fiscalEnd,
    })
    await hrmsOrg.save()

    session.flash('success', 'Company details updated successfully.')
    return response.redirect('/hrms/organization/company')
  }
}
