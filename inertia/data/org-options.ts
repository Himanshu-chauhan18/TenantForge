// ─── Static data for organization create/edit forms ───────────────────────────
// Modules are NOT here — they are fetched from /api/modules (sourced from the modules DB table).
// Currencies and timezones are NOT here — they are fetched from /api/currencies
// and /api/timezones (sourced from the countries DB table).

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance & Banking',
  'Education',
  'Manufacturing',
  'Retail & E-commerce',
  'Real Estate',
  'Hospitality',
  'Logistics & Transport',
  'Media & Entertainment',
  'Legal',
  'Non-profit',
  'Government',
  'Other',
]

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', example: '31/12/2025' },
  { value: 'MM/DD/YYYY', example: '12/31/2025' },
  { value: 'YYYY/MM/DD', example: '2025/12/31' },
  { value: 'DD-MM-YYYY', example: '31-12-2025' },
  { value: 'MM-DD-YYYY', example: '12-31-2025' },
  { value: 'YYYY-MM-DD', example: '2025-12-31' },
]
