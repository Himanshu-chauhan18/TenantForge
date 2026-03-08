import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import SettingsRepository from '#repositories/settings_repository'
import UserRepository from '#repositories/user_repository'

const settingsRepo = new SettingsRepository()
const userRepo = new UserRepository()

export default class SettingsController {
  // ── GET /settings ──────────────────────────────────────────────────────────

  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const [platform, orgDefaults, allUsers] = await Promise.all([
      settingsRepo.getPlatformSettings(),
      settingsRepo.getOrgDefaults(),
      userRepo.listAll(),
    ])

    return inertia.render('settings/index', {
      settingsUser: {
        id:           user.id,
        fullName:     user.fullName,
        email:        user.email,
        hasPassword:  user.password !== null,
        hasGoogle:    user.googleId !== null,
        totpVerified: user.totpVerified,
        initials:     user.initials,
      },
      platform,
      orgDefaults,
      users: allUsers.map((u) => ({
        id:           u.id,
        fullName:     u.fullName,
        email:        u.email,
        hasPassword:  u.password !== null,
        hasGoogle:    u.googleId !== null,
        totpVerified: u.totpVerified,
        isActive:     u.isActive,
        initials:     u.initials,
        createdAt:    u.createdAt.toISO(),
      })),
    })
  }

  // ── PUT /settings/profile ──────────────────────────────────────────────────

  async updateProfile({ request, response, session, auth }: HttpContext) {
    const { fullName } = request.only(['fullName'])
    const userId = auth.user!.id

    if (!fullName || !String(fullName).trim()) {
      session.flash('error', 'Full name is required.')
      return response.redirect().back()
    }

    await userRepo.updateProfile(userId, { fullName: String(fullName).trim() })
    session.flash('success', 'Profile updated successfully.')
    return response.redirect().back()
  }

  // ── PUT /settings/password ─────────────────────────────────────────────────

  async changePassword({ request, response, session, auth }: HttpContext) {
    const user = auth.user!

    if (!user.password) {
      session.flash('error', 'No password is set on this account. Sign in with Google.')
      return response.redirect().back()
    }

    const { currentPassword, newPassword, confirmPassword } =
      request.only(['currentPassword', 'newPassword', 'confirmPassword'])

    if (!currentPassword || !newPassword || !confirmPassword) {
      session.flash('error', 'All password fields are required.')
      return response.redirect().back()
    }

    if (String(newPassword).length < 8) {
      session.flash('error', 'New password must be at least 8 characters.')
      return response.redirect().back()
    }

    if (newPassword !== confirmPassword) {
      session.flash('error', 'New passwords do not match.')
      return response.redirect().back()
    }

    const valid = await hash.verify(user.password, String(currentPassword))
    if (!valid) {
      session.flash('error', 'Current password is incorrect.')
      return response.redirect().back()
    }

    const newHash = await hash.make(String(newPassword))
    await userRepo.updatePassword(user.id, newHash)
    session.flash('success', 'Password changed successfully.')
    return response.redirect().back()
  }

  // ── DELETE /settings/totp ──────────────────────────────────────────────────

  async disableTotp({ response, session, auth }: HttpContext) {
    await userRepo.disableTotp(auth.user!.id)
    session.flash('success', 'Two-factor authentication has been disabled.')
    return response.redirect().back()
  }

  // ── PUT /settings/platform ─────────────────────────────────────────────────

  async updatePlatform({ request, response, session }: HttpContext) {
    const { loginMethod } = request.only(['loginMethod'])

    const validMethods = ['password', 'google', 'both']
    if (!validMethods.includes(loginMethod)) {
      session.flash('error', 'Invalid login method.')
      return response.redirect().back()
    }

    await settingsRepo.set('login_method', loginMethod)
    session.flash('success', 'Platform settings updated.')
    return response.redirect().back()
  }

  // ── PUT /settings/org-defaults ─────────────────────────────────────────────

  async updateOrgDefaults({ request, response, session }: HttpContext) {
    const { trialDays, userLimit, plan } = request.only(['trialDays', 'userLimit', 'plan'])

    const td = Number(trialDays)
    const ul = Number(userLimit)

    if (isNaN(td) || td < 1 || td > 365) {
      session.flash('error', 'Trial days must be between 1 and 365.')
      return response.redirect().back()
    }

    if (isNaN(ul) || ul < 1 || ul > 10000) {
      session.flash('error', 'User limit must be between 1 and 10,000.')
      return response.redirect().back()
    }

    if (!['trial', 'premium'].includes(plan)) {
      session.flash('error', 'Invalid plan type.')
      return response.redirect().back()
    }

    await settingsRepo.setMany({
      org_default_trial_days:  String(td),
      org_default_user_limit:  String(ul),
      org_default_plan:        String(plan),
    })

    session.flash('success', 'Organization defaults updated.')
    return response.redirect().back()
  }

  // ── POST /settings/users ───────────────────────────────────────────────────

  async storeUser({ request, response, session }: HttpContext) {
    const { fullName, email, password } = request.only(['fullName', 'email', 'password'])

    if (!fullName || !String(fullName).trim()) {
      session.flash('error', 'Full name is required.')
      return response.redirect().back()
    }

    if (!email || !String(email).trim()) {
      session.flash('error', 'Email is required.')
      return response.redirect().back()
    }

    if (!password || String(password).length < 8) {
      session.flash('error', 'Password must be at least 8 characters.')
      return response.redirect().back()
    }

    const existing = await userRepo.findByEmail(String(email).trim().toLowerCase())
    if (existing) {
      session.flash('error', 'A user with this email already exists.')
      return response.redirect().back()
    }

    const passwordHash = await hash.make(String(password))
    await userRepo.adminCreate({
      fullName: String(fullName).trim(),
      email:    String(email).trim().toLowerCase(),
      passwordHash,
    })

    session.flash('success', 'User created successfully.')
    return response.redirect().back()
  }

  // ── PUT /settings/users/:id ────────────────────────────────────────────────

  async updateUser({ params, request, response, session, auth }: HttpContext) {
    const { fullName } = request.only(['fullName'])
    const targetId = Number(params.id)

    if (!fullName || !String(fullName).trim()) {
      session.flash('error', 'Full name is required.')
      return response.redirect().back()
    }

    const target = await userRepo.findById(targetId)
    if (!target) {
      session.flash('error', 'User not found.')
      return response.redirect().back()
    }

    await userRepo.adminUpdate(targetId, { fullName: String(fullName).trim() })
    session.flash('success', 'User updated successfully.')
    return response.redirect().back()
  }

  // ── PUT /settings/users/:id/toggle ────────────────────────────────────────

  async toggleUser({ params, response, session, auth }: HttpContext) {
    const targetId = Number(params.id)

    if (targetId === auth.user!.id) {
      session.flash('error', 'You cannot deactivate your own account.')
      return response.redirect().back()
    }

    const target = await userRepo.findById(targetId)
    if (!target) {
      session.flash('error', 'User not found.')
      return response.redirect().back()
    }

    await userRepo.setActive(targetId, !target.isActive)
    session.flash('success', `User ${!target.isActive ? 'activated' : 'deactivated'} successfully.`)
    return response.redirect().back()
  }

  // ── PUT /settings/users/:id/reset-password ────────────────────────────────

  async resetUserPassword({ params, request, response, session }: HttpContext) {
    const { newPassword } = request.only(['newPassword'])
    const targetId = Number(params.id)

    if (!newPassword || String(newPassword).length < 8) {
      session.flash('error', 'New password must be at least 8 characters.')
      return response.redirect().back()
    }

    const target = await userRepo.findById(targetId)
    if (!target) {
      session.flash('error', 'User not found.')
      return response.redirect().back()
    }

    const passwordHash = await hash.make(String(newPassword))
    await userRepo.adminResetPassword(targetId, passwordHash)
    session.flash('success', 'Password reset successfully.')
    return response.redirect().back()
  }
}
