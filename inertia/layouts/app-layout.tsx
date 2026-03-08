import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { toast, Toaster } from 'sonner'
import {
  LayoutDashboard,
  Building2,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  X,
  Menu,
  ChevronRight,
  UserCheck,
  Database,
  Settings,
  Plus,
  MapPin,
  ArrowRight,
  Loader2,
} from 'lucide-react'

interface SharedProps {
  user?: {
    id: number
    fullName: string | null
    email: string
    initials: string
  }
  flash?: { success?: string; error?: string; toasts?: string[] }
}

interface NavItem {
  label: string
  icon: React.ReactNode
  href?: string
  routeName?: string
  children?: { label: string; href: string; routeName?: string }[]
}

interface OrgResult {
  id: number
  orgId: string
  name: string
  status: 'active' | 'inactive' | 'expired'
  planType: 'trial' | 'premium'
  country: string | null
  city: string | null
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      icon: <LayoutDashboard size={16} />, href: '/dashboard',     routeName: 'dashboard' },
  { label: 'Organizations',  icon: <Building2 size={16} />,       href: '/organizations', routeName: 'organizations.index' },
  { label: 'Leads & Owners', icon: <UserCheck size={16} />,       href: '/leads',         routeName: 'leads.index' },
  { label: 'Manage Masters', icon: <Database size={16} />,        href: '/masters',       routeName: 'masters.index' },
  { label: 'Settings',       icon: <Settings size={16} />,        href: '/settings',      routeName: 'settings.index' },
]

const STATUS_META = {
  active:   { label: 'Active',   color: '#10b981', bg: 'rgba(16,185,129,.12)' },
  inactive: { label: 'Inactive', color: '#8b95a1', bg: 'rgba(107,114,128,.12)' },
  expired:  { label: 'Expired',  color: '#ef4444', bg: 'rgba(239,68,68,.12)' },
}

