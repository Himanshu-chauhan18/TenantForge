import vine from '@vinejs/vine'

export const leadOwnerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(150),
    email: vine.string().trim().email().maxLength(255),
    phone: vine.string().trim().maxLength(30).optional(),
    designation: vine.string().trim().maxLength(100).optional(),
    status: vine.enum(['active', 'inactive'] as const).optional(),
  })
)
