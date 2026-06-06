'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff } from 'lucide-react'

const inputCls = 'w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(212,134,10,0.3)] text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#F0A830] transition-colors'
const labelCls = 'block text-[#FDE8B0]/80 text-xs mb-1.5 tracking-wide'

export function RegisterForm() {
  const [form, setForm] = useState({
    firstName:  '',
    middleName: '',
    lastName:   '',
    dob:        '',
    email:      '',
    phone:      '',
    password:   '',
  })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router = useRouter()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName) {
      setError('First name and last name are required.')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      const signInRes = await signIn('customer-login', {
        email:    form.email,
        password: form.password,
        redirect: false,
      })

      if (signInRes?.error) {
        setError('Account created but sign-in failed. Please go to login.')
      } else {
        router.push('/portal/customer/dashboard')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>First Name *</label>
          <input value={form.firstName} onChange={set('firstName')} required placeholder="First name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Last Name *</label>
          <input value={form.lastName} onChange={set('lastName')} required placeholder="Last name" className={inputCls} />
        </div>
      </div>

      {/* Middle name + DOB */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Middle Name <span className="text-white/30">(optional)</span></label>
          <input value={form.middleName} onChange={set('middleName')} placeholder="Middle name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Date of Birth *</label>
          <input type="date" value={form.dob} onChange={set('dob')} required
            className={`${inputCls} [color-scheme:dark]`} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelCls}>Email Address *</label>
        <input type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" className={inputCls} />
      </div>

      {/* Phone */}
      <div>
        <label className={labelCls}>Phone <span className="text-white/30">(optional)</span></label>
        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 (0) 000 000 0000" className={inputCls} />
      </div>

      {/* Password */}
      <div>
        <label className={labelCls}>Password * <span className="text-white/30">(min 8 characters)</span></label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
            placeholder="••••••••"
            className={`${inputCls} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F0A830]/60 hover:text-[#F0A830]"
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-[#D4860A] text-white font-semibold text-sm hover:bg-[#F0A830] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
