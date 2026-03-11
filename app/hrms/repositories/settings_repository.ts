import db from '@adonisjs/lucid/services/db'
import HrmsDivision from '#models/hrms_division'
import HrmsLocation from '#models/hrms_location'
import HrmsDepartment from '#models/hrms_department'
import HrmsSubDepartment from '#models/hrms_sub_department'
import HrmsDesignation from '#models/hrms_designation'
import HrmsGrade from '#models/hrms_grade'
import HrmsSection from '#models/hrms_section'
import HrmsSubSection from '#models/hrms_sub_section'
import HrmsHoliday from '#models/hrms_holiday'
import HrmsNoticePeriod from '#models/hrms_notice_period'
import HrmsApproval from '#models/hrms_approval'
import HrmsCompanyDocument from '#models/hrms_company_document'
import HrmsChecklist from '#models/hrms_checklist'
import HrmsTemplate from '#models/hrms_template'
import HrmsHierarchyNode from '#models/hrms_hierarchy_node'

// ── Code auto-generation helpers ─────────────────────────────────────────────
async function nextCode(table: string, prefix: string, orgId: number): Promise<string> {
  const row = await db
    .from(table)
    .where('org_id', orgId)
    .orderBy('id', 'desc')
    .select('code')
    .first()
  if (!row?.code) return `${prefix}0001`
  const num = parseInt(row.code.replace(prefix, ''), 10)
  return `${prefix}${String(num + 1).padStart(4, '0')}`
}

export default class HrmsSettingsRepository {
  // ── Divisions ───────────────────────────────────────────────────────────────
  async listDivisions(orgId: number) {
    return HrmsDivision.query().where('org_id', orgId).orderBy('code')
  }

  async createDivision(orgId: number, data: Partial<HrmsDivision>) {
    const code = await nextCode('hrms_divisions', 'DIV', orgId)
    return HrmsDivision.create({ ...data, orgId, code, isActive: true })
  }

  async updateDivision(id: number, orgId: number, data: Partial<HrmsDivision>) {
    const div = await HrmsDivision.query().where('id', id).where('org_id', orgId).firstOrFail()
    div.merge(data)
    await div.save()
    return div
  }

  async deleteDivision(id: number, orgId: number) {
    const div = await HrmsDivision.query().where('id', id).where('org_id', orgId).firstOrFail()
    await div.delete()
  }

  async findDivision(id: number, orgId: number) {
    return HrmsDivision.query().where('id', id).where('org_id', orgId).firstOrFail()
  }

  // ── Locations ───────────────────────────────────────────────────────────────
  async listLocations(orgId: number) {
    return HrmsLocation.query().where('org_id', orgId).orderBy('code')
  }

  async createLocation(orgId: number, data: Partial<HrmsLocation>) {
    const code = await nextCode('hrms_locations', 'LOC', orgId)
    return HrmsLocation.create({ ...data, orgId, code, isActive: true })
  }

  async updateLocation(id: number, orgId: number, data: Partial<HrmsLocation>) {
    const loc = await HrmsLocation.query().where('id', id).where('org_id', orgId).firstOrFail()
    loc.merge(data)
    await loc.save()
    return loc
  }

  async deleteLocation(id: number, orgId: number) {
    const loc = await HrmsLocation.query().where('id', id).where('org_id', orgId).firstOrFail()
    await loc.delete()
  }

  // ── Departments ─────────────────────────────────────────────────────────────
  async listDepartments(orgId: number) {
    return HrmsDepartment.query().where('org_id', orgId).orderBy('code')
  }

  async createDepartment(orgId: number, name: string) {
    const code = await nextCode('hrms_departments', 'DEP', orgId)
    return HrmsDepartment.create({ orgId, code, name, isActive: true })
  }

  async updateDepartment(id: number, orgId: number, name: string) {
    const dep = await HrmsDepartment.query().where('id', id).where('org_id', orgId).firstOrFail()
    dep.name = name
    await dep.save()
    return dep
  }

  async deleteDepartment(id: number, orgId: number) {
    const dep = await HrmsDepartment.query().where('id', id).where('org_id', orgId).firstOrFail()
    await dep.delete()
  }

  // ── Sub Departments ─────────────────────────────────────────────────────────
  async listSubDepartments(orgId: number) {
    return HrmsSubDepartment.query().where('org_id', orgId).preload('department').orderBy('code')
  }

  async createSubDepartment(orgId: number, name: string, departmentId?: number) {
    const code = await nextCode('hrms_sub_departments', 'SDEP', orgId)
    return HrmsSubDepartment.create({ orgId, code, name, departmentId: departmentId ?? null, isActive: true })
  }

  async updateSubDepartment(id: number, orgId: number, name: string, departmentId?: number) {
    const dep = await HrmsSubDepartment.query().where('id', id).where('org_id', orgId).firstOrFail()
    dep.name = name
    if (departmentId !== undefined) dep.departmentId = departmentId
    await dep.save()
    return dep
  }

