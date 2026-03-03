import OrganizationRepository from '#repositories/organization_repository'

export default class DashboardRepository {
  private orgRepo = new OrganizationRepository()

  async getStats() {
    return this.orgRepo.getDashboardStats()
  }
}
