'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#2C1F14] via-[#2C1F14] to-[#2C1F14] border-y border-[#5C3D28] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, #D4860A 0%, transparent 50%), radial-gradient(circle at 70% 50%, #8B3A2A 0%, transparent 50%)',
      }} />
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-4">Ready to Connect?</p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
            Let&apos;s Maximise Your{' '}
            <span className="text-[#D4860A]">Property Investment</span>
          </h2>
          <p className="text-[#B89060] text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Whether you&apos;re a first-time landlord or a seasoned investor, our team is ready to help you achieve outstanding results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Get In Touch <ArrowRight size={14} />
            </Link>
            <Link href="/services" className="btn-secondary inline-block">
              Explore Services
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
