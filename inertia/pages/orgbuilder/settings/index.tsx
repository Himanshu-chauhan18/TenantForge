import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
  User, Shield, Sliders, Building2, Users,
  Mail, KeyRound, Smartphone, CheckCircle2,
  XCircle, ExternalLink, AlertTriangle, Eye, EyeOff,
  Lock, Globe, Save, ChevronRight, Info,
  Plus, Pencil, Power, RefreshCw, Search, X,
} from 'lucide-react'
import { Modal } from '~/components/modal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SettingsUser {
  id: number
  fullName: string | null
  email: string
  hasPassword: boolean
  hasGoogle: boolean
  totpVerified: boolean
  initials: string
}

interface PlatformUser {
  id: number
  fullName: string | null
  email: string
  hasPassword: boolean
  hasGoogle: boolean
  totpVerified: boolean
  isActive: boolean
  initials: string
  createdAt: string
}

interface Platform {
  loginMethod: 'password' | 'google' | 'both'
  totpRequired: boolean
}

interface OrgDefaults {
  trialDays: number
  userLimit: number
  plan: 'trial' | 'premium'
}

interface Props {
  settingsUser: SettingsUser
  platform: Platform
  orgDefaults: OrgDefaults
  users: PlatformUser[]
}

// ── Section definitions ────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'profile',      label: 'My Profile',    icon: <User      size={14} />, desc: 'Name & account info' },
  { key: 'security',     label: 'Security',       icon: <Shield    size={14} />, desc: 'Password & 2FA' },
  { key: 'users',        label: 'Users',          icon: <Users     size={14} />, desc: 'Platform user accounts' },
  { key: 'platform',     label: 'Platform',       icon: <Sliders   size={14} />, desc: 'Login & access control' },
  { key: 'org-defaults', label: 'Org Defaults',   icon: <Building2 size={14} />, desc: 'Default org settings' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: '.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', whiteSpace: 'nowrap', background: 'var(--bg)', borderBottom: '1px solid var(--border)', ...style }}>
      {children}
    </th>
  )
}

