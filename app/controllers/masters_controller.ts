import type { HttpContext } from '@adonisjs/core/http'
import Module from '#models/module'
import ModuleAddon from '#models/module_addon'

export default class MastersController {
  // ── GET /masters ────────────────────────────────────────────────────────────

  async index({ request, inertia }: HttpContext) {
    const modules = await Module.query().preload('addons').orderBy('sort_order', 'asc')
    return inertia.render('masters/index', {
      modules: modules.map((m) => m.serialize()),
    })
  }

  // ── POST /masters/modules ───────────────────────────────────────────────────

  async storeModule({ request, response, session }: HttpContext) {
    const { label, key, description, isMandatory, isActive, isComingSoon, sortOrder } =
      request.only(['label', 'key', 'description', 'isMandatory', 'isActive', 'isComingSoon', 'sortOrder'])

    if (!label?.trim() || !key?.trim()) {
      session.flash('error', 'Module label and key are required.')
      return response.redirect().back()
    }

    const cleanKey = String(key).trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const exists = await Module.findBy('key', cleanKey)
    if (exists) {
      session.flash('error', `A module with key "${cleanKey}" already exists.`)
      return response.redirect().back()
    }

    await Module.create({
      key: cleanKey,
      label: String(label).trim(),
      description: description ? String(description).trim() : null,
      isMandatory: isMandatory === true || isMandatory === 'true' || isMandatory === '1',
      isActive: isActive === undefined || isActive === null ? true : (isActive === true || isActive === 'true' || isActive === '1'),
      isComingSoon: isComingSoon === true || isComingSoon === 'true' || isComingSoon === '1',
      sortOrder: sortOrder ? Number(sortOrder) : 999,
    })

    session.flash('success', `Module "${label.trim()}" created.`)
    return response.redirect().back()
  }

  // ── PUT /masters/modules/:id ────────────────────────────────────────────────

  async updateModule({ params, request, response, session }: HttpContext) {
    const mod = await Module.find(Number(params.id))
    if (!mod) {
      session.flash('error', 'Module not found.')
      return response.redirect().back()
    }

    const { label, description, isMandatory, isActive, isComingSoon, sortOrder } =
      request.only(['label', 'description', 'isMandatory', 'isActive', 'isComingSoon', 'sortOrder'])

    if (label !== undefined) mod.label = String(label).trim()
    if (description !== undefined) mod.description = description ? String(description).trim() : null
    if (isMandatory !== undefined) mod.isMandatory = isMandatory === true || isMandatory === 'true' || isMandatory === '1'
    if (isActive !== undefined) mod.isActive = isActive === true || isActive === 'true' || isActive === '1'
    if (isComingSoon !== undefined) mod.isComingSoon = isComingSoon === true || isComingSoon === 'true' || isComingSoon === '1'
    if (sortOrder !== undefined) mod.sortOrder = Number(sortOrder)

    await mod.save()
    session.flash('success', `Module "${mod.label}" updated.`)
    return response.redirect().back()
  }

  // ── POST /masters/addons ────────────────────────────────────────────────────

  async storeAddon({ request, response, session }: HttpContext) {
    const { name, moduleId, type, sortOrder } =
      request.only(['name', 'moduleId', 'type', 'sortOrder'])

    if (!name?.trim() || !moduleId) {
      session.flash('error', 'Addon name and module are required.')
      return response.redirect().back()
    }

    const mod = await Module.find(Number(moduleId))
    if (!mod) {
      session.flash('error', 'Module not found.')
      return response.redirect().back()
    }

    const validType = ['default', 'custom', 'advance'].includes(type) ? type : 'default'

    await ModuleAddon.create({
      moduleId: Number(moduleId),
      name: String(name).trim(),
      type: validType as 'default' | 'custom' | 'advance',
      sortOrder: sortOrder ? Number(sortOrder) : 999,
      isActive: true,
    })

    session.flash('success', `Addon "${name.trim()}" created in "${mod.label}".`)
    return response.redirect().back()
  }

  // ── PUT /masters/addons/:id ─────────────────────────────────────────────────

  async updateAddon({ params, request, response, session }: HttpContext) {
    const addon = await ModuleAddon.find(Number(params.id))
    if (!addon) {
      session.flash('error', 'Addon not found.')
      return response.redirect().back()
    }

    const { name, type, sortOrder, isActive } =
      request.only(['name', 'type', 'sortOrder', 'isActive'])

    if (name !== undefined) addon.name = String(name).trim()
    if (type !== undefined && ['default', 'custom', 'advance'].includes(type)) {
      addon.type = type as 'default' | 'custom' | 'advance'
    }
    if (sortOrder !== undefined) addon.sortOrder = Number(sortOrder)
    if (isActive !== undefined) addon.isActive = isActive === true || isActive === 'true' || isActive === '1'

    await addon.save()
    session.flash('success', `Addon "${addon.name}" updated.`)
    return response.redirect().back()
  }

  // ── DELETE /masters/modules/:id ─────────────────────────────────────────────

  async destroyModule({ params, response, session }: HttpContext) {
    const mod = await Module.find(Number(params.id))
    if (!mod) {
      session.flash('error', 'Module not found.')
      return response.redirect().back()
    }
    await ModuleAddon.query().where('module_id', mod.id).delete()
    await mod.delete()
    session.flash('success', `Module "${mod.label}" and its add-ons deleted.`)
    return response.redirect().back()
  }

  // ── DELETE /masters/addons/:id ──────────────────────────────────────────────

  async destroyAddon({ params, response, session }: HttpContext) {
    const addon = await ModuleAddon.find(Number(params.id))
    if (!addon) {
      session.flash('error', 'Add-on not found.')
      return response.redirect().back()
    }
    const name = addon.name
    await addon.delete()
    session.flash('success', `Add-on "${name}" deleted.`)
    return response.redirect().back()
  }
}
