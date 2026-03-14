import { X, Building2 } from 'lucide-react'
import { CreateOrgForm, type UserOption, type OrgOption } from './create-org-form'

interface CreateOrgModalProps {
  isOpen: boolean
  onClose: () => void
  users: UserOption[]
  organizations: OrgOption[]
}

export function CreateOrgModal({ isOpen, onClose, users, organizations }: CreateOrgModalProps) {
  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes orgModalBdIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes orgModalSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .org-create-backdrop { animation: orgModalBdIn .2s ease forwards; }
        .org-create-sheet { animation: orgModalSlideIn .28s cubic-bezier(0.34,1.1,0.64,1) forwards; }
      `}</style>

      <div
        className="org-create-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 800,
          background: 'rgba(0,0,0,.52)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '20px 16px', overflowY: 'auto',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="org-create-sheet"
          style={{
            background: 'var(--bg)', width: '100%', maxWidth: 860,
            borderRadius: 18, boxShadow: '0 32px 80px rgba(0,0,0,.32)',
            border: '1px solid var(--border)', overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          {/* Modal header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--p-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={15} style={{ color: 'var(--p)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text1)', fontFamily: 'var(--fd)' }}>Add Organization</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>Create a new tenant organization</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, flexShrink: 0, transition: 'background .12s' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Form content */}
          <div style={{ padding: '0 20px 20px' }}>
            <CreateOrgForm users={users} organizations={organizations} />
          </div>
        </div>
      </div>
    </>
  )
}
