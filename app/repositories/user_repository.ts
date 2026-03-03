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
}
