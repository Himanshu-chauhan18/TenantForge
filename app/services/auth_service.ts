import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import UserRepository from '#repositories/user_repository'
import User from '#models/user'

export default class AuthService {
  private userRepo = new UserRepository()

  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      return await User.verifyCredentials(email, password)
    } catch {
      return null
    }
  }

  generateTotpSecret(email: string): { secret: string; otpAuthUrl: string } {
    const generated = speakeasy.generateSecret({
      name: `TenantForge (${email})`,
      issuer: 'TenantForge',
      length: 32,
    })
    return {
      secret: generated.base32,
      otpAuthUrl: generated.otpauth_url!,
    }
  }

  async generateQrCode(otpAuthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpAuthUrl)
  }

  verifyTotpCode(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    })
  }

  async setupTotp(userId: number): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new Error('User not found')

    const { secret, otpAuthUrl } = this.generateTotpSecret(user.email)
    await this.userRepo.updateTotpSecret(userId, secret)
    const qrCode = await this.generateQrCode(otpAuthUrl)

    return { secret, qrCode }
  }

  async enableTotp(userId: number, token: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId)
    if (!user?.totpSecret) return false

    const valid = this.verifyTotpCode(user.totpSecret, token)
    if (valid) {
      await this.userRepo.enableTotp(userId)
    }
    return valid
  }

  async verifyTotp(userId: number, token: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId)
    if (!user?.totpSecret) return false
    return this.verifyTotpCode(user.totpSecret, token)
  }

  async handleGoogleUser(googleUser: {
    id: string
    email: string
    name: string
  }): Promise<User> {
    let user = await this.userRepo.findByGoogleId(googleUser.id)
    if (!user) {
      user = await this.userRepo.findByEmail(googleUser.email)
      if (user) {
        await User.query().where('id', user.id).update({ google_id: googleUser.id })
        user = await this.userRepo.findById(user.id)
      } else {
        user = await this.userRepo.upsertGoogleUser({
          googleId: googleUser.id,
          email: googleUser.email,
          fullName: googleUser.name,
        })
      }
    }
    return user!
  }
}
