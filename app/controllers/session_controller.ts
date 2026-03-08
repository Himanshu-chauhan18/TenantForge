import User from '#models/user'
import SettingsRepository from '#repositories/settings_repository'
import type { HttpContext } from '@adonisjs/core/http'

const settingsRepo = new SettingsRepository()

export default class SessionController {
  async create({ inertia }: HttpContext) {
    const loginMethod = await settingsRepo.getLoginMethod()
    return inertia.render('auth/login', { loginMethod })
  }

  async store({ request, auth, response }: HttpContext) {
    const { email, password } = request.all()
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)
    return response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('auth.login')
  }
}
