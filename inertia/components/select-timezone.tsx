import { useState, useEffect } from 'react'
import { SelectSearch } from '~/components/select-search'

interface CountryInfo {
  id: number
  timezone: string
}

/**
 * Timezone selector scoped to the selected country.
 * - When `country` is provided → fetches only that country's timezones via ?country_id=.
 * - When no country → fetches all timezones.
 */
export function SelectTimezone({
  value,
  onChange,
  country,
  placeholder = 'Select timezone…',
}: {
  value: string
  onChange: (v: string) => void
  country?: CountryInfo | null
  placeholder?: string
}) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const url = country?.id
      ? `/api/timezones?country_id=${country.id}`
      : '/api/timezones'
    fetch(url)
      .then((r) => r.ok ? r.json() : [])
      .then((data: { value: string; label: string }[]) => setOptions(data))
      .catch(() => {})
  }, [country?.id])

  return (
    <SelectSearch
      value={value}
      onChange={onChange}
      options={options.length > 0 ? options : (value ? [{ value, label: value }] : [])}
      placeholder={placeholder}
    />
  )
}
