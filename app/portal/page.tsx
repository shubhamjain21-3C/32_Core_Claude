'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const ROLES = [
  {
    icon: '🏠',
    title: 'Landlord',
    subtitle: 'Manage your properties, services & reports',
    href: '/portal/login?role=landlord',
    color: '#D4860A',
  },
  {
    icon: '🔑',
    title: 'Tenant',
    subtitle: 'View your tenancy, inspection reports & documents',
    href: '/portal/login?role=tenant',
    color: '#2D5016',
  },
  {
    icon: '📋',
    title: 'Property Manager',
    subtitle: 'Oversee portfolios, compliance & client accounts',
    href: '/portal/login?role=manager',
    color: '#4A6FA5',
  },
  {
    icon: '🛡️',
    title: 'Admin',
    subtitle: '3C Core staff — full system access',
    href: '/portal/admin/login',
    color: '#8B3A2A',
  },
]

export default function PortalSelectionPage() {
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
        <Link href="/" className="flex items-center gap-1.5 text-[#F0A830] hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={15} />
          Back to Home
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 text-center hidden sm:block">
          <p className="font-heading font-bold text-white text-base leading-none">3C Core</p>
          <p className="text-[#F0A830] text-[10px] tracking-[0.15em] uppercase mt-0.5">
            Connected | Consistent | Confident
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">Client Portal</h1>
          <p className="mt-2 text-[#8B3A2A] text-base">Select your account type to continue</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {ROLES.map(role => (
            <Link
              key={role.title}
              href={role.href}
              className="group flex flex-col items-center text-center p-7 rounded-2xl transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: `2px solid rgba(${hexToRgb(role.color)},0.25)`,
                boxShadow: '0 2px 12px rgba(44,31,20,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = role.color
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 24px rgba(${hexToRgb(role.color)},0.18)`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(${hexToRgb(role.color)},0.25)`
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(44,31,20,0.08)'
              }}
            >
              <span className="text-4xl mb-4">{role.icon}</span>
              <h2
                className="font-heading font-bold text-xl mb-2 transition-colors"
                style={{ color: role.color }}
              >
                {role.title}
              </h2>
              <p className="text-sm text-[#8B3A2A] leading-relaxed">{role.subtitle}</p>
              <span
                className="mt-4 text-xs font-semibold tracking-wide uppercase transition-colors"
                style={{ color: role.color }}
              >
                Sign In →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-[#8B3A2A]">
          New to 3C Core?{' '}
          <Link href="/portal/register" className="font-semibold underline" style={{ color: '#D4860A' }}>
            Create a free account
          </Link>
        </p>
      </main>
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
