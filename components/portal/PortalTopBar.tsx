'use client'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { User, LogOut, ChevronDown, Settings } from 'lucide-react'

interface Props {
  userName: string
  userEmail: string
  portalRole?: string
}

const ROLE_LABELS: Record<string, string> = {
  property_manager: 'Property Manager',
  tenant:           'Tenant',
  student:          'Student',
  admin:            'Administrator',
}

export function PortalTopBar({ userName, userEmail, portalRole }: Props) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  const firstName = userName.split(' ')[0]
  const initials  = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = ROLE_LABELS[portalRole ?? ''] ?? 'Client'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-end px-6 shrink-0"
      style={{
        background: 'rgba(255,248,238,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(212,134,10,0.18)',
      }}
    >
      {/* User menu */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-medium"
          style={{ border: '1px solid rgba(212,134,10,0.25)', background: 'white', color: '#2C1F14' }}
        >
          {/* Avatar */}
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'rgba(212,134,10,0.18)', color: '#D4860A' }}
          >
            {initials || <User size={13} />}
          </span>
          <span className="hidden sm:block">{firstName}</span>
          <ChevronDown size={13} className="text-[#8B3A2A]" />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 shadow-xl"
            style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 8px 24px rgba(44,31,20,0.12)' }}
          >
            {/* User info header */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(212,134,10,0.1)' }}>
              <p className="text-[#2C1F14] font-semibold text-sm">{userName}</p>
              <p className="text-[#8B3A2A] text-xs mt-0.5 truncate">{userEmail}</p>
              <span
                className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(212,134,10,0.12)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}
              >
                {roleLabel}
              </span>
            </div>

            {/* Links */}
            <div className="py-1">
              <Link
                href="/portal/customer/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                style={{ color: '#2C1F14' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,134,10,0.06)'; e.currentTarget.style.color = '#D4860A' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2C1F14' }}
              >
                <User size={14} /> My Account
              </Link>
              <Link
                href="/portal/customer/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                style={{ color: '#2C1F14' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,134,10,0.06)'; e.currentTarget.style.color = '#D4860A' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2C1F14' }}
              >
                <Settings size={14} /> Settings
              </Link>
            </div>

            <div style={{ borderTop: '1px solid rgba(212,134,10,0.1)', margin: '4px 0' }} />

            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/portal' }) }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-colors"
              style={{ color: '#8B3A2A' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,100,100,0.06)'; e.currentTarget.style.color = '#e53e3e' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8B3A2A' }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
