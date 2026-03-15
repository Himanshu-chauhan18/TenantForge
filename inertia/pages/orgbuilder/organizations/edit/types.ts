// ─── Shared interfaces for the Organization Edit page ────────────────────────

export interface OrgModule {
  id: number
  moduleId: number
  enabled: boolean
  addonIds: Array<{ id: number; enabled: boolean }>
  module: {
    id: number
    key: string
    label: string
    description: string | null
    sortOrder: number
    addons: Array<{ id: number; name: string; type: string }>
  }
}

export interface OrgProfilePermission {
  id: number
  orgId: number
  profileId: number
  moduleId: number
  /** Keys: "module" for module-level, or addon_id (string) for addon-level. Values: {v,a,e,d} (0|1). */
  permissions: Record<string, { v: number; a: number; e: number; d: number }>
}

export interface OrgProfile {
  id: number
  orgId: number
  name: string
  description: string | null
  dataAccess: 'all' | 'organization' | 'self' | 'custom'
  permissions: OrgProfilePermission[]
  createdAt: string
}

export interface OrgUser {
  id: number
  profileId: number | null
  profile: OrgProfile | null
  employeeCode: string | null
  fullName: string
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  companyEmail: string
  isActive: boolean
  createdAt: string
}

export interface FiscalYear {
  id: number
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface LeadOwner {
  id: number
  name: string
  email: string
  designation?: string | null
}

export interface Org {
  id: number
  orgId: string
  name: string
  slug: string | null
  logo: string | null
  companySize: string | null
  industry: string | null
  website: string | null
  about: string | null
  gstNo: string | null
  parentOrgId: number | null
  fiscalName: string | null
  fiscalStart: string | null
  fiscalEnd: string | null
  country: string | null
  city: string | null
  phone: string | null
  email: string | null
  address: string | null
  leadOwnerId: number | null
  currency: string
  timezone: string
  dateFormat: string
  timeFormat: string
  planType: 'trial' | 'premium'
  userLimit: number
  planStart: string | null
  planEnd: string | null
  status: 'active' | 'inactive' | 'expired'
  isArchived: boolean
  createdAt: string
  updatedAt: string
  leadOwner: LeadOwner | null
  modules: OrgModule[]
  orgUsers: OrgUser[]
  profiles: OrgProfile[]
  fiscalYears: FiscalYear[]
}

export interface LeadOwnerOption {
  id: number
  name: string
  email: string
  designation?: string | null
}

export type BillingRecord = { id: number; period: string; amount: string; status: string }
