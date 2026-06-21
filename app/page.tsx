'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { LogOut, LayoutDashboard, AlertTriangle } from 'lucide-react'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'

const FOOTER_LINKS = [
  { label: 'Privacy & Terms', href: '/legal/privacy-and-terms' },
  { label: 'Cookie Settings', href: '/legal/cookies' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

const ROLES = [
  { role: 'property_manager', label: 'Property Manager / Landlord', desc: 'Manage properties, inventories & tenancies' },
  { role: 'tenant',           label: 'Tenant',                      desc: 'View reports, raise requests & track disputes' },
  { role: 'student',          label: 'Student',                     desc: 'Find accommodation & manage your tenancy' },
  { role: 'others',           label: 'Others',                      desc: 'General enquiries & other services' },
]

const PORTAL_ROLE_LABELS: Record<string, string> = {
  property_manager: 'Property Manager / Landlord',
  tenant: 'Tenant',
  student: 'Student',
  others: 'Others',
}

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [signingOut, setSigningOut] = useState(false)
  const [mismatchTarget, setMismatchTarget] = useState<string | null>(null)

  const isLoggedIn = status === 'authenticated'
  const userPortalRole = session?.user?.portalRole ?? null

  function handleRole(role: string) {
    if (isLoggedIn && userPortalRole && userPortalRole !== role) {
      setMismatchTarget(role)
      return
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('3c_user_role', role)
    }
    const nextUrl = `/what-are-you-looking-for?role=${role}`
    if (isLoggedIn) {
      router.push(nextUrl)
      return
    }
    router.push(`/portal/login?role=${role}&return=${encodeURIComponent(nextUrl)}`)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut({ redirect: false })
    setSigningOut(false)
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
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(30,15,5,0.55)' }} />
      <div className="ai-grid-overlay" />

      {isLoggedIn && (
        <div className="relative z-20 pt-5 px-5 flex items-center justify-end">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            style={{ color: 'rgba(255,120,120,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,120,120,0.8)' }}
          >
            <LogOut size={13} />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {mismatchTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMismatchTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: '#2C1F14', border: '1.5px solid rgba(240,168,48,0.5)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(212,134,10,0.15)', border: '1.5px solid rgba(212,134,10,0.4)' }}>
                <AlertTriangle size={22} style={{ color: '#F0A830' }} />
              </div>
              <h3 className="font-heading font-bold text-white text-lg mb-2">Wrong Account Type</h3>
              <p className="text-white/60 text-sm mb-1 leading-relaxed">
                You&apos;re currently signed in as a{' '}
                <span style={{ color: '#F0A830', fontWeight: 600 }}>
                  {PORTAL_ROLE_LABELS[userPortalRole ?? ''] ?? userPortalRole}
                </span>.
              </p>
              <p className="text-white/60 text-sm mb-5 leading-relaxed">
                To access{' '}
                <span className="text-white/80 font-medium">
                  {PORTAL_ROLE_LABELS[mismatchTarget] ?? mismatchTarget}
                </span>{' '}
                services, please sign out and sign back in with the correct account.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => { setMismatchTarget(null); await handleSignOut() }}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all"
                  style={{ background: '#D4860A', border: '1.5px solid #D4860A' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
                >
                  Sign out &amp; switch account
                </button>
                <button
                  onClick={() => setMismatchTarget(null)}
                  className="w-full py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center overflow-y-auto py-8 -mt-10">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-5"
        >
          <h1 className="font-heading font-bold text-white text-4xl sm:text-5xl leading-none">3C Core</h1>
          <p className="mt-2 text-xs sm:text-sm tracking-[0.18em] uppercase font-medium" style={{ color: '#F0A830' }}>
            Connected&nbsp;|&nbsp;Consistent&nbsp;|&nbsp;Confident
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-7 max-w-xl"
        >
          <p className="font-heading font-bold text-white text-2xl sm:text-3xl mb-3">
            AI Powered Property Services
          </p>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            3C Core uses artificial intelligence to automate property inventories, inspections,
            and dispute resolution — giving landlords, tenants, and students a faster, fairer,
            and fully documented property experience.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[11px] tracking-widest uppercase mb-5 font-medium"
          style={{ color: '#F0A830' }}
        >
          Who are you?
        </motion.p>

        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="w-full max-w-sm"
          >
            <div
              className="rounded-2xl p-6 mb-5 text-left"
              style={{ background: 'rgba(44,31,20,0.85)', border: '1.5px solid rgba(240,168,48,0.5)', backdropFilter: 'blur(10px)' }}
            >
              <p className="text-[10px] tracking-widest uppercase font-medium mb-1" style={{ color: '#D4860A' }}>
                Currently signed in as
              </p>
              <p className="font-heading font-bold text-white text-xl mb-1">{session?.user?.name}</p>
              <p className="text-white/50 text-xs">{session?.user?.email}</p>
              {userPortalRole && (
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(212,134,10,0.2)', color: '#F0A830', border: '1px solid rgba(212,134,10,0.35)' }}>
                  {PORTAL_ROLE_LABELS[userPortalRole]}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => router.push(`/what-are-you-looking-for?role=${userPortalRole ?? 'property_manager'}`)}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#D4860A', border: '1.5px solid #D4860A', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
              >
                Continue to My Services
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                onClick={() => router.push('/portal/customer/dashboard')}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm"
                style={{
                  background: 'rgba(212,134,10,0.12)',
                  border: '1.5px solid rgba(212,134,10,0.4)',
                  color: '#F0A830',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,134,10,0.22)'; e.currentTarget.style.borderColor = '#F0A830' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,134,10,0.12)'; e.currentTarget.style.borderColor = 'rgba(212,134,10,0.4)' }}
              >
                <LayoutDashboard size={15} />
                Go to My Portal Dashboard
              </motion.button>
            </div>

            <p className="text-white/40 text-xs mt-1 mb-3">— or select a different role —</p>

            <div className="flex flex-col gap-2">
              {ROLES.map(({ role, label, desc }, i) => {
                const isMine = role === userPortalRole
                return (
                  <motion.button
                    key={role}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.07 }}
                    onClick={() => handleRole(role)}
                    className="text-left px-4 py-3 rounded-xl text-sm relative"
                    style={{
                      background: isMine ? 'rgba(212,134,10,0.12)' : 'rgba(255,255,255,0.05)',
                      border: isMine ? '1.5px solid rgba(240,168,48,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s',
                      opacity: isMine ? 1 : 0.6,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = isMine ? 'rgba(212,134,10,0.22)' : 'rgba(255,100,100,0.08)'
                      e.currentTarget.style.borderColor = isMine ? '#F0A830' : 'rgba(255,100,100,0.4)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isMine ? 'rgba(212,134,10,0.12)' : 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.borderColor = isMine ? 'rgba(240,168,48,0.5)' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <p className="font-semibold" style={{ color: isMine ? '#F0A830' : 'rgba(255,255,255,0.5)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: isMine ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>{desc}</p>
                    {!isMine && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,80,80,0.12)', color: 'rgba(255,100,100,0.6)', border: '1px solid rgba(255,80,80,0.2)' }}>
                        locked
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {ROLES.map(({ role, label, desc }, i) => (
                <motion.button
                  key={role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.55 + i * 0.1 }}
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
              transition={{ delay: 1.0 }}
              className="mt-5 text-xs"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Don&apos;t have an account yet?{' '}
              <Link
                href="/portal/register"
                className="underline underline-offset-2 font-medium transition-colors"
                style={{ color: '#F0A830' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFD175' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#F0A830' }}
              >
                Create an account
              </Link>
            </motion.p>
          </>
        )}
      </div>

      <ComingSoonWidget />

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
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
