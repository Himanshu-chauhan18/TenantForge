import { useState, useRef, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import {
  Eye, EyeOff, Lock, ArrowRight, ChevronLeft,
  AlertCircle, CheckCircle2, Sun, Moon,
  Users, CalendarCheck, ShieldCheck, Zap, Globe,
} from 'lucide-react'

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function isEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function isPhone(v: string) { return /^\+?[\d\s\-().]{7,15}$/.test(v.trim()) }
function getIdentifierType(v: string): 'email' | 'phone' | null {
  if (isEmail(v)) return 'email'
  if (isPhone(v)) return 'phone'
  return null
}

/* ─── theme tokens ──────────────────────────────────────────────────────────── */
const T = {
  dark: {
    pageBg:            '#060f0e',
    pageGrad:          'linear-gradient(135deg,#060f0e 0%,#0b1d1a 55%,#071410 100%)',
    leftPanelBg:       'linear-gradient(160deg,#0a1f1c 0%,#0d2922 45%,#071a16 100%)',
    leftShadow:        '4px 0 40px rgba(0,0,0,.5)',
    gridColor:         'rgba(13,148,136,.055)',
    headlineSub:       'rgba(255,255,255,.45)',
    logoText:          '#ffffff',
    logoTag:           'rgba(255,255,255,.3)',
    /* right-side decorative */
    orb1:              'rgba(13,148,136,.14)',
    orb2:              'rgba(5,150,105,.09)',
    orb3:              'rgba(52,211,153,.07)',
    dotColor:          'rgba(13,148,136,.045)',
    ringColor:         'rgba(13,148,136,.07)',
    /* card */
    cardBg:            'rgba(255,255,255,.055)',
    cardBorder:        'rgba(255,255,255,.1)',
    cardShadow:        '0 32px 100px rgba(0,0,0,.65),0 1px 0 rgba(255,255,255,.08) inset',
    /* form */
    progressInact:     'rgba(255,255,255,.12)',
    stepLabel:         '#34d399',
    stepTitle:         '#ffffff',
    stepSub:           'rgba(255,255,255,.4)',
    inputBg:           'rgba(255,255,255,.065)',
    inputBorder:       'rgba(255,255,255,.13)',
    inputText:         '#ffffff',
    inputPlaceholder:  'rgba(255,255,255,.3)',
    inputIcon:         'rgba(255,255,255,.3)',
    labelText:         'rgba(255,255,255,.6)',
    backBtn:           'rgba(255,255,255,.5)',
    backBtnHover:      'rgba(255,255,255,.88)',
    chipBg:            'rgba(13,148,136,.12)',
    chipBorder:        'rgba(13,148,136,.22)',
    chipText:          'rgba(255,255,255,.7)',
    avatarTitle:       '#ffffff',
    avatarSub:         'rgba(255,255,255,.35)',
    errorBg:           'rgba(239,68,68,.1)',
    errorBorder:       'rgba(239,68,68,.25)',
    errorText:         '#fca5a5',
    tagBg:             'rgba(13,148,136,.15)',
    tagBorder:         'rgba(13,148,136,.25)',
    tagText:           '#34d399',
    footer:            'rgba(255,255,255,.25)',
    toggleBg:          'rgba(255,255,255,.08)',
    toggleBorder:      'rgba(255,255,255,.13)',
    toggleIcon:        'rgba(255,255,255,.6)',
    pwToggle:          'rgba(255,255,255,.35)',
    pwToggleHover:     'rgba(255,255,255,.72)',
  },
  light: {
    pageBg:            '#edfaf5',
    pageGrad:          'linear-gradient(135deg,#f0fdf9 0%,#e4faf3 55%,#eafaf5 100%)',
    leftPanelBg:       'linear-gradient(160deg,#0a2420 0%,#0d3028 45%,#071e19 100%)',
    leftShadow:        '4px 0 40px rgba(0,0,0,.2)',
    gridColor:         'rgba(52,211,153,.08)',
    headlineSub:       'rgba(255,255,255,.55)',
    logoText:          '#ffffff',
    logoTag:           'rgba(255,255,255,.45)',
    /* right-side decorative */
    orb1:              'rgba(13,148,136,.1)',
    orb2:              'rgba(5,150,105,.07)',
    orb3:              'rgba(52,211,153,.06)',
    dotColor:          'rgba(13,148,136,.07)',
    ringColor:         'rgba(13,148,136,.1)',
    /* card */
    cardBg:            'rgba(255,255,255,.9)',
    cardBorder:        'rgba(13,148,136,.18)',
    cardShadow:        '0 24px 80px rgba(13,148,136,.12),0 1px 0 rgba(255,255,255,.98) inset,0 8px 32px rgba(0,0,0,.04)',
    /* form */
    progressInact:     'rgba(13,148,136,.15)',
    stepLabel:         '#059669',
    stepTitle:         '#0f2420',
    stepSub:           'rgba(15,36,32,.5)',
    inputBg:           'rgba(255,255,255,.92)',
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
    tagBg:             'rgba(52,211,153,.15)',
    tagBorder:         'rgba(52,211,153,.28)',
    tagText:           '#059669',
    footer:            'rgba(15,36,32,.35)',
    toggleBg:          'rgba(255,255,255,.18)',
    toggleBorder:      'rgba(255,255,255,.28)',
    toggleIcon:        'rgba(255,255,255,.85)',
    pwToggle:          'rgba(15,36,32,.35)',
    pwToggleHover:     'rgba(15,36,32,.72)',
  },
} as const

/* ─── feature highlights ────────────────────────────────────────────────────── */
const FEATURES = [
  { Icon: Users,         title: 'Employee Lifecycle',   desc: 'From onboarding to exit, every stage managed in one place' },
  { Icon: CalendarCheck, title: 'Attendance & Leaves',  desc: 'Real-time tracking with smart leave approval workflows' },
  { Icon: ShieldCheck,   title: 'Payroll & Compliance', desc: 'Automated payroll runs with tax and statutory handling' },
]

/* ─── trust signals ─────────────────────────────────────────────────────────── */
const TRUST = [
  { Icon: ShieldCheck, label: 'Enterprise Secure' },
  { Icon: Zap,         label: 'High Performance' },
  { Icon: Globe,       label: 'Multi-Organisation' },
]

/* ─── page ──────────────────────────────────────────────────────────────────── */
export default function HrmsLogin() {
  const page     = usePage<any>()
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

  const c      = T[theme]
  const isDark = theme === 'dark'

  /* step flow */
  const [step, setStep]               = useState<'identifier' | 'password'>('identifier')
  const [identifier, setIdentifier]   = useState('')
  const [identifierErr, setIdentifierErr] = useState('')
  const [showPw, setShowPw]           = useState(false)

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
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideLeft  { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes floatA   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.04)} }
        @keyframes floatB   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(22px) scale(.97)} }
        @keyframes floatC   { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-18px)} }
        @keyframes pulse    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }

        .hl-step-in  { animation:slideLeft  .28s cubic-bezier(.4,0,.2,1) both; }
        .hl-step-out { animation:slideRight .28s cubic-bezier(.4,0,.2,1) both; }
        .hl-card-anim{ animation:fadeUp .42s cubic-bezier(.4,0,.2,1) both; }
        .hl-feat     { animation:fadeUp .5s cubic-bezier(.4,0,.2,1) both; }

        .hl-input {
          width:100%; border-radius:12px; padding:13px 44px;
          font-size:.9rem; outline:none; box-sizing:border-box;
          transition:border-color .2s,box-shadow .2s,background .3s,color .3s;
        }
        .hl-input:focus { border-color:#0D9488!important; box-shadow:0 0 0 3px rgba(13,148,136,.18)!important; }
        .hl-input.err   { border-color:#f87171!important; box-shadow:0 0 0 3px rgba(248,113,113,.15)!important; }

        .hl-btn {
          width:100%; padding:13px 20px; border-radius:12px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#0D9488,#059669);
          color:#fff; font-size:.9rem; font-weight:700; letter-spacing:.02em;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:opacity .2s,transform .15s,box-shadow .2s;
          box-shadow:0 4px 22px rgba(13,148,136,.42);
        }
        .hl-btn:hover:not(:disabled)  { opacity:.91; transform:translateY(-1px); box-shadow:0 7px 28px rgba(13,148,136,.58); }
        .hl-btn:active:not(:disabled) { transform:translateY(0); }
        .hl-btn:disabled { opacity:.6; cursor:not-allowed; }

        .hl-back {
          background:none; border:none; cursor:pointer;
          display:flex; align-items:center; gap:4px;
          font-size:.78rem; padding:0; transition:color .15s;
        }
        .hl-toggle {
          display:flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:10px; border:1px solid;
          cursor:pointer; transition:background .2s,border-color .2s,transform .15s;
          flex-shrink:0;
        }
        .hl-toggle:hover { transform:scale(1.1); }

        /* ── layout ── */
        .hl-layout { min-height:100vh; display:flex; position:relative; overflow:hidden; transition:background .35s; }
        .hl-left   { flex:0 0 46%; display:flex; flex-direction:column; justify-content:space-between; padding:44px 52px; position:relative; z-index:1; overflow:hidden; transition:background .35s,box-shadow .35s; }
        .hl-right  { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 48px; position:relative; z-index:1; }
        .hl-card   { width:100%; max-width:440px; border-radius:24px; padding:44px 40px; backdrop-filter:blur(24px); transition:background .3s,border-color .3s,box-shadow .3s; position:relative; z-index:2; }

        /* mobile header (hidden on desktop) */
        .hl-mob-header { display:none; align-items:center; justify-content:space-between; width:100%; max-width:440px; margin-bottom:28px; }

        @media (max-width: 768px) {
          .hl-left       { display:none !important; }
          .hl-right      { padding:24px 20px 40px; justify-content:flex-start; padding-top:32px; }
          .hl-card       { padding:28px 22px; border-radius:20px; }
          .hl-mob-header { display:flex; }
        }
        @media (max-width: 400px) {
          .hl-right { padding:20px 12px 32px; }
          .hl-card  { padding:24px 18px; }
        }
      `}</style>

      {/* ── page ── */}
      <div className="hl-layout" style={{ background:c.pageGrad }}>

        {/* ── global ambient orbs (right side & full page) ── */}
        <div style={{ position:'fixed', top:'-8%', right:'8%', width:520, height:520, borderRadius:'50%', background:`radial-gradient(circle,${c.orb1} 0%,transparent 68%)`, filter:'blur(60px)', pointerEvents:'none', zIndex:0, animation:'floatA 14s ease-in-out infinite' }} />
        <div style={{ position:'fixed', bottom:'5%', right:'22%', width:380, height:380, borderRadius:'50%', background:`radial-gradient(circle,${c.orb2} 0%,transparent 68%)`, filter:'blur(52px)', pointerEvents:'none', zIndex:0, animation:'floatB 18s ease-in-out infinite' }} />
        <div style={{ position:'fixed', top:'40%', right:'-4%', width:300, height:300, borderRadius:'50%', background:`radial-gradient(circle,${c.orb3} 0%,transparent 65%)`, filter:'blur(44px)', pointerEvents:'none', zIndex:0, animation:'floatC 22s ease-in-out infinite' }} />

        {/* ── decorative dot grid (right side) ── */}
        <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:.65 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill={c.dotColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* ── decorative rings behind card ── */}
        <div style={{ position:'fixed', top:'50%', left:'62%', transform:'translate(-50%,-50%)', width:520, height:520, borderRadius:'50%', border:`1px solid ${c.ringColor}`, pointerEvents:'none', zIndex:0, animation:'pulse 8s ease-in-out infinite' }} />
        <div style={{ position:'fixed', top:'50%', left:'62%', transform:'translate(-50%,-50%)', width:380, height:380, borderRadius:'50%', border:`1px solid ${c.ringColor}`, opacity:.6, pointerEvents:'none', zIndex:0, animation:'pulse 8s ease-in-out infinite .8s' }} />
        <div style={{ position:'fixed', top:'50%', left:'62%', transform:'translate(-50%,-50%)', width:240, height:240, borderRadius:'50%', border:`1px solid ${c.ringColor}`, opacity:.4, pointerEvents:'none', zIndex:0, animation:'pulse 8s ease-in-out infinite 1.6s' }} />

        {/* ═══════════════════════════════════════════════════════════════════════
            LEFT BRANDING PANEL (hidden on mobile)
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="hl-left" style={{ background:c.leftPanelBg, boxShadow:c.leftShadow }}>

          {/* grid overlay */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={c.gridColor} strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* glows */}
          <div style={{ position:'absolute', top:'-15%', left:'-10%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle,rgba(13,148,136,.22) 0%,transparent 65%)', filter:'blur(55px)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-12%', right:'-12%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(5,150,105,.18) 0%,transparent 65%)', filter:'blur(55px)', pointerEvents:'none' }} />

          {/* ── top: logo + toggle ── */}
          <div style={{ position:'relative', zIndex:1, animation:'fadeIn .5s ease both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:13, background:'linear-gradient(135deg,#0D9488,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 20px rgba(13,148,136,.5)' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:'1.05rem', color:'#fff', letterSpacing:'-.01em' }}>TenantForge</div>
                  <div style={{ fontSize:'.58rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.32)' }}>HRMS Platform</div>
                </div>
              </div>
              <button className="hl-toggle" style={{ background:c.toggleBg, borderColor:c.toggleBorder, color:c.toggleIcon }} onClick={() => setTheme(isDark ? 'light' : 'dark')} title={isDark ? 'Light mode' : 'Dark mode'}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            {/* headline */}
            <div style={{ animation:'fadeUp .5s .08s cubic-bezier(.4,0,.2,1) both' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 12px', borderRadius:20, background:c.tagBg, border:`1px solid ${c.tagBorder}`, marginBottom:18 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 8px #34d399', display:'inline-block' }} />
                <span style={{ fontSize:'.67rem', fontWeight:700, color:c.tagText, letterSpacing:'.06em', textTransform:'uppercase' }}>Live Dashboard</span>
              </div>
              <h1 style={{ fontFamily:'var(--fd)', fontSize:'2.45rem', fontWeight:900, color:'#fff', lineHeight:1.1, marginBottom:14, letterSpacing:'-.025em' }}>
                Manage Your<br/>
                <span style={{ background:'linear-gradient(90deg,#34d399 20%,#0D9488 80%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Workforce</span><br/>
                Smarter
              </h1>
              <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.86rem', lineHeight:1.7, maxWidth:290 }}>
                One platform for employees, attendance, payroll, and your entire org hierarchy.
              </p>
            </div>
          </div>

          {/* ── middle: feature cards ── */}
          <div style={{ position:'relative', zIndex:1, animation:'fadeUp .5s .2s cubic-bezier(.4,0,.2,1) both' }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="hl-feat" style={{
                animationDelay:`${.22 + i * .08}s`,
                display:'flex', alignItems:'flex-start', gap:14,
                padding:'14px 16px', borderRadius:14,
                marginBottom: i < FEATURES.length - 1 ? 10 : 0,
                background:'rgba(255,255,255,.042)', border:'1px solid rgba(255,255,255,.075)',
                backdropFilter:'blur(10px)',
                boxShadow:'0 2px 14px rgba(0,0,0,.18)',
              }}>
                <div style={{ width:38, height:38, borderRadius:11, background:'rgba(13,148,136,.18)', border:'1px solid rgba(13,148,136,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#34d399' }}>
                  <f.Icon size={17} />
                </div>
                <div style={{ paddingTop:1 }}>
                  <div style={{ fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,.88)', marginBottom:3, letterSpacing:'-.01em' }}>{f.title}</div>
                  <div style={{ fontSize:'.67rem', color:'rgba(255,255,255,.38)', lineHeight:1.55 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── bottom: trust pills ── */}
          <div style={{ position:'relative', zIndex:1, animation:'fadeIn .6s .5s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {TRUST.map((t) => (
                <div key={t.label} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 10px', borderRadius:10, background:'rgba(255,255,255,.042)', border:'1px solid rgba(255,255,255,.07)' }}>
                  <t.Icon size={12} color="#34d399" />
                  <span style={{ fontSize:'.6rem', fontWeight:600, color:'rgba(255,255,255,.42)', whiteSpace:'nowrap' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            RIGHT FORM PANEL
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="hl-right">

          {/* mobile-only header */}
          <div className="hl-mob-header">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#0D9488,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(13,148,136,.45)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:'.95rem', color:c.stepTitle, letterSpacing:'-.01em', transition:'color .3s' }}>TenantForge</div>
                <div style={{ fontSize:'.55rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:c.stepSub, transition:'color .3s' }}>HRMS Platform</div>
              </div>
            </div>
            <button className="hl-toggle" style={{ background:c.toggleBg, borderColor:c.toggleBorder, color:c.toggleIcon }} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* ── login card ── */}
          <div className="hl-card hl-card-anim" style={{ background:c.cardBg, border:`1px solid ${c.cardBorder}`, boxShadow:c.cardShadow }}>

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

            {/* ── STEP 1: identifier ── */}
            {step === 'identifier' && (
              <div className="hl-step-out">
                <div style={{ marginBottom:30 }}>
                  <p style={{ fontSize:'.71rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:c.stepLabel, marginBottom:10, transition:'color .3s' }}>Step 1 of 2</p>
                  <h2 style={{ fontFamily:'var(--fd)', fontSize:'1.62rem', fontWeight:800, color:c.stepTitle, marginBottom:8, letterSpacing:'-.02em', transition:'color .3s' }}>Welcome back</h2>
                  <p style={{ color:c.stepSub, fontSize:'.84rem', lineHeight:1.6, transition:'color .3s' }}>Enter your work email or phone number to continue.</p>
                </div>

                <form onSubmit={handleIdentifierNext}>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:'block', fontSize:'.77rem', fontWeight:600, color:c.labelText, marginBottom:8, letterSpacing:'.02em', transition:'color .3s' }}>Work Email or Phone</label>
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

                  <button type="submit" className="hl-btn">Continue <ArrowRight size={16} /></button>
                </form>
              </div>
            )}

            {/* ── STEP 2: password ── */}
            {step === 'password' && (
              <div className="hl-step-in">
                {/* back + chip */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:26 }}>
                  <button type="button" className="hl-back" style={{ color:c.backBtn }} onMouseEnter={e=>(e.currentTarget.style.color=c.backBtnHover)} onMouseLeave={e=>(e.currentTarget.style.color=c.backBtn)} onClick={goBack}>
                    <ChevronLeft size={15} /> Back
                  </button>
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:20, background:c.chipBg, border:`1px solid ${c.chipBorder}`, transition:'background .3s,border-color .3s' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#34d399', flexShrink:0 }} />
                    <span style={{ fontSize:'.73rem', color:c.chipText, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color .3s' }}>{data.identifier}</span>
                    <button type="button" onClick={goBack} style={{ background:'none', border:'none', cursor:'pointer', color:'#0D9488', fontSize:'.69rem', fontWeight:700, padding:0, flexShrink:0 }}>Change</button>
                  </div>
                </div>

                {/* avatar */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:26, textAlign:'center' }}>
                  <div style={{ width:58, height:58, borderRadius:'50%', background:'linear-gradient(135deg,#0D9488,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', fontWeight:700, color:'#fff', boxShadow:'0 4px 20px rgba(13,148,136,.45)' }}>
                    {data.identifier.trim().split(/[@\s]+/)[0].slice(0,2).toUpperCase() || '?'}
                  </div>
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontFamily:'var(--fd)', fontSize:'1.5rem', fontWeight:800, color:c.avatarTitle, letterSpacing:'-.02em', marginBottom:4, transition:'color .3s' }}>Enter Password</div>
                    <div style={{ fontSize:'.79rem', color:c.avatarSub, transition:'color .3s' }}>Sign in to your HRMS account</div>
                  </div>
                </div>

                {/* error */}
                {authError && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:10, marginBottom:20, background:c.errorBg, border:`1px solid ${c.errorBorder}`, color:c.errorText, fontSize:'.79rem', lineHeight:1.5, transition:'background .3s,border-color .3s,color .3s' }}>
                    <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} />{authError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom:20 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <label style={{ fontSize:'.77rem', fontWeight:600, color:c.labelText, letterSpacing:'.02em', transition:'color .3s' }}>Password</label>
                      <span style={{ fontSize:'.7rem', color:'#0D9488', cursor:'pointer', fontWeight:600 }}>Forgot password?</span>
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
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:c.pwToggle, padding:2, display:'flex', transition:'color .15s' }}
                        onMouseEnter={e=>(e.currentTarget.style.color=c.pwToggleHover)}
                        onMouseLeave={e=>(e.currentTarget.style.color=c.pwToggle)}
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