const PLAN_META = {
  trial:   { label: 'Trial',   color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  premium: { label: 'Premium', color: '#8b5cf6', bg: 'rgba(139,92,246,.12)' },
}

function orgInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { url, props } = usePage<{ props: SharedProps } & any>()
  const shared = props as SharedProps
  const user = shared?.user
  const flash = shared?.flash

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tf-theme') as 'light' | 'dark') || 'light'
    }
    return 'light'
  })

  const [openNav,    setOpenNav]    = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<OrgResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchFocused, setSearchFocused] = useState(-1)
  const [mobSidebar, setMobSidebar] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tf-theme', theme)
  }, [theme])

  // ── Keyboard shortcut ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
    if (!searchOpen) {
      setSearchQuery('')
      setSearchResults([])
      setSearchFocused(-1)
    }
  }, [searchOpen])

  // ── Debounced API search ───────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); setSearchLoading(false); return }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/orgs/search?q=${encodeURIComponent(q.trim())}`)
      if (res.ok) setSearchResults(await res.json())
    } catch { /* ignore */ }
    setSearchLoading(false)
  }, [])

  useEffect(() => {
    setSearchFocused(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!searchQuery.trim()) { setSearchResults([]); setSearchLoading(false); return }
    setSearchLoading(true)
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery, doSearch])

  // ── Keyboard navigation in results ────────────────────────────────────────
  function handleSearchKeyDown(e: React.KeyboardEvent) {
    const total = searchResults.length
    if (!total) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSearchFocused((f) => (f + 1) % total) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSearchFocused((f) => (f - 1 + total) % total) }
    if (e.key === 'Enter' && searchFocused >= 0) {
      e.preventDefault()
      const hit = searchResults[searchFocused]
      router.visit(`/organizations/${hit.id}`)
      setSearchOpen(false)
    }
  }

  // ── Toasts ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (flash?.success) toast.success(flash.success)
    if (flash?.error)   toast.error(flash.error)
    flash?.toasts?.forEach((msg: string) => toast.error(msg))
  }, [flash])

  const isActive = (item: NavItem) => !!(item.href && url.startsWith(item.href))

  const breadcrumbs = (() => {
    const parts = url.split('/').filter(Boolean)
    const crumbs = [{ label: 'Home', href: '/dashboard' }]
    if (parts[0] === 'dashboard')    crumbs.push({ label: 'Dashboard',       href: '/dashboard' })
    if (parts[0] === 'organizations') {
      crumbs.push({ label: 'Organizations', href: '/organizations' })
      if (parts[1] === 'create') crumbs.push({ label: 'Add Organization', href: '/organizations/create' })
      else if (parts[1]) crumbs.push({ label: 'Detail', href: url })
    }
    if (parts[0] === 'leads')   crumbs.push({ label: 'Leads & Owners', href: '/leads' })
    if (parts[0] === 'masters') crumbs.push({ label: 'Manage Masters',  href: '/masters' })
    if (parts[0] === 'settings') crumbs.push({ label: 'Settings',       href: '/settings' })
    return crumbs
  })()

  const logout = () => router.post('/logout')

  function closeSearch() {
    setSearchOpen(false)
  }

  function goToOrg(id: number) {
    router.visit(`/organizations/${id}`)
    closeSearch()
  }

  return (
    <>
      <div className="shell">
        {/* Sidebar */}
        <aside className={`sidebar${mobSidebar ? ' mob-open' : ''}`}>
          <div className="brand">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="brand-name">TenantForge</div>
              <div className="brand-tag">Organization Builder</div>
            </div>
          </div>

          <div className="sb-scroll">
            <div className="sb-label">Main Menu</div>
            {NAV_ITEMS.map((item) => {
              const active   = isActive(item)
              const expanded = openNav === item.label

              if (item.children) {
                return (
                  <div key={item.label}>
                    <div className={`sb-item${active ? ' active' : ''}`} onClick={() => setOpenNav(expanded ? null : item.label)}>
                      <span className="sb-icon">{item.icon}</span>
                      {item.label}
                      <ChevronDown size={12} className={`chevron${expanded ? ' open' : ''}`} />
                    </div>
                    <div className={`sb-sub${expanded || active ? ' open' : ''}`}>
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} className={`sb-sub-item${url === child.href ? ' active' : ''}`}>
                          <span className="sb-sub-dot" />{child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <Link key={item.label} href={item.href!} className={`sb-item${active ? ' active' : ''}`}>
                  <span className="sb-icon">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {user && (
            <div className="sb-footer">
              <div className="user-pill">
                <div className="av">{user.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="u-name truncate">{user.fullName || user.email}</div>
                  <div className="u-role">Administrator</div>
                </div>
                <button onClick={logout} className="ibtn" title="Logout">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main area */}
        <div className="main">
          <header className="navbar">
            <button className="ibtn" style={{ display: 'none' }} onClick={() => setMobSidebar(!mobSidebar)}>
              <Menu size={16} />
            </button>

            <nav className="bc">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {i > 0 && <ChevronRight size={12} className="bc-sep" />}
                  {i === breadcrumbs.length - 1
                    ? <span className="bc-item cur">{crumb.label}</span>
                    : <Link href={crumb.href} className="bc-item">{crumb.label}</Link>}
                </span>
              ))}
            </nav>

            <div className="nav-right">
              {/* Search trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                title="Search (Ctrl+K)"
                style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text3)', cursor: 'pointer', fontSize: '.76rem', transition: 'all .15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--p)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--p)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)' }}
              >
                <Search size={13} />
                <span style={{ display: 'none' }}>Search</span>
                <kbd style={{ fontSize: '.62rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text4)', lineHeight: 1.6, letterSpacing: '.02em' }}>⌘K</kbd>
              </button>

              <button className={`ibtn nd`} onClick={() => setDrawerOpen(true)} title="Notifications">
                <Bell size={16} />
              </button>

              <button className="theme-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="Toggle theme">
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              {user && (
                <div className="av" style={{ cursor: 'pointer' }} title={user.email}>
                  {user.initials}
                </div>
              )}
            </div>
          </header>

          <main className="content">{children}</main>
        </div>
      </div>

      {/* ════ Search Modal ════ */}
      <div
        className={`ov${searchOpen ? ' open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeSearch() }}
        style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
      >
        <div className="modal" style={{ maxWidth: 600, maxHeight: '70vh' }}>
          {/* Input row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            {searchLoading
              ? <Loader2 size={17} style={{ color: 'var(--p)', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
              : <Search size={17} style={{ color: 'var(--text3)', flexShrink: 0 }} />}
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by organization name, Org ID, or #ID…"
              style={{ flex: 1, fontSize: '.92rem', color: 'var(--text1)', background: 'none', border: 'none', outline: 'none' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex', padding: 2 }}>
                <X size={14} />
              </button>
            )}
            <kbd onClick={closeSearch} style={{ fontSize: '.65rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text4)', cursor: 'pointer', lineHeight: 1.6, flexShrink: 0 }}>ESC</kbd>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 56px)' }}>

            {/* Empty state / hint */}
            {!searchQuery && (
              <div style={{ padding: '28px 20px' }}>
                <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>Quick Actions</div>
                <QuickLink href="/organizations/create" icon={<Plus size={14} />} label="Add Organization" desc="Create a new tenant organization" onClick={closeSearch} />
                <QuickLink href="/organizations" icon={<Building2 size={14} />} label="All Organizations" desc="Browse the full organization list" onClick={closeSearch} />
                <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Search size={13} style={{ color: 'var(--text4)', flexShrink: 0 }} />
                  <span style={{ fontSize: '.76rem', color: 'var(--text4)' }}>Type to search organizations by name, Org ID, or numeric ID</span>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {searchQuery && searchLoading && searchResults.length === 0 && (
              <div style={{ padding: '12px 16px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg2)', flexShrink: 0, animation: 'shimmer 1.2s ease-in-out infinite alternate' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 11, width: '50%', background: 'var(--bg2)', borderRadius: 4, marginBottom: 6, animation: 'shimmer 1.2s ease-in-out infinite alternate' }} />
                      <div style={{ height: 9, width: '30%', background: 'var(--bg2)', borderRadius: 4, animation: 'shimmer 1.2s ease-in-out infinite alternate' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {searchQuery && !searchLoading && searchResults.length === 0 && (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--text4)' }}>
                  <Building2 size={20} />
                </div>
                <div style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>No organizations found</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text4)' }}>Try searching by a different name, Org ID, or number</div>
                <Link
                  href={`/organizations?search=${encodeURIComponent(searchQuery)}`}
                  onClick={closeSearch}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 14, fontSize: '.77rem', color: 'var(--p)', fontWeight: 600 }}
                >
                  View all results <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {searchQuery && searchResults.length > 0 && (
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text4)', padding: '4px 16px 6px' }}>
                  Organizations · {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((org, idx) => {
                  const sm = STATUS_META[org.status] ?? STATUS_META.active
                  const pm = PLAN_META[org.planType] ?? PLAN_META.trial
                  const focused = idx === searchFocused
                  return (
                    <div
                      key={org.id}
                      onClick={() => goToOrg(org.id)}
                      onMouseEnter={() => setSearchFocused(idx)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px', cursor: 'pointer', background: focused ? 'var(--p-lt)' : 'transparent', borderLeft: `3px solid ${focused ? 'var(--p)' : 'transparent'}`, transition: 'background .1s, border-color .1s' }}
                    >
                      {/* Avatar */}
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: focused ? 'var(--p)' : 'var(--p-lt)', color: focused ? '#fff' : 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.72rem', flexShrink: 0, letterSpacing: '.04em', transition: 'background .15s, color .15s', fontFamily: 'var(--fd)' }}>
                        {orgInitials(org.name)}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '.83rem', fontWeight: 700, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</span>
                          <code style={{ fontSize: '.65rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', color: 'var(--text3)', fontFamily: 'monospace' }}>{org.orgId}</code>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                          {(org.city || org.country) && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.69rem', color: 'var(--text4)' }}>
                              <MapPin size={9} />
                              {[org.city, org.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: '.63rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: sm.bg, color: sm.color }}>{sm.label}</span>
                        <span style={{ fontSize: '.63rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: pm.bg, color: pm.color }}>{pm.label}</span>
                      </div>
                      {focused && <ArrowRight size={13} style={{ color: 'var(--p)', flexShrink: 0 }} />}
                    </div>
                  )
                })}

                {/* Footer */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: '.66rem', color: 'var(--text4)' }}>
                    <span>↑↓ navigate</span>
                    <span>↵ open</span>
                    <span>ESC close</span>
                  </div>
                  <Link
                    href={`/organizations?search=${encodeURIComponent(searchQuery)}`}
                    onClick={closeSearch}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.73rem', color: 'var(--p)', fontWeight: 600 }}
                  >
                    View all results <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        gap={8}
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '.82rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,.16)', padding: '12px 16px' },
        }}
      />

      {/* Notifications Drawer */}
      <div className={`dov${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="dh">
          <span style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '.92rem' }}>Notifications</span>
          <button className="xbtn" onClick={() => setDrawerOpen(false)}><X size={16} /></button>
        </div>
        <div className="db">
          <div className="ni unread">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--p-lt)', color: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={14} />
              </div>
              <div>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text1)', lineHeight: 1.4 }}>Welcome to TenantForge!</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text3)', marginTop: 3 }}>Get started by adding your first organization.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Quick link helper ──────────────────────────────────────────────────────────

function QuickLink({ href, icon, label, desc, onClick }: { href: string; icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 9, transition: 'background .12s', marginBottom: 4, textDecoration: 'none' }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg2)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
    >
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--p-lt)', color: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)' }}>{label}</div>
        <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{desc}</div>
      </div>
    </Link>
  )
}
