import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().toLowerCase(),
    password: vine.string().minLength(1),
  })
)

export const totpVerifyValidator = vine.compile(
  vine.object({
    token: vine
      .string()
      .trim()
      .minLength(6)
      .maxLength(6)
      .regex(/^\d{6}$/),
  })
)

export const totpEnableValidator = vine.compile(
  vine.object({
    token: vine
      .string()
      .trim()
      .minLength(6)
      .maxLength(6)
      .regex(/^\d{6}$/),
  })
)
