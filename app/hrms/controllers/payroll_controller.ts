import type { HttpContext } from '@adonisjs/core/http'

export default class HrmsPayrollController {
  async index({ inertia }: HttpContext) {
    return inertia.render('hrms/payroll/index')
  }
}
