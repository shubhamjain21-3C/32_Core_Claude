'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'

type Role = 'property_manager' | 'landlord' | 'tenant' | 'student'

const SERVICE_MATRIX: Record<string, string[]> = {
  property_manager: ['inventory', 'maintenance', 'midterm', 'dispute', 'deposit'],
  landlord:         ['inventory', 'maintenance', 'midterm', 'dispute', 'deposit'],
  tenant:           ['inventory', 'maintenance', 'midterm', 'dispute', 'letting'],
  student:          ['inventory', 'maintenance', 'midterm', 'dispute', 'letting'],
}

const ALL_SERVICES = [
  { id: 'inventory',   label: 'Inventory Management',            href: '/services/inventory' },
  { id: 'maintenance', label: 'Maintenance & Cleaning',           href: '/services/maintenance' },
  { id: 'midterm',     label: 'Midterm Property Inspection',      href: '/services/midterm-inspections' },
  { id: 'dispute',     label: 'Dispute Resolution',               href: '/services/dispute-resolution' },
  { id: 'deposit',     label: 'Deposit Negotiation',              href: '/services/deposit-negotiation' },
  { id: 'letting',     label: 'Letting Services',                 href: '/services/letting-services' },
]

const ROLE_GREETINGS: Record<string, string> = {
  property_manager: 'Welcome, Property Manager',
  landlord:         'Welcome, Landlord',
  tenant:           'Welcome, Tenant',
  student:          'Welcome, Student',
}

const AI_STATS = [
  { label: 'Reports Generated', value: '1,000+' },
  { label: 'Items Catalogued', value: '50,000+' },
  { label: 'Avg Report Time', value: 'Under 3 mins' },
]

const FOOTER_LINKS = [
  { label: 'Privacy & Terms', href: '/legal/privacy-and-terms' },
  { label: 'Cookie Settings', href: '/legal/cookies' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

function ServicesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const roleParam = params.get('role') as Role | null
  const intent = params.get('intent') ?? 'services'

  const role = roleParam ?? (
    typeof window !== 'undefined' ? (sessionStorage.getItem('3c_user_role') as Role | null) : null
  ) ?? 'property_manager'

  useEffect(() => {
    if (intent === 'letting') {
      router.replace(`/services/letting-services?role=${role}`)
    }
  }, [intent, role, router])

  const allowedIds = SERVICE_MATRIX[role] ?? SERVICE_MATRIX.property_manager
  const visibleServices = ALL_SERVICES.filter(s => allowedIds.includes(s.id))
  const greeting = ROLE_GREETINGS[role] ?? 'Welcome'

  if (intent === 'letting') {
    return (
      <div className="w-screen h-screen bg-[#1e0f05] flex items-center justify-center">
        <p style={{ color: '#F0A830' }}>Redirecting…</p>
      </div>
    )
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col"
      style={{
        backgroundImage: "url('/assets/images/homepage_3c.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(30,15,5,0.52)' }} />
      <div className="ai-grid-overlay" />

      {/* Change Selection nav — z-20 so it sits above the -mt-6 main content div */}
      <div className="relative z-20 pt-5 pl-5">
        <Link href={`/who-are-you?intent=${intent}`} className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#F0A830] transition-colors text-sm">
          <ArrowLeft size={15} />
          Change Selection
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center overflow-y-auto py-4 -mt-6">

        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-3">
          <Link href="/">
            <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl leading-none">3C Core</h1>
            <p className="mt-1 text-[10px] sm:text-xs tracking-[0.18em] uppercase font-medium" style={{ color: '#F0A830' }}>
              Connected&nbsp;|&nbsp;Consistent&nbsp;|&nbsp;Confident
            </p>
          </Link>
        </motion.div>

        {/* Role greeting */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="font-heading font-bold text-white text-xl sm:text-2xl mb-1"
        >
          {greeting}
        </motion.p>

        {/* AI stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex gap-3 mb-5 mt-3 flex-wrap justify-center"
        >
          {AI_STATS.map(stat => (
            <div
              key={stat.label}
              className="px-4 py-2 rounded-lg text-center"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(240,168,48,0.35)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <p className="font-heading font-bold text-white text-base">{stat.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Services label */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-[11px] tracking-widest uppercase mb-4 font-medium"
          style={{ color: '#F0A830' }}
        >
          Your Services
        </motion.p>

        {/* Service buttons */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
          {visibleServices.map((svc, i) => (
            <motion.div
              key={svc.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.5 + i * 0.08 }}
            >
              <Link
                href={svc.href}
                className="inline-block px-6 py-3.5 text-sm font-medium text-white rounded-md min-w-[210px]"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1.5px solid rgba(240,168,48,0.65)',
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.03em',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(240,168,48,0.22)'
                  el.style.borderColor = '#F0A830'
                  el.style.color = '#FDE8B0'
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(255,255,255,0.10)'
                  el.style.borderColor = 'rgba(240,168,48,0.65)'
                  el.style.color = 'white'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {svc.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <ComingSoonWidget />

      <motion.footer
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        className="relative z-10 flex items-center justify-center gap-1 px-4 py-3"
        style={{ background: 'rgba(30,15,5,0.68)' }}
      >
        {FOOTER_LINKS.map((link, i) => (
          <span key={link.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-white/30 text-xs">|</span>}
            <Link href={link.href} className="text-[11px] text-white/75 hover:text-[#F0A830] hover:underline transition-colors">
              {link.label}
            </Link>
          </span>
        ))}
      </motion.footer>

      <style>{`
        .ai-grid-overlay {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(240,168,48,0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none; z-index: 1;
          animation: gridFade 4s ease-in-out infinite alternate;
        }
        @keyframes gridFade { from { opacity: 0.3; } to { opacity: 0.7; } }
      `}</style>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#1e0f05] flex items-center justify-center"><p style={{ color: '#F0A830' }}>Loading…</p></div>}>
      <ServicesContent />
    </Suspense>
  )
}
