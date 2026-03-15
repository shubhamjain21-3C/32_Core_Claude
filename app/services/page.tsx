import type { Metadata } from 'next'
import { ServiceCard } from '@/components/services/ServiceCard'
import { CTABanner } from '@/components/home/CTABanner'
import { CircuitDecor } from '@/components/ui/CircuitDecor'
import { services } from '@/data/services'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Full-spectrum property management services — from tenant placement to investment advisory.',
}

export default function ServicesPage() {
  return (
    <div className="bg-[#050d1a]">
      <section className="relative py-20 bg-gradient-to-b from-[#071224] to-[#050d1a] overflow-hidden">
        <CircuitDecor position="tr" />
        <CircuitDecor position="bl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-3">What We Do</p>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Our <span className="text-[#2a9fd4]">Services</span>
          </h1>
          <p className="text-[#7aaecc] text-sm leading-relaxed max-w-2xl mx-auto">
            From first-time landlords to seasoned investors — we provide the expertise, systems, and dedication to maximise your property&apos;s potential.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
      <CTABanner />
    </div>
  )
}
