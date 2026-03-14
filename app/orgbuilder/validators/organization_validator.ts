import vine from '@vinejs/vine'

export const organizationStep1Validator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    companySize: vine
      .string()
      .in(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'])
      .optional()
      .nullable(),
    industry: vine.string().trim().maxLength(100).optional().nullable(),
    website: vine.string().trim().maxLength(500).optional().nullable(),
    about: vine.string().trim().maxLength(1000).optional().nullable(),
    gstNo: vine.string().trim().maxLength(50).optional().nullable(),
    parentOrgId: vine.number().optional().nullable(),
    fiscalName: vine.string().trim().maxLength(100).optional().nullable(),
    fiscalStart: vine.string().optional().nullable(),
    fiscalEnd: vine.string().optional().nullable(),
    country: vine.string().trim().maxLength(100).optional().nullable(),
    city: vine.string().trim().maxLength(100).optional().nullable(),
    phone: vine.string().trim().maxLength(30).optional().nullable(),
    email: vine.string().trim().maxLength(254).optional().nullable(),
    address: vine.string().trim().optional().nullable(),
    leadOwnerId: vine.number().optional().nullable(),
    currency: vine.string().trim().maxLength(10).optional().nullable(),
    timezone: vine.string().trim().maxLength(60).optional().nullable(),
    dateFormat: vine.string().trim().maxLength(20).optional().nullable(),
    timeFormat: vine.string().in(['12h', '24h', '12', '24']).optional().nullable(),
    planType: vine.string().in(['trial', 'premium']),
    userLimit: vine.number().min(1).max(100000),
    planStart: vine.string().optional().nullable(),
    planEnd: vine.string().optional().nullable(),
    status: vine.string().in(['active', 'inactive', 'expired']).optional(),
  })
)

export const organizationModulesValidator = vine.compile(
  vine.object({
    modules: vine
      .array(
        vine.object({
          moduleId: vine.number().min(1),
          addonIds: vine.array(vine.number().min(1)).maxLength(50),
        })
      )
      .maxLength(50)
      .optional(),
  })
)

export const organizationSuperAdminValidator = vine.compile(
  vine.object({
    employeeCode: vine.string().trim().maxLength(50).optional().nullable(),
    fullName: vine.string().trim().minLength(2).maxLength(255),
    gender: vine.string().in(['male', 'female', 'other']).optional().nullable(),
    adminPhone: vine.string().trim().maxLength(30).optional().nullable(),
    dateOfBirth: vine.string().optional().nullable(),
    companyEmail: vine.string().email().trim().maxLength(254),
    password: vine.string().minLength(8),
    sendWelcomeMail: vine.boolean().optional(),
  })
)

export const updateModulesValidator = vine.compile(
  vine.object({
    modules: vine.array(
      vine.object({
        moduleId: vine.number().min(1),
        enabled: vine.boolean(),
        addonIds: vine.array(vine.number().min(1)).maxLength(50),
      })
    ),
  })
)

export const bulkOperationValidator = vine.compile(
  vine.object({
    ids: vine.array(vine.number()).minLength(1).maxLength(500),
    operation: vine
      .string()
      .in([
        'activate',
        'deactivate',
        'archive',
        'unarchive',
        'delete',
        'extend_plan',
        'extend_user_limit',
        'assign_lead',
      ]),
    payload: vine
      .object({
        planEnd: vine.string().optional(),
        userLimit: vine.number().optional(),
        leadOwnerId: vine.number().optional(),
      })
      .optional(),
  })
)
