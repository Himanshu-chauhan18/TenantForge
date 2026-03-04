import { CreateOrgForm, type UserOption, type OrgOption } from '~/components/organizations/create-org-form'

interface Props {
  users: UserOption[]
  organizations: OrgOption[]
}

export default function CreateOrganization({ users, organizations }: Props) {
  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Add Organization</div>
          <div className="ph-sub">Create a new tenant organization — fill in company info, enable modules, and set up the super admin</div>
        </div>
      </div>

      <CreateOrgForm users={users} organizations={organizations} />
    </>
  )
}
