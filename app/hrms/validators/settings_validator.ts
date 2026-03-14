import vine from '@vinejs/vine'

export const divisionStep1Validator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    shortName: vine.string().trim().maxLength(50).optional(),
    legalEmployeeId: vine.string().trim().maxLength(100).optional(),
    bankName: vine.string().trim().maxLength(255).optional(),
    bankAgentCode: vine.string().trim().maxLength(100).optional(),
    bankAccountNo: vine.string().trim().maxLength(100).optional(),
    ifscCode: vine.string().trim().maxLength(20).optional(),
    establishmentNo: vine.string().trim().maxLength(100).optional(),
    contactPerson: vine.string().trim().maxLength(255).optional(),
    contactPhone: vine.string().trim().maxLength(20).optional(),
    address: vine.string().trim().optional(),
    email: vine.string().trim().email().optional(),
    country: vine.string().trim().maxLength(100).optional(),
    city: vine.string().trim().maxLength(100).optional(),
    currency: vine.string().trim().maxLength(10).optional(),
    dateFormat: vine.string().trim().maxLength(30).optional(),
    timezone: vine.string().trim().maxLength(80).optional(),
    timeFormat: vine.string().trim().maxLength(20).optional(),
  })
)

export const locationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    country: vine.string().trim().minLength(1).maxLength(100),
    city: vine.string().trim().minLength(1).maxLength(100),
    address: vine.string().trim().minLength(2),
    landmark: vine.string().trim().maxLength(255).optional(),
    zipCode: vine.string().trim().maxLength(20).optional(),
  })
)

export const nameOnlyValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
  })
)

export const holidayValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    date: vine.string().trim(),
    isFlexi: vine.boolean().optional(),
    description: vine.string().trim().optional(),
    applyTo: vine.enum(['division', 'location', 'both']).optional(),
    divisionIds: vine.array(vine.number()).optional(),
    locationIds: vine.array(vine.number()).optional(),
  })
)

export const noticePeriodValidator = vine.compile(
  vine.object({
    designationId: vine.number().optional(),
    designationName: vine.string().trim().maxLength(255).optional(),
    noticeDays: vine.number().min(0).max(3650),
  })
)

export const approvalValidator = vine.compile(
  vine.object({
    moduleName: vine.string().trim().minLength(1).maxLength(100),
    approvalType: vine.enum(['resignation', 'termination', 'personal_requisition', 'leave', 'expense', 'other']),
    basedOn: vine.enum(['designation', 'division']),
    referenceId: vine.number().optional(),
    referenceName: vine.string().trim().maxLength(255).optional(),
    escalationPeriodDays: vine.number().min(1).max(365).optional(),
    sendMailOnEscalation: vine.boolean().optional(),
  })
)

export const companyDocumentValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    documentType: vine.string().trim().maxLength(100).optional(),
    description: vine.string().trim().optional(),
    isMandatory: vine.boolean().optional(),
  })
)

export const checklistValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    type: vine.enum(['onboarding', 'offboarding', 'general']).optional(),
    description: vine.string().trim().optional(),
    items: vine.array(vine.string().trim()).optional(),
  })
)

export const templateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    type: vine.enum(['offer_letter', 'appointment_letter', 'experience_letter', 'relieving_letter', 'warning_letter', 'appraisal_letter', 'email', 'other']).optional(),
    content: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)

export const companyUpdateValidator = vine.compile(
  vine.object({
    // Company Info
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    about: vine.string().trim().optional(),
    industry: vine.string().trim().maxLength(100).optional(),
    companySize: vine.string().trim().maxLength(50).optional(),
    website: vine.string().trim().maxLength(500).optional(),
    gstNo: vine.string().trim().maxLength(30).optional(),
    // Contact
    phone: vine.string().trim().maxLength(20).optional(),
    email: vine.string().trim().email().optional(),
    country: vine.string().trim().maxLength(100).optional(),
    city: vine.string().trim().maxLength(100).optional(),
    address: vine.string().trim().optional(),
    pincode: vine.string().trim().maxLength(20).optional(),
    // Locale
    currency: vine.string().trim().maxLength(10).optional(),
    timezone: vine.string().trim().maxLength(80).optional(),
    dateFormat: vine.string().trim().maxLength(30).optional(),
    timeFormat: vine.string().trim().maxLength(20).optional(),
    // Fiscal
    fiscalName: vine.string().trim().maxLength(100).optional(),
    fiscalStart: vine.string().trim().optional(),
    fiscalEnd: vine.string().trim().optional(),
  })
)

export const hierarchyNodeValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255),
    department: vine.string().trim().maxLength(255).optional(),
    parentId: vine.number().optional(),
    employeeId: vine.number().optional(),
    sortOrder: vine.number().optional(),
  })
)
