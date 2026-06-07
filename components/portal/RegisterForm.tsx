'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import {
  Eye, EyeOff, ClipboardList, Key, GraduationCap, Building2,
  Mail, Smartphone, ArrowLeft, Loader2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LookupRow } from '@/types/database'

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = [
  'w-full px-4 py-2.5 rounded-lg text-sm text-[#2C1F14] placeholder-[#8B3A2A]/50',
  'border border-[rgba(212,134,10,0.35)] bg-white/70',
  'focus:outline-none focus:border-[#D4860A] focus:ring-1 focus:ring-[#D4860A]',
  'transition-colors',
].join(' ')

const labelCls = 'block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase'

const errBoxCls = [
  'text-[#8B3A2A] text-xs text-center py-2 px-3 rounded-lg',
  'bg-[rgba(139,58,42,0.08)] border border-[rgba(139,58,42,0.25)]',
].join(' ')

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_ICONS: Record<string, LucideIcon> = {
  property_manager: ClipboardList,
  landlord:         Building2,
  tenant:           Key,
  student:          GraduationCap,
}

const FALLBACK_ROLES: LookupRow[] = [
  { id: 1, code: 'property_manager', label: 'Property Manager / Landlord', description: null, sort_order: 1, is_active: true, flags: {}, created_at: '' },
  { id: 3, code: 'tenant',           label: 'Tenant',                      description: null, sort_order: 3, is_active: true, flags: {}, created_at: '' },
  { id: 4, code: 'student',          label: 'Student',                     description: null, sort_order: 4, is_active: true, flags: {}, created_at: '' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type OtpMethod = 'email' | 'phone'
type OtpState  = 'idle' | 'sending' | 'sent'

// ── Component ─────────────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter()

  // Portal roles from API
  const [portalRoles, setPortalRoles] = useState<LookupRow[]>(FALLBACK_ROLES)
  useEffect(() => {
    fetch('/api/lookups?table=ref_portal_roles')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPortalRoles(data.filter((r: LookupRow) => r.code !== 'admin'))
        }
      })
      .catch(() => {})
  }, [])

  // ── Step 1 state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    firstName:  '',
    middleName: '',
    lastName:   '',
    dob:        '',
    email:      '',
    phone:      '',
    company:    '',
    password:   '',
    portalRole: '',
  })
  const [showPw, setShowPw]       = useState(false)
  const [step1Error, setStep1Error] = useState('')

  // ── Step 2 state ────────────────────────────────────────────────────────────
  const [otpMethod, setOtpMethod]       = useState<OtpMethod>('email')
  const [otpState, setOtpState]         = useState<OtpState>('idle')
  const [codeDigits, setCodeDigits]     = useState<string[]>(Array(6).fill(''))
  const [maskedContact, setMaskedContact] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [step2Error, setStep2Error]     = useState('')
  const [loading, setLoading]           = useState(false)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const isPropertyManager = form.portalRole === 'property_manager'

  function selectRole(code: string) {
    setForm(f => ({
      ...f,
      portalRole: code,
      // clear company when switching away from PM
      company: code !== 'property_manager' ? '' : f.company,
    }))
  }

  // ── Step 1 → Step 2 ─────────────────────────────────────────────────────────

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    setStep1Error('')
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setStep1Error('First name and last name are required.')
      return
    }
    if (!form.email.trim()) {
      setStep1Error('Email address is required.')
      return
    }
    if (!form.password || form.password.length < 8) {
      setStep1Error('Password must be at least 8 characters.')
      return
    }
    if (!form.portalRole) {
      setStep1Error('Please select your account type.')
      return
    }
    // Go to step 2
    setStep(2)
    setOtpMethod('email')
    setOtpState('idle')
    setCodeDigits(Array(6).fill(''))
    setStep2Error('')
    setResendCountdown(0)
  }

  // ── Send OTP ────────────────────────────────────────────────────────────────

  async function handleSendOtp() {
    setOtpState('sending')
    setStep2Error('')
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: otpMethod,
          email:  form.email,
          phone:  form.phone || undefined,
          name:   form.firstName,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStep2Error(data.error || 'Failed to send code. Please try again.')
        setOtpState('idle')
        return
      }
      setMaskedContact(data.masked || (otpMethod === 'email' ? form.email : form.phone))
      setOtpState('sent')
      setResendCountdown(60)
      setCodeDigits(Array(6).fill(''))
      setTimeout(() => digitRefs.current[0]?.focus(), 80)
    } catch {
      setStep2Error('Network error. Please try again.')
      setOtpState('idle')
    }
  }

  // ── OTP digit handlers ───────────────────────────────────────────────────────

  function handleDigit(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const digit = val.slice(-1)
    const next = [...codeDigits]
    next[idx] = digit
    setCodeDigits(next)
    if (digit && idx < 5) digitRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !codeDigits[idx] && idx > 0) {
      digitRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0)  digitRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) digitRefs.current[idx + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCodeDigits(pasted.split(''))
      digitRefs.current[5]?.focus()
      e.preventDefault()
    }
  }

  // ── Final submit ─────────────────────────────────────────────────────────────

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setStep2Error('')
    const code = codeDigits.join('')
    if (code.length !== 6) {
      setStep2Error('Please enter the complete 6-digit code.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, otpCode: code, otpMethod }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStep2Error(data.message || 'Verification failed. Please try again.')
        setLoading(false)
        return
      }
      const signInRes = await signIn('customer-login', {
        email:    form.email,
        password: form.password,
        redirect: false,
      })
      if (signInRes?.error) {
        setStep2Error('Account created but sign-in failed. Please go to the login page.')
      } else {
        router.push('/portal/customer/dashboard')
        router.refresh()
      }
    } catch {
      setStep2Error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Progress bar ─────────────────────────────────────────────────────────────

  const StepBar = () => (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2 flex-1">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: '#D4860A' }}>1</div>
        <span className="text-xs font-medium text-[#2C1F14]">Your Details</span>
      </div>
      <div className="flex-1 h-px" style={{ background: step === 2 ? '#D4860A' : 'rgba(212,134,10,0.25)' }} />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{
            background: step === 2 ? '#D4860A' : 'transparent',
            border:     step === 2 ? 'none' : '1.5px solid rgba(212,134,10,0.4)',
            color:      step === 2 ? '#fff' : 'rgba(212,134,10,0.6)',
          }}>2</div>
        <span className="text-xs font-medium" style={{ color: step === 2 ? '#2C1F14' : '#8B3A2A' }}>
          Verify
        </span>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 2 — OTP verification
  // ════════════════════════════════════════════════════════════════════════════

  if (step === 2) {
    return (
      <div className="space-y-5">
        <StepBar />

        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1.5 text-xs text-[#8B3A2A] hover:text-[#D4860A] transition-colors font-medium"
        >
          <ArrowLeft size={13} />
          Back to details
        </button>

        <div>
          <h3 className="font-semibold text-[#2C1F14] text-sm mb-1">Verify your identity</h3>
          <p className="text-[#8B3A2A] text-xs leading-relaxed">
            Choose how you&apos;d like to receive your one-time 6-digit code.
          </p>
        </div>

        {/* Method cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Email */}
          <button
            type="button"
            onClick={() => { setOtpMethod('email'); setOtpState('idle'); setStep2Error('') }}
            className={[
              'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all',
              otpMethod === 'email'
                ? 'bg-[rgba(212,134,10,0.10)] border-[#D4860A]'
                : 'bg-white/70 border-[rgba(212,134,10,0.25)] hover:border-[#D4860A]',
            ].join(' ')}
          >
            <Mail size={20} className={otpMethod === 'email' ? 'text-[#D4860A]' : 'text-[#8B3A2A]'} />
            <div>
              <p className="text-xs font-semibold text-[#2C1F14]">Email</p>
              <p className="text-[10px] text-[#8B3A2A]/70 mt-0.5 max-w-[100px] truncate">{form.email}</p>
            </div>
          </button>

          {/* Phone / SMS */}
          <button
            type="button"
            disabled={!form.phone}
            onClick={() => { setOtpMethod('phone'); setOtpState('idle'); setStep2Error('') }}
            className={[
              'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all',
              !form.phone
                ? 'opacity-50 cursor-not-allowed bg-white/40 border-[rgba(212,134,10,0.15)]'
                : otpMethod === 'phone'
                ? 'bg-[rgba(212,134,10,0.10)] border-[#D4860A]'
                : 'bg-white/70 border-[rgba(212,134,10,0.25)] hover:border-[#D4860A]',
            ].join(' ')}
          >
            <Smartphone size={20} className={otpMethod === 'phone' && form.phone ? 'text-[#D4860A]' : 'text-[#8B3A2A]'} />
            <div>
              <p className="text-xs font-semibold text-[#2C1F14]">SMS</p>
              <p className="text-[10px] text-[#8B3A2A]/70 mt-0.5">
                {form.phone || 'No phone added'}
              </p>
            </div>
          </button>
        </div>

        {!form.phone && (
          <p className="text-[10px] text-[#8B3A2A]/60 -mt-1">
            Add a phone number in step 1 to enable SMS verification.
          </p>
        )}

        {/* Send code button */}
        {otpState === 'idle' && (
          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-colors"
            style={{ background: '#D4860A' }}
          >
            Send Code
          </button>
        )}

        {/* Sending spinner */}
        {otpState === 'sending' && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm" style={{ color: '#D4860A' }}>
            <Loader2 size={16} className="animate-spin" />
            Sending code…
          </div>
        )}

        {/* Error before code is sent */}
        {step2Error && otpState !== 'sent' && (
          <p className={errBoxCls}>{step2Error}</p>
        )}

        {/* Code entry */}
        {otpState === 'sent' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-xs text-[#2C1F14] leading-relaxed">
              Code sent to{' '}
              <span className="font-semibold" style={{ color: '#D4860A' }}>{maskedContact}</span>.
              {' '}Valid for 10 minutes.
            </p>

            {/* 6-digit boxes */}
            <div>
              <label className={labelCls}>6-digit code</label>
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={el => { digitRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={codeDigits[i]}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="flex-1 min-w-0 aspect-square text-center text-xl font-bold rounded-lg border border-[rgba(212,134,10,0.35)] bg-white/70 focus:outline-none focus:border-[#D4860A] focus:ring-2 focus:ring-[rgba(212,134,10,0.25)] text-[#2C1F14] transition-colors"
                    style={{ caretColor: '#D4860A' }}
                  />
                ))}
              </div>
            </div>

            {/* Resend */}
            <div className="text-center">
              {resendCountdown > 0 ? (
                <p className="text-xs text-[#8B3A2A]/60">Resend in {resendCountdown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-xs font-medium hover:underline transition-colors"
                  style={{ color: '#D4860A' }}
                >
                  Resend code
                </button>
              )}
            </div>

            {step2Error && <p className={errBoxCls}>{step2Error}</p>}

            <button
              type="submit"
              disabled={loading || codeDigits.join('').length < 6}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#aaa' : '#D4860A' }}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 size={15} className="animate-spin" /> Creating account…
                </span>
              ) : 'Verify & Create Account'}
            </button>
          </form>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 1 — Registration form
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <form onSubmit={handleContinue} className="space-y-5">
      <StepBar />

      {/* Role selector */}
      <div>
        <label className={labelCls}>I am a *</label>
        <div className="flex flex-col gap-2">
          {portalRoles.map(({ code, label }) => {
            const Icon = ROLE_ICONS[code] ?? ClipboardList
            const selected = form.portalRole === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => selectRole(code)}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-all',
                  selected
                    ? 'bg-[rgba(212,134,10,0.12)] border-[#D4860A] text-[#2C1F14] font-medium'
                    : 'bg-white/70 border-[rgba(212,134,10,0.25)] text-[#8B3A2A] hover:border-[#D4860A]',
                ].join(' ')}
              >
                <Icon size={16} className={selected ? 'text-[#D4860A]' : 'text-[#8B3A2A]'} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Company — property manager only */}
      {isPropertyManager && (
        <div>
          <label className={labelCls}>
            Company{' '}
            <span className="text-[#8B3A2A]/50 normal-case font-normal">(optional)</span>
          </label>
          <input
            value={form.company}
            onChange={setField('company')}
            placeholder="Your company or trading name"
            className={inputCls}
          />
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>First Name *</label>
          <input value={form.firstName} onChange={setField('firstName')} required placeholder="First name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Last Name *</label>
          <input value={form.lastName} onChange={setField('lastName')} required placeholder="Last name" className={inputCls} />
        </div>
      </div>

      {/* Middle name + DOB */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>
            Middle Name{' '}
            <span className="text-[#8B3A2A]/50 normal-case font-normal">(optional)</span>
          </label>
          <input value={form.middleName} onChange={setField('middleName')} placeholder="Middle name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Date of Birth *</label>
          <input type="date" value={form.dob} onChange={setField('dob')} required className={inputCls} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelCls}>Email Address *</label>
        <input type="email" value={form.email} onChange={setField('email')} required placeholder="your@email.com" className={inputCls} />
      </div>

      {/* Phone */}
      <div>
        <label className={labelCls}>
          Phone{' '}
          <span className="text-[#8B3A2A]/50 normal-case font-normal">(optional — required for SMS verification)</span>
        </label>
        <input type="tel" value={form.phone} onChange={setField('phone')} placeholder="+44 (0) 000 000 0000" className={inputCls} />
      </div>

      {/* Password */}
      <div>
        <label className={labelCls}>
          Password *{' '}
          <span className="text-[#8B3A2A]/50 normal-case font-normal">(min 8 characters)</span>
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={setField('password')}
            required
            minLength={8}
            placeholder="••••••••"
            className={`${inputCls} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B3A2A] hover:text-[#D4860A] transition-colors"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {step1Error && <p className={errBoxCls}>{step1Error}</p>}

      <button
        type="submit"
        className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-colors"
        style={{ background: '#D4860A' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
      >
        Continue to Verification →
      </button>
    </form>
  )
}