function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '10px 14px', verticalAlign: 'middle', borderBottom: '1px solid var(--border)', ...style }}>
      {children}
    </td>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsIndex({ settingsUser, platform, orgDefaults, users }: Props) {
  const urlObj     = new URL(window.location.href)
  const currentSec = urlObj.searchParams.get('s') || 'profile'

  function goSection(key: string) {
    router.get('/orgbuilder/settings', { s: key }, { preserveState: false, replace: true })
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(settingsUser.fullName ?? '')
  const [profileSaving, setProfileSaving] = useState(false)

  function saveProfile() {
    setProfileSaving(true)
    router.put('/orgbuilder/settings/profile', { fullName: profileName }, {
      onFinish: () => setProfileSaving(false),
    })
  }

  // ── Password ──────────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

  function savePassword() {
    setPwSaving(true)
    router.put('/orgbuilder/settings/password', pwForm, {
      onSuccess: () => setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }),
      onFinish:  () => setPwSaving(false),
    })
  }

  // ── 2FA ───────────────────────────────────────────────────────────────────
  const [disableTotpOpen, setDisableTotpOpen] = useState(false)
  const [totpDisabling,   setTotpDisabling]   = useState(false)

  function handleDisableTotp() {
    setTotpDisabling(true)
    router.delete('/orgbuilder/settings/totp', {
      onSuccess: () => setDisableTotpOpen(false),
      onFinish:  () => setTotpDisabling(false),
    })
  }

  // ── Platform ──────────────────────────────────────────────────────────────
  const [loginMethod,   setLoginMethod]   = useState(platform.loginMethod)
  const [totpRequired,  setTotpRequired]  = useState(platform.totpRequired)
  const [platformSaving, setPlatformSaving] = useState(false)

  function savePlatform() {
    setPlatformSaving(true)
    router.put('/orgbuilder/settings/platform', { loginMethod, totpRequired }, {
      onFinish: () => setPlatformSaving(false),
    })
  }

  // ── Org Defaults ──────────────────────────────────────────────────────────
  const [orgForm, setOrgForm] = useState({
    trialDays: String(orgDefaults.trialDays),
    userLimit: String(orgDefaults.userLimit),
    plan:      orgDefaults.plan,
  })
  const [orgSaving, setOrgSaving] = useState(false)

  function saveOrgDefaults() {
    setOrgSaving(true)
    router.put('/orgbuilder/settings/org-defaults', {
      trialDays: Number(orgForm.trialDays),
      userLimit: Number(orgForm.userLimit),
      plan:      orgForm.plan,
    }, {
      onFinish: () => setOrgSaving(false),
    })
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  const [userSearch, setUserSearch] = useState('')

  // Add user modal
  const emptyAddForm = () => ({ fullName: '', email: '', password: '', showPw: false })
  const [addUserOpen,    setAddUserOpen]    = useState(false)
  const [addUserForm,    setAddUserForm]    = useState(emptyAddForm())
  const [addUserSaving,  setAddUserSaving]  = useState(false)

  function handleAddUser() {
    setAddUserSaving(true)
    router.post('/orgbuilder/settings/users', {
      fullName: addUserForm.fullName,
      email:    addUserForm.email,
      password: addUserForm.password,
    }, {
      onSuccess: () => { setAddUserOpen(false); setAddUserForm(emptyAddForm()) },
      onFinish:  () => setAddUserSaving(false),
    })
  }

  // Edit user modal
  const [editUserOpen,   setEditUserOpen]   = useState(false)
  const [editUserTarget, setEditUserTarget] = useState<PlatformUser | null>(null)
  const [editUserName,   setEditUserName]   = useState('')
  const [editUserSaving, setEditUserSaving] = useState(false)

  function openEditUser(u: PlatformUser) {
    setEditUserTarget(u)
    setEditUserName(u.fullName ?? '')
    setEditUserOpen(true)
  }

  function handleEditUser() {
    if (!editUserTarget) return
    setEditUserSaving(true)
    router.put(`/orgbuilder/settings/users/${editUserTarget.id}`, { fullName: editUserName }, {
      onSuccess: () => { setEditUserOpen(false); setEditUserTarget(null) },
      onFinish:  () => setEditUserSaving(false),
    })
  }

  // Reset password modal
  const [resetPwOpen,    setResetPwOpen]    = useState(false)
  const [resetPwTarget,  setResetPwTarget]  = useState<PlatformUser | null>(null)
  const [resetPwVal,     setResetPwVal]     = useState('')
  const [resetPwShow,    setResetPwShow]    = useState(false)
  const [resetPwSaving,  setResetPwSaving]  = useState(false)

  function openResetPw(u: PlatformUser) {
    setResetPwTarget(u)
    setResetPwVal('')
    setResetPwShow(false)
    setResetPwOpen(true)
  }

  function handleResetPw() {
    if (!resetPwTarget) return
    setResetPwSaving(true)
    router.put(`/orgbuilder/settings/users/${resetPwTarget.id}/reset-password`, { newPassword: resetPwVal }, {
      onSuccess: () => { setResetPwOpen(false); setResetPwTarget(null) },
      onFinish:  () => setResetPwSaving(false),
    })
  }

  // Toggle active
  const [toggleTarget,  setToggleTarget]  = useState<PlatformUser | null>(null)
  const [toggleOpen,    setToggleOpen]    = useState(false)
  const [toggleSaving,  setToggleSaving]  = useState(false)

  function openToggle(u: PlatformUser) {
    setToggleTarget(u)
    setToggleOpen(true)
  }

  function handleToggle() {
    if (!toggleTarget) return
    setToggleSaving(true)
    router.put(`/orgbuilder/settings/users/${toggleTarget.id}/toggle`, {}, {
      onSuccess: () => { setToggleOpen(false); setToggleTarget(null) },
      onFinish:  () => setToggleSaving(false),
    })
  }

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return (u.fullName ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Settings</div>
          <div className="ph-sub">Manage your account, security, and platform preferences</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

        {/* ── Left section nav ─────────────────────────────────────────────── */}
        <div className="card" style={{ width: 210, flexShrink: 0, position: 'sticky', top: 16 }}>
          {/* User summary */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="av av-sq" style={{ width: 36, height: 36, fontSize: '.75rem', borderRadius: 10, flexShrink: 0 }}>
              {settingsUser.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {settingsUser.fullName || 'Admin'}
              </div>
              <div style={{ fontSize: '.66rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {settingsUser.email}
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ padding: '6px' }}>
            {SECTIONS.map((s) => {
              const active = currentSec === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => goSection(s.key)}
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: '7px 10px', borderRadius: 8, background: active ? 'var(--p-lt)' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, transition: 'background .12s' }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)' }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <span style={{ color: active ? 'var(--p)' : 'var(--text3)', flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: active ? 700 : 500, color: active ? 'var(--p)' : 'var(--text1)' }}>{s.label}</div>
                    <div style={{ fontSize: '.64rem', color: 'var(--text4)' }}>{s.desc}</div>
                  </div>
                  {active && <ChevronRight size={11} style={{ color: 'var(--p)', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right content area ───────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ════ PROFILE SECTION ════ */}
          {currentSec === 'profile' && (
            <>
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="card-h">
                  <div>
                    <div className="card-title">Personal Information</div>
                    <div className="card-sub">Update your display name and view account details</div>
                  </div>
                </div>
                <div className="card-b">
                  {/* Avatar row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <div className="av av-sq" style={{ width: 48, height: 48, fontSize: '1rem', borderRadius: 14, flexShrink: 0, boxShadow: '0 2px 10px var(--p-ring)' }}>
                      {settingsUser.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--text1)', fontFamily: 'var(--fd)' }}>
                        {settingsUser.fullName || 'Administrator'}
                      </div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                        {settingsUser.hasGoogle && (
                          <span className="bdg bdg-teal"><Globe size={9} /> Google Connected</span>
                        )}
                        {settingsUser.hasPassword && (
                          <span className="bdg bdg-green"><KeyRound size={9} /> Password Set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="g2" style={{ marginBottom: 16 }}>
                    <div className="fg">
                      <label>Full Name</label>
                      <input
                        className="fi"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="fg">
                      <label>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="fi"
                          value={settingsUser.email}
                          readOnly
                          style={{ paddingLeft: 34, background: 'var(--bg)', color: 'var(--text3)', cursor: 'not-allowed' }}
                        />
                        <Mail size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
                      </div>
                      <div className="fg-hint">Email cannot be changed.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-p btn-sm" disabled={profileSaving || !profileName.trim()} onClick={saveProfile}>
                      <Save size={13} /> {profileSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-h">
                  <div>
                    <div className="card-title">Linked Accounts</div>
                    <div className="card-sub">External accounts connected to your profile</div>
                  </div>
                </div>
                <div style={{ padding: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text3)' }}>
                      <Globe size={15} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text1)' }}>Google Account</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>
                        {settingsUser.hasGoogle ? 'Your account is linked to Google OAuth' : 'Not connected — sign in with Google to link'}
                      </div>
                    </div>
                    <span className={`bdg ${settingsUser.hasGoogle ? 'bdg-green' : 'bdg-gray'}`}>
                      <span className="bdg-dot" />{settingsUser.hasGoogle ? 'Connected' : 'Not linked'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text3)' }}>
                      <KeyRound size={15} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text1)' }}>Password Sign-in</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>
                        {settingsUser.hasPassword ? 'Email & password login is enabled' : 'No password set — Google sign-in only'}
                      </div>
                    </div>
                    <span className={`bdg ${settingsUser.hasPassword ? 'bdg-green' : 'bdg-gray'}`}>
                      <span className="bdg-dot" />{settingsUser.hasPassword ? 'Enabled' : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════ SECURITY SECTION ════ */}
          {currentSec === 'security' && (
            <>
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="card-h">
                  <div>
                    <div className="card-title">Two-Factor Authentication</div>
                    <div className="card-sub">Secure your account with an authenticator app</div>
                  </div>
                  <span className={`bdg ${settingsUser.totpVerified ? 'bdg-green' : 'bdg-gray'}`}>
                    <span className="bdg-dot" />{settingsUser.totpVerified ? '2FA Active' : '2FA Disabled'}
                  </span>
                </div>
                <div className="card-b">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: settingsUser.totpVerified ? 'rgba(16,185,129,.12)' : 'var(--bg2)', color: settingsUser.totpVerified ? '#10b981' : 'var(--text3)' }}>
                      <Smartphone size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>Authenticator App</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text3)', lineHeight: 1.5, marginBottom: 12 }}>
                        {settingsUser.totpVerified
                          ? 'Two-factor authentication is active. A time-based code is required on each login.'
                          : 'Protect your account with a time-based one-time password. Works with Google Authenticator, Authy, and more.'}
                      </div>
                      {settingsUser.totpVerified ? (
                        <button className="btn btn-danger btn-sm" onClick={() => setDisableTotpOpen(true)}>
                          <XCircle size={12} /> Disable 2FA
                        </button>
                      ) : (
                        <a href="/auth/totp/setup" className="btn btn-p btn-sm" style={{ textDecoration: 'none' }}>
                          <Smartphone size={12} /> Set Up 2FA <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-h">
                  <div>
                    <div className="card-title">Change Password</div>
                    <div className="card-sub">
                      {settingsUser.hasPassword ? 'Update your login password' : 'No password set — account uses Google sign-in only'}
                    </div>
                  </div>
                </div>
                <div className="card-b">
                  {!settingsUser.hasPassword ? (
                    <div className="alert alert-info" style={{ marginBottom: 0 }}>
                      <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>Your account is linked to Google. Password sign-in is not available.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="fg">
                        <label>Current Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            className="fi"
                            type={showPw.current ? 'text' : 'password'}
                            value={pwForm.currentPassword}
                            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                            placeholder="Enter current password"
                            style={{ paddingRight: 38 }}
                          />
                          <button type="button" onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex' }}>
                            {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="g2">
                        <div className="fg">
                          <label>New Password</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              className="fi"
                              type={showPw.new ? 'text' : 'password'}
                              value={pwForm.newPassword}
                              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                              placeholder="At least 8 characters"
                              style={{ paddingRight: 38 }}
                            />
                            <button type="button" onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex' }}>
                              {showPw.new ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                        <div className="fg">
                          <label>Confirm Password</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              className="fi"
                              type={showPw.confirm ? 'text' : 'password'}
                              value={pwForm.confirmPassword}
                              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                              placeholder="Repeat new password"
                              style={{ paddingRight: 38 }}
                            />
                            <button type="button" onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex' }}>
                              {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {pwForm.newPassword && <PasswordStrength password={pwForm.newPassword} />}

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-p btn-sm"
                          disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                          onClick={savePassword}
                        >
                          <Lock size={13} /> {pwSaving ? 'Updating…' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ════ USERS SECTION ════ */}
          {currentSec === 'users' && (
            <div className="card">
              <div className="card-h">
                <div>
                  <div className="card-title">Platform Users</div>
                  <div className="card-sub">Manage admin accounts that can access TenantForge</div>
                </div>
                <button className="btn btn-p btn-sm" onClick={() => { setAddUserForm(emptyAddForm()); setAddUserOpen(true) }}>
                  <Plus size={13} /> Add User
                </button>
              </div>

              {/* Toolbar */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="sb-inp" style={{ flex: 1, maxWidth: 300 }}>
                  <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email…"
                  />
                  {userSearch && (
                    <button type="button" onClick={() => setUserSearch('')}>
                      <X size={12} style={{ color: 'var(--text3)' }} />
                    </button>
                  )}
                </div>
                <button className="btn btn-ghost" style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }} onClick={() => router.reload()}>
                  <RefreshCw size={13} />
                </button>
                <div style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--text3)' }}>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text4)' }}>
                    <Users size={32} style={{ opacity: .18, color: 'var(--text3)', marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>No users found</div>
                    <div style={{ fontSize: '.77rem' }}>{userSearch ? 'Try a different search term.' : 'Add your first platform user.'}</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                    <thead>
                      <tr>
                        <Th>User</Th>
                        <Th>Auth Methods</Th>
                        <Th style={{ textAlign: 'center' }}>2FA</Th>
                        <Th style={{ textAlign: 'center' }}>Status</Th>
                        <Th style={{ textAlign: 'right' }}>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const isSelf = u.id === settingsUser.id
                        return (
                          <tr key={u.id}
                            style={{ background: 'var(--surface)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'var(--p-lt)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface)')}
                          >
                            <Td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="av av-sq" style={{ width: 32, height: 32, fontSize: '.68rem', borderRadius: 9, flexShrink: 0, opacity: u.isActive ? 1 : .45 }}>
                                  {u.initials}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: u.isActive ? 'var(--text1)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {u.fullName || '—'}
                                    {isSelf && <span className="bdg bdg-teal" style={{ fontSize: '.6rem' }}>You</span>}
                                  </div>
                                  <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{u.email}</div>
                                </div>
                              </div>
                            </Td>
                            <Td>
                              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                {u.hasPassword && (
                                  <span className="bdg bdg-gray" style={{ fontSize: '.65rem' }}><KeyRound size={9} /> Password</span>
                                )}
                                {u.hasGoogle && (
                                  <span className="bdg bdg-teal" style={{ fontSize: '.65rem' }}><Globe size={9} /> Google</span>
                                )}
                                {!u.hasPassword && !u.hasGoogle && (
                                  <span style={{ fontSize: '.72rem', color: 'var(--text4)' }}>—</span>
                                )}
                              </div>
                            </Td>
                            <Td style={{ textAlign: 'center' }}>
                              {u.totpVerified
                                ? <span className="bdg bdg-green" style={{ fontSize: '.65rem' }}><CheckCircle2 size={9} /> Active</span>
                                : <span style={{ color: 'var(--text4)', fontSize: '.75rem' }}>—</span>}
                            </Td>
                            <Td style={{ textAlign: 'center' }}>
                              <span className={`bdg ${u.isActive ? 'bdg-green' : 'bdg-gray'}`}>
                                <span className="bdg-dot" />{u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </Td>
                            <Td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => openEditUser(u)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 6, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }}
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                                {u.hasPassword && (
                                  <button
                                    onClick={() => openResetPw(u)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 6, fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer' }}
                                  >
                                    <RefreshCw size={11} /> Reset PW
                                  </button>
                                )}
                                {!isSelf && (
                                  <button
                                    onClick={() => openToggle(u)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 6, fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg2)', color: u.isActive ? 'var(--danger)' : 'var(--s)' }}
                                  >
                                    <Power size={11} /> {u.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                )}
                              </div>
                            </Td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ════ PLATFORM SECTION ════ */}
          {currentSec === 'platform' && (
            <div className="card">
              <div className="card-h">
                <div>
                  <div className="card-title">Login & Access Control</div>
                  <div className="card-sub">Control how users authenticate into the platform</div>
                </div>
              </div>
              <div className="card-b">
                <label style={{ marginBottom: 10 }}>Authentication Method</label>
                <div className="radio-g" style={{ flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {([
                    { value: 'password', icon: <KeyRound size={14} />, title: 'Password Only', desc: 'Users sign in with email & password only' },
                    { value: 'google',   icon: <Globe    size={14} />, title: 'Google Only',   desc: 'Users sign in via Google OAuth only' },
                    { value: 'both',     icon: <CheckCircle2 size={14} />, title: 'Both Methods', desc: 'Both password and Google sign-in allowed' },
                  ] as const).map((m) => (
                    <div key={m.value} className={`rc${loginMethod === m.value ? ' on' : ''}`} onClick={() => setLoginMethod(m.value)}>
                      <input type="radio" name="loginMethod" value={m.value} checked={loginMethod === m.value} readOnly />
                      <div className="rc-dot" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <span style={{ color: loginMethod === m.value ? 'var(--p)' : 'var(--text3)' }}>{m.icon}</span>
                        <div>
                          <div className="rc-title">{m.title}</div>
                          <div className="rc-desc">{m.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-warn" style={{ marginBottom: 14 }}>
                  <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Changing the login method affects all users. Switching to "Google Only" will prevent password-only users from signing in.</span>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 16px' }} />

                <label style={{ marginBottom: 8, display: 'block' }}>Two-Factor Authentication (2FA)</label>
                <div
                  onClick={() => setTotpRequired((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, border: `1px solid ${totpRequired ? 'var(--p-mid)' : 'var(--border)'}`, background: totpRequired ? 'var(--p-lt)' : 'var(--bg)', cursor: 'pointer', marginBottom: 14, transition: 'all .15s' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: totpRequired ? 'var(--p)' : 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}>
                    <Smartphone size={17} style={{ color: totpRequired ? '#fff' : 'var(--text3)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)' }}>Require 2FA for all users</div>
                    <div style={{ fontSize: '.73rem', color: 'var(--text3)', marginTop: 2 }}>
                      {totpRequired
                        ? 'Users must set up and verify a TOTP authenticator app before accessing the platform.'
                        : '2FA is optional — users can log in without setting up an authenticator app.'}
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <div style={{ width: 42, height: 24, borderRadius: 12, background: totpRequired ? 'var(--p)' : 'var(--bg2)', border: `1px solid ${totpRequired ? 'var(--p)' : 'var(--border)'}`, position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
                    <div style={{ position: 'absolute', top: 3, left: totpRequired ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .15s' }} />
                  </div>
                </div>

                {totpRequired && (
                  <div className="alert alert-warn" style={{ marginBottom: 14 }}>
                    <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>When enabled, users without 2FA set up will be <strong>forced to configure it</strong> on their next login before they can access the platform.</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-p btn-sm" disabled={platformSaving} onClick={savePlatform}>
                    <Save size={13} /> {platformSaving ? 'Saving…' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ ORG DEFAULTS SECTION ════ */}
          {currentSec === 'org-defaults' && (
            <div className="card">
              <div className="card-h">
                <div>
                  <div className="card-title">Organization Defaults</div>
                  <div className="card-sub">Default values applied when creating a new organization</div>
                </div>
              </div>
              <div className="card-b">
                <div className="g2" style={{ marginBottom: 14 }}>
                  <div className="fg">
                    <label>Default Trial Period (days)</label>
                    <input
                      className="fi"
                      type="number"
                      min={1}
                      max={365}
                      value={orgForm.trialDays}
                      onChange={(e) => setOrgForm((f) => ({ ...f, trialDays: e.target.value }))}
                    />
                    <div className="fg-hint">How many days a new org gets on trial plan</div>
                  </div>
                  <div className="fg">
                    <label>Default User Limit</label>
                    <input
                      className="fi"
                      type="number"
                      min={1}
                      max={10000}
                      value={orgForm.userLimit}
                      onChange={(e) => setOrgForm((f) => ({ ...f, userLimit: e.target.value }))}
                    />
                    <div className="fg-hint">Maximum users per org when created</div>
                  </div>
                </div>

                <div className="fg" style={{ marginBottom: 14 }}>
                  <label>Default Plan Type</label>
                  <div className="radio-g">
                    {([
                      { value: 'trial',   title: 'Trial',   desc: 'Limited time access' },
                      { value: 'premium', title: 'Premium', desc: 'Full paid access' },
                    ] as const).map((p) => (
                      <div key={p.value} className={`rc${orgForm.plan === p.value ? ' on' : ''}`} onClick={() => setOrgForm((f) => ({ ...f, plan: p.value }))}>
                        <input type="radio" name="plan" value={p.value} checked={orgForm.plan === p.value} readOnly />
                        <div className="rc-dot" />
                        <div>
                          <div className="rc-title">{p.title}</div>
                          <div className="rc-desc">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="alert alert-info" style={{ marginBottom: 14 }}>
                  <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>These defaults only apply to <strong>newly created</strong> organizations. Existing organizations are not affected.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-p btn-sm" disabled={orgSaving} onClick={saveOrgDefaults}>
                    <Save size={13} /> {orgSaving ? 'Saving…' : 'Save Defaults'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════ DISABLE TOTP CONFIRM ════ */}
      <Modal
        open={disableTotpOpen}
        onClose={() => setDisableTotpOpen(false)}
        title="Disable Two-Factor Authentication"
        variant="danger"
        size="sm"
        icon={<AlertTriangle size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDisableTotpOpen(false)}>Cancel</button>
            <button className="btn btn-danger" disabled={totpDisabling} onClick={handleDisableTotp}>
              <XCircle size={13} /> {totpDisabling ? 'Disabling…' : 'Disable 2FA'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.83rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          Are you sure you want to disable two-factor authentication?{' '}
          <strong style={{ color: 'var(--text1)' }}>Your account will be less secure.</strong>{' '}
          You can re-enable it at any time from Security settings.
        </p>
      </Modal>

      {/* ════ ADD USER MODAL ════ */}
      <Modal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        title="Add Platform User"
        icon={<Plus size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddUserOpen(false)}>Cancel</button>
            <button
              className="btn btn-p"
              disabled={addUserSaving || !addUserForm.fullName.trim() || !addUserForm.email.trim() || addUserForm.password.length < 8}
              onClick={handleAddUser}
            >
              <Plus size={13} /> {addUserSaving ? 'Creating…' : 'Create User'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="g2">
            <div className="fg">
              <label>Full Name <span className="req">*</span></label>
              <input className="fi" value={addUserForm.fullName} onChange={(e) => setAddUserForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="John Smith" autoFocus />
            </div>
            <div className="fg">
              <label>Email Address <span className="req">*</span></label>
              <input className="fi" type="email" value={addUserForm.email} onChange={(e) => setAddUserForm((f) => ({ ...f, email: e.target.value }))} placeholder="john@company.com" />
            </div>
          </div>
          <div className="fg">
            <label>Password <span className="req">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                className="fi"
                type={addUserForm.showPw ? 'text' : 'password'}
                value={addUserForm.password}
                onChange={(e) => setAddUserForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="At least 8 characters"
                style={{ paddingRight: 38 }}
              />
              <button type="button" onClick={() => setAddUserForm((f) => ({ ...f, showPw: !f.showPw }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex' }}>
                {addUserForm.showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {addUserForm.password && <PasswordStrength password={addUserForm.password} />}
          </div>
          <div className="alert alert-info" style={{ marginBottom: 0 }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>This creates a platform admin account. The user can also link Google later.</span>
          </div>
        </div>
      </Modal>

      {/* ════ EDIT USER MODAL ════ */}
      <Modal
        open={editUserOpen}
        onClose={() => setEditUserOpen(false)}
        title="Edit User"
        size="sm"
        icon={<Pencil size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditUserOpen(false)}>Cancel</button>
            <button className="btn btn-p" disabled={editUserSaving || !editUserName.trim()} onClick={handleEditUser}>
              {editUserSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {editUserTarget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div className="av av-sq" style={{ width: 28, height: 28, fontSize: '.65rem', borderRadius: 7, flexShrink: 0 }}>{editUserTarget.initials}</div>
              <div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text1)' }}>{editUserTarget.fullName || editUserTarget.email}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>{editUserTarget.email}</div>
              </div>
            </div>
          )}
          <div className="fg">
            <label>Full Name <span className="req">*</span></label>
            <input className="fi" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} autoFocus />
          </div>
        </div>
      </Modal>

      {/* ════ RESET PASSWORD MODAL ════ */}
      <Modal
        open={resetPwOpen}
        onClose={() => setResetPwOpen(false)}
        title="Reset Password"
        size="sm"
        icon={<RefreshCw size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setResetPwOpen(false)}>Cancel</button>
            <button className="btn btn-p" disabled={resetPwSaving || resetPwVal.length < 8} onClick={handleResetPw}>
              <Lock size={13} /> {resetPwSaving ? 'Resetting…' : 'Reset Password'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {resetPwTarget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div className="av av-sq" style={{ width: 28, height: 28, fontSize: '.65rem', borderRadius: 7, flexShrink: 0 }}>{resetPwTarget.initials}</div>
              <div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text1)' }}>{resetPwTarget.fullName || resetPwTarget.email}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>{resetPwTarget.email}</div>
              </div>
            </div>
          )}
          <div className="fg">
            <label>New Password <span className="req">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                className="fi"
                type={resetPwShow ? 'text' : 'password'}
                value={resetPwVal}
                onChange={(e) => setResetPwVal(e.target.value)}
                placeholder="At least 8 characters"
                style={{ paddingRight: 38 }}
                autoFocus
              />
              <button type="button" onClick={() => setResetPwShow((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex' }}>
                {resetPwShow ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {resetPwVal && <PasswordStrength password={resetPwVal} />}
          </div>
        </div>
      </Modal>

      {/* ════ TOGGLE USER CONFIRM ════ */}
      <Modal
        open={toggleOpen}
        onClose={() => setToggleOpen(false)}
        title={toggleTarget?.isActive ? 'Deactivate User' : 'Activate User'}
        variant={toggleTarget?.isActive ? 'danger' : undefined}
        size="sm"
        icon={<Power size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setToggleOpen(false)}>Cancel</button>
            <button
              className={`btn ${toggleTarget?.isActive ? 'btn-danger' : 'btn-p'}`}
              disabled={toggleSaving}
              onClick={handleToggle}
            >
              <Power size={13} /> {toggleSaving ? 'Updating…' : (toggleTarget?.isActive ? 'Deactivate' : 'Activate')}
            </button>
          </>
        }
      >
        {toggleTarget && (
          <p style={{ fontSize: '.83rem', color: 'var(--text2)', lineHeight: 1.6 }}>
            {toggleTarget.isActive
              ? <>Are you sure you want to deactivate <strong style={{ color: 'var(--text1)' }}>{toggleTarget.fullName || toggleTarget.email}</strong>? They will no longer be able to sign in.</>
              : <>Activate <strong style={{ color: 'var(--text1)' }}>{toggleTarget.fullName || toggleTarget.email}</strong>? They will be able to sign in again.</>}
          </p>
        )}
      </Modal>
    </div>
  )
}

// ── Password Strength ──────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters',       ok: password.length >= 8 },
    { label: 'Uppercase',           ok: /[A-Z]/.test(password) },
    { label: 'Number',              ok: /\d/.test(password) },
    { label: 'Special character',   ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score  = checks.filter((c) => c.ok).length
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? colors[score - 1] : 'var(--border)', transition: 'background .3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '.68rem', color: 'var(--text3)', fontWeight: 600 }}>Password strength</span>
        <span style={{ fontSize: '.68rem', fontWeight: 800, color: score > 0 ? colors[score - 1] : 'var(--text4)' }}>
          {score > 0 ? labels[score - 1] : 'None'}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px' }}>
        {checks.map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.66rem', color: c.ok ? '#15803d' : 'var(--text4)' }}>
            {c.ok ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}
