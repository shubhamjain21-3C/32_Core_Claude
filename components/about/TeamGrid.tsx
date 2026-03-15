'use client'
import { motion } from 'framer-motion'
import { Linkedin } from 'lucide-react'
import { team } from '@/data/team'

export function TeamGrid() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold font-heading text-white mb-10 text-center">
        Meet the <span className="text-[#2a9fd4]">Team</span>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6 text-center hover:border-[#2a7fd4] transition-colors duration-300 group"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1a5fa8] to-[#0d2248] border-2 border-[#2a7fd4]/50 flex items-center justify-center text-2xl font-bold font-heading text-[#6ab4e8]">
              {member.name.charAt(0)}
            </div>
            <h3 className="font-semibold font-heading text-white mb-0.5">{member.name}</h3>
            <p className="text-[#4a90c4] text-xs tracking-wide mb-3">{member.title}</p>
            <p className="text-[#7aaecc] text-xs leading-relaxed mb-4">{member.bio}</p>
            {member.linkedIn && (
              <a href={member.linkedIn} className="inline-flex items-center gap-1.5 text-[#7aaecc] text-xs hover:text-[#6ab4e8] transition-colors">
                <Linkedin size={13} /> LinkedIn
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
