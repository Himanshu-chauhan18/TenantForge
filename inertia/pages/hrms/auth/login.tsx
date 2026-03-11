import { useState, useRef, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import {
  Eye, EyeOff, Lock, ArrowRight, ChevronLeft,
  AlertCircle, CheckCircle2, Users, BarChart3, Layers, Sun, Moon,
} from 'lucide-react'

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function isEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function isPhone(v: string) { return /^\+?[\d\s\-().]{7,15}$/.test(v.trim()) }
function getIdentifierType(v: string): 'email' | 'phone' | null {
  if (isEmail(v)) return 'email'
  if (isPhone(v)) return 'phone'
  return null
}

/* ─── feature list ──────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Users,     title: 'Employee Management',  desc: 'Centralized profiles, documents & org hierarchy' },
  { icon: BarChart3, title: 'Attendance & Leave',    desc: 'Real-time tracking with automated approvals' },
  { icon: Layers,    title: 'Performance Analytics', desc: 'Data-driven insights to unlock potential' },
]

/* ─── theme tokens ──────────────────────────────────────────────────────────── */
const T = {
  dark: {
    pageBg:            'linear-gradient(135deg,#060f0e 0%,#0a1a18 40%,#0d2421 70%,#071210 100%)',
    blob1:             'radial-gradient(circle,rgba(13,148,136,.18) 0%,transparent 65%)',
    blob2:             'radial-gradient(circle,rgba(5,150,105,.14) 0%,transparent 65%)',
    blob3:             'radial-gradient(circle,rgba(13,148,136,.08) 0%,transparent 65%)',
    headline:          '#ffffff',
    headlineSub:       'rgba(255,255,255,.45)',
    logoText:          '#ffffff',
    logoTag:           'rgba(255,255,255,.35)',
    cardBg:            'rgba(255,255,255,.05)',
    cardBorder:        'rgba(255,255,255,.1)',
    cardShadow:        '0 24px 80px rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.08) inset,0 -1px 0 rgba(0,0,0,.3) inset',
    progressInact:     'rgba(255,255,255,.12)',
    stepLabel:         '#34d399',
    stepTitle:         '#ffffff',
    stepSub:           'rgba(255,255,255,.4)',
    inputBg:           'rgba(255,255,255,.06)',
    inputBorder:       'rgba(255,255,255,.12)',
    inputText:         '#ffffff',
    inputPlaceholder:  'rgba(255,255,255,.3)',
    inputIcon:         'rgba(255,255,255,.3)',
    labelText:         'rgba(255,255,255,.6)',
    backBtn:           'rgba(255,255,255,.5)',
    backBtnHover:      'rgba(255,255,255,.85)',
    chipBg:            'rgba(13,148,136,.12)',
    chipBorder:        'rgba(13,148,136,.2)',
    chipText:          'rgba(255,255,255,.7)',
    avatarTitle:       '#ffffff',
    avatarSub:         'rgba(255,255,255,.35)',
    errorBg:           'rgba(239,68,68,.1)',
    errorBorder:       'rgba(239,68,68,.25)',
    errorText:         '#fca5a5',
    featureBg:         'rgba(255,255,255,.04)',
    featureBorder:     'rgba(255,255,255,.07)',
    featureTitle:      'rgba(255,255,255,.9)',
    featureDesc:       'rgba(255,255,255,.38)',
    featureIconBg:     'rgba(13,148,136,.18)',
    featureIconBorder: 'rgba(13,148,136,.3)',
    badgeText:         'rgba(255,255,255,.35)',
    footer:            'rgba(255,255,255,.25)',
    toggleBg:          'rgba(255,255,255,.08)',
    toggleBorder:      'rgba(255,255,255,.12)',
    toggleIcon:        'rgba(255,255,255,.6)',
    pwToggle:          'rgba(255,255,255,.35)',
    pwToggleHover:     'rgba(255,255,255,.7)',
  },
  light: {
    pageBg:            'linear-gradient(135deg,#f0fdf9 0%,#ecfdf5 40%,#f0fdfa 70%,#e6fffa 100%)',
    blob1:             'radial-gradient(circle,rgba(13,148,136,.12) 0%,transparent 65%)',
    blob2:             'radial-gradient(circle,rgba(5,150,105,.08) 0%,transparent 65%)',
    blob3:             'radial-gradient(circle,rgba(13,148,136,.06) 0%,transparent 65%)',
    headline:          '#0f2420',
    headlineSub:       'rgba(15,36,32,.5)',
    logoText:          '#0f2420',
    logoTag:           'rgba(15,36,32,.4)',
    cardBg:            'rgba(255,255,255,.82)',
    cardBorder:        'rgba(13,148,136,.18)',
    cardShadow:        '0 24px 72px rgba(13,148,136,.12),0 1px 0 rgba(255,255,255,.95) inset,0 8px 32px rgba(0,0,0,.05)',
    progressInact:     'rgba(13,148,136,.15)',
    stepLabel:         '#059669',
    stepTitle:         '#0f2420',
    stepSub:           'rgba(15,36,32,.5)',
    inputBg:           'rgba(255,255,255,.9)',
    inputBorder:       'rgba(13,148,136,.2)',
    inputText:         '#0f2420',
    inputPlaceholder:  'rgba(15,36,32,.35)',
    inputIcon:         'rgba(13,148,136,.55)',
    labelText:         'rgba(15,36,32,.65)',
    backBtn:           'rgba(15,36,32,.45)',
    backBtnHover:      '#0f2420',
    chipBg:            'rgba(13,148,136,.08)',
    chipBorder:        'rgba(13,148,136,.2)',
    chipText:          'rgba(15,36,32,.75)',
    avatarTitle:       '#0f2420',
    avatarSub:         'rgba(15,36,32,.45)',
    errorBg:           'rgba(239,68,68,.06)',
    errorBorder:       'rgba(239,68,68,.2)',
    errorText:         '#dc2626',
    featureBg:         'rgba(255,255,255,.65)',
    featureBorder:     'rgba(13,148,136,.12)',
    featureTitle:      '#0f2420',
    featureDesc:       'rgba(15,36,32,.45)',
    featureIconBg:     'rgba(13,148,136,.1)',
    featureIconBorder: 'rgba(13,148,136,.2)',
    badgeText:         'rgba(15,36,32,.4)',
    footer:            'rgba(15,36,32,.35)',
    toggleBg:          'rgba(13,148,136,.08)',
    toggleBorder:      'rgba(13,148,136,.15)',
    toggleIcon:        '#0D9488',
    pwToggle:          'rgba(15,36,32,.35)',
    pwToggleHover:     'rgba(15,36,32,.7)',
  },
} as const

/* ─── page ──────────────────────────────────────────────────────────────────── */
export default function HrmsLogin() {
  const page = usePage<any>()
  const authError = (page.props as any)?.authError as string | undefined

  /* theme */
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tf-theme') as 'dark' | 'light') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tf-theme', theme)
  }, [theme])

  const c = T[theme]
  const isDark = theme === 'dark'

  /* step flow */
  const [step, setStep] = useState<'identifier' | 'password'>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [identifierErr, setIdentifierErr] = useState('')
  const [showPw, setShowPw] = useState(false)

  const identifierRef = useRef<HTMLInputElement>(null)
  const passwordRef   = useRef<HTMLInputElement>(null)

  useEffect(() => { identifierRef.current?.focus() }, [])
  useEffect(() => {
    if (step === 'password') setTimeout(() => passwordRef.current?.focus(), 60)
  }, [step])

  const { data, setData, post, processing, errors } = useForm({ identifier: '', password: '' })

  function handleIdentifierNext(e: React.SyntheticEvent) {
    e.preventDefault()
    const v = identifier.trim()
    if (!v) { setIdentifierErr('Enter your work email or phone number.'); return }
    if (!getIdentifierType(v)) { setIdentifierErr('Enter a valid email address or phone number.'); return }
    setIdentifierErr('')
    setData('identifier', v)
    setStep('password')
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    post('/login')
  }

  function goBack() {
    setStep('identifier')
    setData('password', '')
    setTimeout(() => identifierRef.current?.focus(), 60)
  }

  const idType = getIdentifierType(identifier)

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideLeft  { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .hl-step-in  { animation:slideLeft  .28s cubic-bezier(.4,0,.2,1) both; }
        .hl-step-out { animation:slideRight .28s cubic-bezier(.4,0,.2,1) both; }
        .hl-card     { animation:fadeUp .4s cubic-bezier(.4,0,.2,1) both; }
        .hl-feat     { animation:fadeUp .5s cubic-bezier(.4,0,.2,1) both; }

        .hl-input {
          width:100%; border-radius:12px; padding:13px 44px;
          font-size:.9rem; outline:none; box-sizing:border-box;
          transition:border-color .2s,box-shadow .2s,background .3s,color .3s;
        }
        .hl-input:focus { border-color:#0D9488!important; box-shadow:0 0 0 3px rgba(13,148,136,.2)!important; }
        .hl-input.err  { border-color:#f87171!important; box-shadow:0 0 0 3px rgba(248,113,113,.15)!important; }

        .hl-btn {
          width:100%; padding:13px 20px; border-radius:12px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#0D9488,#059669);
          color:#fff; font-size:.9rem; font-weight:700; letter-spacing:.02em;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:opacity .2s,transform .15s,box-shadow .2s;
          box-shadow:0 4px 20px rgba(13,148,136,.4);
        }
        .hl-btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); box-shadow:0 6px 24px rgba(13,148,136,.55); }
        .hl-btn:active:not(:disabled){ transform:translateY(0); }
        .hl-btn:disabled { opacity:.6; cursor:not-allowed; }

        .hl-back {
          background:none; border:none; cursor:pointer;
          display:flex; align-items:center; gap:4px;
          font-size:.78rem; padding:0; transition:color .15s;
        }
        .hl-toggle {
          display:flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:10px;
          cursor:pointer; transition:background .2s,border-color .2s,transform .15s;
        }
        .hl-toggle:hover { transform:scale(1.1); }
      `}</style>

      {/* page wrapper */}
      <div style={{ minHeight:'100vh', display:'flex', background:c.pageBg, position:'relative', overflow:'hidden', transition:'background .35s' }}>

        {/* blobs */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', top:'-10%', left:'-5%',  width:600, height:600, borderRadius:'50%', background:c.blob1, filter:'blur(40px)', transition:'background .35s' }} />
          <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%', background:c.blob2, filter:'blur(40px)', transition:'background .35s' }} />
          <div style={{ position:'absolute', top:'45%', left:'40%', width:400, height:400, borderRadius:'50%', background:c.blob3, filter:'blur(60px)', transition:'background .35s' }} />
        </div>

        {/* ── left branding panel ──────────────────────────────────────────────── */}
        <div style={{ flex:'0 0 44%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 56px', position:'relative', zIndex:1 }}>

          {/* logo row + theme toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:54, animation:'fadeIn .5s ease both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:46, height:46, borderRadius:14, background:'linear-gradient(135deg,#0D9488,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 20px rgba(13,148,136,.45)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:'1.1rem', color:c.logoText, letterSpacing:'-.01em', transition:'color .3s' }}>TenantForge</div>
                <div style={{ fontSize:'.6rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:c.logoTag, transition:'color .3s' }}>HRMS Platform</div>
              </div>
            </div>
            <button
              className="hl-toggle"
              style={{ background:c.toggleBg, border:`1px solid ${c.toggleBorder}`, color:c.toggleIcon }}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* headline */}
          <div style={{ marginBottom:46, animation:'fadeUp .5s .1s cubic-bezier(.4,0,.2,1) both' }}>
            <h1 style={{ fontFamily:'var(--fd)', fontSize:'2.55rem', fontWeight:900, color:c.headline, lineHeight:1.12, marginBottom:16, letterSpacing:'-.02em', transition:'color .3s' }}>
              Manage Your<br/>
              <span style={{ background:'linear-gradient(90deg,#34d399,#0D9488)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Workforce
              </span><br/>
              Smarter
            </h1>
            <p style={{ color:c.headlineSub, fontSize:'.88rem', lineHeight:1.75, maxWidth:305, transition:'color .3s' }}>
              One platform for employees, attendance, payroll, and your entire organizational hierarchy.
            </p>
          </div>

          {/* feature cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="hl-feat" style={{
                animationDelay:`${.18 + i * .08}s`,
                display:'flex', alignItems:'center', gap:14,
                padding:'13px 16px', borderRadius:13,
                background:c.featureBg, border:`1px solid ${c.featureBorder}`,
                backdropFilter:'blur(8px)',
                boxShadow: isDark ? '0 2px 10px rgba(0,0,0,.18)' : '0 2px 12px rgba(13,148,136,.06)',
                transition:'background .3s,border-color .3s',
              }}>
                <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:c.featureIconBg, border:`1px solid ${c.featureIconBorder}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#0D9488', transition:'background .3s,border-color .3s' }}>
                  <f.icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize:'.81rem', fontWeight:700, color:c.featureTitle, marginBottom:2, transition:'color .3s' }}>{f.title}</div>
                  <div style={{ fontSize:'.7rem', color:c.featureDesc, lineHeight:1.4, transition:'color .3s' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* social proof */}
          <div style={{ marginTop:38, display:'flex', alignItems:'center', gap:10, animation:'fadeIn .6s .5s both' }}>
            <div style={{ display:'flex' }}>
              {['#0D9488','#059669','#10b981'].map((col, i) => (
                <div key={i} style={{ width:24, height:24, borderRadius:'50%', background:col, border:'2px solid rgba(255,255,255,.2)', marginLeft:i > 0 ? -8 : 0, zIndex:3 - i }} />
              ))}
            </div>
            <span style={{ fontSize:'.71rem', color:c.badgeText, letterSpacing:'.01em', transition:'color .3s' }}>
              Trusted by 500+ organisations worldwide
            </span>
          </div>
        </div>

        {/* ── right card panel ─────────────────────────────────────────────────── */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 48px', position:'relative', zIndex:1 }}>
          <div className="hl-card" style={{
            width:'100%', maxWidth:440,
            background:c.cardBg, border:`1px solid ${c.cardBorder}`,
            borderRadius:24, padding:'44px 40px',
            backdropFilter:'blur(24px)',
            boxShadow:c.cardShadow,
            transition:'background .3s,border-color .3s,box-shadow .3s',
          }}>

            {/* progress bar */}
            <div style={{ display:'flex', gap:6, marginBottom:32 }}>
              {(['identifier','password'] as const).map(s => (
                <div key={s} style={{
                  height:4, borderRadius:4, transition:'all .35s ease',
                  flex:step === s ? 2 : 1,
                  background:step === s ? 'linear-gradient(90deg,#0D9488,#34d399)' : c.progressInact,
                }} />
              ))}
            </div>

            {/* ── STEP 1: identifier ──── */}
            {step === 'identifier' && (
              <div className="hl-step-out">
                <div style={{ marginBottom:30 }}>
                  <p style={{ fontSize:'.71rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:c.stepLabel, marginBottom:10, transition:'color .3s' }}>
                    Step 1 of 2
                  </p>
                  <h2 style={{ fontFamily:'var(--fd)', fontSize:'1.65rem', fontWeight:800, color:c.stepTitle, marginBottom:8, letterSpacing:'-.02em', transition:'color .3s' }}>
                    Welcome back
                  </h2>
                  <p style={{ color:c.stepSub, fontSize:'.84rem', lineHeight:1.6, transition:'color .3s' }}>
                    Enter your work email or phone number to continue.
                  </p>
                </div>

                <form onSubmit={handleIdentifierNext}>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:'block', fontSize:'.77rem', fontWeight:600, color:c.labelText, marginBottom:8, letterSpacing:'.02em', transition:'color .3s' }}>
                      Work Email or Phone
                    </label>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:c.inputIcon, pointerEvents:'none', display:'flex', transition:'color .3s' }}>
                        {idType === 'phone'
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.15 12a19.8 19.8 0 01-3.07-8.67A2 2 0 012.06 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        }
                      </div>
                      <input
                        ref={identifierRef}
                        className={`hl-input${identifierErr ? ' err' : ''}`}
                        type="text"
                        placeholder="you@company.com or +91 98765 43210"
                        value={identifier}
                        onChange={e => { setIdentifier(e.target.value); if (identifierErr) setIdentifierErr('') }}
                        autoComplete="email"
                        style={{ background:c.inputBg, border:`1.5px solid ${identifierErr ? '#f87171' : c.inputBorder}`, color:c.inputText }}
                      />
                      {idType && !identifierErr && (
                        <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#34d399', display:'flex' }}>
                          <CheckCircle2 size={15} />
                        </div>
                      )}
                    </div>
                    {identifierErr && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, color:'#f87171', fontSize:'.75rem' }}>
                        <AlertCircle size={13} />{identifierErr}
                      </div>
                    )}
                    <style>{`.hl-input::placeholder{color:${c.inputPlaceholder}}`}</style>
                  </div>

                  <button type="submit" className="hl-btn">
                    Continue <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 2: password ──── */}
            {step === 'password' && (
              <div className="hl-step-in">
                {/* back + chip */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:26 }}>
                  <button
                    type="button"
                    className="hl-back"
                    style={{ color:c.backBtn }}
                    onMouseEnter={e => (e.currentTarget.style.color = c.backBtnHover)}
                    onMouseLeave={e => (e.currentTarget.style.color = c.backBtn)}
                    onClick={goBack}
                  >
                    <ChevronLeft size={15} /> Back
                  </button>
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:20, background:c.chipBg, border:`1px solid ${c.chipBorder}`, transition:'background .3s,border-color .3s' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#34d399', flexShrink:0 }} />
                    <span style={{ fontSize:'.73rem', color:c.chipText, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color .3s' }}>
                      {data.identifier}
                    </span>
                    <button type="button" onClick={goBack} style={{ background:'none', border:'none', cursor:'pointer', color:'#0D9488', fontSize:'.69rem', fontWeight:700, padding:0, flexShrink:0 }}>
                      Change
                    </button>
                  </div>
                </div>

                {/* avatar */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:26, textAlign:'center' }}>
                  <div style={{ width:58, height:58, borderRadius:'50%', background:'linear-gradient(135deg,#0D9488,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', fontWeight:700, color:'#fff', boxShadow:'0 4px 18px rgba(13,148,136,.45)', letterSpacing:'-.01em' }}>
                    {data.identifier.trim().split(/[@\s]+/)[0].slice(0,2).toUpperCase() || '?'}
                  </div>
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontFamily:'var(--fd)', fontSize:'1.5rem', fontWeight:800, color:c.avatarTitle, letterSpacing:'-.02em', marginBottom:4, transition:'color .3s' }}>
                      Enter Password
                    </div>
                    <div style={{ fontSize:'.79rem', color:c.avatarSub, transition:'color .3s' }}>
                      Sign in to your HRMS account
                    </div>
                  </div>
                </div>

                {/* error */}
                {authError && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:10, marginBottom:20, background:c.errorBg, border:`1px solid ${c.errorBorder}`, color:c.errorText, fontSize:'.79rem', lineHeight:1.5, transition:'background .3s,border-color .3s,color .3s' }}>
                    <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} />
                    {authError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom:20 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <label style={{ fontSize:'.77rem', fontWeight:600, color:c.labelText, letterSpacing:'.02em', transition:'color .3s' }}>
                        Password
                      </label>
                      <span style={{ fontSize:'.7rem', color:'#0D9488', cursor:'pointer', fontWeight:600 }}>
                        Forgot password?
                      </span>
                    </div>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:c.inputIcon, pointerEvents:'none', display:'flex', transition:'color .3s' }}>
                        <Lock size={15} />
                      </div>
                      <input
                        ref={passwordRef}
                        className={`hl-input${errors.password || authError ? ' err' : ''}`}
                        type={showPw ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        autoComplete="current-password"
                        required
                        style={{ background:c.inputBg, border:`1.5px solid ${errors.password || authError ? '#f87171' : c.inputBorder}`, color:c.inputText, paddingRight:44 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:c.pwToggle, padding:2, display:'flex', transition:'color .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = c.pwToggleHover)}
                        onMouseLeave={e => (e.currentTarget.style.color = c.pwToggle)}
                      >
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <style>{`.hl-input::placeholder{color:${c.inputPlaceholder}}`}</style>
                  </div>

                  <button type="submit" className="hl-btn" disabled={processing}>
                    {processing
                      ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 1s linear infinite', display:'inline-block' }} /> Signing in…</>
                      : <>Sign in to HRMS <ArrowRight size={16} /></>
                    }
                  </button>
                </form>
              </div>
            )}

            {/* footer */}
            <p style={{ marginTop:28, textAlign:'center', fontSize:'.7rem', color:c.footer, lineHeight:1.6, transition:'color .3s' }}>
              Having trouble?{' '}
              <span style={{ color:'#0D9488', fontWeight:600, cursor:'pointer' }}>Contact HR Administrator</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
