import { useState, useRef, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import {
  Eye, EyeOff, Lock, ArrowRight, ChevronLeft,
  AlertCircle, CheckCircle2, Sun, Moon,
} from 'lucide-react'

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function isEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function isPhone(v: string) { return /^\+?[\d\s\-().]{7,15}$/.test(v.trim()) }
function getIdentifierType(v: string): 'email' | 'phone' | null {
  if (isEmail(v)) return 'email'
  if (isPhone(v)) return 'phone'
  return null
}

/* ─── theme ──────────────────────────────────────────────────────────────── */
const T = {
  dark: {
    pageBg:         '#050e0c',
    cardBg:         'rgba(10,25,22,.85)',
    cardBorder:     'rgba(13,148,136,.28)',
    cardGlow:       '0 0 0 1px rgba(13,148,136,.18), 0 8px 32px rgba(13,148,136,.1)',
    logoText:       '#ffffff',
    logoSub:        'rgba(255,255,255,.3)',
    divider:        'rgba(255,255,255,.07)',
    progressInact:  'rgba(255,255,255,.1)',
    stepLabel:      '#34d399',
    stepTitle:      '#ffffff',
    stepSub:        'rgba(255,255,255,.38)',
    inputBg:        'rgba(255,255,255,.05)',
    inputBorder:    'rgba(255,255,255,.1)',
    inputText:      '#ffffff',
    inputPH:        'rgba(255,255,255,.26)',
    inputIcon:      'rgba(255,255,255,.28)',
    label:          'rgba(255,255,255,.52)',
    backBtn:        'rgba(255,255,255,.4)',
    backHover:      'rgba(255,255,255,.85)',
    chipBg:         'rgba(13,148,136,.1)',
    chipBorder:     'rgba(13,148,136,.2)',
    chipText:       'rgba(255,255,255,.6)',
    avatarTitle:    '#ffffff',
    avatarSub:      'rgba(255,255,255,.3)',
    errBg:          'rgba(239,68,68,.1)',
    errBorder:      'rgba(239,68,68,.22)',
    errText:        '#fca5a5',
    footer:         'rgba(255,255,255,.2)',
    toggleBg:       'rgba(255,255,255,.06)',
    toggleBorder:   'rgba(255,255,255,.1)',
    toggleIcon:     'rgba(255,255,255,.5)',
    pwToggle:       'rgba(255,255,255,.28)',
    pwToggleHover:  'rgba(255,255,255,.7)',
    /* bg decorations */
    blob1: 'rgba(13,148,136,.3)',
    blob2: 'rgba(5,150,105,.2)',
    blob3: 'rgba(52,211,153,.12)',
    blob4: 'rgba(6,78,59,.25)',
    gridLine: 'rgba(13,148,136,.04)',
    ring:  'rgba(13,148,136,.09)',
    dot:   'rgba(13,148,136,.55)',
  },
  light: {
    pageBg:         '#e8faf4',
    cardBg:         'rgba(255,255,255,.9)',
    cardBorder:     'rgba(13,148,136,.2)',
    cardGlow:       '0 0 0 1px rgba(13,148,136,.14), 0 6px 24px rgba(13,148,136,.08), 0 2px 8px rgba(0,0,0,.04)',
    logoText:       '#0f2420',
    logoSub:        'rgba(15,36,32,.35)',
    divider:        'rgba(13,148,136,.1)',
    progressInact:  'rgba(13,148,136,.13)',
    stepLabel:      '#059669',
    stepTitle:      '#0f2420',
    stepSub:        'rgba(15,36,32,.45)',
    inputBg:        'rgba(255,255,255,.95)',
    inputBorder:    'rgba(13,148,136,.18)',
    inputText:      '#0f2420',
    inputPH:        'rgba(15,36,32,.3)',
    inputIcon:      'rgba(13,148,136,.5)',
    label:          'rgba(15,36,32,.58)',
    backBtn:        'rgba(15,36,32,.4)',
    backHover:      '#0f2420',
    chipBg:         'rgba(13,148,136,.07)',
    chipBorder:     'rgba(13,148,136,.16)',
    chipText:       'rgba(15,36,32,.65)',
    avatarTitle:    '#0f2420',
    avatarSub:      'rgba(15,36,32,.4)',
    errBg:          'rgba(239,68,68,.06)',
    errBorder:      'rgba(239,68,68,.16)',
    errText:        '#dc2626',
    footer:         'rgba(15,36,32,.28)',
    toggleBg:       'rgba(13,148,136,.07)',
    toggleBorder:   'rgba(13,148,136,.14)',
    toggleIcon:     '#0D9488',
    pwToggle:       'rgba(15,36,32,.3)',
    pwToggleHover:  'rgba(15,36,32,.7)',
    blob1: 'rgba(13,148,136,.22)',
    blob2: 'rgba(5,150,105,.14)',
    blob3: 'rgba(52,211,153,.1)',
    blob4: 'rgba(20,184,166,.12)',
    gridLine: 'rgba(13,148,136,.055)',
    ring:  'rgba(13,148,136,.12)',
    dot:   'rgba(13,148,136,.35)',
  },
} as const

/* ─── page ──────────────────────────────────────────────────────────────────── */
export default function HrmsLogin() {
  const page      = usePage<any>()
  const authError = (page.props as any)?.authError as string | undefined

  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('tf-theme') as 'dark' | 'light') || 'dark' : 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tf-theme', theme)
  }, [theme])

  const c      = T[theme]
  const isDark = theme === 'dark'

  /* mouse parallax — updates DOM directly, zero re-renders */
  const b1 = useRef<HTMLDivElement>(null)
  const b2 = useRef<HTMLDivElement>(null)
  const b3 = useRef<HTMLDivElement>(null)
  const b4 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mouse = { x: 0, y: 0 }
    const cur   = { x: 0, y: 0 }
    let raf: number

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const tick = () => {
      cur.x += (mouse.x - cur.x) * 0.055
      cur.y += (mouse.y - cur.y) * 0.055
      if (b1.current) b1.current.style.transform = `translate(${cur.x * -28}px,${cur.y * -20}px)`
      if (b2.current) b2.current.style.transform = `translate(${cur.x * 20}px,${cur.y * 26}px)`
      if (b3.current) b3.current.style.transform = `translate(${cur.x * -14}px,${cur.y * 18}px)`
      if (b4.current) b4.current.style.transform = `translate(${cur.x * 18}px,${cur.y * -16}px)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  /* step flow */
  const [step, setStep]                   = useState<'identifier' | 'password'>('identifier')
  const [identifier, setIdentifier]       = useState('')
  const [identifierErr, setIdentifierErr] = useState('')
  const [checking, setChecking]           = useState(false)
  const [showPw, setShowPw]               = useState(false)

  const identifierRef = useRef<HTMLInputElement>(null)
  const passwordRef   = useRef<HTMLInputElement>(null)

  useEffect(() => { identifierRef.current?.focus() }, [])
  useEffect(() => {
    if (step === 'password') setTimeout(() => passwordRef.current?.focus(), 60)
  }, [step])

  const { data, setData, post, processing, errors } = useForm({ identifier: '', password: '' })

  async function handleIdentifierNext(e: React.SyntheticEvent) {
    e.preventDefault()
    const v = identifier.trim()
    if (!v) { setIdentifierErr('Enter your work email or phone number.'); return }
    if (!getIdentifierType(v)) { setIdentifierErr('Enter a valid email address or phone number.'); return }

    setChecking(true)
    setIdentifierErr('')
    try {
      const res = await fetch(`/login/check-identifier?identifier=${encodeURIComponent(v)}`)
      const json = await res.json()
      if (!json.exists) {
        setIdentifierErr('No account found with this email or phone number.')
        return
      }
      setData('identifier', v)
      setStep('password')
    } catch {
      setIdentifierErr('Unable to connect. Please try again.')
    } finally {
      setChecking(false)
    }
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
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideL  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideR  { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        /* aurora blob animations */
        @keyframes aurora1 {
          0%   { border-radius:60% 40% 55% 45%/50% 60% 40% 50%; }
          33%  { border-radius:40% 60% 45% 55%/60% 40% 60% 40%; }
          66%  { border-radius:55% 45% 60% 40%/40% 55% 45% 60%; }
          100% { border-radius:60% 40% 55% 45%/50% 60% 40% 50%; }
        }
        @keyframes aurora2 {
          0%   { border-radius:45% 55% 40% 60%/60% 45% 55% 40%; }
          50%  { border-radius:65% 35% 55% 45%/40% 65% 35% 60%; }
          100% { border-radius:45% 55% 40% 60%/60% 45% 55% 40%; }
        }
        @keyframes aurora3 {
          0%   { border-radius:55% 45% 65% 35%/45% 60% 40% 55%; }
          50%  { border-radius:35% 65% 45% 55%/65% 35% 60% 40%; }
          100% { border-radius:55% 45% 65% 35%/45% 60% 40% 55%; }
        }
        @keyframes drift1  { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(-30px,-20px) rotate(120deg)} 66%{transform:translate(20px,30px) rotate(240deg)} }
        @keyframes drift2  { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(25px,35px) rotate(-100deg)} 66%{transform:translate(-35px,-15px) rotate(-220deg)} }
        @keyframes drift3  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }
        @keyframes drift4  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(22px,-18px)} }
        @keyframes pulse   { 0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.75;transform:translate(-50%,-50%) scale(1.07)} }
        @keyframes spin-slow{ to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes float-dot{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

        .hl-card   { animation:fadeUp .42s cubic-bezier(.4,0,.2,1) both; }
        .hl-step-in  { animation:slideL .26s cubic-bezier(.4,0,.2,1) both; }
        .hl-step-out { animation:slideR .26s cubic-bezier(.4,0,.2,1) both; }

        .hl-input {
          width:100%; border-radius:11px; padding:12px 42px;
          font-size:.875rem; outline:none; box-sizing:border-box;
          transition:border-color .18s, box-shadow .18s, background .3s, color .3s;
        }
        .hl-input:focus {
          border-color:#0D9488 !important;
          box-shadow:0 0 0 3px rgba(13,148,136,.16) !important;
        }
        .hl-input.err {
          border-color:#f87171 !important;
          box-shadow:0 0 0 3px rgba(248,113,113,.13) !important;
        }

        .hl-btn {
          width:100%; padding:12px 18px; border-radius:11px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#0D9488 0%,#059669 100%);
          color:#fff; font-size:.875rem; font-weight:700; letter-spacing:.025em;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:filter .18s, transform .14s, box-shadow .18s;
          box-shadow:0 4px 20px rgba(13,148,136,.35);
          position:relative; overflow:hidden;
        }
        .hl-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.12),transparent);
          opacity:0; transition:opacity .2s;
        }
        .hl-btn:hover:not(:disabled)::before { opacity:1; }
        .hl-btn:hover:not(:disabled)  { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 7px 28px rgba(13,148,136,.5); }
        .hl-btn:active:not(:disabled) { transform:translateY(0); }
        .hl-btn:disabled              { opacity:.55; cursor:not-allowed; }

        .hl-back {
          background:none; border:none; cursor:pointer;
          display:flex; align-items:center; gap:4px;
          font-size:.76rem; padding:0; transition:color .14s;
        }
        .hl-toggle {
          width:34px; height:34px; border-radius:9px; border:1px solid;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:background .2s, transform .15s, box-shadow .15s;
          flex-shrink:0;
        }
        .hl-toggle:hover { transform:scale(1.08); box-shadow:0 2px 10px rgba(13,148,136,.2); }

        /* floating accent dots */
        .hl-acc-dot {
          position:fixed; width:6px; height:6px; border-radius:50%;
          background:#34d399; pointer-events:none; z-index:0;
        }

        /* responsive card */
        @media (max-width:480px) {
          .hl-card-wrap { padding:16px 12px !important; }
          .hl-card-inner { padding:28px 20px !important; border-radius:18px !important; }
        }
      `}</style>

      {/* ── full-page canvas ── */}
      <div style={{
        minHeight: '100vh', background: c.pageBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        transition: 'background .35s',
      }}>

        {/* ── aurora blobs (mouse-tracked via refs) ── */}
        <div ref={b1} style={{ position:'fixed', top:'-15%', right:'-8%', width:680, height:680, background:c.blob1, filter:'blur(90px)', pointerEvents:'none', zIndex:0, animation:'drift1 22s ease-in-out infinite, aurora1 12s ease-in-out infinite', willChange:'transform' }} />
        <div ref={b2} style={{ position:'fixed', bottom:'-12%', left:'-8%', width:560, height:560, background:c.blob2, filter:'blur(80px)', pointerEvents:'none', zIndex:0, animation:'drift2 28s ease-in-out infinite, aurora2 15s ease-in-out infinite', willChange:'transform' }} />
        <div ref={b3} style={{ position:'fixed', top:'30%', left:'5%', width:380, height:380, background:c.blob3, filter:'blur(70px)', pointerEvents:'none', zIndex:0, animation:'drift3 18s ease-in-out infinite, aurora3 18s ease-in-out infinite', willChange:'transform' }} />
        <div ref={b4} style={{ position:'fixed', top:'10%', right:'20%', width:320, height:320, background:c.blob4, filter:'blur(65px)', pointerEvents:'none', zIndex:0, animation:'drift4 24s ease-in-out infinite', willChange:'transform' }} />

        {/* ── line grid ── */}
        <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lg" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke={c.gridLine} strokeWidth=".8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lg)" />
        </svg>

        {/* ── decorative concentric rings ── */}
        <div style={{ position:'fixed', top:'50%', left:'50%', width:680, height:680, borderRadius:'50%', border:`1px solid ${c.ring}`, pointerEvents:'none', zIndex:0, animation:'pulse 10s ease-in-out infinite', transform:'translate(-50%,-50%)' }} />
        <div style={{ position:'fixed', top:'50%', left:'50%', width:480, height:480, borderRadius:'50%', border:`1px solid ${c.ring}`, opacity:.65, pointerEvents:'none', zIndex:0, animation:'pulse 10s ease-in-out infinite .8s', transform:'translate(-50%,-50%)' }} />
        <div style={{ position:'fixed', top:'50%', left:'50%', width:280, height:280, borderRadius:'50%', border:`1px solid ${c.ring}`, opacity:.35, pointerEvents:'none', zIndex:0, animation:'pulse 10s ease-in-out infinite 1.6s', transform:'translate(-50%,-50%)' }} />

        {/* ── spinning dashed ring ── */}
        <svg style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:820, height:820, pointerEvents:'none', zIndex:0, animation:'spin-slow 60s linear infinite', opacity:.35 }} viewBox="0 0 820 820">
          <circle cx="410" cy="410" r="400" fill="none" stroke={c.ring} strokeWidth="1" strokeDasharray="6 18" />
        </svg>

        {/* ── floating accent dots ── */}
        {[
          { t:'12%',  l:'8%',  delay:'0s',   op:.7 },
          { t:'78%',  l:'15%', delay:'1.2s', op:.5 },
          { t:'25%',  r:'10%', delay:'0.6s', op:.6 },
          { t:'65%',  r:'8%',  delay:'1.8s', op:.45 },
          { t:'45%',  l:'4%',  delay:'2.4s', op:.4 },
        ].map((d, i) => (
          <div key={i} className="hl-acc-dot" style={{ top:d.t, left:(d as any).l, right:(d as any).r, opacity:d.op, animationDelay:d.delay, animation:`float-dot ${3 + i * 0.5}s ease-in-out infinite ${d.delay}`, boxShadow:'0 0 8px #34d399' }} />
        ))}

        {/* ── card wrapper ── */}
        <div className="hl-card-wrap" style={{ width:'100%', maxWidth:440, padding:'24px 16px', position:'relative', zIndex:1 }}>

          {/* gradient border wrapper */}
          <div className="hl-card" style={{
            borderRadius: 22,
            padding: 1.5,
            background: isDark
              ? 'linear-gradient(135deg,rgba(13,148,136,.5) 0%,rgba(5,150,105,.3) 50%,rgba(52,211,153,.4) 100%)'
              : 'linear-gradient(135deg,rgba(13,148,136,.35) 0%,rgba(5,150,105,.2) 50%,rgba(52,211,153,.3) 100%)',
            boxShadow: c.cardGlow,
          }}>
            <div className="hl-card-inner" style={{
              background: c.cardBg,
              borderRadius: 21,
              padding: '34px 30px',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              transition: 'background .3s',
            }}>

              {/* ── card header: logo + theme ── */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#0D9488,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 16px rgba(13,148,136,.45)' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:'.96rem', color:c.logoText, letterSpacing:'-.01em', transition:'color .3s' }}>TenantForge</div>
                    <div style={{ fontSize:'.56rem', fontWeight:700, letterSpacing:'.11em', textTransform:'uppercase', color:c.logoSub, transition:'color .3s' }}>HRMS Platform</div>
                  </div>
                </div>
                <button
                  className="hl-toggle"
                  style={{ background:c.toggleBg, borderColor:c.toggleBorder, color:c.toggleIcon }}
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  title={isDark ? 'Light mode' : 'Dark mode'}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>

              {/* divider */}
              <div style={{ height:1, background:c.divider, marginBottom:22 }} />

              {/* progress */}
              <div style={{ display:'flex', gap:5, marginBottom:26 }}>
                {(['identifier','password'] as const).map(s => (
                  <div key={s} style={{
                    height:3, borderRadius:3, transition:'all .32s ease',
                    flex: step === s ? 2 : 1,
                    background: step === s ? 'linear-gradient(90deg,#0D9488,#34d399)' : c.progressInact,
                  }} />
                ))}
              </div>

              {/* ── STEP 1 ── */}
              {step === 'identifier' && (
                <div className="hl-step-out">
                  <div style={{ marginBottom:24 }}>
                    <p style={{ fontSize:'.67rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:c.stepLabel, marginBottom:8, transition:'color .3s' }}>
                      Step 1 of 2
                    </p>
                    <h2 style={{ fontFamily:'var(--fd)', fontSize:'1.52rem', fontWeight:800, color:c.stepTitle, marginBottom:6, letterSpacing:'-.02em', transition:'color .3s' }}>
                      Welcome back
                    </h2>
                    <p style={{ color:c.stepSub, fontSize:'.82rem', lineHeight:1.65, transition:'color .3s' }}>
                      Enter your work email or phone to continue.
                    </p>
                  </div>

                  <form onSubmit={handleIdentifierNext}>
                    <div style={{ marginBottom:18 }}>
                      <label style={{ display:'block', fontSize:'.74rem', fontWeight:600, color:c.label, marginBottom:7, letterSpacing:'.02em', transition:'color .3s' }}>
                        Work Email or Phone
                      </label>
                      <div style={{ position:'relative' }}>
                        <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:c.inputIcon, pointerEvents:'none', display:'flex', transition:'color .3s' }}>
                          {idType === 'phone'
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.15 12a19.8 19.8 0 01-3.07-8.67A2 2 0 012.06 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
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
                          <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'#34d399', display:'flex' }}>
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>
                      {identifierErr && (
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:7, color:'#f87171', fontSize:'.73rem' }}>
                          <AlertCircle size={12} />{identifierErr}
                        </div>
                      )}
                      <style>{`.hl-input::placeholder{color:${c.inputPH}}`}</style>
                    </div>
                    <button type="submit" className="hl-btn" disabled={checking}>
                      {checking
                        ? <><span style={{ width:15, height:15, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 1s linear infinite', display:'inline-block' }} /> Checking…</>
                        : <>Continue <ArrowRight size={15} /></>
                      }
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 'password' && (
                <div className="hl-step-in">

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <button type="button" className="hl-back" style={{ color:c.backBtn }}
                      onMouseEnter={e => (e.currentTarget.style.color = c.backHover)}
                      onMouseLeave={e => (e.currentTarget.style.color = c.backBtn)}
                      onClick={goBack}
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:20, background:c.chipBg, border:`1px solid ${c.chipBorder}`, transition:'background .3s,border-color .3s' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', flexShrink:0 }} />
                      <span style={{ fontSize:'.71rem', color:c.chipText, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color .3s' }}>
                        {data.identifier}
                      </span>
                      <button type="button" onClick={goBack} style={{ background:'none', border:'none', cursor:'pointer', color:'#0D9488', fontSize:'.67rem', fontWeight:700, padding:0, flexShrink:0 }}>
                        Change
                      </button>
                    </div>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20, textAlign:'center' }}>
                    <div style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(135deg,#0D9488,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.15rem', fontWeight:700, color:'#fff', boxShadow:'0 4px 20px rgba(13,148,136,.42)', letterSpacing:'-.01em' }}>
                      {data.identifier.trim().split(/[@\s]+/)[0].slice(0,2).toUpperCase() || '?'}
                    </div>
                    <div style={{ marginTop:12 }}>
                      <div style={{ fontFamily:'var(--fd)', fontSize:'1.35rem', fontWeight:800, color:c.avatarTitle, letterSpacing:'-.02em', marginBottom:3, transition:'color .3s' }}>
                        Enter Password
                      </div>
                      <div style={{ fontSize:'.77rem', color:c.avatarSub, transition:'color .3s' }}>Sign in to your HRMS account</div>
                    </div>
                  </div>

                  {authError && (
                    <div style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'11px 13px', borderRadius:10, marginBottom:18, background:c.errBg, border:`1px solid ${c.errBorder}`, color:c.errText, fontSize:'.77rem', lineHeight:1.5, transition:'background .3s,border-color .3s,color .3s' }}>
                      <AlertCircle size={13} style={{ flexShrink:0, marginTop:1 }} />{authError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom:18 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                        <label style={{ fontSize:'.74rem', fontWeight:600, color:c.label, letterSpacing:'.02em', transition:'color .3s' }}>Password</label>
                        <span style={{ fontSize:'.7rem', color:'#0D9488', cursor:'pointer', fontWeight:600 }}>Forgot password?</span>
                      </div>
                      <div style={{ position:'relative' }}>
                        <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:c.inputIcon, pointerEvents:'none', display:'flex', transition:'color .3s' }}>
                          <Lock size={14} />
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
                          style={{ background:c.inputBg, border:`1.5px solid ${errors.password || authError ? '#f87171' : c.inputBorder}`, color:c.inputText, paddingRight:42 }}
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:c.pwToggle, padding:2, display:'flex', transition:'color .14s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = c.pwToggleHover)}
                          onMouseLeave={e => (e.currentTarget.style.color = c.pwToggle)}
                        >
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <style>{`.hl-input::placeholder{color:${c.inputPH}}`}</style>
                    </div>

                    <button type="submit" className="hl-btn" disabled={processing}>
                      {processing
                        ? <><span style={{ width:15, height:15, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 1s linear infinite', display:'inline-block' }} /> Signing in…</>
                        : <>Sign in to HRMS <ArrowRight size={15} /></>
                      }
                    </button>
                  </form>
                </div>
              )}

              <p style={{ marginTop:22, textAlign:'center', fontSize:'.68rem', color:c.footer, lineHeight:1.6, transition:'color .3s' }}>
                Having trouble?{' '}
                <span style={{ color:'#0D9488', fontWeight:600, cursor:'pointer' }}>Contact HR Administrator</span>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
