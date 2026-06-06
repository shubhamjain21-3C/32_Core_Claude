'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Building2, Wrench, CreditCard, LogOut, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem { href: string; label: string; Icon: React.ElementType }

const customerNav: NavItem[] = [
  { href: '/portal/customer/dashboard',  label: 'Dashboard',     Icon: LayoutDashboard },
  { href: '/portal/customer/properties', label: 'My Properties', Icon: Building2       },
  { href: '/portal/customer/services',   label: 'My Services',   Icon: Wrench          },
  { href: '/portal/customer/payments',   label: 'Payments',      Icon: CreditCard      },
]

const adminNav: NavItem[] = [
  { href: '/portal/admin/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/portal/admin/customers',  label: 'Customers',  Icon: Building2       },
  { href: '/portal/admin/properties', label: 'Properties', Icon: Building2       },
]

export function PortalSidebar({ role, userName }: { role: 'customer' | 'admin'; userName: string }) {
  const pathname = usePathname()
  const nav      = role === 'admin' ? adminNav : customerNav

  const firstName = userName.split(' ')[0]
  const initials  = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside
      className="w-64 flex flex-col min-h-screen shrink-0"
      style={{ background: '#2C1F14', borderRight: '1px solid rgba(212,134,10,0.25)' }}
    >
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <Link href="/">
          <Image src="/logo/3CCore_Logo_Compact_Header.svg" alt="3C Core" width={180} height={32} className="h-8 w-auto" />
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(212,134,10,0.15)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(212,134,10,0.25)', color: '#F0A830', border: '1.5px solid rgba(212,134,10,0.5)' }}
          >
            {initials || <User size={16} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[2px] uppercase font-medium" style={{ color: '#D4860A' }}>
              {role === 'admin' ? 'Admin Portal' : 'Client Portal'}
            </p>
            <p className="text-white text-sm font-medium truncate">{firstName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                active
                  ? 'font-medium'
                  : 'hover:bg-white/5'
              )}
              style={active ? {
                background: 'rgba(212,134,10,0.18)',
                color: '#F0A830',
                border: '1px solid rgba(212,134,10,0.35)',
              } : {
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(212,134,10,0.2)' }}>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs mb-3 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#D4860A' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >
          ← Back to website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/portal' })}
          className="flex items-center gap-2 text-sm w-full transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}
