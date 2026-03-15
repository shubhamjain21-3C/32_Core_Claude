'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

const inputClass = 'w-full bg-[#071224] border border-[#1e3a5f] text-[#c8dff0] placeholder-[#4a90c4]/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2a7fd4] transition-colors'

interface LoginFormProps {
  provider: 'customer-login' | 'admin-login'
}

export function LoginForm({ provider }: LoginFormProps) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  const redirect = provider === 'admin-login' ? '/portal/admin/dashboard' : '/portal/customer/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn(provider, { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password.')
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" className={inputClass} />
      </div>
      <div>
        <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Password</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={`${inputClass} pr-10`} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a90c4] hover:text-[#7aaecc]">
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <a href="#" className="text-[#4a90c4] text-xs hover:text-[#6ab4e8] transition-colors">Forgot password?</a>
      </div>
      {error && <p className="text-red-400 text-xs text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="w-full">
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  )
}
