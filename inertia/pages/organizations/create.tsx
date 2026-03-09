import { CreateOrgForm, type LeadOwnerOption, type OrgOption } from './add/create-org-form'

interface Props {
  leadOwners: LeadOwnerOption[]
  organizations: OrgOption[]
}

export default function CreateOrganization({ leadOwners, organizations }: Props) {
  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Add Organization</div>
          <div className="ph-sub">Create a new tenant organization — fill in company info, enable modules, and set up the super admin</div>
        </div>
      </div>

      <CreateOrgForm leadOwners={leadOwners} organizations={organizations} />
    </>
  )
}
