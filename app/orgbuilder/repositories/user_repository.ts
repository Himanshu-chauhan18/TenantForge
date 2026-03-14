import User from '#models/user'

export default class UserRepository {
  async findById(id: number): Promise<User | null> {
    return User.find(id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findBy('email', email)
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return User.findBy('google_id', googleId)
  }

  async create(data: Partial<User>): Promise<User> {
    return User.create(data)
  }

  async updateTotpSecret(userId: number, secret: string): Promise<void> {
    await User.query().where('id', userId).update({ totp_secret: secret })
  }

  async enableTotp(userId: number): Promise<void> {
    await User.query().where('id', userId).update({ totp_verified: true })
  }

  async upsertGoogleUser(data: {
    googleId: string
    email: string
    fullName: string
  }): Promise<User> {
    return User.updateOrCreate({ googleId: data.googleId }, { ...data, isActive: true })
  }

  async list(): Promise<User[]> {
    return User.query().where('is_active', true).orderBy('full_name', 'asc')
  }

  async updateProfile(userId: number, data: { fullName?: string }): Promise<void> {
    await User.query().where('id', userId).update({
      ...(data.fullName !== undefined ? { full_name: data.fullName } : {}),
    })
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await User.query().where('id', userId).update({ password: passwordHash })
  }

  async disableTotp(userId: number): Promise<void> {
    await User.query().where('id', userId).update({ totp_secret: null, totp_verified: false })
  }

  async listAll(): Promise<User[]> {
    return User.query().orderBy('full_name', 'asc')
  }

  async adminCreate(data: { fullName: string; email: string; passwordHash: string }): Promise<User> {
    return User.create({ fullName: data.fullName, email: data.email, password: data.passwordHash, isActive: true })
  }

  async adminUpdate(userId: number, data: { fullName?: string }): Promise<void> {
    await User.query().where('id', userId).update({
      ...(data.fullName !== undefined ? { full_name: data.fullName } : {}),
    })
  }

  async setActive(userId: number, isActive: boolean): Promise<void> {
    await User.query().where('id', userId).update({ is_active: isActive })
  }

  async adminResetPassword(userId: number, passwordHash: string): Promise<void> {
    await User.query().where('id', userId).update({ password: passwordHash })
  }
}
