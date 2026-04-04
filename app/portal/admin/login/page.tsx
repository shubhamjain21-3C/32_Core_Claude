import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { LoginForm } from '@/components/portal/LoginForm'

export const metadata: Metadata = {
  title: 'Admin Login | 3C Core',
  description: '3C Core staff-only admin portal access.',
}

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 55%,#F0A830 100%)' }}
    >
      {/* Header */}
      <header
        className="h-14 flex items-center px-6"
        style={{ background: 'rgba(44,31,20,0.92)', borderBottom: '1px solid rgba(212,134,10,0.3)' }}
      >
        <Link
          href="/portal"
          className="flex items-center gap-1.5 text-[#F0A830] hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={15} />
          Portal Selection
        </Link>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center hidden sm:block">
          <p className="font-heading font-bold text-white text-base leading-none">3C Core</p>
          <p className="text-[#F0A830] text-[10px] tracking-[0.15em] uppercase mt-0.5">
            Connected | Consistent | Confident
          </p>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 shadow-xl"
            style={{
              background: 'rgba(255,255,255,0.82)',
              border: '1.5px solid rgba(139,58,42,0.35)',
            }}
          >
            {/* Brand */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-4">
                <p className="font-heading font-bold text-[#2C1F14] text-2xl leading-none">3C Core</p>
                <p className="text-[#D4860A] text-[10px] tracking-[0.15em] uppercase mt-1">
                  Connected | Consistent | Confident
                </p>
              </Link>

              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck size={22} className="text-[#8B3A2A]" />
                <h1 className="font-heading font-bold text-[#2C1F14] text-xl">Admin Portal</h1>
              </div>
              <p className="text-[#8B3A2A] text-sm">3C Core staff access only</p>

              {/* Warning badge */}
              <div
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(139,58,42,0.1)', color: '#8B3A2A', border: '1px solid rgba(139,58,42,0.25)' }}
              >
                🔒 Restricted access
              </div>
            </div>

            <LoginForm provider="admin-login" />

            <div className="mt-6 text-center border-t pt-4" style={{ borderColor: 'rgba(212,134,10,0.2)' }}>
              <Link
                href="/portal"
                className="text-xs text-[#8B3A2A] hover:text-[#D4860A] transition-colors"
              >
                ← Back to portal selection
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
