'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Eye, EyeOff, Loader2, KeyRound, ShieldCheck,
} from 'lucide-react'

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

type Step = 'email' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [maskedContact, setMaskedContact] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [sending, setSending] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Step 2 state
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(''))
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setSending(true)
    try {
      const res = await fetch('/api/auth/forgot-password/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailError(data.message || 'Failed to send verification code.')
        return
      }
      setMaskedContact(data.masked || email)
      setStep('reset')
      setCodeDigits(Array(6).fill(''))
      setResendCountdown(60)
      setTimeout(() => digitRefs.current[0]?.focus(), 80)
    } catch {
      setEmailError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // ── OTP digit handlers ───────────────────────────────────────────────────
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

  // ── Step 2: reset password ───────────────────────────────────────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setResetError('')
    const code = codeDigits.join('')
    if (code.length !== 6) {
      setResetError('Please enter the complete 6-digit code.')
      return
    }
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.')
      return
    }
    setResetting(true)
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: code, newPassword }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setResetError(data.message || 'Could not reset password.')
        return
      }
      setStep('done')
    } catch {
      setResetError('Network error. Please try again.')
    } finally {
      setResetting(false)
    }
  }

  async function resendCode() {
    if (resendCountdown > 0 || sending) return
    await handleSendCode({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 55%,#F0A830 100%)' }}
    >
      {/* Header */}
      <header
        className="h-14 flex items-center px-6 relative"
        style={{ background: 'rgba(44,31,20,0.92)', borderBottom: '1px solid rgba(212,134,10,0.3)' }}
      >
        <Link
          href="/portal/login"
          className="flex items-center gap-1.5 text-[#F0A830] hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={15} /> Back to Sign In
        </Link>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center hidden sm:block">
          <p className="font-heading font-bold text-white text-base leading-none">3C Core</p>
          <p className="text-[#F0A830] text-[10px] tracking-[0.15em] uppercase mt-0.5">
            Connected | Consistent | Confident
          </p>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 shadow-xl"
            style={{
              background: 'rgba(255,255,255,0.82)',
              border: '1.5px solid rgba(212,134,10,0.35)',
            }}
          >
            {/* Brand */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                {step === 'done'
                  ? <ShieldCheck size={22} className="text-[#D4860A]" />
                  : <KeyRound size={20} className="text-[#D4860A]" />}
                <h1 className="font-heading font-bold text-[#2C1F14] text-xl">
                  {step === 'done' ? 'Password Reset' : 'Reset Your Password'}
                </h1>
              </div>
              <p className="text-[#8B3A2A] text-xs">
                {step === 'email' && 'We will email you a 6-digit verification code.'}
                {step === 'reset' && `Enter the code we sent to ${maskedContact} and choose a new password.`}
                {step === 'done' && 'Your password has been updated. You can sign in now.'}
              </p>
            </div>

            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className={inputCls}
                  />
                </div>

                {emailError && <p className={errBoxCls}>{emailError}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                  style={{ background: sending ? '#aaa' : '#D4860A' }}
                >
                  {sending && <Loader2 size={14} className="animate-spin" />}
                  {sending ? 'Sending…' : 'Send Verification Code'}
                </button>

                <p className="text-[10px] text-[#8B3A2A]/70 text-center">
                  Tip: if you registered with email but don&apos;t remember your password, this will reset it. Admin accounts cannot be reset here.
                </p>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleReset} className="space-y-4">
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

                <div>
                  <label className={labelCls}>
                    New Password <span className="text-[#8B3A2A]/60 normal-case font-normal">(min 8 characters)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B3A2A] hover:text-[#D4860A] transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {resetError && <p className={errBoxCls}>{resetError}</p>}

                <button
                  type="submit"
                  disabled={resetting || codeDigits.join('').length < 6 || newPassword.length < 8}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: resetting ? '#aaa' : '#D4860A' }}
                >
                  {resetting && <Loader2 size={15} className="animate-spin" />}
                  {resetting ? 'Updating password…' : 'Update Password'}
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-[#2C1F14]">You can now sign in with your new password.</p>
                <button
                  type="button"
                  onClick={() => router.push('/portal/login')}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-colors"
                  style={{ background: '#D4860A' }}
                >
                  Go to Sign In
                </button>
              </div>
            )}

            <div className="mt-6 text-center border-t pt-4" style={{ borderColor: 'rgba(212,134,10,0.2)' }}>
              <Link
                href="/portal/login"
                className="text-xs text-[#8B3A2A] hover:text-[#D4860A] transition-colors"
              >
                Remembered your password? Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
