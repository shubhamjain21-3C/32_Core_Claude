'use client'
import { motion } from 'framer-motion'
import { Target, Eye, Star } from 'lucide-react'

const cards = [
  {
    Icon: Target,
    title: 'Our Mission',
    body: 'To deliver outstanding property management and consultancy services that give landlords and investors complete confidence in their portfolio — through transparency, expertise, and relentless attention to detail.',
  },
  {
    Icon: Eye,
    title: 'Our Vision',
    body: 'To be the most trusted property management firm in the UK — recognised for transforming how landlords experience property ownership: stress-free, profitable, and professionally managed.',
  },
  {
    Icon: Star,
    title: 'Core Values',
    body: 'Connected — we build lasting relationships. Consistent — we deliver on every promise. Confident — we act with expertise and integrity in everything we do.',
  },
]

export function MissionVision() {
  return (
    <section className="py-16">
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map(({ Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-[#0d1f3c] border-l-2 border-[#2a7fd4] border border-[#1e3a5f] border-l-[#2a7fd4] rounded-r-xl rounded-l-sm p-6"
          >
            <div className="w-11 h-11 rounded-lg bg-[#1a5fa8]/20 border border-[#2a7fd4]/30 flex items-center justify-center mb-4">
              <Icon size={20} className="text-[#6ab4e8]" />
            </div>
            <h3 className="font-bold font-heading text-white text-lg mb-3">{title}</h3>
            <p className="text-[#7aaecc] text-sm leading-relaxed">{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
