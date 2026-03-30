'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Building2, Wrench, CreditCard, LogOut, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem { href: string; label: string; Icon: React.ElementType }

const customerNav: NavItem[] = [
  { href: '/portal/customer/dashboard',        label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/portal/customer/properties',       label: 'My Properties', Icon: Building2       },
  { href: '/portal/customer/services',         label: 'My Services',   Icon: Wrench          },
  { href: '/portal/customer/payments',         label: 'Payments',      Icon: CreditCard      },
]

const adminNav: NavItem[] = [
  { href: '/portal/admin/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { href: '/portal/admin/customers',   label: 'Customers',   Icon: Building2       },
  { href: '/portal/admin/properties',  label: 'Properties',  Icon: Building2       },
]

export function PortalSidebar({ role, userName }: { role: 'customer' | 'admin'; userName: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const nav      = role === 'admin' ? adminNav : customerNav

  return (
    <aside className="w-64 bg-[#0a1c35] border-r border-[#1e3a5f] flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-[#1e3a5f]">
        <Link href="/">
          <Image src="/logo/3CCore_Logo_Compact_Header.svg" alt="3C Core" width={180} height={32} className="h-8 w-auto" />
        </Link>
        <div className="mt-3 px-1">
          <p className="text-[10px] tracking-[2px] text-[#4a90c4] uppercase">{role === 'admin' ? 'Admin Portal' : 'Client Portal'}</p>
          <p className="text-white text-sm font-medium mt-0.5 truncate">{userName}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-[#1a5fa8]/30 text-white border border-[#2a7fd4]/30'
                : 'text-[#7aaecc] hover:text-white hover:bg-[#1e3a5f]/60'
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {(pathname === href || pathname.startsWith(href + '/')) && <ChevronRight size={12} />}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e3a5f]">
        <Link href="/" className="flex items-center gap-2 text-[#4a90c4] text-xs hover:text-[#7aaecc] mb-3 transition-colors">
          ← Back to website
        </Link>
        <button
          onClick={() => { signOut({ callbackUrl: '/' }) }}
          className="flex items-center gap-2 text-[#7aaecc] text-sm hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}
