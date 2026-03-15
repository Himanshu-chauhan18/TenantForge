import { useState, useEffect } from 'react'
import { SelectSearch } from '~/components/select-search'

interface CurrencyInfo {
  currency: string | null
  currencyName: string | null
  currencySymbol: string | null
}

/**
 * Currency selector that scopes options to the selected country.
 * - When `country` with a currency is provided → shows only that country's currency.
 * - When no country is provided → fetches and shows all currencies.
 */
export function SelectCurrency({
  value,
  onChange,
  country,
  placeholder = 'Select currency…',
}: {
  value: string
  onChange: (v: string) => void
  country?: CurrencyInfo | null
  placeholder?: string
}) {
  const [allOptions, setAllOptions] = useState<{ value: string; label: string; sub: string }[]>([])

  // Only fetch all currencies when no country is selected
  useEffect(() => {
    if (country?.currency) return
    fetch('/api/currencies')
      .then((r) => r.ok ? r.json() : [])
      .then((data: { code: string; name: string; symbol: string }[]) =>
        setAllOptions(data.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}`, sub: c.symbol })))
      )
      .catch(() => {})
  }, [country?.currency])

  if (country?.currency) {
    const options = [{
      value:  country.currency,
      label:  `${country.currency}${country.currencyName ? ` — ${country.currencyName}` : ''}`,
      sub:    country.currencySymbol || '',
    }]
    return <SelectSearch value={value} onChange={onChange} options={options} placeholder={placeholder} />
  }

  return (
    <SelectSearch
      value={value}
      onChange={onChange}
      options={allOptions.length > 0 ? allOptions : (value ? [{ value, label: value, sub: '' }] : [])}
      placeholder={placeholder}
    />
  )
}
