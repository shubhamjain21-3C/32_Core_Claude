'use client'
import { motion } from 'framer-motion'

const events = [
  { year: '2009', title: 'Founded', description: '3C Core established with a focus on residential lettings and property management in London.' },
  { year: '2012', title: 'HMO Expansion', description: 'Launched specialist HMO management and licensing service as demand for multi-let properties grew.' },
  { year: '2015', title: 'Investment Advisory', description: 'Added investment consultancy arm to help landlords build and optimise property portfolios.' },
  { year: '2018', title: 'Commercial Division', description: 'Expanded into commercial property management, serving retail and office landlords.' },
  { year: '2021', title: 'Digital Transformation', description: 'Launched owner portal and digital reporting platform for real-time portfolio visibility.' },
  { year: '2024', title: '250+ Properties', description: 'Reached 250+ managed properties and 180+ landlord clients across residential and commercial sectors.' },
]

export function CompanyTimeline() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold font-heading text-white mb-12 text-center">
        Our <span className="text-[#D4860A]">Journey</span>
      </h2>
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#D4860A] via-[#5C3D28] to-transparent" />
        {events.map((e, i) => (
          <motion.div
            key={e.year}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative pl-16 pb-10 last:pb-0"
          >
            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-[#3A2517] border-2 border-[#D4860A] flex items-center justify-center">
              <span className="text-[9px] font-bold text-[#F0A830] tracking-wide">{e.year}</span>
            </div>
            <div className="bg-[#3A2517] border border-[#5C3D28] rounded-xl p-5 hover:border-[#D4860A] transition-colors duration-300">
              <h3 className="font-semibold font-heading text-white mb-1.5">{e.title}</h3>
              <p className="text-[#B89060] text-sm leading-relaxed">{e.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
