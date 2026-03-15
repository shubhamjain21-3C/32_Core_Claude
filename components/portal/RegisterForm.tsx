'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

const inputClass = 'w-full bg-[#071224] border border-[#1e3a5f] text-[#c8dff0] placeholder-[#4a90c4]/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2a7fd4] transition-colors'

export function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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

      // Auto sign-in after registration
      const signInRes = await signIn('customer-login', {
        email: form.email,
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Full Name *</label>
          <input value={form.name} onChange={set('name')} required placeholder="Your name" className={inputClass} />
        </div>
        <div>
          <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Company</label>
          <input value={form.company} onChange={set('company')} placeholder="Optional" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Email Address *</label>
        <input type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" className={inputClass} />
      </div>
      <div>
        <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Phone</label>
        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 (0) 000 000 0000" className={inputClass} />
      </div>
      <div>
        <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Password * (min 8 chars)</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={8} placeholder="••••••••" className={`${inputClass} pr-10`} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a90c4] hover:text-[#7aaecc]">
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 text-xs text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="w-full">
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  )
}
