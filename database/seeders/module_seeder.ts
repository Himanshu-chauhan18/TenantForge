import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Module from '#models/module'
import ModuleAddon from '#models/module_addon'

type AddonType = 'default' | 'custom' | 'advance'
interface AddonDef { name: string; type: AddonType }

const SEED_MODULES: {
  key: string
  label: string
  description: string
  isMandatory: boolean
  isActive: boolean
  isComingSoon: boolean
  sortOrder: number
  addons: AddonDef[]
}[] = [
  {
    key: 'organization',
    label: 'Organization',
    description: 'Organization structure, policies, settings & permissions',
    isMandatory: true,
    isActive: true,
    isComingSoon: false,
    sortOrder: 1,
    addons: [
      // ── Default ──────────────────────────────────────
      { name: 'Policies & Procedures',        type: 'default' },
      { name: 'Roles & Permissions',          type: 'default' },
      { name: 'Reports',                      type: 'default' },
      { name: 'Settings - Company',           type: 'default' },
      { name: 'Settings - Company Documents', type: 'default' },
      { name: 'Settings - Divisions',         type: 'default' },
      { name: 'Settings - Departments',       type: 'default' },
      { name: 'Settings - Designations',      type: 'default' },
      { name: 'Settings - Locations',         type: 'default' },
      { name: 'Settings - Grades',            type: 'default' },
      { name: 'Settings - Fiscal Year',       type: 'default' },
      { name: 'Settings - Hierarchy',         type: 'default' },
      { name: 'Settings - Holidays',          type: 'default' },
      { name: 'Settings - Alerts',            type: 'default' },
      { name: 'Settings - Notifications',     type: 'default' },
      { name: 'Settings - Approvals',         type: 'default' },
      { name: 'Settings - Notice Period',     type: 'default' },
      // ── Custom ───────────────────────────────────────
      { name: 'Settings - Sub Department',    type: 'custom' },
      { name: 'Settings - Section',           type: 'custom' },
      { name: 'Settings - Sub Section',       type: 'custom' },
      { name: 'Settings - Checklists',        type: 'custom' },
      // ── Advance ──────────────────────────────────────
      { name: 'Settings - Templates',         type: 'advance' },
    ],
  },
  {
    key: 'employee',
    label: 'Employee',
    description: 'Manage employees, profiles, documents & employment lifecycle',
    isMandatory: true,
    isActive: true,
    isComingSoon: false,
    sortOrder: 2,
    addons: [
      // ── Default ──────────────────────────────────────
      { name: 'Hobbies',                                          type: 'default' },
      { name: 'Employee Bank Details',                            type: 'default' },
      { name: 'Employee List',                                    type: 'default' },
      { name: 'New Joinings',                                     type: 'default' },
      { name: 'Ex Employees',                                     type: 'default' },
      { name: 'Offboard Employees',                               type: 'default' },
      { name: 'Employee Documents - Document List',               type: 'default' },
      { name: 'Employees Under Probation',                        type: 'default' },
      { name: 'Reports',                                          type: 'default' },
      { name: 'Settings - Skills',                                type: 'default' },
      { name: 'Settings - Employment Status',                     type: 'default' },
      { name: 'Settings - Qualification',                         type: 'default' },
      { name: 'Settings - Marital Status',                        type: 'default' },
      { name: 'Settings - Banks',                                 type: 'default' },
      { name: 'Settings - Employment Type',                       type: 'default' },
      { name: 'Employment Change',                                type: 'default' },
      { name: 'Settings - Documents',                             type: 'default' },
      { name: 'Employee Document - Document Approval',            type: 'default' },
      { name: 'Employee Document - Document Release',             type: 'default' },
      { name: 'Employee Document - Document Return',              type: 'default' },
      { name: 'Settings - Certificates',                          type: 'default' },
      { name: 'Employee Document - Certificate Release',          type: 'default' },
      { name: 'Employee Document - Certificate Approval',         type: 'default' },
      // ── Custom ───────────────────────────────────────
      { name: 'Employee Family Details',                          type: 'custom' },
      { name: 'Official Communication',                           type: 'custom' },
      // ── Advance ──────────────────────────────────────
      { name: 'Bulk Import',                                      type: 'advance' },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    description: 'Track daily attendance, shifts, overtime & regularization',
    isMandatory: false,
    isActive: true,
    isComingSoon: false,
    sortOrder: 3,
    addons: [
      // ── Default ──────────────────────────────────────
      { name: 'Attendance List',                        type: 'default' },
      { name: 'Reports',                                type: 'default' },
      { name: 'Settings - Shift',                       type: 'default' },
      // ── Custom ───────────────────────────────────────
      { name: 'Settings - Geo-fence',                   type: 'custom' },
      { name: 'Settings - Shift Rotation',              type: 'custom' },
      { name: 'Edit Attendance',                        type: 'custom' },
      { name: 'Delete Attendance',                      type: 'custom' },
      { name: 'Team Attendance',                        type: 'custom' },
      { name: 'Attendance Selfie',                      type: 'custom' },
      { name: 'Overtime Approval',                      type: 'custom' },
      { name: 'Request Weekly Off',                     type: 'custom' },
      { name: 'Regularization',                         type: 'custom' },
      { name: 'Device Restriction',                     type: 'custom' },
      { name: 'Quick QR Attendance',                    type: 'custom' },
      { name: 'Auto TimeOut',                           type: 'custom' },
      { name: 'Visits Distance',                        type: 'custom' },
      { name: 'Geo-Fence Notification',                 type: 'custom' },
      { name: 'Manage Overtime',                        type: 'custom' },
      { name: 'View Attendance Logs',                   type: 'custom' },
      { name: 'Overtime',                               type: 'custom' },
      { name: 'Late Coming',                            type: 'custom' },
      { name: 'Shift Planner',                          type: 'custom' },
      { name: 'Settings - Regularization Settings',     type: 'custom' },
      // ── Advance ──────────────────────────────────────
      { name: 'Settings - Face Recognition',            type: 'advance' },
      { name: 'Settings - Track Visits',                type: 'advance' },
      { name: 'Employee Tracking',                      type: 'advance' },
      { name: 'Settings - Punch Visit',                 type: 'advance' },
    ],
  },
  {
    key: 'leave',
    label: 'Leave',
    description: 'Leave requests, approvals, balances & holiday calendar',
    isMandatory: false,
    isActive: true,
    isComingSoon: true,
    sortOrder: 4,
    addons: [
      { name: 'Leave Requests',     type: 'default' },
      { name: 'Leave Balance',      type: 'default' },
      { name: 'Holiday Calendar',   type: 'default' },
      { name: 'Reports',            type: 'default' },
      { name: 'Leave Encashment',   type: 'custom' },
      { name: 'Comp Off',           type: 'custom' },
      { name: 'Leave Policy',       type: 'custom' },
    ],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    description: 'Salary processing, payslips, tax & statutory compliance',
    isMandatory: false,
    isActive: true,
    isComingSoon: true,
    sortOrder: 5,
    addons: [
      { name: 'Payslips',                    type: 'default' },
      { name: 'Salary Structure',            type: 'default' },
      { name: 'Reports',                     type: 'default' },
      { name: 'Tax Computation',             type: 'custom' },
      { name: 'PF & ESI',                    type: 'custom' },
      { name: 'Bank Transfer',               type: 'custom' },
      { name: 'Payslip Template Builder',    type: 'advance' },
    ],
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'KPIs, appraisals, goal tracking & 360° feedback',
    isMandatory: false,
    isActive: true,
    isComingSoon: true,
    sortOrder: 6,
    addons: [
      { name: 'Goals',            type: 'default' },
      { name: 'Reviews',          type: 'default' },
      { name: 'Reports',          type: 'default' },
      { name: '360° Feedback',    type: 'custom' },
      { name: 'Appraisal Cycles', type: 'custom' },
      { name: 'OKR Framework',    type: 'advance' },
    ],
  },
]

export default class ModuleSeeder extends BaseSeeder {
  async run() {
    for (const data of SEED_MODULES) {
      const { addons, ...moduleData } = data

      // Upsert module
      let mod = await Module.findBy('key', moduleData.key)
      if (!mod) {
        mod = await Module.create(moduleData)
        console.log(`✓ Created module: ${mod.label}`)
      } else {
        await mod.merge(moduleData).save()
        console.log(`  Updated module: ${mod.label}`)
      }

      // Wipe all existing addons for this module and re-insert fresh
      await ModuleAddon.query().where('module_id', mod.id).delete()

      for (const [i, addon] of addons.entries()) {
        await ModuleAddon.create({
          moduleId: mod.id,
          name: addon.name,
          type: addon.type,
          sortOrder: i + 1,
          isActive: true,
        })
      }

      console.log(`  → ${addons.length} add-ons seeded (${addons.filter(a => a.type === 'default').length} default, ${addons.filter(a => a.type === 'custom').length} custom, ${addons.filter(a => a.type === 'advance').length} advance)`)
    }
  }
}
