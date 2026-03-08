import Organization from '#models/organization'
import Module from '#models/module'
import OrganizationModule from '#models/organization_module'
import FiscalYear from '#models/fiscal_year'
import db from '@adonisjs/lucid/services/db'

// Numeric mappings for tinyint columns — used in raw query builder calls
// (Lucid model prepare/consume only applies to INSERT/UPDATE via model, not raw QB WHERE/UPDATE)
const S = { inactive: 0, active: 1, expired: 2 } as const
const P = { trial: 0, premium: 1 } as const

export interface OrgFilters {
  search?: string
  tab?: 'all' | 'paid' | 'trial' | 'unsubscribed' | 'archived' | 'expired' | 'near_expiry'
  planType?: 'trial' | 'premium'
  status?: 'active' | 'inactive' | 'expired'
  leadOwnerId?: number
  country?: string
  city?: string
  createdFrom?: string
  createdTo?: string
  page?: number
  perPage?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export interface OrgCreateData {
  // Step 1
  name: string
  companySize?: string
  industry?: string
  website?: string
  about?: string
  logo?: string
  gstNo?: string
  parentOrgId?: number
  fiscalName?: string
  fiscalStart?: string
  fiscalEnd?: string
  country?: string
  city?: string
  phone?: string
  email?: string
  address?: string
  leadOwnerId?: number
  currency?: string
  timezone?: string
  dateFormat?: string
  timeFormat?: string
  planType: 'trial' | 'premium'
  userLimit: number
  planStart?: string
  planEnd?: string
  status?: 'active' | 'inactive' | 'expired'
  // Step 2 - modules/addons
  modules?: { moduleId: number; addonIds: number[] }[]
}

export default class OrganizationRepository {
  async paginate(filters: OrgFilters) {
    const {
      search,
      tab = 'all',
      status,
      leadOwnerId,
      country,
      city,
      createdFrom,
      createdTo,
      page = 1,
      perPage = 10,
      sortBy = 'created_at',
      sortDir = 'desc',
    } = filters

    const today = new Date().toISOString().split('T')[0]
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const query = Organization.query()
      .select('organizations.*')
      .select(db.raw('(SELECT COUNT(*) FROM organization_users WHERE org_id = organizations.id) as user_count'))
      .preload('leadOwner')
      .whereNull('deleted_at')

    if (tab === 'paid') {
      query.where('plan_type', P.premium).where('is_archived', false)
    } else if (tab === 'trial') {
      query.where('plan_type', P.trial).where('is_archived', false)
    } else if (tab === 'unsubscribed') {
      query.where('status', S.inactive).where('is_archived', false)
    } else if (tab === 'archived') {
      query.where('is_archived', true)
    } else if (tab === 'expired') {
      // Show orgs whose plan has expired (date in past or today) OR whose status is explicitly set to expired
      query.where((q) => {
        q.where('plan_end', '<=', today).orWhere('status', S.expired)
      }).where('is_archived', false)
    } else if (tab === 'near_expiry') {
      query.where('plan_end', '>', today).where('plan_end', '<=', sevenDaysLater).where('status', '!=', S.expired).where('is_archived', false)
    } else {
      query.where('is_archived', false)
    }

    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`).orWhereILike('org_id', `%${search}%`)
      })
    }

    if (status) {
      query.where('status', S[status] ?? S.active)
    }

    if (leadOwnerId) {
      query.where('lead_owner_id', leadOwnerId)
    }

    if (country) {
      query.whereILike('country', `%${country}%`)
    }

    if (city) {
      query.whereILike('city', `%${city}%`)
    }

    if (createdFrom) {
      query.where('created_at', '>=', createdFrom)
    }

    if (createdTo) {
      query.where('created_at', '<=', createdTo + ' 23:59:59')
    }

    query.orderBy(sortBy, sortDir)
    return query.paginate(page, perPage)
  }

  async findById(id: number): Promise<Organization | null> {
    return Organization.query()
      .where('id', id)
      .preload('leadOwner')
      .preload('modules', (q) => q.preload('module', (mq) => mq.preload('addons')))
      .preload('orgUsers')
      .preload('userProfiles', (q) => q.preload('permissions'))
      .preload('fiscalYears')
      .first()
  }

  async findByOrgId(orgId: string): Promise<Organization | null> {
    return Organization.query().where('org_id', orgId).preload('leadOwner').first()
  }

  async generateOrgId(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let id: string
    let exists: boolean
    do {
      id = 'ORG-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const found = await Organization.findBy('org_id', id)
      exists = !!found
    } while (exists)
    return id
  }

  async emailExists(email: string): Promise<boolean> {
    const found = await Organization.query().whereNull('deleted_at').where('email', email).first()
    return !!found
  }

  async phoneExists(phone: string): Promise<boolean> {
    const found = await Organization.query().whereNull('deleted_at').where('phone', phone).first()
    return !!found
  }

  async emailExistsExcluding(email: string, excludeId: number): Promise<boolean> {
    const found = await Organization.query().whereNull('deleted_at').where('email', email).whereNot('id', excludeId).first()
    return !!found
  }

  async phoneExistsExcluding(phone: string, excludeId: number): Promise<boolean> {
    const found = await Organization.query().whereNull('deleted_at').where('phone', phone).whereNot('id', excludeId).first()
    return !!found
  }

  async create(data: OrgCreateData): Promise<Organization> {
    const orgId = await this.generateOrgId()
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Normalize enum values to match DB column definitions exactly
    // DB time_format enum: ('12', '24') — strip trailing 'h' if present
    const timeFormat = (data.timeFormat ?? '12h').startsWith('24') ? '24' : '12'
    // DB date_format enum: all lowercase — frontend sends uppercase like 'DD/MM/YYYY'
    const dateFormat = (data.dateFormat ?? 'dd/mm/yyyy').toLowerCase()

    return db.transaction(async (trx) => {
      const org = await Organization.create({
        orgId,
        slug: `${slug}-${orgId.toLowerCase()}`,
        name: data.name,
        companySize: data.companySize,
        industry: data.industry,
        website: data.website,
        about: data.about,
        logo: data.logo,
        gstNo: data.gstNo,
        parentOrgId: data.parentOrgId,
        fiscalName: data.fiscalName,
        fiscalStart: data.fiscalStart,
        fiscalEnd: data.fiscalEnd,
        country: data.country,
        city: data.city,
        phone: data.phone,
        email: data.email,
        address: data.address,
        leadOwnerId: data.leadOwnerId,
        currency: data.currency || 'INR',
        timezone: data.timezone || 'Asia/Kolkata',
        dateFormat,
        timeFormat,
        planType: data.planType,
        userLimit: data.userLimit,
        planStart: data.planStart,
        planEnd: data.planEnd,
        status: 'active',
      }, { client: trx })

      // Insert fiscal year record
      if (data.fiscalName && data.fiscalStart && data.fiscalEnd) {
        await FiscalYear.create({
          orgId: org.id,
          name: data.fiscalName,
          startDate: data.fiscalStart,
          endDate: data.fiscalEnd,
          isActive: true,
        }, { client: trx })
      }

      // Build module list — always guarantee mandatory modules are present
      const mandatoryModules = await Module.query().where('is_mandatory', true).select('id').useTransaction(trx)
      const mandatoryIds = mandatoryModules.map((m) => m.id)
      const incoming = data.modules && data.modules.length > 0 ? [...data.modules] : []
      const incomingModuleIds = new Set(incoming.map((m) => m.moduleId))
      for (const id of mandatoryIds) {
        if (!incomingModuleIds.has(id)) incoming.push({ moduleId: id, addonIds: [] })
      }

      for (const mod of incoming) {
        await OrganizationModule.create(
          {
            orgId: org.id,
            moduleId: mod.moduleId,
            enabled: true,
            addonIds: mod.addonIds.map((id) => ({ id, enabled: true })),
          },
          { client: trx }
        )
      }

      return org
    })
  }

  async update(id: number, data: Partial<OrgCreateData>): Promise<Organization> {
    const org = await Organization.findOrFail(id)
    // Normalize formats the same way as create
    const normalized: Partial<OrgCreateData> = { ...data }
    if (normalized.dateFormat) normalized.dateFormat = normalized.dateFormat.toLowerCase()
    if (normalized.timeFormat) normalized.timeFormat = normalized.timeFormat.startsWith('24') ? '24' : '12'
    await org.merge(normalized).save()
    return org
  }

  async softDelete(id: number): Promise<void> {
    await Organization.query().where('id', id).update({ deleted_at: new Date() })
  }

  async restore(id: number): Promise<void> {
    await Organization.query().where('id', id).update({ deleted_at: null })
  }

  async bulkOperation(
    ids: number[],
    operation: string,
    payload?: Record<string, unknown>
  ): Promise<void> {
    switch (operation) {
      case 'activate':
        await Organization.query().whereIn('id', ids).update({ status: S.active })
        break
      case 'deactivate':
        await Organization.query().whereIn('id', ids).update({ status: S.inactive })
        break
      case 'archive':
        await Organization.query().whereIn('id', ids).update({ is_archived: true })
        break
      case 'unarchive':
        await Organization.query().whereIn('id', ids).update({ is_archived: false })
        break
      case 'delete':
        await Organization.query().whereIn('id', ids).update({ deleted_at: new Date() })
        break
      case 'extend_plan':
        if (payload?.planEnd) {
          await Organization.query()
            .whereIn('id', ids)
            .update({ plan_end: payload.planEnd as string })
        }
        break
      case 'extend_user_limit':
        if (payload?.userLimit) {
          await Organization.query()
            .whereIn('id', ids)
            .update({ user_limit: payload.userLimit as number })
        }
        break
      case 'assign_lead':
        if (payload?.leadOwnerId) {
          await Organization.query()
            .whereIn('id', ids)
            .update({ lead_owner_id: payload.leadOwnerId as number })
        }
        break
    }
  }

  async updateModules(
    orgId: number,
    modules: { moduleId: number; enabled: boolean; addonIds: number[] }[]
  ): Promise<void> {
    for (const mod of modules) {
      const existing = await OrganizationModule.query()
        .where('org_id', orgId)
        .where('module_id', mod.moduleId)
        .first()
      const addonIds = mod.addonIds.map((id) => ({ id, enabled: true }))
      if (existing) {
        existing.enabled = mod.enabled
        existing.addonIds = addonIds
        await existing.save()
      } else {
        await OrganizationModule.create({ orgId, moduleId: mod.moduleId, enabled: mod.enabled, addonIds })
      }
    }
  }

  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0]
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const [total, subscribed, unsubscribed, archived, trialActive, trialExpired, premiumActive, premiumExpired, nearExpiry] =
      await Promise.all([
        Organization.query().whereNull('deleted_at').count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('status', S.active).where('is_archived', false).count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('status', S.inactive).count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('is_archived', true).count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('plan_type', P.trial).where('status', S.active).count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('plan_type', P.trial).where((q) => q.where('plan_end', '<=', today).orWhere('status', S.expired)).count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('plan_type', P.premium).where('status', S.active).count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('plan_type', P.premium).where((q) => q.where('plan_end', '<=', today).orWhere('status', S.expired)).count('* as count').first(),
        Organization.query().whereNull('deleted_at').where('plan_end', '>', today).where('plan_end', '<=', sevenDaysLater).where('status', '!=', S.expired).count('* as count').first(),
      ])

    const totalUsers = await db.from('organization_users').count('* as count').first()

    const monthlyData = await db
      .from('organizations')
      .select(db.raw('DATE_FORMAT(created_at, "%Y-%m") as month'))
      .count('* as count')
      .whereNull('deleted_at')
      .whereRaw('created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)')
      .groupByRaw('DATE_FORMAT(created_at, "%Y-%m")')
      .orderBy('month', 'asc')

    const recentOrgs = await Organization.query()
      .whereNull('deleted_at')
      .preload('leadOwner')
      .orderBy('created_at', 'desc')
      .limit(10)

    return {
      total: Number((total as any)?.$extras?.count || 0),
      subscribed: Number((subscribed as any)?.$extras?.count || 0),
      unsubscribed: Number((unsubscribed as any)?.$extras?.count || 0),
      archived: Number((archived as any)?.$extras?.count || 0),
      trialActive: Number((trialActive as any)?.$extras?.count || 0),
      trialExpired: Number((trialExpired as any)?.$extras?.count || 0),
      premiumActive: Number((premiumActive as any)?.$extras?.count || 0),
      premiumExpired: Number((premiumExpired as any)?.$extras?.count || 0),
      nearExpiry: Number((nearExpiry as any)?.$extras?.count || 0),
      totalUsers: Number((totalUsers as any)?.count || 0),
      monthlyData,
      recentOrgs: recentOrgs.map((o) => o.serialize()),
    }
  }
}
