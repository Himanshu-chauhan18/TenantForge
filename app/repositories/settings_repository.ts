import SystemSetting from '#models/system_setting'

export default class SettingsRepository {
  async get(key: string): Promise<string | null> {
    const setting = await SystemSetting.findBy('key', key)
    return setting?.value ?? null
  }

  async set(key: string, value: string): Promise<void> {
    await SystemSetting.updateOrCreate({ key }, { value })
  }

  async getLoginMethod(): Promise<'password' | 'google' | 'both'> {
    const value = await this.get('login_method')
    return (value as 'password' | 'google' | 'both') ?? 'password'
  }
}
