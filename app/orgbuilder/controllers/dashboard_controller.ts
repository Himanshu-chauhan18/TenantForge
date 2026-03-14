import type { HttpContext } from '@adonisjs/core/http'
import DashboardService from '#orgbuilder/services/dashboard_service'

const dashboardService = new DashboardService()

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    const stats = await dashboardService.getStats()
    // @ts-ignore - inertia page type inference issue with this page
    return inertia.render('orgbuilder/dashboard/index', { stats })
  }
}
