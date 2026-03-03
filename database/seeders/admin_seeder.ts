import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import SystemSetting from '#models/system_setting'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    // Create super admin user
    const email = 'admin@tenantforge.com'
    const existing = await User.findBy('email', email)

    if (!existing) {
      await User.create({
        fullName: 'Super Admin',
        email,
        password: 'Admin@123456',
        isActive: true,
        totpVerified: false,
      })
      console.log(`✓ Created admin user: ${email} / Admin@123456`)
    } else {
      console.log(`  Admin user already exists: ${email}`)
    }

    // Ensure login_method setting exists
    const setting = await SystemSetting.findBy('key', 'login_method')
    if (!setting) {
      await SystemSetting.create({ key: 'login_method', value: 'password' })
      console.log('✓ Created login_method setting: password')
    } else {
      console.log(`  login_method already set: ${setting.value}`)
    }
  }
}
