import DashboardRepository from '#repositories/dashboard_repository'

export default class DashboardService {
  private repo = new DashboardRepository()

  async getStats() {
    return this.repo.getStats()
  }
}
