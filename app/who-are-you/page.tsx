'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react'
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
  const [signingOut, setSigningOut] = useState(false)

  const roles = intent === 'letting' ? ROLES_LETTING : ROLES_SERVICES

  const firstName  = session?.user?.name?.split(' ')[0] ?? ''
  const isLoggedIn = status === 'authenticated'

  function handleRole(role: string) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('3c_user_role', role)
      sessionStorage.setItem('3c_journey_intent', intent)
    }
    // If authenticated, go straight to portal (no login gate)
    if (isLoggedIn) {
      router.push('/portal/customer/dashboard')
      return
    }
    // Not authenticated → go directly to role-specific login page
    router.push(`/portal/login?role=${role}&return=${encodeURIComponent('/portal/customer/dashboard')}`)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut({ redirect: false })
    setSigningOut(false)
    // After sign-out, page re-renders with status='unauthenticated' and shows role cards
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
      {/* Dark overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(30,15,5,0.55)' }} />
      <div className="ai-grid-overlay" />

      {/* Back button */}
      <div className="relative z-20 pt-5 pl-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#F0A830] transition-colors text-sm">
          <ArrowLeft size={15} />
          Back
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

        {/* ── LOGGED IN: show signed-in panel ── */}
        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            {/* Signed-in card */}
            <div
              className="rounded-2xl p-6 mb-5 text-left"
              style={{ background: 'rgba(44,31,20,0.85)', border: '1.5px solid rgba(240,168,48,0.5)', backdropFilter: 'blur(10px)' }}
            >
              <p className="text-[10px] tracking-widest uppercase font-medium mb-1" style={{ color: '#D4860A' }}>
                Currently signed in as
              </p>
              <p className="font-heading font-bold text-white text-xl mb-1">{session?.user?.name}</p>
              <p className="text-white/50 text-xs">{session?.user?.email}</p>
            </div>

            <h2 className="font-heading font-bold text-white text-xl mb-6">
              What would you like to do?
            </h2>

            <div className="flex flex-col gap-3">
              {/* Continue to portal */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => router.push('/portal/customer/dashboard')}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#D4860A', border: '1.5px solid #D4860A', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
              >
                <LayoutDashboard size={16} />
                Continue to My Portal
              </motion.button>

              {/* Select a different role */}
              <p className="text-white/40 text-xs mt-1 mb-1">— or select a service category below —</p>

              <div className="flex flex-col gap-2">
                {roles.map(({ role, label, desc }, i) => (
                  <motion.button
                    key={role}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    onClick={() => handleRole(role)}
                    className="text-left px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1.5px solid rgba(240,168,48,0.4)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,168,48,0.18)'; e.currentTarget.style.borderColor = '#F0A830' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(240,168,48,0.4)' }}
                  >
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                  </motion.button>
                ))}
              </div>

              {/* Sign out & new session */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-3 flex items-center justify-center gap-2 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ color: 'rgba(255,100,100,0.7)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,100,100,0.7)' }}
              >
                <LogOut size={13} />
                {signingOut ? 'Signing out…' : 'Sign out & start a new session'}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ── NOT LOGGED IN: show role selection ── */
          <>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-2">
              <h2 className="font-heading font-bold text-white text-2xl sm:text-3xl">And who are you?</h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}
              style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}
            >
              Select your role — you&apos;ll be taken to your login page to access personalised services.
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
                    e.currentTarget.style.background = 'rgba(240,168,48,0.22)'
                    e.currentTarget.style.borderColor = '#F0A830'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                    e.currentTarget.style.borderColor = 'rgba(240,168,48,0.65)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <p className="font-heading font-semibold text-white text-base">{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{desc}</p>
                </motion.button>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-5 text-xs"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Don&apos;t have an account? You can create one on the login page.
            </motion.p>
          </>
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
