import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class LocationController {
  async countries({ request, response }: HttpContext) {
    const search = (request.input('search', '') as string).trim()

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

  async cities({ request, response }: HttpContext) {
    const search = (request.input('search', '') as string).trim()
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
