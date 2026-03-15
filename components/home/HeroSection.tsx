'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CircuitDecor } from '@/components/ui/CircuitDecor'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#071224] to-[#0d2248] overflow-hidden flex items-center">
      <CircuitDecor position="tl" />
      <CircuitDecor position="tr" />
      <CircuitDecor position="bl" />
      <CircuitDecor position="br" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          >
            <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-4 font-body">
              Professional Property Management
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold font-heading text-white leading-tight mb-2">
              Connected.<br />Consistent.
            </h1>
            <h1 className="text-5xl lg:text-6xl font-bold font-heading text-[#2a9fd4] leading-tight mb-6">
              Confident.
            </h1>
            <p className="text-[13px] text-[#7aaecc] leading-relaxed mb-8 max-w-md">
              Expert property management, lettings consultancy, and investment advisory services.
              We protect your asset, maximise your returns, and handle every detail — so you don&apos;t have to.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/services">
                <Button size="lg" variant="primary" className="group">
                  Our Services
                  <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Get In Touch
                </Button>
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-12 flex gap-8">
              {[
                { value: '250+', label: 'Properties Managed' },
                { value: '15+',  label: 'Years Experience'   },
                { value: '96%',  label: 'Satisfaction Rate'  },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold font-heading text-[#2a9fd4]">{stat.value}</div>
                  <div className="text-[11px] text-[#7aaecc] tracking-wide mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Property Icon */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              {/* Ambient glow */}
              <div className="absolute inset-0 rounded-full bg-radial-gradient" style={{ background: 'radial-gradient(circle, #0d2a52 0%, transparent 70%)' }} />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <HeroPropertyIcon />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function HeroPropertyIcon() {
  return (
    <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heroAmbient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d2a52" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#050d1a" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="heroCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
          <stop offset="35%" stopColor="#aaf0ff" stopOpacity="0.95"/>
          <stop offset="70%" stopColor="#00b8e6" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#1a6fc4" stopOpacity="0"/>
        </radialGradient>
        <filter id="heroGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background ambient */}
      <circle cx="160" cy="160" r="155" fill="url(#heroAmbient)"/>

      {/* Outer rings */}
      <circle cx="160" cy="160" r="148" fill="none" stroke="#1a5090" strokeWidth="0.8" opacity="0.4"/>
      <circle cx="160" cy="160" r="132" fill="none" stroke="#1a5090" strokeWidth="0.5" opacity="0.25"/>
      <circle cx="160" cy="160" r="115" fill="none" stroke="#2a7fd4" strokeWidth="0.4" opacity="0.2" strokeDasharray="8 12"/>

      {/* Circuit lines extending outward */}
      <line x1="12" y1="160" x2="45" y2="160" stroke="#00ccff" strokeWidth="1.2" opacity="0.5"/>
      <line x1="12" y1="160" x2="25" y2="135" stroke="#00ccff" strokeWidth="0.9" opacity="0.35"/>
      <circle cx="12" cy="135" r="3" fill="#00ccff" opacity="0.5"/>
      <line x1="308" y1="160" x2="275" y2="160" stroke="#00ccff" strokeWidth="1.2" opacity="0.5"/>
      <line x1="308" y1="160" x2="295" y2="135" stroke="#00ccff" strokeWidth="0.9" opacity="0.35"/>
      <circle cx="308" cy="135" r="3" fill="#00ccff" opacity="0.5"/>
      <line x1="160" y1="12" x2="160" y2="50" stroke="#00ccff" strokeWidth="1.2" opacity="0.5"/>
      <line x1="160" y1="12" x2="135" y2="25" stroke="#00ccff" strokeWidth="0.9" opacity="0.35"/>
      <circle cx="135" cy="12" r="3" fill="#00ccff" opacity="0.5"/>
      <line x1="185" y1="12" x2="200" y2="12" stroke="#00ccff" strokeWidth="0.9" opacity="0.35"/>
      <circle cx="200" cy="12" r="2.5" fill="#00ccff" opacity="0.4"/>

      {/* Building base shadow/glow */}
      <ellipse cx="160" cy="268" rx="70" ry="10" fill="#2a7fd4" opacity="0.12"/>

      {/* ── MAIN BUILDING ── */}

      {/* Building body */}
      <rect x="88" y="155" width="144" height="110" rx="2" fill="#071224" stroke="#2a7fd4" strokeWidth="2.5"/>
      <rect x="88" y="155" width="144" height="110" rx="2" fill="none" stroke="#6ab4e8" strokeWidth="1" strokeDasharray="6 90" strokeDashoffset="-8" opacity="0.45"/>

      {/* Roofline */}
      <polyline points="72,158 160,68 248,158"
                fill="none" stroke="#2a7fd4" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
      <polyline points="72,158 160,68 248,158"
                fill="none" stroke="#6ab4e8" strokeWidth="1.2" strokeDasharray="6 100" strokeDashoffset="-10" opacity="0.5"/>

      {/* Spire / tower at peak */}
      <rect x="150" y="42" width="20" height="30" rx="1" fill="#071224" stroke="#1a5fa8" strokeWidth="2" opacity="0.9"/>
      <polygon points="160,28 153,44 167,44" fill="#1a5fa8" stroke="#2a7fd4" strokeWidth="1.5"/>

      {/* Core glow at peak */}
      <circle cx="160" cy="62" r="30" fill="url(#heroCoreGlow)" opacity="0.3" filter="url(#heroGlow)"/>
      <circle cx="160" cy="62" r="14" fill="#071224"/>
      <circle cx="160" cy="62" r="9"  fill="#00b8e6" opacity="0.85"/>
      <circle cx="160" cy="62" r="5.5" fill="#aaf0ff" opacity="0.95"/>
      <circle cx="160" cy="62" r="2.5" fill="#ffffff"/>

      {/* Floors dividers */}
      <line x1="88" y1="195" x2="232" y2="195" stroke="#1e3a5f" strokeWidth="1" opacity="0.7"/>
      <line x1="88" y1="230" x2="232" y2="230" stroke="#1e3a5f" strokeWidth="1" opacity="0.7"/>

      {/* Windows — top floor */}
      {[102, 132, 188, 218].map(x => (
        <g key={x}>
          <rect x={x} y="163" width="22" height="18" rx="1" fill="#0d1f3c" stroke="#6ab4e8" strokeWidth="1.2" opacity="0.8"/>
          <circle cx={x+11} cy="172" r="3.5" fill="#00ccff" opacity="0.65" filter="url(#heroGlow)"/>
        </g>
      ))}
      {/* Windows — mid floor */}
      {[102, 132, 188, 218].map(x => (
        <g key={x}>
          <rect x={x} y="202" width="22" height="18" rx="1" fill="#0d1f3c" stroke="#6ab4e8" strokeWidth="1.2" opacity="0.65"/>
          <circle cx={x+11} cy="211" r="3" fill="#2a7fd4" opacity="0.5"/>
        </g>
      ))}

      {/* Door */}
      <rect x="140" y="232" width="40" height="33" rx="2" fill="#071224" stroke="#00ccff" strokeWidth="1.8" opacity="0.75"/>
      <rect x="148" y="240" width="10" height="10" rx="0.5" fill="none" stroke="#6ab4e8" strokeWidth="0.8" opacity="0.6"/>
      <rect x="162" y="240" width="10" height="10" rx="0.5" fill="none" stroke="#6ab4e8" strokeWidth="0.8" opacity="0.6"/>
      <circle cx="157" cy="252" r="2" fill="#00ccff" opacity="0.55"/>

      {/* Surrounding small buildings */}
      <rect x="42" y="200" width="38" height="65" rx="1" fill="#071224" stroke="#1e6ab0" strokeWidth="1.5" opacity="0.7"/>
      <polyline points="36,202 61,180 86,202" fill="none" stroke="#1e6ab0" strokeWidth="2" strokeLinejoin="round" opacity="0.7"/>
      {[48, 64].map(x => (
        <rect key={x} x={x} y="210" width="10" height="9" rx="0.5" fill="none" stroke="#4a90c4" strokeWidth="1" opacity="0.6"/>
      ))}

      <rect x="240" y="200" width="38" height="65" rx="1" fill="#071224" stroke="#1e6ab0" strokeWidth="1.5" opacity="0.7"/>
      <polyline points="234,202 259,180 284,202" fill="none" stroke="#1e6ab0" strokeWidth="2" strokeLinejoin="round" opacity="0.7"/>
      {[248, 264].map(x => (
        <rect key={x} x={x} y="210" width="10" height="9" rx="0.5" fill="none" stroke="#4a90c4" strokeWidth="1" opacity="0.6"/>
      ))}

      {/* Ground line */}
      <line x1="30" y1="265" x2="290" y2="265" stroke="#1e3a5f" strokeWidth="1.2" opacity="0.6"/>
    </svg>
  )
}
