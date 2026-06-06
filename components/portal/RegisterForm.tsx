'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, ClipboardList, Key, GraduationCap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const inputCls = [
  'w-full px-4 py-2.5 rounded-lg text-sm text-[#2C1F14] placeholder-[#8B3A2A]/50',
  'border border-[rgba(212,134,10,0.35)] bg-white/70',
  'focus:outline-none focus:border-[#D4860A] focus:ring-1 focus:ring-[#D4860A]',
  'transition-colors',
].join(' ')

const labelCls = 'block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase'

interface PortalRoleOption {
  id: string
  label: string
  Icon: LucideIcon
}

const PORTAL_ROLES: PortalRoleOption[] = [
  { id: 'property_manager', label: 'Property Manager / Landlord', Icon: ClipboardList },
  { id: 'tenant',           label: 'Tenant',                      Icon: Key },
  { id: 'student',          label: 'Student',                     Icon: GraduationCap },
]

export function RegisterForm() {
  const [form, setForm] = useState({
    firstName:  '',
    middleName: '',
    lastName:   '',
    dob:        '',
    email:      '',
    phone:      '',
    password:   '',
    portalRole: '',
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
    if (!form.portalRole) {
      setError('Please select your account type.')
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
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Role selector */}
      <div>
        <label className={labelCls}>I am a *</label>
        <div className="flex flex-col gap-2">
          {PORTAL_ROLES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setForm(f => ({ ...f, portalRole: id }))}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                form.portalRole === id
                  ? 'bg-[rgba(212,134,10,0.12)] border-[#D4860A] text-[#2C1F14] font-medium'
                  : 'bg-white/70 border-[rgba(212,134,10,0.25)] text-[#8B3A2A] hover:border-[#D4860A]'
              }`}
            >
              <Icon size={16} className={form.portalRole === id ? 'text-[#D4860A]' : 'text-[#8B3A2A]'} />
              {label}
            </button>
          ))}
        </div>
      </div>

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
          <label className={labelCls}>Middle Name <span className="text-[#8B3A2A]/50 normal-case font-normal">(optional)</span></label>
          <input value={form.middleName} onChange={set('middleName')} placeholder="Middle name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Date of Birth *</label>
          <input type="date" value={form.dob} onChange={set('dob')} required className={inputCls} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelCls}>Email Address *</label>
        <input type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" className={inputCls} />
      </div>

      {/* Phone */}
      <div>
        <label className={labelCls}>Phone <span className="text-[#8B3A2A]/50 normal-case font-normal">(optional)</span></label>
        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 (0) 000 000 0000" className={inputCls} />
      </div>

      {/* Password */}
      <div>
        <label className={labelCls}>Password * <span className="text-[#8B3A2A]/50 normal-case font-normal">(min 8 characters)</span></label>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B3A2A] hover:text-[#D4860A] transition-colors"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-[#8B3A2A] text-xs text-center py-2 px-3 rounded-lg"
          style={{ background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.25)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: loading ? '#aaa' : '#D4860A' }}
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
