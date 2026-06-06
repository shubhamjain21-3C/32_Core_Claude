'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react'
import { Suspense } from 'react'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'

const FOOTER_LINKS = [
  { label: 'Privacy & Terms', href: '/legal/privacy-and-terms' },
  { label: 'Cookie Settings', href: '/legal/cookies' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

const ROLES_SERVICES = [
  { role: 'property_manager', label: 'Property Manager / Landlord', desc: 'Manage properties, inventories & tenancies' },
  { role: 'tenant',           label: 'Tenant',                      desc: 'View reports, raise requests & track disputes' },
  { role: 'student',          label: 'Student',                     desc: 'Find accommodation & manage your tenancy' },
]

const ROLES_LETTING = [
  { role: 'tenant',  label: 'Tenant',  desc: 'Find your next rental property' },
  { role: 'student', label: 'Student', desc: 'Find student accommodation' },
]

function WhoAreYouContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const params = useSearchParams()
  const intent = (params.get('intent') ?? 'services') as 'services' | 'letting'

  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const roles = intent === 'letting' ? ROLES_LETTING : ROLES_SERVICES

  function getServicesUrl(role: string) {
    return intent === 'letting'
      ? `/services/letting-services?role=${role}`
      : `/services?role=${role}&intent=${intent}`
  }

  function handleRole(role: string) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('3c_user_role', role)
      sessionStorage.setItem('3c_journey_intent', intent)
    }
    if (status === 'authenticated') {
      router.push(getServicesUrl(role))
    } else {
      setSelectedRole(role)
    }
  }

  function browseAsGuest(role: string) {
    router.push(getServicesUrl(role))
  }

  const selectedRoleLabel = roles.find(r => r.role === selectedRole)?.label ?? ''

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
      {/* Dark overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(30,15,5,0.55)' }} />
      <div className="ai-grid-overlay" />

      {/* Back button */}
      <div className="relative z-20 pt-5 pl-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#F0A830] transition-colors text-sm"
          onClick={() => selectedRole ? setSelectedRole(null) : undefined}
        >
          <ArrowLeft size={15} />
          {selectedRole ? 'Change Selection' : 'Back'}
        </Link>
      </div>

      {/* Main */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center -mt-8">

        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <Link href="/">
            <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl leading-none">3C Core</h1>
            <p className="mt-1 text-[10px] sm:text-xs tracking-[0.18em] uppercase font-medium" style={{ color: '#F0A830' }}>
              Connected&nbsp;|&nbsp;Consistent&nbsp;|&nbsp;Confident
            </p>
          </Link>
        </motion.div>

        {/* ── Role selection stage ── */}
        {!selectedRole && (
          <>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-2">
              <h2 className="font-heading font-bold text-white text-2xl sm:text-3xl">And who are you?</h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}
              style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}
            >
              Our AI tailors your experience based on your role —
              giving you only the tools and services relevant to you.
            </motion.p>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              {roles.map(({ role, label, desc }, i) => (
                <motion.button
                  key={role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.45 + i * 0.1 }}
                  onClick={() => handleRole(role)}
                  className="text-left px-5 py-4 rounded-xl cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.10)',
                    border: '1.5px solid rgba(240,168,48,0.65)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(240,168,48,0.22)'
                    el.style.borderColor = '#F0A830'
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(255,255,255,0.10)'
                    el.style.borderColor = 'rgba(240,168,48,0.65)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <p className="font-heading font-semibold text-white text-base">{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{desc}</p>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* ── Auth prompt stage (after role selected, not logged in) ── */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            {/* Selected role indicator */}
            <div className="mb-5 px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-medium"
              style={{ background: 'rgba(240,168,48,0.18)', border: '1px solid rgba(240,168,48,0.5)', color: '#F0A830' }}>
              {selectedRoleLabel}
            </div>

            <h2 className="font-heading font-bold text-white text-2xl sm:text-3xl mb-2">
              Welcome aboard
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Login or create a free account to access your personalised services, reports, and property tools.
            </p>

            <div className="flex flex-col gap-3">
              {/* Login button */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => router.push(
                  `/portal/login?role=${selectedRole}&return=${encodeURIComponent(getServicesUrl(selectedRole))}`
                )}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#D4860A', border: '1.5px solid #D4860A', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
              >
                <LogIn size={16} />
                Login to My Account
              </motion.button>

              {/* Register button */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                onClick={() => router.push('/portal/register')}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-semibold text-sm"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1.5px solid rgba(240,168,48,0.65)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(240,168,48,0.22)'
                  e.currentTarget.style.borderColor = '#F0A830'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                  e.currentTarget.style.borderColor = 'rgba(240,168,48,0.65)'
                }}
              >
                <UserPlus size={16} />
                Create Free Account
              </motion.button>

              {/* Guest browse */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.26 }}
                onClick={() => browseAsGuest(selectedRole)}
                className="text-xs font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
              >
                Continue without account →
              </motion.button>
            </div>

            {/* Change selection */}
            <button
              onClick={() => setSelectedRole(null)}
              className="mt-6 text-xs transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F0A830' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              ← Change my selection
            </button>
          </motion.div>
        )}
      </div>

      <ComingSoonWidget />

      {/* Footer */}
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

export default function WhoAreYouPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#1e0f05] flex items-center justify-center"><p className="text-[#F0A830]">Loading…</p></div>}>
      <WhoAreYouContent />
    </Suspense>
  )
}
