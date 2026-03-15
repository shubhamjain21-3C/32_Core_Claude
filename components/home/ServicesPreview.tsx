'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, LineChart, TrendingUp, Wrench, Users, ShieldCheck, ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { services } from '@/data/services'

const iconMap: Record<string, React.ElementType> = {
  Building2, LineChart, TrendingUp, Wrench, Users, ShieldCheck,
}

export function ServicesPreview() {
  return (
    <section className="section-padding bg-[#050d1a]">
      <div className="container-max">
        <SectionHeading
          label="What We Do"
          title="Comprehensive Property"
          highlight="Management Services"
          subtitle="From tenant placement to investment strategy — we provide end-to-end solutions that protect your asset and maximise your returns."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] || Building2
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6 hover:border-[#2a7fd4] transition-all duration-300 hover:shadow-lg hover:shadow-[#2a7fd4]/10"
              >
                <div className="w-12 h-12 rounded-lg bg-[#1a5fa8]/20 border border-[#2a7fd4]/30 flex items-center justify-center mb-4 group-hover:bg-[#1a5fa8]/40 transition-colors duration-300">
                  <Icon size={22} className="text-[#6ab4e8]" />
                </div>
                <h3 className="font-semibold font-heading text-white mb-2">{service.title}</h3>
                <p className="text-[#7aaecc] text-sm leading-relaxed mb-4">{service.shortDescription}</p>
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-[#4a90c4] text-sm font-medium group-hover:text-[#6ab4e8] transition-colors duration-200"
                >
                  Learn more <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/services" className="btn-secondary inline-block">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
