import type { HttpContext } from '@adonisjs/core/http'
import OrganizationUser from '#models/organization_user'
import HrmsDivision from '#models/hrms_division'
import HrmsDepartment from '#models/hrms_department'
import HrmsDesignation from '#models/hrms_designation'

export default class HrmsHierarchyController {
  // ── Filter/Index page ──────────────────────────────────────────────────────
  async index({ inertia, hrmsOrg }: HttpContext) {
    const divisions = await HrmsDivision.query()
      .where('org_id', hrmsOrg.id)
      .where('is_active', true)
      .orderBy('name')

    return inertia.render('hrms/organization/hierarchy/index', {
      divisions: divisions.map((d) => ({ id: d.id, code: d.code, name: d.name })),
    })
  }

  // ── Chart page — dynamic tree from reporting_to_id ─────────────────────────
  async chart({ inertia, request, hrmsOrg }: HttpContext) {
    const { divisionId: divIdStr, departmentId: deptIdStr } = request.qs()
    const divisionId   = divIdStr  ? Number(divIdStr)  : null
    const departmentId = deptIdStr ? Number(deptIdStr) : null

    if (!divisionId) {
      return inertia.render('hrms/organization/hierarchy/index', { divisions: [] })
    }

    const [allEmployees, departments, division, designations] = await Promise.all([
      OrganizationUser.query()
        .where('org_id', hrmsOrg.id)
        .where('is_active', true)
        .where('division_id', divisionId)
        .orderBy('full_name'),
      HrmsDepartment.query()
        .where('org_id', hrmsOrg.id)
        .where('is_active', true)
        .orderBy('name'),
      HrmsDivision.query()
        .where('id', divisionId)
        .where('org_id', hrmsOrg.id)
        .first(),
      HrmsDesignation.query()
        .where('org_id', hrmsOrg.id)
        .where('is_active', true),
    ])

    const desMap  = new Map(designations.map((d) => [d.id, d.name]))
    const deptMap = new Map(departments.map((d) => [d.id, d.name]))
    const empById = new Map(allEmployees.map((e) => [e.id, e]))

    // If filtering by department, keep dept employees + their ancestors up to root
    let visibleEmps = allEmployees
    if (departmentId) {
      const deptEmpIds = new Set(
        allEmployees.filter((e) => e.departmentId === departmentId).map((e) => e.id)
      )
      const keepIds = new Set(deptEmpIds)
      function addAncestors(id: number) {
        const emp = empById.get(id)
        if (!emp?.reportingToId || keepIds.has(emp.reportingToId)) return
        keepIds.add(emp.reportingToId)
        addAncestors(emp.reportingToId)
      }
      ;[...deptEmpIds].forEach((id) => addAncestors(id))
      visibleEmps = allEmployees.filter((e) => keepIds.has(e.id))
    }

    // Departments that have at least one employee in this division
    const divDeptIds    = new Set(allEmployees.map((e) => e.departmentId).filter(Boolean) as number[])
    const divisionDepts = departments.filter((d) => divDeptIds.has(d.id))

    const mapEmp = (e: (typeof allEmployees)[0]) => ({
      id: e.id,
      fullName: e.fullName,
      employeeCode: e.employeeCode,
      designationName: e.designationId ? (desMap.get(e.designationId) ?? null) : null,
      departmentName:  e.departmentId  ? (deptMap.get(e.departmentId)  ?? null) : null,
      reportingToId:   e.reportingToId,
    })

    return inertia.render('hrms/organization/hierarchy/chart', {
      employees:    visibleEmps.map(mapEmp),
      allEmployees: allEmployees.map(mapEmp),
      departments:  divisionDepts.map((d) => ({ id: d.id, code: d.code, name: d.name })),
      division:     division ? { id: division.id, code: division.code, name: division.name } : null,
      divisionId,
      departmentId,
    })
  }

  // ── Update reporting relationship ──────────────────────────────────────────
  async setParent({ params, request, response, hrmsOrg, session }: HttpContext) {
    const { reportingToId, divisionId } = request.only(['reportingToId', 'divisionId'])
    const employee = await OrganizationUser.query()
      .where('id', params.id)
      .where('org_id', hrmsOrg.id)
      .firstOrFail()
    employee.reportingToId = (reportingToId !== null && reportingToId !== undefined && reportingToId !== '')
      ? Number(reportingToId)
      : null
    await employee.save()
    session.flash('success', 'Hierarchy updated.')
    return response.redirect(`/hrms/organization/hierarchy/chart?divisionId=${divisionId ?? ''}`)
  }
}
