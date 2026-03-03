import type { HttpContext } from '@adonisjs/core/http'
import DashboardService from '#services/dashboard_service'

const dashboardService = new DashboardService()

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    const stats = await dashboardService.getStats()
    return inertia.render('dashboard/index', { stats })
  }
}
