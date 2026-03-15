import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { services } from '@/data/services'
import { CTABanner } from '@/components/home/CTABanner'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return services.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = services.find(s => s.slug === params.slug)
  if (!service) return {}
  return { title: service.title, description: service.shortDescription }
}

export default function ServiceDetailPage({ params }: Props) {
  const service = services.find(s => s.slug === params.slug)
  if (!service) notFound()

  return (
    <div className="bg-[#050d1a]">
      <section className="py-16 bg-gradient-to-b from-[#071224] to-[#050d1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-[#4a90c4] text-sm mb-8 hover:text-[#6ab4e8] transition-colors">
            <ArrowLeft size={14} /> Back to Services
          </Link>
          <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-3">Our Services</p>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            {service.title}
          </h1>
          <p className="text-[#7aaecc] text-base leading-relaxed">{service.fullDescription}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Benefits */}
        <div>
          <h2 className="text-2xl font-bold font-heading text-white mb-6">Key Benefits</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {service.benefits.map(b => (
              <div key={b} className="flex items-start gap-3 bg-[#0d1f3c] border border-[#1e3a5f] rounded-lg p-4">
                <CheckCircle2 size={16} className="text-[#00ccff] flex-shrink-0 mt-0.5" />
                <span className="text-[#c8dff0] text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div>
          <h2 className="text-2xl font-bold font-heading text-white mb-6">Our Process</h2>
          <div className="space-y-4">
            {service.process.map(step => (
              <div key={step.step} className="flex gap-5 bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-5 hover:border-[#2a7fd4] transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a5fa8]/30 border border-[#2a7fd4]/50 flex items-center justify-center text-[#6ab4e8] font-bold font-heading text-sm">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-[#7aaecc] text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            Enquire About This Service <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <CTABanner />
    </div>
  )
}