  async deleteSubDepartment(id: number, orgId: number) {
    const dep = await HrmsSubDepartment.query().where('id', id).where('org_id', orgId).firstOrFail()
    await dep.delete()
  }

  // ── Designations ────────────────────────────────────────────────────────────
  async listDesignations(orgId: number) {
    return HrmsDesignation.query().where('org_id', orgId).orderBy('code')
  }

  async createDesignation(orgId: number, name: string) {
    const code = await nextCode('hrms_designations', 'DES', orgId)
    return HrmsDesignation.create({ orgId, code, name, isActive: true })
  }

  async updateDesignation(id: number, orgId: number, name: string) {
    const des = await HrmsDesignation.query().where('id', id).where('org_id', orgId).firstOrFail()
    des.name = name
    await des.save()
    return des
  }

  async deleteDesignation(id: number, orgId: number) {
    const des = await HrmsDesignation.query().where('id', id).where('org_id', orgId).firstOrFail()
    await des.delete()
  }

  // ── Grades ──────────────────────────────────────────────────────────────────
  async listGrades(orgId: number) {
    return HrmsGrade.query().where('org_id', orgId).orderBy('code')
  }

  async createGrade(orgId: number, name: string) {
    const code = await nextCode('hrms_grades', 'GRA', orgId)
    return HrmsGrade.create({ orgId, code, name, isActive: true })
  }

  async updateGrade(id: number, orgId: number, name: string) {
    const grade = await HrmsGrade.query().where('id', id).where('org_id', orgId).firstOrFail()
    grade.name = name
    await grade.save()
    return grade
  }

  async deleteGrade(id: number, orgId: number) {
    const grade = await HrmsGrade.query().where('id', id).where('org_id', orgId).firstOrFail()
    await grade.delete()
  }

  // ── Sections ────────────────────────────────────────────────────────────────
  async listSections(orgId: number) {
    return HrmsSection.query().where('org_id', orgId).preload('department').orderBy('code')
  }

  async createSection(orgId: number, name: string, departmentId?: number) {
    const code = await nextCode('hrms_sections', 'SEC', orgId)
    return HrmsSection.create({ orgId, code, name, departmentId: departmentId ?? null, isActive: true })
  }

  async updateSection(id: number, orgId: number, name: string, departmentId?: number) {
    const sec = await HrmsSection.query().where('id', id).where('org_id', orgId).firstOrFail()
    sec.name = name
    if (departmentId !== undefined) sec.departmentId = departmentId
    await sec.save()
    return sec
  }

  async deleteSection(id: number, orgId: number) {
    const sec = await HrmsSection.query().where('id', id).where('org_id', orgId).firstOrFail()
    await sec.delete()
  }

  // ── Sub Sections ────────────────────────────────────────────────────────────
  async listSubSections(orgId: number) {
    return HrmsSubSection.query().where('org_id', orgId).preload('section').orderBy('code')
  }

  async createSubSection(orgId: number, name: string, sectionId?: number) {
    const code = await nextCode('hrms_sub_sections', 'SSEC', orgId)
    return HrmsSubSection.create({ orgId, code, name, sectionId: sectionId ?? null, isActive: true })
  }

  async updateSubSection(id: number, orgId: number, name: string, sectionId?: number) {
    const sub = await HrmsSubSection.query().where('id', id).where('org_id', orgId).firstOrFail()
    sub.name = name
    if (sectionId !== undefined) sub.sectionId = sectionId
    await sub.save()
    return sub
  }

  async deleteSubSection(id: number, orgId: number) {
    const sub = await HrmsSubSection.query().where('id', id).where('org_id', orgId).firstOrFail()
    await sub.delete()
  }

  // ── Holidays ────────────────────────────────────────────────────────────────
  async listHolidays(orgId: number) {
    return HrmsHoliday.query().where('org_id', orgId).orderBy('date')
  }

  async createHoliday(orgId: number, data: Partial<HrmsHoliday>) {
    return HrmsHoliday.create({ ...data, orgId, isActive: true })
  }

  async updateHoliday(id: number, orgId: number, data: Partial<HrmsHoliday>) {
    const h = await HrmsHoliday.query().where('id', id).where('org_id', orgId).firstOrFail()
    h.merge(data)
    await h.save()
    return h
  }

  async deleteHoliday(id: number, orgId: number) {
    const h = await HrmsHoliday.query().where('id', id).where('org_id', orgId).firstOrFail()
    await h.delete()
  }

  // ── Notice Periods ──────────────────────────────────────────────────────────
  async listNoticePeriods(orgId: number) {
    return HrmsNoticePeriod.query().where('org_id', orgId).preload('designation').orderBy('id')
  }

  async createNoticePeriod(orgId: number, data: Partial<HrmsNoticePeriod>) {
    return HrmsNoticePeriod.create({ ...data, orgId, isActive: true })
  }

