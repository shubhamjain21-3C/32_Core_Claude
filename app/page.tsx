'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const SERVICES = [
  { label: 'Check In / Check Out Inventory',  href: '/services/inventory' },
  { label: 'Midterm Property Inspections',    href: '/services/midterm-inspections' },
  { label: 'Dispute Resolution',              href: '/services/dispute-resolution' },
  { label: 'Maintenance & Cleaning',          href: '/services/maintenance' },
  { label: 'Deposit Negotiation',             href: '/services/deposit-negotiation' },
]

const FOOTER_LINKS = [
  { label: 'Privacy & Terms',  href: '/legal/privacy-and-terms' },
  { label: 'Cookie Settings',  href: '/legal/cookies' },
  { label: 'About Us',         href: '/about' },
  { label: 'Contact Us',       href: '/contact' },
]

export default function HomePage() {
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(30,15,5,0.52)' }}
      />

      {/* Main content — scrollable on very small screens */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center overflow-y-auto py-8 -mt-16 sm:-mt-20">

        {/* Brand block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <h1 className="font-heading font-bold text-white text-4xl sm:text-5xl leading-none">
            3C Core
          </h1>
          <p
            className="mt-2 text-xs sm:text-sm tracking-[0.18em] uppercase font-medium"
            style={{ color: '#F0A830' }}
          >
            Connected&nbsp;|&nbsp;Consistent&nbsp;|&nbsp;Confident
          </p>
        </motion.div>

        {/* Tagline */}
        <div className="mb-8 sm:mb-10 space-y-1">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-heading font-bold text-white text-4xl sm:text-5xl lg:text-6xl"
          >
            One Skyline
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="font-heading font-bold text-white text-4xl sm:text-5xl lg:text-6xl"
          >
            Infinite Needs
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="font-body text-lg sm:text-2xl font-normal tracking-wide mt-2"
            style={{ color: '#F0A830' }}
          >
            Property Services You Can Finally Trust
          </motion.p>
        </div>

        {/* Services label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="text-[11px] tracking-widest uppercase mb-4 font-medium"
          style={{ color: '#F0A830' }}
        >
          Our Services
        </motion.p>

        {/* Service buttons */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 + i * 0.1 }}
            >
              <Link
                href={svc.href}
                className="group inline-block px-6 py-3.5 text-sm font-medium text-white rounded-md transition-all duration-250 min-w-[210px]"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1.5px solid rgba(240,168,48,0.65)',
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.03em',
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

      {/* AI Coming Soon badge — fixed bottom-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="fixed bottom-16 right-7 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl cursor-default select-none"
        style={{ background: 'rgba(212,134,10,0.90)' }}
      >
        <span className="text-base">🤖</span>
        <div className="leading-tight">
          <p className="text-white text-xs font-semibold">3C Core Assistant</p>
          <p className="text-[#FDE8B0] text-[10px]">Coming Soon — Stay Tuned</p>
        </div>
      </motion.div>

      {/* Footer strip */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 h-13 flex items-center justify-center gap-1 px-4 py-3"
        style={{ background: 'rgba(30,15,5,0.68)' }}
      >
        {FOOTER_LINKS.map((link, i) => (
          <span key={link.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-white/30 text-xs">|</span>}
            <Link
              href={link.href}
              className="text-[11px] text-white/75 hover:text-[#F0A830] hover:underline transition-colors"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </motion.footer>
    </div>
  )
}
