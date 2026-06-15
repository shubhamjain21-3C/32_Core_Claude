'use client'
import { motion } from 'framer-motion'
import { ShieldCheck, Clock, BarChart3, HeartHandshake, Award, MapPin } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'

const reasons = [
  {
    Icon: ShieldCheck,
    title: 'Fully Compliant',
    body: 'We keep your portfolio compliant with all landlord legislation — licences, safety certificates, deposit protection, and more.',
  },
  {
    Icon: Clock,
    title: '24/7 Response',
    body: 'Emergency maintenance covered around the clock. Your tenants and properties are never left without support.',
  },
  {
    Icon: BarChart3,
    title: 'Transparent Reporting',
    body: 'Monthly financial statements, maintenance logs, and portfolio dashboards — complete visibility, zero surprises.',
  },
  {
    Icon: HeartHandshake,
    title: 'Tenant-First Approach',
    body: 'Happy tenants stay longer and pay on time. Our tenant relations programme drives retention and reduces voids.',
  },
  {
    Icon: Award,
    title: '15+ Years Experience',
    body: 'Deep market expertise across residential, HMO, and commercial property — locally focused, nationally informed.',
  },
  {
    Icon: MapPin,
    title: 'Local Market Knowledge',
    body: 'Data-driven rental valuations and investment advice grounded in granular local market intelligence.',
  },
]

export function WhyUs() {
  return (
    <section className="section-padding bg-[#2C1F14]">
      <div className="container-max">
        <SectionHeading
          label="Why 3C Core"
          title="The Difference Is"
          highlight="In The Detail"
          subtitle="We don't just manage properties — we protect investments, nurture relationships, and deliver measurable results."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-4 p-6 bg-[#3A2517] border-l-2 border-[#D4860A] rounded-r-xl rounded-l-sm border border-[#5C3D28] border-l-[#D4860A]"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#D4860A]/20 flex items-center justify-center">
                <Icon size={18} className="text-[#F0A830]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1.5 font-heading">{title}</h3>
                <p className="text-[#B89060] text-sm leading-relaxed">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