  async updateNoticePeriod(id: number, orgId: number, data: Partial<HrmsNoticePeriod>) {
    const np = await HrmsNoticePeriod.query().where('id', id).where('org_id', orgId).firstOrFail()
    np.merge(data)
    await np.save()
    return np
  }

  async deleteNoticePeriod(id: number, orgId: number) {
    const np = await HrmsNoticePeriod.query().where('id', id).where('org_id', orgId).firstOrFail()
    await np.delete()
  }

  // ── Approvals ───────────────────────────────────────────────────────────────
  async listApprovals(orgId: number) {
    return HrmsApproval.query().where('org_id', orgId).orderBy('id')
  }

  async createApproval(orgId: number, data: Partial<HrmsApproval>) {
    return HrmsApproval.create({ ...data, orgId, isActive: true })
  }

  async updateApproval(id: number, orgId: number, data: Partial<HrmsApproval>) {
    const ap = await HrmsApproval.query().where('id', id).where('org_id', orgId).firstOrFail()
    ap.merge(data)
    await ap.save()
    return ap
  }

  async deleteApproval(id: number, orgId: number) {
    const ap = await HrmsApproval.query().where('id', id).where('org_id', orgId).firstOrFail()
    await ap.delete()
  }

  // ── Company Documents ───────────────────────────────────────────────────────
  async listDocuments(orgId: number) {
    return HrmsCompanyDocument.query().where('org_id', orgId).orderBy('name')
  }

  async createDocument(orgId: number, data: Partial<HrmsCompanyDocument>) {
    return HrmsCompanyDocument.create({ ...data, orgId, isActive: true })
  }

  async updateDocument(id: number, orgId: number, data: Partial<HrmsCompanyDocument>) {
    const doc = await HrmsCompanyDocument.query().where('id', id).where('org_id', orgId).firstOrFail()
    doc.merge(data)
    await doc.save()
    return doc
  }

  async deleteDocument(id: number, orgId: number) {
    const doc = await HrmsCompanyDocument.query().where('id', id).where('org_id', orgId).firstOrFail()
    await doc.delete()
  }

  // ── Checklists ──────────────────────────────────────────────────────────────
  async listChecklists(orgId: number) {
    return HrmsChecklist.query().where('org_id', orgId).orderBy('name')
  }

  async createChecklist(orgId: number, data: Partial<HrmsChecklist>) {
    return HrmsChecklist.create({ ...data, orgId, isActive: true })
  }

  async updateChecklist(id: number, orgId: number, data: Partial<HrmsChecklist>) {
    const cl = await HrmsChecklist.query().where('id', id).where('org_id', orgId).firstOrFail()
    cl.merge(data)
    await cl.save()
    return cl
  }

  async deleteChecklist(id: number, orgId: number) {
    const cl = await HrmsChecklist.query().where('id', id).where('org_id', orgId).firstOrFail()
    await cl.delete()
  }

  // ── Templates ───────────────────────────────────────────────────────────────
  async listTemplates(orgId: number) {
    return HrmsTemplate.query().where('org_id', orgId).orderBy('name')
  }

  async createTemplate(orgId: number, data: Partial<HrmsTemplate>) {
    return HrmsTemplate.create({ ...data, orgId, isActive: true })
  }

  async updateTemplate(id: number, orgId: number, data: Partial<HrmsTemplate>) {
    const tmpl = await HrmsTemplate.query().where('id', id).where('org_id', orgId).firstOrFail()
    tmpl.merge(data)
    await tmpl.save()
    return tmpl
  }

  async deleteTemplate(id: number, orgId: number) {
    const tmpl = await HrmsTemplate.query().where('id', id).where('org_id', orgId).firstOrFail()
    await tmpl.delete()
  }

  // ── Hierarchy ───────────────────────────────────────────────────────────────
  async listHierarchy(orgId: number) {
    return HrmsHierarchyNode.query()
      .where('org_id', orgId)
      .preload('employee')
      .preload('children', (q) => q.preload('employee').preload('children', (q2) => q2.preload('employee')))
      .whereNull('parent_id')
      .orderBy('sort_order')
  }

  async createHierarchyNode(orgId: number, data: Partial<HrmsHierarchyNode>) {
    return HrmsHierarchyNode.create({ ...data, orgId })
  }

  async updateHierarchyNode(id: number, orgId: number, data: Partial<HrmsHierarchyNode>) {
    const node = await HrmsHierarchyNode.query().where('id', id).where('org_id', orgId).firstOrFail()
    node.merge(data)
    await node.save()
    return node
  }

  async deleteHierarchyNode(id: number, orgId: number) {
    const node = await HrmsHierarchyNode.query().where('id', id).where('org_id', orgId).firstOrFail()
    // Re-parent children to grandfather
    await HrmsHierarchyNode.query()
      .where('parent_id', id)
      .update({ parent_id: node.parentId })
    await node.delete()
  }
}
