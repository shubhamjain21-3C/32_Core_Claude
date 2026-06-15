'use client'
import { motion } from 'framer-motion'
import { Linkedin } from 'lucide-react'
import { team } from '@/data/team'

export function TeamGrid() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold font-heading text-white mb-10 text-center">
        Meet the <span className="text-[#D4860A]">Team</span>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-[#3A2517] border border-[#5C3D28] rounded-xl p-6 text-center hover:border-[#D4860A] transition-colors duration-300 group"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#D4860A] to-[#2C1F14] border-2 border-[#D4860A]/50 flex items-center justify-center text-2xl font-bold font-heading text-[#F0A830]">
              {member.name.charAt(0)}
            </div>
            <h3 className="font-semibold font-heading text-white mb-0.5">{member.name}</h3>
            <p className="text-[#D4860A] text-xs tracking-wide mb-3">{member.title}</p>
            <p className="text-[#B89060] text-xs leading-relaxed mb-4">{member.bio}</p>
            {member.linkedIn && (
              <a href={member.linkedIn} className="inline-flex items-center gap-1.5 text-[#B89060] text-xs hover:text-[#F0A830] transition-colors">
                <Linkedin size={13} /> LinkedIn
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
