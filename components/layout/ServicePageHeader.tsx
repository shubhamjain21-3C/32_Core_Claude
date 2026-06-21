'use client'
import Link from 'next/link'
import { ArrowLeft, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export function ServicePageHeader() {
  const pathname   = usePathname()
  const { data: session } = useSession()
  const [open, setOpen]   = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const isLettingPage = pathname === '/services/letting-services'

  const [backUrl,   setBackUrl]   = useState('/services')
  const [backLabel, setBackLabel] = useState('Back to Services')
  const [loginUrl,  setLoginUrl]  = useState('/portal/login')

  useEffect(() => {
    const role   = sessionStorage.getItem('3c_user_role') ?? ''
    const intent = sessionStorage.getItem('3c_journey_intent') ?? 'services'

    if (isLettingPage || intent === 'letting') {
      setBackUrl(`/what-are-you-looking-for?role=${role}`)
      setBackLabel('Back')
    } else if (role) {
      setBackUrl(`/services?role=${role}&intent=${intent}`)
      setBackLabel('Back to Services')
    }

    if (role) setLoginUrl(`/portal/login?role=${role}`)
  }, [isLettingPage])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] ?? ''
  const initials  = session?.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? ''

  return (
    <header
      className="sticky top-0 z-40 h-16 flex items-center px-4 sm:px-8"
      style={{
        background: 'rgba(44,31,20,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(212,134,10,0.3)',
      }}
    >
      {/* Back link */}
      <Link
        href={backUrl}
        className="flex items-center gap-1.5 text-[#F0A830] hover:text-white transition-colors text-sm font-medium mr-auto"
      >
        <ArrowLeft size={15} />
        {backLabel}
      </Link>

      {/* Brand centre */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center hidden sm:block">
        <p className="font-heading font-bold text-white text-base leading-none">3C Core</p>
        <p className="text-[#F0A830] text-[10px] tracking-[0.15em] uppercase mt-0.5">
          Connected | Consistent | Confident
        </p>
      </div>

      {/* Right: logged-in user OR login link */}
      {session ? (
        <div className="ml-auto relative" ref={dropRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            style={{ background: 'rgba(212,134,10,0.18)', border: '1px solid rgba(240,168,48,0.45)', color: '#F0A830' }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: 'rgba(212,134,10,0.35)', color: '#F0A830' }}
            >
              {initials || <User size={12} />}
            </span>
            {firstName}
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 shadow-xl"
              style={{ background: '#2C1F14', border: '1px solid rgba(212,134,10,0.3)' }}
            >
              <Link
                href="/portal/customer/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F0A830'; e.currentTarget.style.background = 'rgba(212,134,10,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent' }}
              >
                <LayoutDashboard size={14} /> My Portal
              </Link>
              <Link
                href="/portal/customer/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F0A830'; e.currentTarget.style.background = 'rgba(212,134,10,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent' }}
              >
                <User size={14} /> My Account
              </Link>
              <div style={{ borderTop: '1px solid rgba(212,134,10,0.2)', margin: '4px 0' }} />
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: '/portal' }) }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-colors"
                style={{ color: 'rgba(255,100,100,0.8)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,100,100,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,100,100,0.8)'; e.currentTarget.style.background = 'transparent' }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href={loginUrl}
          className="ml-auto text-sm px-3 py-1.5 border border-[#F0A830] text-[#F0A830] rounded hover:bg-[rgba(212,134,10,0.2)] transition-colors"
        >
          Login
        </Link>
      )}
    </header>
  )
}
