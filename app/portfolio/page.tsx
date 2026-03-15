import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { caseStudies } from '@/data/caseStudies'
import { Badge } from '@/components/ui/Badge'
import { CTABanner } from '@/components/home/CTABanner'
import { CircuitDecor } from '@/components/ui/CircuitDecor'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Case studies from our property management and investment advisory work.',
}

export default function PortfolioPage() {
  return (
    <div className="bg-[#050d1a]">
      <section className="relative py-20 bg-gradient-to-b from-[#071224] to-[#050d1a] overflow-hidden">
        <CircuitDecor position="tr" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-3">Our Work</p>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Client <span className="text-[#2a9fd4]">Case Studies</span>
          </h1>
          <p className="text-[#7aaecc] text-sm leading-relaxed max-w-2xl mx-auto">
            Real results for real clients — see how we&apos;ve helped landlords and investors achieve outstanding outcomes.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map(cs => (
            <div key={cs.id} className="group bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6 hover:border-[#2a7fd4] transition-all duration-300 flex flex-col">
              <div className="flex gap-2 mb-4 flex-wrap">
                <Badge variant="blue">{cs.industry}</Badge>
                <Badge variant="muted">{cs.serviceType}</Badge>
              </div>
              <h3 className="font-bold font-heading text-white mb-2">{cs.title}</h3>
              <p className="text-[#00ccff] text-xs font-medium mb-3 leading-relaxed">{cs.outcome}</p>
              <p className="text-[#7aaecc] text-sm leading-relaxed flex-1 mb-4 line-clamp-3">{cs.challenge}</p>
              <Link href={`/portfolio/${cs.slug}`} className="inline-flex items-center gap-1.5 text-[#4a90c4] text-sm font-medium group-hover:text-[#6ab4e8] transition-colors">
                View Case Study <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </section>
      <CTABanner />
    </div>
  )
}
