import type { HttpContext } from '@adonisjs/core/http'

export default class HrmsLeaveController {
  async index({ inertia }: HttpContext) {
    return inertia.render('hrms/leave/index')
  }
}
