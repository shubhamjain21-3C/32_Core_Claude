import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Quote } from 'lucide-react'
import { caseStudies } from '@/data/caseStudies'
import { Badge } from '@/components/ui/Badge'
import { CTABanner } from '@/components/home/CTABanner'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return caseStudies.map(cs => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cs = caseStudies.find(c => c.slug === params.slug)
  if (!cs) return {}
  return { title: cs.title, description: cs.outcome }
}

export default function CaseStudyPage({ params }: Props) {
  const cs = caseStudies.find(c => c.slug === params.slug)
  if (!cs) notFound()

  return (
    <div className="bg-[#050d1a]">
      <section className="py-16 bg-gradient-to-b from-[#071224] to-[#050d1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/portfolio" className="inline-flex items-center gap-1.5 text-[#4a90c4] text-sm mb-8 hover:text-[#6ab4e8] transition-colors">
            <ArrowLeft size={14} /> Back to Portfolio
          </Link>
          <div className="flex gap-2 mb-4">
            <Badge variant="blue">{cs.industry}</Badge>
            <Badge variant="muted">{cs.serviceType}</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">{cs.title}</h1>
          <p className="text-[#00ccff] text-base font-medium">{cs.outcome}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
            <h2 className="text-lg font-bold font-heading text-white mb-3">The Challenge</h2>
            <p className="text-[#7aaecc] text-sm leading-relaxed">{cs.challenge}</p>
          </div>
          <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
            <h2 className="text-lg font-bold font-heading text-white mb-3">Our Approach</h2>
            <p className="text-[#7aaecc] text-sm leading-relaxed">{cs.approach}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-heading text-white mb-6">Results Achieved</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {cs.results.map(r => (
              <div key={r} className="flex items-start gap-3 bg-[#0d1f3c] border border-[#1e3a5f] rounded-lg p-4">
                <CheckCircle2 size={16} className="text-[#00ccff] flex-shrink-0 mt-0.5" />
                <span className="text-[#c8dff0] text-sm">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {cs.clientQuote && (
          <div className="bg-[#0d1f3c] border border-[#2a7fd4]/30 rounded-2xl p-8 relative">
            <Quote size={32} className="text-[#2a7fd4]/30 absolute top-5 left-5" />
            <p className="text-[#c8dff0] text-base leading-relaxed mb-4 mt-2 ml-4">&ldquo;{cs.clientQuote}&rdquo;</p>
            <p className="text-[#4a90c4] text-sm ml-4">— {cs.clientName}, {cs.clientCompany}</p>
          </div>
        )}
      </div>
      <CTABanner />
    </div>
  )
}
