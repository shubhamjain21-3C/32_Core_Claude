'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'

const inputClass = [
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

interface LoginFormProps {
  provider: 'customer-login' | 'admin-login'
  returnUrl?: string
}

export function LoginForm({ provider, returnUrl }: LoginFormProps) {
  return provider === 'admin-login'
    ? <AdminLoginForm returnUrl={returnUrl} />
    : <CustomerLoginForm returnUrl={returnUrl} />
}

// ── Customer login (unchanged: email + password) ────────────────────────────

function CustomerLoginForm({ returnUrl }: { returnUrl?: string }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('customer-login', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password. Please try again.')
      return
    }
    if (returnUrl) {
      router.push(returnUrl)
      router.refresh()
      return
    }
    const session = await getSession()
    const portalRole = session?.user?.portalRole ?? 'property_manager'
    router.push(`/what-are-you-looking-for?role=${portalRole}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Email Address</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          required placeholder="your@email.com" className={inputClass}
        />
      </div>

      <div>
        <label className={labelCls}>Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)}
            required placeholder="••••••••" className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPw(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B3A2A] hover:text-[#D4860A] transition-colors"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {/* Plain <a> so browser handles the navigation — avoids any
            client-routing edge case and stale-bundle cache problem. */}
        <a
          href="/portal/forgot-password"
          className="text-xs text-[#8B3A2A] hover:text-[#D4860A] transition-colors cursor-pointer"
        >
          Forgot password?
        </a>
      </div>

      {error && <p className={errBoxCls}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        style={{ background: loading ? '#aaa' : '#D4860A' }}
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

// ── Admin login (2-step: password → email OTP → session) ─────────────────────

function AdminLoginForm({ returnUrl }: { returnUrl?: string }) {
  const router = useRouter()
  const [step,     setStep]     = useState<1 | 2>(1)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)

  const [sendingOtp, setSendingOtp] = useState(false)
  const [step1Error, setStep1Error] = useState('')

  const [codeDigits,      setCodeDigits]      = useState<string[]>(Array(6).fill(''))
  const [verifying,       setVerifying]       = useState(false)
  const [step2Error,      setStep2Error]      = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // ── Step 1: verify password and request OTP ─────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setStep1Error('')
    setSendingOtp(true)
    try {
      const res = await fetch('/api/auth/admin/start-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setStep1Error(data.message || 'Invalid email or password.')
        return
      }
      setStep(2)
      setCodeDigits(Array(6).fill(''))
      setResendCountdown(60)
      setTimeout(() => digitRefs.current[0]?.focus(), 80)
    } catch {
      setStep1Error('Network error. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  // ── OTP digit handlers ──────────────────────────────────────────────────
  function handleDigit(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const digit = val.slice(-1)
    const next = [...codeDigits]
    next[idx] = digit
    setCodeDigits(next)
    if (digit && idx < 5) digitRefs.current[idx + 1]?.focus()
  }
  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !codeDigits[idx] && idx > 0) digitRefs.current[idx - 1]?.focus()
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

  async function resendCode() {
    if (resendCountdown > 0 || sendingOtp) return
    await handleSendOtp({ preventDefault: () => {} } as React.FormEvent)
  }

  // ── Step 2: verify OTP via NextAuth admin-login provider ────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setStep2Error('')
    const code = codeDigits.join('')
    if (code.length !== 6) {
      setStep2Error('Please enter the complete 6-digit code.')
      return
    }
    setVerifying(true)
    try {
      const res = await signIn('admin-login', {
        email, password, otpCode: code, redirect: false,
      })
      if (res?.error) {
        setStep2Error('Invalid verification code. Please try again.')
        return
      }
      router.push(returnUrl || '/portal/admin/dashboard')
      router.refresh()
    } catch {
      setStep2Error('Network error. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1.5 text-xs text-[#8B3A2A] hover:text-[#D4860A] transition-colors font-medium"
        >
          <ArrowLeft size={13} /> Back to credentials
        </button>

        <div>
          <h3 className="font-semibold text-[#2C1F14] text-sm mb-1 inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#D4860A]" />
            Two-step verification
          </h3>
          <p className="text-[#8B3A2A] text-xs leading-relaxed">
            We sent a 6-digit code to <span className="font-semibold" style={{ color: '#D4860A' }}>{email}</span>. Enter it below to finish signing in.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
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

          <div className="text-center">
            {resendCountdown > 0 ? (
              <p className="text-xs text-[#8B3A2A]/60">Resend in {resendCountdown}s</p>
            ) : (
              <button
                type="button"
                onClick={resendCode}
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
            disabled={verifying || codeDigits.join('').length < 6}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: verifying ? '#aaa' : '#D4860A' }}
          >
            {verifying && <Loader2 size={15} className="animate-spin" />}
            {verifying ? 'Verifying…' : 'Verify & Sign In'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <div>
        <label className={labelCls}>Admin Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          required placeholder="admin@3ccore.com" className={inputClass}
        />
      </div>

      <div>
        <label className={labelCls}>Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)}
            required placeholder="••••••••" className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPw(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B3A2A] hover:text-[#D4860A] transition-colors"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {step1Error && <p className={errBoxCls}>{step1Error}</p>}

      <button
        type="submit"
        disabled={sendingOtp}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        style={{ background: sendingOtp ? '#aaa' : '#D4860A' }}
      >
        {sendingOtp && <Loader2 size={15} className="animate-spin" />}
        {sendingOtp ? 'Sending code…' : 'Continue to Verification'}
      </button>

      <p className="text-[10px] text-[#8B3A2A]/70 text-center">
        For security, admin sign-ins require a verification code emailed to the admin address.
      </p>
    </form>
  )
}
