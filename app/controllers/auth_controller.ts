import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import SettingsRepository from '#repositories/settings_repository'
import { loginValidator, totpVerifyValidator, totpEnableValidator } from '#validators/auth_validator'

const authService = new AuthService()
const settingsRepo = new SettingsRepository()

export default class AuthController {
  async showLogin({ inertia, auth, response }: HttpContext) {
    if (await auth.check()) {
      return response.redirect().toRoute('dashboard')
    }
    const loginMethod = await settingsRepo.getLoginMethod()
    return inertia.render('auth/login', { loginMethod })
  }

  async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await authService.verifyPassword(email, password)
    if (!user) {
      session.flash('errors', { auth: 'Invalid email or password.' })
      return response.redirect().back()
    }

    if (!user.isActive) {
      session.flash('errors', { auth: 'Your account is disabled. Contact administrator.' })
      return response.redirect().back()
    }

    // If TOTP is set up, require it
    if (user.totpVerified) {
      session.put('totp_pending_user_id', user.id)
      return response.redirect().toPath('/auth/totp/verify')
    }

    await auth.use('web').login(user)
    return response.redirect().toRoute('dashboard')
  }

  async googleRedirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async googleCallback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')

    if (google.accessDenied()) {
      session.flash('errors', { auth: 'Google sign-in was cancelled.' })
      return response.redirect().toPath('/login')
    }

    if (google.stateMisMatch()) {
      session.flash('errors', { auth: 'Invalid state. Please try again.' })
      return response.redirect().toPath('/login')
    }

    if (google.hasError()) {
      session.flash('errors', { auth: 'Google sign-in failed. Please try again.' })
      return response.redirect().toPath('/login')
    }

    const googleUser = await google.user()
    if (!googleUser.email) {
      session.flash('errors', { auth: 'Google account has no email.' })
      return response.redirect().toPath('/login')
    }

    const user = await authService.handleGoogleUser({
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split('@')[0],
    })

    if (!user.isActive) {
      session.flash('errors', { auth: 'Your account is disabled.' })
      return response.redirect().toPath('/login')
    }

    // Require TOTP (setup or verify)
    if (!user.totpVerified) {
      await auth.use('web').login(user)
      return response.redirect().toPath('/auth/totp/setup')
    }

    session.put('totp_pending_user_id', user.id)
    return response.redirect().toPath('/auth/totp/verify')
  }

  async totpSetup({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const { secret, qrCode } = await authService.setupTotp(user.id)
    return inertia.render('auth/totp-setup', { qrCode, secret })
  }

  async totpEnable({ request, auth, response, session }: HttpContext) {
    const { token } = await request.validateUsing(totpEnableValidator)
    const user = auth.user!
    const valid = await authService.enableTotp(user.id, token)

    if (!valid) {
      session.flash('errors', { totp: 'Invalid code. Please try again.' })
      return response.redirect().back()
    }

    session.flash('success', 'Two-factor authentication enabled successfully!')
    return response.redirect().toRoute('dashboard')
  }

  async showTotpVerify({ session, inertia, response }: HttpContext) {
    const pendingUserId = session.get('totp_pending_user_id')
    if (!pendingUserId) {
      return response.redirect().toPath('/login')
    }
    return inertia.render('auth/totp-verify', {})
  }

  async totpVerify({ request, auth, response, session }: HttpContext) {
    const { token } = await request.validateUsing(totpVerifyValidator)
    const pendingUserId = session.get('totp_pending_user_id')

    if (!pendingUserId) {
      return response.redirect().toPath('/login')
    }

    const valid = await authService.verifyTotp(pendingUserId, token)

    if (!valid) {
      session.flash('errors', { totp: 'Invalid code. Please try again.' })
      return response.redirect().back()
    }

    // Find user and login
    const { default: User } = await import('#models/user')
    const user = await User.findOrFail(pendingUserId)
    await auth.use('web').login(user)
    session.forget('totp_pending_user_id')

    return response.redirect().toRoute('dashboard')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toPath('/login')
  }
}
