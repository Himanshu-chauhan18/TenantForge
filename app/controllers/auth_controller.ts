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

    // If TOTP is already set up, always require verification
    if (user.totpVerified) {
      session.put('totp_pending_user_id', user.id)
      return response.redirect().toPath('/auth/totp/verify')
    }

    // If TOTP setup is mandatory, force setup before login
    const totpRequired = await settingsRepo.getTotpRequired()
    if (totpRequired) {
      session.put('totp_setup_pending_user_id', user.id)
      return response.redirect().toPath('/auth/totp/setup')
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
      return response.redirect().toPath('/orgbuilder/login')
    }

    if (google.stateMisMatch()) {
      session.flash('errors', { auth: 'Invalid state. Please try again.' })
      return response.redirect().toPath('/orgbuilder/login')
    }

    if (google.hasError()) {
      session.flash('errors', { auth: 'Google sign-in failed. Please try again.' })
      return response.redirect().toPath('/orgbuilder/login')
    }

    const googleUser = await google.user()
    if (!googleUser.email) {
      session.flash('errors', { auth: 'Google account has no email.' })
      return response.redirect().toPath('/orgbuilder/login')
    }

    // Only allow Google login for users already registered in the system
    const { default: User } = await import('#models/user')
    const registeredUser = await User.findBy('email', googleUser.email.trim().toLowerCase())
    if (!registeredUser) {
      session.flash('errors', { auth: 'Your Google account email is not registered on this platform. Contact your administrator to add your account.' })
      return response.redirect().toPath('/orgbuilder/login')
    }

    const user = await authService.handleGoogleUser({
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split('@')[0],
    })

    if (!user.isActive) {
      session.flash('errors', { auth: 'Your account is disabled.' })
      return response.redirect().toPath('/orgbuilder/login')
    }

    // User has TOTP set up — require verification
    if (user.totpVerified) {
      session.put('totp_pending_user_id', user.id)
      return response.redirect().toPath('/auth/totp/verify')
    }

    // TOTP not set up yet — check if mandatory
    const totpRequired = await settingsRepo.getTotpRequired()
    if (totpRequired) {
      // Force setup WITHOUT logging in (prevents bypass)
      session.put('totp_setup_pending_user_id', user.id)
      return response.redirect().toPath('/auth/totp/setup')
    }

    // TOTP not required — just login
    await auth.use('web').login(user)
    return response.redirect().toRoute('dashboard')
  }

  async totpSetup({ auth, session, inertia, response }: HttpContext) {
    // Allow either: already authenticated user (from settings page)
    // OR: a user pending forced TOTP setup (from login flow)
    let userId: number

    if (await auth.check()) {
      userId = auth.user!.id
    } else {
      const pendingId = session.get('totp_setup_pending_user_id')
      if (!pendingId) return response.redirect().toPath('/orgbuilder/login')
      userId = Number(pendingId)
    }

    const { secret, qrCode } = await authService.setupTotp(userId)
    return inertia.render('auth/totp-setup', { qrCode, secret })
  }

  async totpEnable({ request, auth, session, response }: HttpContext) {
    const { token } = await request.validateUsing(totpEnableValidator)

    let userId: number
    const isAlreadyAuthed = await auth.check()

    if (isAlreadyAuthed) {
      userId = auth.user!.id
    } else {
      const pendingId = session.get('totp_setup_pending_user_id')
      if (!pendingId) return response.redirect().toPath('/orgbuilder/login')
      userId = Number(pendingId)
    }

    const valid = await authService.enableTotp(userId, token)
    if (!valid) {
      session.flash('errors', { totp: 'Invalid code. Please try again.' })
      return response.redirect().back()
    }

    // If user wasn't logged in (forced setup flow), log them in now
    if (!isAlreadyAuthed) {
      const { default: User } = await import('#models/user')
      const user = await User.findOrFail(userId)
      await auth.use('web').login(user)
      session.forget('totp_setup_pending_user_id')
    }

    session.flash('success', 'Two-factor authentication enabled successfully!')
    return response.redirect().toRoute('dashboard')
  }

  async showTotpVerify({ session, inertia, response }: HttpContext) {
    const pendingUserId = session.get('totp_pending_user_id')
    if (!pendingUserId) {
      return response.redirect().toPath('/orgbuilder/login')
    }
    return inertia.render('auth/totp-verify', {})
  }

  async totpVerify({ request, auth, response, session }: HttpContext) {
    const { token } = await request.validateUsing(totpVerifyValidator)
    const pendingUserId = session.get('totp_pending_user_id')

    if (!pendingUserId) {
      return response.redirect().toPath('/orgbuilder/login')
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
    return response.redirect().toPath('/orgbuilder/login')
  }
}
