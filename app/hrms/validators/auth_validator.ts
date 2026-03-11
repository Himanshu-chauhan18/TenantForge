import vine from '@vinejs/vine'

export const hrmsLoginValidator = vine.compile(
  vine.object({
    identifier: vine.string().trim().minLength(1),
    password: vine.string().minLength(1),
  })
)
