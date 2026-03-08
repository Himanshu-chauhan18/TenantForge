import LeadOwnerRepository, { type LeadOwnerFilters, type LeadOwnerData } from '#repositories/lead_owner_repository'
import type LeadOwner from '#models/lead_owner'

const repo = new LeadOwnerRepository()

export default class LeadOwnerService {
  async list(filters: LeadOwnerFilters) {
    return repo.paginate(filters)
  }

  async listAll() {
    return repo.list()
  }

  async getById(id: number) {
    return repo.findById(id)
  }

  async create(data: LeadOwnerData): Promise<LeadOwner> {
    const exists = await repo.emailExists(data.email)
    if (exists) throw new Error('DUPLICATE_EMAIL')
    return repo.create(data)
  }

  async update(id: number, data: Partial<LeadOwnerData>): Promise<LeadOwner> {
    if (data.email) {
      const exists = await repo.emailExists(data.email, id)
      if (exists) throw new Error('DUPLICATE_EMAIL')
    }
    return repo.update(id, data)
  }

  async delete(id: number): Promise<void> {
    return repo.delete(id)
  }
}
