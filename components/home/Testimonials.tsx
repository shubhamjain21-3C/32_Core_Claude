'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { testimonials } from '@/data/testimonials'

export function Testimonials() {
  const [idx, setIdx] = useState(0)
  const prev = () => setIdx(i => (i - 1 + testimonials.length) % testimonials.length)
  const next = () => setIdx(i => (i + 1) % testimonials.length)
  const t = testimonials[idx]

  return (
    <section className="section-padding bg-[#050d1a]">
      <div className="container-max">
        <SectionHeading label="Client Stories" title="What Our" highlight="Clients Say" />
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl p-8 md:p-10 relative"
            >
              <Quote size={36} className="text-[#2a7fd4]/30 absolute top-6 left-6" />
              <p className="text-[#c8dff0] text-base md:text-lg leading-relaxed mb-6 mt-4 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 border-t border-[#1e3a5f] pt-6">
                <div className="w-11 h-11 rounded-full bg-[#1a5fa8]/40 border border-[#2a7fd4]/40 flex items-center justify-center text-[#6ab4e8] font-bold font-heading text-sm">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.author}</p>
                  <p className="text-[#4a90c4] text-xs">{t.role} — {t.company}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={prev} className="w-10 h-10 border border-[#1e3a5f] rounded-full flex items-center justify-center text-[#7aaecc] hover:border-[#2a7fd4] hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-[#2a7fd4]' : 'bg-[#1e3a5f]'}`} />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 border border-[#1e3a5f] rounded-full flex items-center justify-center text-[#7aaecc] hover:border-[#2a7fd4] hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
