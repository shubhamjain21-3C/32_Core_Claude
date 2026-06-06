'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const inputClass = [
  'w-full px-4 py-2.5 rounded-lg text-sm text-[#2C1F14] placeholder-[#8B3A2A]/50',
  'border border-[rgba(212,134,10,0.35)] bg-white/70',
  'focus:outline-none focus:border-[#D4860A] focus:ring-1 focus:ring-[#D4860A]',
  'transition-colors',
].join(' ')

interface LoginFormProps {
  provider: 'customer-login' | 'admin-login'
  returnUrl?: string
}

export function LoginForm({ provider, returnUrl }: LoginFormProps) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const router = useRouter()

  const defaultRedirect = provider === 'admin-login'
    ? '/portal/admin/dashboard'
    : '/portal/customer/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn(provider, { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push(returnUrl || defaultRedirect)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">
          Email Address
        </label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          required placeholder="your@email.com" className={inputClass}
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">
          Password
        </label>
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

      {/* Forgot password */}
      <div className="flex justify-end">
        <a href="#" className="text-xs text-[#8B3A2A] hover:text-[#D4860A] transition-colors">
          Forgot password?
        </a>
      </div>

      {/* Error */}
      {error && (
        <p className="text-[#8B3A2A] text-xs text-center py-2 px-3 rounded-lg"
          style={{ background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.25)' }}>
          {error}
        </p>
      )}

      {/* Submit */}
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
