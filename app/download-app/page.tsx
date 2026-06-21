'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Smartphone } from 'lucide-react'

export default function DownloadAppPage() {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios')

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

      <div className="relative z-20 pt-5 px-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#F0A830] transition-colors text-sm">
          <ArrowLeft size={15} />
          Back
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/">
            <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl leading-none">3C Core</h1>
            <p className="mt-1 text-[10px] sm:text-xs tracking-[0.18em] uppercase font-medium" style={{ color: '#F0A830' }}>
              Connected&nbsp;|&nbsp;Consistent&nbsp;|&nbsp;Confident
            </p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl p-8"
            style={{ background: 'rgba(44,31,20,0.85)', border: '1.5px solid rgba(240,168,48,0.5)', backdropFilter: 'blur(10px)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(212,134,10,0.15)', border: '1.5px solid rgba(212,134,10,0.4)' }}>
              <Smartphone size={28} style={{ color: '#F0A830' }} />
            </div>

            <h2 className="font-heading font-bold text-white text-2xl mb-2">Get the App</h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Download the 3C Core app for a seamless property management experience on the go.
            </p>

            {/* Platform toggle */}
            <div
              className="flex rounded-xl p-1 mb-6 mx-auto max-w-xs"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(240,168,48,0.25)' }}
            >
              <button
                onClick={() => setPlatform('ios')}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: platform === 'ios' ? '#D4860A' : 'transparent',
                  color: platform === 'ios' ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              >
                App Store
              </button>
              <button
                onClick={() => setPlatform('android')}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: platform === 'android' ? '#D4860A' : 'transparent',
                  color: platform === 'android' ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              >
                Google Play
              </button>
            </div>

            {/* Download button */}
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="block w-full py-4 rounded-xl font-semibold text-white text-sm text-center transition-all"
              style={{ background: '#D4860A', border: '1.5px solid #D4860A' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
            >
              {platform === 'ios' ? 'Download on the App Store' : 'Get it on Google Play'}
            </a>

            <p className="text-white/40 text-xs mt-4">
              Coming soon — links will be updated once the app is published.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 flex items-center justify-center gap-1 px-4 py-3"
        style={{ background: 'rgba(30,15,5,0.68)' }}
      >
        {[
          { label: 'Privacy & Terms', href: '/legal/privacy-and-terms' },
          { label: 'Cookie Settings', href: '/legal/cookies' },
          { label: 'About Us', href: '/about' },
          { label: 'Contact Us', href: '/contact' },
        ].map((link, i) => (
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
