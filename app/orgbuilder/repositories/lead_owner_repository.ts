import LeadOwner from '#models/lead_owner'

// Numeric mappings for tinyint status column
const S = { inactive: 0, active: 1 } as const

export interface LeadOwnerFilters {
  search?: string
  status?: 'active' | 'inactive'
  page?: number
  perPage?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export interface LeadOwnerData {
  name: string
  email: string
  phone?: string | null
  designation?: string | null
  status?: 'active' | 'inactive'
}

export default class LeadOwnerRepository {
  async paginate(filters: LeadOwnerFilters) {
    const {
      search,
      status,
      page = 1,
      perPage = 10,
      sortBy = 'created_at',
      sortDir = 'desc',
    } = filters

    const query = LeadOwner.query()

    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('designation', `%${search}%`)
      })
    }

    if (status) {
      query.where('status', S[status])
    }

    query.orderBy(sortBy, sortDir)
    return query.paginate(page, perPage)
  }

  async list(): Promise<LeadOwner[]> {
    return LeadOwner.query().where('status', S.active).orderBy('name', 'asc').limit(1000)
  }

  async findById(id: number): Promise<LeadOwner | null> {
    return LeadOwner.find(id)
  }

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const q = LeadOwner.query().where('email', email)
    if (excludeId) q.whereNot('id', excludeId)
    const found = await q.first()
    return !!found
  }

  async create(data: LeadOwnerData): Promise<LeadOwner> {
    return LeadOwner.create({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      designation: data.designation ?? null,
      status: data.status ?? 'active',
    })
  }

  async update(id: number, data: Partial<LeadOwnerData>): Promise<LeadOwner> {
    const owner = await LeadOwner.findOrFail(id)
    await owner.merge(data).save()
    return owner
  }

  async delete(id: number): Promise<void> {
    await LeadOwner.query().where('id', id).delete()
  }
}
