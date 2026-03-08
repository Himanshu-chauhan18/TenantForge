import SystemSetting from '#models/system_setting'

export default class SettingsRepository {
  async get(key: string): Promise<string | null> {
    const setting = await SystemSetting.findBy('key', key)
    return setting?.value ?? null
  }

  async set(key: string, value: string): Promise<void> {
    await SystemSetting.updateOrCreate({ key }, { value })
  }

  async setMany(pairs: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(pairs)) {
      await this.set(key, value)
    }
  }

  async getLoginMethod(): Promise<'password' | 'google' | 'both'> {
    const value = await this.get('login_method')
    return (value as 'password' | 'google' | 'both') ?? 'password'
  }

  async getPlatformSettings() {
    const rows = await SystemSetting.query()
      .whereIn('key', ['login_method'])
    const map: Record<string, string> = {}
    for (const r of rows) if (r.value !== null) map[r.key] = r.value
    return {
      loginMethod: (map['login_method'] ?? 'password') as 'password' | 'google' | 'both',
    }
  }

  async getOrgDefaults() {
    const rows = await SystemSetting.query()
      .whereIn('key', ['org_default_trial_days', 'org_default_user_limit', 'org_default_plan'])
    const map: Record<string, string> = {}
    for (const r of rows) if (r.value !== null) map[r.key] = r.value
    return {
      trialDays:  Number(map['org_default_trial_days'] ?? 30),
      userLimit:  Number(map['org_default_user_limit'] ?? 10),
      plan:       (map['org_default_plan'] ?? 'trial') as 'trial' | 'premium',
    }
  }
}
