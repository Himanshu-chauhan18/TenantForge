import type { HttpContext } from '@adonisjs/core/http'
import HrmsSettingsRepository from '#hrms/repositories/settings_repository'
import {
  divisionStep1Validator,
  locationValidator,
  nameOnlyValidator,
  holidayValidator,
  noticePeriodValidator,
  approvalValidator,
  companyDocumentValidator,
  checklistValidator,
  templateValidator,
} from '#hrms/validators/settings_validator'

const repo = new HrmsSettingsRepository()

export default class HrmsSettingsController {
  // ── Divisions ────────────────────────────────────────────────────────────────
  async divisionsIndex({ inertia, hrmsOrg }: HttpContext) {
    const divisions = await repo.listDivisions(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/divisions', { divisions: divisions.map((d) => d.serialize()) })
  }
  async divisionsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(divisionStep1Validator)
    await repo.createDivision(hrmsOrg.id, data as any)
    session.flash('success', 'Division created successfully.')
    return response.redirect('/hrms/organization/settings/divisions')
  }
  async divisionsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(divisionStep1Validator)
    await repo.updateDivision(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Division updated.')
    return response.redirect('/hrms/organization/settings/divisions')
  }
  async divisionsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteDivision(params.id, hrmsOrg.id)
    session.flash('success', 'Division deleted.')
    return response.redirect('/hrms/organization/settings/divisions')
  }

  // ── Locations ────────────────────────────────────────────────────────────────
  async locationsIndex({ inertia, hrmsOrg }: HttpContext) {
    const locations = await repo.listLocations(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/locations', { locations: locations.map((l) => l.serialize()) })
  }
  async locationsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(locationValidator)
    await repo.createLocation(hrmsOrg.id, data as any)
    session.flash('success', 'Location created.')
    return response.redirect('/hrms/organization/settings/locations')
  }
  async locationsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(locationValidator)
    await repo.updateLocation(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Location updated.')
    return response.redirect('/hrms/organization/settings/locations')
  }
  async locationsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteLocation(params.id, hrmsOrg.id)
    session.flash('success', 'Location deleted.')
    return response.redirect('/hrms/organization/settings/locations')
  }

  // ── Departments ──────────────────────────────────────────────────────────────
  async departmentsIndex({ inertia, hrmsOrg }: HttpContext) {
    const departments = await repo.listDepartments(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/departments', { departments: departments.map((d) => d.serialize()) })
  }
  async departmentsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(nameOnlyValidator)
    await repo.createDepartment(hrmsOrg.id, data.name)
    session.flash('success', 'Department created.')
    return response.redirect('/hrms/organization/settings/departments')
  }
  async departmentsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(nameOnlyValidator)
    await repo.updateDepartment(params.id, hrmsOrg.id, data.name)
    session.flash('success', 'Department updated.')
    return response.redirect('/hrms/organization/settings/departments')
  }
  async departmentsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteDepartment(params.id, hrmsOrg.id)
    session.flash('success', 'Department deleted.')
    return response.redirect('/hrms/organization/settings/departments')
  }

  // ── Sub Departments ──────────────────────────────────────────────────────────
  async subDepartmentsIndex({ inertia, hrmsOrg }: HttpContext) {
    const [subDepts, departments] = await Promise.all([
      repo.listSubDepartments(hrmsOrg.id),
      repo.listDepartments(hrmsOrg.id),
    ])
    return inertia.render('hrms/organization/settings/sub-departments', {
      subDepartments: subDepts.map((d) => d.serialize()),
      departments: departments.map((d) => d.serialize()),
    })
  }
  async subDepartmentsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const body = request.body()
    await repo.createSubDepartment(hrmsOrg.id, body.name, body.departmentId)
    session.flash('success', 'Sub-department created.')
    return response.redirect('/hrms/organization/settings/sub-departments')
  }
  async subDepartmentsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const body = request.body()
    await repo.updateSubDepartment(params.id, hrmsOrg.id, body.name, body.departmentId)
    session.flash('success', 'Sub-department updated.')
    return response.redirect('/hrms/organization/settings/sub-departments')
  }
  async subDepartmentsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteSubDepartment(params.id, hrmsOrg.id)
    session.flash('success', 'Sub-department deleted.')
    return response.redirect('/hrms/organization/settings/sub-departments')
  }

  // ── Designations ─────────────────────────────────────────────────────────────
  async designationsIndex({ inertia, hrmsOrg }: HttpContext) {
    const designations = await repo.listDesignations(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/designations', { designations: designations.map((d) => d.serialize()) })
  }
  async designationsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(nameOnlyValidator)
    await repo.createDesignation(hrmsOrg.id, data.name)
    session.flash('success', 'Designation created.')
    return response.redirect('/hrms/organization/settings/designations')
  }
  async designationsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(nameOnlyValidator)
    await repo.updateDesignation(params.id, hrmsOrg.id, data.name)
    session.flash('success', 'Designation updated.')
    return response.redirect('/hrms/organization/settings/designations')
  }
  async designationsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteDesignation(params.id, hrmsOrg.id)
    session.flash('success', 'Designation deleted.')
    return response.redirect('/hrms/organization/settings/designations')
  }

  // ── Grades ───────────────────────────────────────────────────────────────────
  async gradesIndex({ inertia, hrmsOrg }: HttpContext) {
    const grades = await repo.listGrades(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/grades', { grades: grades.map((g) => g.serialize()) })
  }
  async gradesStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(nameOnlyValidator)
    await repo.createGrade(hrmsOrg.id, data.name)
    session.flash('success', 'Grade created.')
    return response.redirect('/hrms/organization/settings/grades')
  }
  async gradesUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(nameOnlyValidator)
    await repo.updateGrade(params.id, hrmsOrg.id, data.name)
    session.flash('success', 'Grade updated.')
    return response.redirect('/hrms/organization/settings/grades')
  }
  async gradesDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteGrade(params.id, hrmsOrg.id)
    session.flash('success', 'Grade deleted.')
    return response.redirect('/hrms/organization/settings/grades')
  }

  // ── Sections ─────────────────────────────────────────────────────────────────
  async sectionsIndex({ inertia, hrmsOrg }: HttpContext) {
    const [sections, departments] = await Promise.all([
      repo.listSections(hrmsOrg.id),
      repo.listDepartments(hrmsOrg.id),
    ])
    return inertia.render('hrms/organization/settings/sections', {
      sections: sections.map((s) => s.serialize()),
      departments: departments.map((d) => d.serialize()),
    })
  }
  async sectionsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const body = request.body()
    await repo.createSection(hrmsOrg.id, body.name, body.departmentId)
    session.flash('success', 'Section created.')
    return response.redirect('/hrms/organization/settings/sections')
  }
  async sectionsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const body = request.body()
    await repo.updateSection(params.id, hrmsOrg.id, body.name, body.departmentId)
    session.flash('success', 'Section updated.')
    return response.redirect('/hrms/organization/settings/sections')
  }
  async sectionsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteSection(params.id, hrmsOrg.id)
    session.flash('success', 'Section deleted.')
    return response.redirect('/hrms/organization/settings/sections')
  }

  // ── Sub Sections ─────────────────────────────────────────────────────────────
  async subSectionsIndex({ inertia, hrmsOrg }: HttpContext) {
    const [subSections, sections] = await Promise.all([
      repo.listSubSections(hrmsOrg.id),
      repo.listSections(hrmsOrg.id),
    ])
    return inertia.render('hrms/organization/settings/sub-sections', {
      subSections: subSections.map((s) => s.serialize()),
      sections: sections.map((s) => s.serialize()),
    })
  }
  async subSectionsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const body = request.body()
    await repo.createSubSection(hrmsOrg.id, body.name, body.sectionId)
    session.flash('success', 'Sub-section created.')
    return response.redirect('/hrms/organization/settings/sub-sections')
  }
  async subSectionsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const body = request.body()
    await repo.updateSubSection(params.id, hrmsOrg.id, body.name, body.sectionId)
    session.flash('success', 'Sub-section updated.')
    return response.redirect('/hrms/organization/settings/sub-sections')
  }
  async subSectionsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteSubSection(params.id, hrmsOrg.id)
    session.flash('success', 'Sub-section deleted.')
    return response.redirect('/hrms/organization/settings/sub-sections')
  }

  // ── Holidays ─────────────────────────────────────────────────────────────────
  async holidaysIndex({ inertia, hrmsOrg }: HttpContext) {
    const [holidays, divisions, locations] = await Promise.all([
      repo.listHolidays(hrmsOrg.id),
      repo.listDivisions(hrmsOrg.id),
      repo.listLocations(hrmsOrg.id),
    ])
    return inertia.render('hrms/organization/settings/holidays', {
      holidays: holidays.map((h) => h.serialize()),
      divisions: divisions.map((d) => ({ id: d.id, name: d.name, code: d.code })),
      locations: locations.map((l) => ({ id: l.id, name: l.name, code: l.code })),
    })
  }
  async holidaysStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(holidayValidator)
    await repo.createHoliday(hrmsOrg.id, data as any)
    session.flash('success', 'Holiday added.')
    return response.redirect('/hrms/organization/settings/holidays')
  }
  async holidaysUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(holidayValidator)
    await repo.updateHoliday(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Holiday updated.')
    return response.redirect('/hrms/organization/settings/holidays')
  }
  async holidaysDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteHoliday(params.id, hrmsOrg.id)
    session.flash('success', 'Holiday deleted.')
    return response.redirect('/hrms/organization/settings/holidays')
  }

  // ── Notice Periods ───────────────────────────────────────────────────────────
  async noticePeriodIndex({ inertia, hrmsOrg }: HttpContext) {
    const [noticePeriods, designations] = await Promise.all([
      repo.listNoticePeriods(hrmsOrg.id),
      repo.listDesignations(hrmsOrg.id),
    ])
    return inertia.render('hrms/organization/settings/notice-period', {
      noticePeriods: noticePeriods.map((n) => n.serialize()),
      designations: designations.map((d) => ({ id: d.id, name: d.name, code: d.code })),
    })
  }
  async noticePeriodStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(noticePeriodValidator)
    await repo.createNoticePeriod(hrmsOrg.id, data as any)
    session.flash('success', 'Notice period added.')
    return response.redirect('/hrms/organization/settings/notice-period')
  }
  async noticePeriodUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(noticePeriodValidator)
    await repo.updateNoticePeriod(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Notice period updated.')
    return response.redirect('/hrms/organization/settings/notice-period')
  }
  async noticePeriodDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteNoticePeriod(params.id, hrmsOrg.id)
    session.flash('success', 'Notice period deleted.')
    return response.redirect('/hrms/organization/settings/notice-period')
  }

  // ── Approvals ────────────────────────────────────────────────────────────────
  async approvalsIndex({ inertia, hrmsOrg }: HttpContext) {
    const [approvals, designations, divisions] = await Promise.all([
      repo.listApprovals(hrmsOrg.id),
      repo.listDesignations(hrmsOrg.id),
      repo.listDivisions(hrmsOrg.id),
    ])
    return inertia.render('hrms/organization/settings/approvals', {
      approvals: approvals.map((a) => a.serialize()),
      designations: designations.map((d) => ({ id: d.id, name: d.name })),
      divisions: divisions.map((d) => ({ id: d.id, name: d.name })),
    })
  }
  async approvalsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(approvalValidator)
    await repo.createApproval(hrmsOrg.id, data as any)
    session.flash('success', 'Approval workflow added.')
    return response.redirect('/hrms/organization/settings/approvals')
  }
  async approvalsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(approvalValidator)
    await repo.updateApproval(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Approval workflow updated.')
    return response.redirect('/hrms/organization/settings/approvals')
  }
  async approvalsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteApproval(params.id, hrmsOrg.id)
    session.flash('success', 'Approval workflow deleted.')
    return response.redirect('/hrms/organization/settings/approvals')
  }

  // ── Company Documents ────────────────────────────────────────────────────────
  async documentsIndex({ inertia, hrmsOrg }: HttpContext) {
    const documents = await repo.listDocuments(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/documents', { documents: documents.map((d) => d.serialize()) })
  }
  async documentsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(companyDocumentValidator)
    await repo.createDocument(hrmsOrg.id, data as any)
    session.flash('success', 'Document added.')
    return response.redirect('/hrms/organization/settings/documents')
  }
  async documentsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(companyDocumentValidator)
    await repo.updateDocument(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Document updated.')
    return response.redirect('/hrms/organization/settings/documents')
  }
  async documentsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteDocument(params.id, hrmsOrg.id)
    session.flash('success', 'Document deleted.')
    return response.redirect('/hrms/organization/settings/documents')
  }

  // ── Checklists ───────────────────────────────────────────────────────────────
  async checklistsIndex({ inertia, hrmsOrg }: HttpContext) {
    const checklists = await repo.listChecklists(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/checklists', { checklists: checklists.map((c) => c.serialize()) })
  }
  async checklistsStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(checklistValidator)
    await repo.createChecklist(hrmsOrg.id, data as any)
    session.flash('success', 'Checklist created.')
    return response.redirect('/hrms/organization/settings/checklists')
  }
  async checklistsUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(checklistValidator)
    await repo.updateChecklist(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Checklist updated.')
    return response.redirect('/hrms/organization/settings/checklists')
  }
  async checklistsDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteChecklist(params.id, hrmsOrg.id)
    session.flash('success', 'Checklist deleted.')
    return response.redirect('/hrms/organization/settings/checklists')
  }

  // ── Templates ────────────────────────────────────────────────────────────────
  async templatesIndex({ inertia, hrmsOrg }: HttpContext) {
    const templates = await repo.listTemplates(hrmsOrg.id)
    return inertia.render('hrms/organization/settings/templates', { templates: templates.map((t) => t.serialize()) })
  }
  async templatesStore({ request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(templateValidator)
    await repo.createTemplate(hrmsOrg.id, data as any)
    session.flash('success', 'Template created.')
    return response.redirect('/hrms/organization/settings/templates')
  }
  async templatesUpdate({ params, request, response, hrmsOrg, session }: HttpContext) {
    const data = await request.validateUsing(templateValidator)
    await repo.updateTemplate(params.id, hrmsOrg.id, data as any)
    session.flash('success', 'Template updated.')
    return response.redirect('/hrms/organization/settings/templates')
  }
  async templatesDestroy({ params, response, hrmsOrg, session }: HttpContext) {
    await repo.deleteTemplate(params.id, hrmsOrg.id)
    session.flash('success', 'Template deleted.')
    return response.redirect('/hrms/organization/settings/templates')
  }

  // ── Placeholders ─────────────────────────────────────────────────────────────
  async alertsIndex({ inertia }: HttpContext) {
    return inertia.render('hrms/organization/settings/alerts')
  }
  async notificationsIndex({ inertia }: HttpContext) {
    return inertia.render('hrms/organization/settings/notifications')
  }
  async fiscalYearIndex({ inertia, hrmsOrg }: HttpContext) {
    return inertia.render('hrms/organization/settings/fiscal-year', { company: hrmsOrg.serialize() })
  }
}
