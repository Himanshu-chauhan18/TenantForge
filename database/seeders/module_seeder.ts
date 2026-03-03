import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Module from '#models/module'
import ModuleAddon from '#models/module_addon'

const SEED_MODULES = [
  {
    key: 'employee',
    label: 'Employee',
    description: 'Manage employees, profiles, documents',
    isMandatory: true,
    isActive: true,
    isComingSoon: false,
    sortOrder: 1,
    addons: ['Employee Self Service', 'Document Management', 'Onboarding Workflow'],
  },
  {
    key: 'organization',
    label: 'Organization',
    description: 'Organization structure, branches, departments',
    isMandatory: true,
    isActive: true,
    isComingSoon: false,
    sortOrder: 2,
    addons: ['Branch Management', 'Department Structure', 'Role Management'],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    description: 'Track daily attendance, shifts, overtime',
    isMandatory: false,
    isActive: true,
    isComingSoon: false,
    sortOrder: 3,
    addons: ['Biometric Integration', 'Geo-fencing', 'Shift Management', 'Overtime Tracking'],
  },
  {
    key: 'leave',
    label: 'Leave',
    description: 'Leave requests, approvals, policies',
    isMandatory: false,
    isActive: true,
    isComingSoon: true,
    sortOrder: 4,
    addons: ['Leave Encashment', 'Comp Off', 'Holiday Calendar'],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    description: 'Salary processing, payslips, compliance',
    isMandatory: false,
    isActive: true,
    isComingSoon: true,
    sortOrder: 5,
    addons: ['Tax Computation', 'PF & ESI', 'Payslip Generation', 'Bank Transfer'],
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'KPIs, appraisals, goals',
    isMandatory: false,
    isActive: true,
    isComingSoon: true,
    sortOrder: 6,
    addons: ['360 Feedback', 'Goal Tracking', 'Appraisal Cycles'],
  },
]

export default class ModuleSeeder extends BaseSeeder {
  async run() {
    for (const [i, data] of SEED_MODULES.entries()) {
      const { addons, ...moduleData } = data

      let mod = await Module.findBy('key', moduleData.key)
      if (!mod) {
        mod = await Module.create(moduleData)
        console.log(`✓ Created module: ${mod.label}`)
      } else {
        await mod.merge(moduleData).save()
        console.log(`  Module already exists, updated: ${mod.label}`)
      }

      for (const [j, addonName] of addons.entries()) {
        const existing = await ModuleAddon.query()
          .where('module_id', mod.id)
          .where('name', addonName)
          .first()

        if (!existing) {
          await ModuleAddon.create({
            moduleId: mod.id,
            name: addonName,
            sortOrder: j + 1,
            isActive: true,
          })
        }
      }
    }
  }
}
