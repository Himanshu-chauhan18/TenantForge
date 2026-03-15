import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Module from '#models/module'

export default class LocationController {
  async modules({ response }: HttpContext) {
    response.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')

    const mods = await Module.query()
      .where('is_active', true)
      .preload('addons', (q) => q.where('is_active', true).orderBy('sort_order', 'asc'))
      .orderBy('sort_order', 'asc')

    return response.json(
      mods.map((m) => ({
        id: m.id,
        key: m.key,
        label: m.label,
        description: m.description,
        isMandatory: m.isMandatory,
        isComingSoon: m.isComingSoon,
        sortOrder: m.sortOrder,
        addons: m.addons.map((a) => ({ id: a.id, name: a.name, type: a.type })),
      }))
    )
  }


  async countries({ request, response }: HttpContext) {
    response.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300')

    const search = (request.input('search', '') as string).trim().slice(0, 100)

    const query = db
      .from('countries')
      .where('flag', 1)
      .select([
        'id',
        'name',
        'iso2',
        'currency',
        'currency_name',
        'currency_symbol',
        'timezones',
        'emoji',
        'phonecode',
      ])
      .orderBy('name', 'asc')
      .limit(60)

    if (search) {
      query.where((q) => {
        q.where('name', 'like', `%${search}%`).orWhere('iso2', 'like', `%${search}%`)
      })
    }

    const rows = await query

    return response.json(
      rows.map((r: any) => {
        let timezone = ''
        try {
          const tzs = JSON.parse(r.timezones || '[]')
          if (Array.isArray(tzs) && tzs.length > 0) {
            timezone = tzs[0].zoneName || ''
          }
        } catch {}

        return {
          id: r.id,
          name: r.name,
          iso2: r.iso2,
          currency: r.currency,
          currencyName: r.currency_name,
          currencySymbol: r.currency_symbol,
          timezone,
          emoji: r.emoji,
          phonecode: r.phonecode,
        }
      })
    )
  }

  async currencies({ response }: HttpContext) {
    response.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300')

    const rows = await db
      .from('countries')
      .whereNotNull('currency')
      .where('flag', 1)
      .select(['currency', 'currency_name', 'currency_symbol'])
      .orderBy('currency', 'asc')

    // Deduplicate by currency code
    const seen = new Set<string>()
    const result: { code: string; name: string; symbol: string }[] = []
    for (const r of rows) {
      if (r.currency && !seen.has(r.currency)) {
        seen.add(r.currency)
        result.push({ code: r.currency, name: r.currency_name || r.currency, symbol: r.currency_symbol || '' })
      }
    }

    return response.json(result)
  }

  async timezones({ request, response }: HttpContext) {
    response.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300')

    const countryId = request.input('country_id')
    const query = db.from('countries').where('flag', 1).whereNotNull('timezones').select(['timezones'])
    if (countryId) query.where('id', Number(countryId))

    const rows = await query

    const seen = new Set<string>()
    const result: { value: string; label: string }[] = []

    for (const r of rows) {
      try {
        const tzs = JSON.parse(r.timezones || '[]')
        if (!Array.isArray(tzs)) continue
        for (const tz of tzs) {
          if (!tz.zoneName || seen.has(tz.zoneName)) continue
          seen.add(tz.zoneName)
          const offset = tz.gmtOffsetName || tz.gmtOffset || ''
          const abbr = tz.abbreviation || ''
          const label = abbr ? `${tz.zoneName} — ${abbr} (${offset})` : `${tz.zoneName} (${offset})`
          result.push({ value: tz.zoneName, label })
        }
      } catch {}
    }

    result.sort((a, b) => a.value.localeCompare(b.value))

    return response.json(result)
  }

  async cities({ request, response }: HttpContext) {
    response.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300')

    const search = (request.input('search', '') as string).trim().slice(0, 100)
    const countryId = request.input('country_id')

    if (!countryId) return response.json([])

    const query = db
      .from('cities')
      .where('country_id', countryId)
      .where('flag', 1)
      .select(['id', 'name', 'country_id', 'country_code'])
      .orderBy('name', 'asc')
      .limit(100)

    if (search) {
      query.where('name', 'like', `%${search}%`)
    }

    const rows = await query

    return response.json(
      rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        countryId: r.country_id,
        countryCode: r.country_code,
      }))
    )
  }
}
