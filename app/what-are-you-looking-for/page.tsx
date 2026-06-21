'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'

const FOOTER_LINKS = [
  { label: 'Privacy & Terms', href: '/legal/privacy-and-terms' },
  { label: 'Cookie Settings', href: '/legal/cookies' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

function WhatAreYouLookingForContent() {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('role') ?? 'property_manager'

  function handleIntent(intent: 'services' | 'letting') {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('3c_journey_intent', intent)
    }
    router.push(`/services?role=${role}&intent=${intent}`)
  }

  return (
    <div
      className="relative w-screen min-h-screen overflow-y-auto flex flex-col"
      style={{
        backgroundImage: "url('/assets/images/homepage_3c.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(30,15,5,0.55)' }} />
      <div className="ai-grid-overlay" />

      <div className="relative z-20 pt-5 px-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#F0A830] transition-colors text-sm">
          <ArrowLeft size={15} />
          Back
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center overflow-y-auto py-4">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-3"
        >
          <Link href="/">
            <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl leading-none">3C Core</h1>
            <p className="mt-1.5 text-[10px] sm:text-xs tracking-[0.18em] uppercase font-medium" style={{ color: '#F0A830' }}>
              Connected&nbsp;|&nbsp;Consistent&nbsp;|&nbsp;Confident
            </p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-4 max-w-xl"
        >
          <p className="font-heading font-bold text-white text-xl sm:text-2xl leading-snug">
            One Skyline<br />
            Infinite Needs
          </p>
          <p className="mt-2 font-heading font-semibold text-base sm:text-lg" style={{ color: '#F0A830' }}>
            Property Services You Can Finally Trust
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[11px] tracking-widest uppercase mb-3 font-medium"
          style={{ color: '#F0A830' }}
        >
          What are you looking for today?
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          {[
            {
              intent: 'services' as const,
              title: 'Services',
              desc: 'Inventory, Inspections, Dispute Resolution, Maintenance & more',
              delay: 0.65,
            },
            {
              intent: 'letting' as const,
              title: 'Letting',
              desc: 'Find your next home. Short & long-term lets for tenants and students.',
              delay: 0.75,
            },
          ].map(({ intent, title, desc, delay }) => (
            <motion.button
              key={intent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay }}
              onClick={() => handleIntent(intent)}
              className="flex-1 text-left p-6 rounded-xl cursor-pointer"
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
                el.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'rgba(255,255,255,0.10)'
                el.style.borderColor = 'rgba(240,168,48,0.65)'
                el.style.transform = 'translateY(0)'
              }}
            >
              <p className="font-heading font-bold text-white text-xl mb-2">{title}</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <ComingSoonWidget />

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
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

export default function WhatAreYouLookingForPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#1e0f05] flex items-center justify-center"><p className="text-[#F0A830]">Loading…</p></div>}>
      <WhatAreYouLookingForContent />
    </Suspense>
  )
}
