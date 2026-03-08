import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import Organization from '#models/organization'
import OrganizationProfile from '#models/organization_profile'
import OrganizationProfilePermission from '#models/organization_profile_permission'
import type { PermissionsJson } from '#models/organization_profile_permission'

// ── Permission helpers ────────────────────────────────────────────────────────
type Perm = { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean }

const FULL: Perm     = { canView: true,  canAdd: true,  canEdit: true,  canDelete: true  }
const WRITE: Perm    = { canView: true,  canAdd: true,  canEdit: true,  canDelete: false }
const VIEW: Perm     = { canView: true,  canAdd: false, canEdit: false, canDelete: false }
const NO_ACCESS: Perm = { canView: false, canAdd: false, canEdit: false, canDelete: false }

function toEntry(p: Perm): PermissionsJson[string] {
  return { v: p.canView ? 1 : 0, a: p.canAdd ? 1 : 0, e: p.canEdit ? 1 : 0, d: p.canDelete ? 1 : 0 }
}

// ── Module keys that exist in the system (must match module_seeder keys) ──────
const MODULE_KEYS = ['organization', 'employee', 'attendance', 'leave', 'payroll', 'performance']

// ── Default profile definitions ───────────────────────────────────────────────
interface ProfileDef {
  name: string
  description: string
  dataAccess: 'all' | 'organization' | 'self' | 'custom'
  permissions: Record<string, Perm>   // moduleKey → permission
}

const DEFAULT_PROFILES: ProfileDef[] = [
  {
    name: 'Super Admin',
    description: 'Full access to all modules and settings',
    dataAccess: 'all',
    permissions: {
      organization: FULL,
      employee:     FULL,
      attendance:   FULL,
      leave:        FULL,
      payroll:      FULL,
      performance:  FULL,
    },
  },
  {
    name: 'HR Admin',
    description: 'Manages human resources and employee data',
    dataAccess: 'organization',
    permissions: {
      organization: WRITE,
      employee:     FULL,
      attendance:   WRITE,
      leave:        FULL,
      payroll:      WRITE,
      performance:  VIEW,
    },
  },
  {
    name: 'Manager',
    description: 'Team and project management access',
    dataAccess: 'organization',
    permissions: {
      organization: VIEW,
      employee:     VIEW,
      attendance:   WRITE,
      leave:        WRITE,
      payroll:      NO_ACCESS,
      performance:  WRITE,
    },
  },
  {
    name: 'User',
    description: 'Standard employee access',
    dataAccess: 'self',
    permissions: {
      organization: NO_ACCESS,
      employee:     VIEW,
      attendance:   VIEW,
      leave:        WRITE,
      payroll:      VIEW,
      performance:  VIEW,
    },
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export default class ProfileSeeder extends BaseSeeder {
  async run() {
    // Build moduleKey → moduleId map from DB
    const moduleRows = await db.from('modules').select('id', 'key').whereIn('key', MODULE_KEYS)
    const moduleIdByKey: Record<string, number> = {}
    for (const row of moduleRows) moduleIdByKey[row.key] = row.id

    const orgs = await Organization.query().whereNull('deleted_at').select('id', 'name')

    if (orgs.length === 0) {
      console.log('  No organizations found — skipping profile seed.')
      return
    }

    let created = 0
    let skipped = 0

    for (const org of orgs) {
      const existingCount = await OrganizationProfile.query()
        .where('org_id', org.id)
        .count('* as total')
      const total = Number(existingCount[0]?.$extras?.total ?? 0)

      if (total > 0) {
        // Profiles exist — seed permissions only if the permissions table is empty for them
        const profiles = await OrganizationProfile.query().where('org_id', org.id).select('id', 'name')
        let permSeeded = 0
        for (const profile of profiles) {
          const permCount = await OrganizationProfilePermission.query()
            .where('profile_id', profile.id).count('* as total')
          const hasPerms = Number(permCount[0]?.$extras?.total ?? 0) > 0
          if (hasPerms) continue

          // Find matching default definition by profile name (case-insensitive)
          const def = DEFAULT_PROFILES.find((d) => d.name.toLowerCase() === profile.name.toLowerCase())
          const permDef = def ?? DEFAULT_PROFILES[3] // fallback to "User" perms

          const perms = MODULE_KEYS
            .filter((key) => moduleIdByKey[key] !== undefined)
            .map((key) => ({
              orgId:     org.id,
              profileId: profile.id,
              moduleId:  moduleIdByKey[key],
              permissions: { module: toEntry(permDef.permissions[key] ?? NO_ACCESS) } as PermissionsJson,
            }))
          await OrganizationProfilePermission.createMany(perms)
          permSeeded++
        }

        if (permSeeded > 0) {
          console.log(`✓ Re-seeded permissions for ${permSeeded} profile(s) in org #${org.id} (${org.name})`)
        } else {
          console.log(`  Skipped org #${org.id} (${org.name}) — already has profiles and permissions`)
        }
        skipped++
        continue
      }

      for (const def of DEFAULT_PROFILES) {
        const profile = await OrganizationProfile.create({
          orgId: org.id,
          name: def.name,
          description: def.description,
          dataAccess: def.dataAccess,
        })

        // One permission row per module (module-level perm stored under "module" key in JSON)
        const perms = MODULE_KEYS
          .filter((key) => moduleIdByKey[key] !== undefined)
          .map((key) => ({
            orgId:     org.id,
            profileId: profile.id,
            moduleId:  moduleIdByKey[key],
            permissions: { module: toEntry(def.permissions[key] ?? NO_ACCESS) } as PermissionsJson,
          }))

        await OrganizationProfilePermission.createMany(perms)
      }

      console.log(`✓ Seeded 4 profiles for org #${org.id} (${org.name})`)
      created++
    }

    console.log(`\n  Done — ${created} org(s) seeded, ${skipped} org(s) skipped (already had profiles).`)
  }
}
