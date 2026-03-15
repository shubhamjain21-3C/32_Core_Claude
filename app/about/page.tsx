import type { Metadata } from 'next'
import { MissionVision } from '@/components/about/MissionVision'
import { TeamGrid } from '@/components/about/TeamGrid'
import { CompanyTimeline } from '@/components/about/CompanyTimeline'
import { CTABanner } from '@/components/home/CTABanner'
import { CircuitDecor } from '@/components/ui/CircuitDecor'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about 3C Core — our mission, team, and 15+ years of property management expertise.',
}

export default function AboutPage() {
  return (
    <div className="bg-[#050d1a]">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-[#071224] to-[#050d1a] overflow-hidden">
        <CircuitDecor position="tr" />
        <CircuitDecor position="bl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-3">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            About <span className="text-[#2a9fd4]">3C Core</span>
          </h1>
          <p className="text-[#7aaecc] text-sm leading-relaxed max-w-2xl mx-auto">
            Founded on the belief that property management should be transparent, proactive, and genuinely client-focused.
            For over 15 years, we&apos;ve helped landlords and investors across the UK achieve outstanding results.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MissionVision />
        <TeamGrid />
        <CompanyTimeline />
      </div>
      <CTABanner />
    </div>
  )
}
