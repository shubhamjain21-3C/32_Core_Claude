'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/portal/LoginForm'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const ROLE_LABELS: Record<string, { title: string; desc: string }> = {
  property_manager: { title: 'Property Manager / Landlord Login', desc: 'Manage portfolios, properties & client accounts' },
  landlord:         { title: 'Landlord Login',                    desc: 'Access your property dashboard & reports' },
  tenant:           { title: 'Tenant Login',                      desc: 'View your tenancy documents & inspections' },
  student:          { title: 'Student Login',                     desc: 'Find accommodation & manage your tenancy' },
  others:           { title: 'Client Login',                      desc: 'Sign in to browse all available services' },
  default:          { title: 'Client Portal Login',               desc: 'Sign in to access your 3C Core account' },
}

function LoginContent() {
  const params = useSearchParams()
  const role = params.get('role') ?? 'default'
  const returnUrl = params.get('return') ?? ''
  const { title, desc } = ROLE_LABELS[role] ?? ROLE_LABELS.default

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl p-8 shadow-xl"
        style={{
          background: 'rgba(255,255,255,0.82)',
          border: '1.5px solid rgba(212,134,10,0.3)',
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

          <h1 className="font-heading font-bold text-[#2C1F14] text-xl mb-1">{title}</h1>
          <p className="text-[#8B3A2A] text-sm">{desc}</p>
        </div>

        <LoginForm provider="customer-login" returnUrl={returnUrl || undefined} />

        <div className="mt-6 space-y-3 text-center text-sm">
          {/* Create account — prominent button */}
          <Link
            href="/portal/register"
            className="block w-full py-3 rounded-xl font-semibold text-sm border-2 transition-colors"
            style={{ borderColor: '#D4860A', color: '#D4860A', background: 'transparent' }}
            onMouseEnter={undefined}
          >
            Create a Free Account
          </Link>
          <p className="text-[11px] text-[#8B3A2A]/70">
            <Link href="/portal/admin-login" className="hover:text-[#D4860A] transition-colors">
              Login for Admin access
            </Link>
          </p>
          <div className="pt-2" style={{ borderTop: '1px solid rgba(212,134,10,0.2)' }}>
            <Link href="/portal" className="text-xs text-[#8B3A2A] hover:text-[#D4860A] transition-colors">
              ← Back to portal selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
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
        <Link href="/portal" className="flex items-center gap-1.5 text-[#F0A830] hover:text-white transition-colors text-sm font-medium">
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
        <Suspense fallback={<div className="text-[#2C1F14]">Loading…</div>}>
          <LoginContent />
        </Suspense>
      </main>
    </div>
  )
}
