import type { HttpContext } from '@adonisjs/core/http'

export default class HrmsSelfServiceController {
  async index({ inertia }: HttpContext) {
    return inertia.render('hrms/self-service/index')
  }
}
