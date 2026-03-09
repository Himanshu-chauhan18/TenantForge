import type { HttpContext } from '@adonisjs/core/http'
import LeadOwnerService from '#orgbuilder/services/lead_owner_service'
import { leadOwnerValidator } from '#orgbuilder/validators/lead_owner_validator'
import Organization from '#models/organization'

const svc = new LeadOwnerService()

export default class LeadOwnerController {
  async index({ request, inertia }: HttpContext) {
    const qs = request.qs()
    const owners = await svc.list({
      search: qs.search,
      status: qs.status,
      page: qs.page ? Number(qs.page) : 1,
      perPage: qs.per_page ? Math.min(Number(qs.per_page), 500) : 10,
      sortBy: qs.sort_by || 'created_at',
      sortDir: qs.sort_dir || 'desc',
    })

    const serialized = owners.serialize()
    const meta = {
      total: owners.total,
      perPage: owners.perPage,
      currentPage: owners.currentPage,
      lastPage: owners.lastPage,
    }

    // Assignments: organizations grouped by lead owner
    const assignedOrgs = await Organization.query()
      .whereNull('deleted_at')
      .whereNotNull('lead_owner_id')
      .select('id', 'name', 'org_id', 'lead_owner_id', 'status', 'plan_type', 'created_at')
      .orderBy('name', 'asc')

    return inertia.render('orgbuilder/leads/index', {
      owners: { data: serialized.data, meta },
      assignments: assignedOrgs.map((o) => o.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(leadOwnerValidator)
    try {
      await svc.create(data as any)
      session.flash('success', `Lead owner "${data.name}" created successfully!`)
    } catch (error) {
      if (error.message === 'DUPLICATE_EMAIL') {
        session.flash('error', 'A lead owner with this email already exists.')
      } else {
        session.flash('error', 'Failed to create lead owner. Please try again.')
      }
    }
    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const data = await request.validateUsing(leadOwnerValidator)
    try {
      const owner = await svc.update(Number(params.id), data as any)
      session.flash('success', `Lead owner "${owner.name}" updated successfully!`)
    } catch (error) {
      if (error.message === 'DUPLICATE_EMAIL') {
        session.flash('error', 'A lead owner with this email already exists.')
      } else {
        session.flash('error', 'Failed to update lead owner. Please try again.')
      }
    }
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    await svc.delete(Number(params.id))
    session.flash('success', 'Lead owner deleted successfully.')
    return response.redirect().back()
  }

  async bulk({ request, response, session }: HttpContext) {
    const { ids: rawIds, operation } = request.only(['ids', 'operation'])
    const ids = Array.isArray(rawIds) ? rawIds.slice(0, 500) : []
    if (!ids.length) {
      session.flash('error', 'No lead owners selected.')
      return response.redirect().back()
    }
    const statusInt = operation === 'activate' ? 1 : 0
    const LeadOwner = (await import('#models/lead_owner')).default
    await LeadOwner.query().whereIn('id', ids as number[]).update({ status: statusInt })
    session.flash('success', `${ids.length} lead owner(s) ${operation === 'activate' ? 'activated' : 'deactivated'}.`)
    return response.redirect().back()
  }

  // API endpoint for dropdown in org forms
  async apiList({ response }: HttpContext) {
    response.header('Cache-Control', 'private, max-age=60')
    const owners = await svc.listAll()
    return response.json(owners.map((o) => ({ id: o.id, name: o.name, email: o.email, designation: o.designation })))
  }
}
