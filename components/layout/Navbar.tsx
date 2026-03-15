'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Building2 } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300',
      scrolled
        ? 'bg-[#050d1a]/98 backdrop-blur-md border-b border-[#1e3a5f] shadow-lg shadow-[#050d1a]/50'
        : 'bg-[#050d1a]/95 backdrop-blur-md border-b border-[#1e3a5f]'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0" onClick={() => setOpen(false)}>
          <Image
            src="/logo/3CCore_Logo_Compact_Header.svg"
            alt="3C Core — Connected, Consistent, Confident"
            width={280}
            height={48}
            priority
            className="h-12 w-auto hidden sm:block"
          />
          <Image
            src="/logo/3CCore_Logo_Compact_Header.svg"
            alt="3C Core"
            width={210}
            height={36}
            priority
            className="h-9 w-auto sm:hidden"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-2 text-sm tracking-wide transition-colors duration-200 rounded',
                pathname === href
                  ? 'text-white border-b-2 border-[#2a9fd4]'
                  : 'text-[#c8dff0] hover:text-white'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/portal/login"
            className="hidden sm:inline-flex items-center gap-1.5 border border-[#2a7fd4] bg-[#1a5fa8]/40 text-[#7ecfff] text-xs font-medium tracking-wide px-4 py-2 rounded transition-all duration-200 hover:border-[#00ccff] hover:bg-[#1a5fa8]/80"
          >
            <Building2 size={13} />
            Client Portal
          </Link>

          <button
            className="md:hidden text-[#c8dff0] hover:text-white p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#050d1a] border-t border-[#1e3a5f] px-4 pb-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'block py-3 text-sm border-b border-[#1e3a5f]/50 transition-colors duration-200',
                pathname === href ? 'text-white font-medium' : 'text-[#c8dff0] hover:text-white'
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/portal/login"
            onClick={() => setOpen(false)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 border border-[#2a7fd4] bg-[#1a5fa8]/40 text-[#7ecfff] text-xs font-medium tracking-wide px-4 py-2.5 rounded"
          >
            <Building2 size={13} />
            Client Portal
          </Link>
        </div>
      )}
    </header>
  )
}
