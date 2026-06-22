'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface RoleCard {
  title: string
  subtitle: string
  href: string
  borderColor: string
  titleColor: string
}

const ROLES: RoleCard[] = [
  {
    title: 'Property Manager / Landlord',
    subtitle: 'Manage properties, inventories, compliance & tenancies',
    href: '/portal/login?role=property_manager',
    borderColor: '#D4860A',
    titleColor: '#D4860A',
  },
  {
    title: 'Tenant',
    subtitle: 'View your tenancy, inspection reports & documents',
    href: '/portal/login?role=tenant',
    borderColor: '#2D5016',
    titleColor: '#2D5016',
  },
  {
    title: 'Student',
    subtitle: 'Find accommodation & manage your student tenancy',
    href: '/portal/login?role=student',
    borderColor: '#4A6FA5',
    titleColor: '#4A6FA5',
  },
  {
    title: 'Others',
    subtitle: 'Browse all available property services',
    href: '/portal/login?role=others',
    borderColor: '#8B3A2A',
    titleColor: '#8B3A2A',
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
          {ROLES.map(({ title, subtitle, href, borderColor, titleColor }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col items-center text-center p-7 rounded-2xl transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: `2px solid rgba(0,0,0,0.08)`,
                boxShadow: '0 2px 12px rgba(44,31,20,0.08)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = borderColor
                el.style.boxShadow = `0 6px 24px rgba(0,0,0,0.12)`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(0,0,0,0.08)'
                el.style.boxShadow = '0 2px 12px rgba(44,31,20,0.08)'
              }}
            >
              <h2
                className="font-heading font-bold text-lg mb-2"
                style={{ color: titleColor }}
              >
                {title}
              </h2>
              <p className="text-sm text-[#8B3A2A] leading-relaxed">{subtitle}</p>
              <span
                className="mt-4 text-xs font-semibold tracking-wide uppercase"
                style={{ color: titleColor }}
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
        <p className="mt-2 text-xs text-[#8B3A2A]/70">
          <Link href="/portal/admin-login" className="hover:text-[#D4860A] transition-colors">
            Login for Admin access
          </Link>
        </p>
      </main>
    </div>
  )
}
