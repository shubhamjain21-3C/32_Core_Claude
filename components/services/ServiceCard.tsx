import Link from 'next/link'
import { Building2, LineChart, TrendingUp, Wrench, Users, ShieldCheck, ArrowRight } from 'lucide-react'
import type { Service } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  Building2, LineChart, TrendingUp, Wrench, Users, ShieldCheck,
}

export function ServiceCard({ service }: { service: Service }) {
  const Icon = iconMap[service.icon] || Building2
  return (
    <div className="group bg-[#3A2517] border border-[#5C3D28] rounded-xl p-6 hover:border-[#D4860A] transition-all duration-300 hover:shadow-lg hover:shadow-[#D4860A]/10 flex flex-col">
      <div className="w-12 h-12 rounded-lg bg-[#D4860A]/20 border border-[#D4860A]/30 flex items-center justify-center mb-4 group-hover:bg-[#D4860A]/40 transition-colors">
        <Icon size={22} className="text-[#F0A830]" />
      </div>
      <h3 className="font-bold font-heading text-white mb-2">{service.title}</h3>
      <p className="text-[#B89060] text-sm leading-relaxed flex-1 mb-4">{service.shortDescription}</p>
      <Link href={`/services/${service.slug}`} className="inline-flex items-center gap-1.5 text-[#D4860A] text-sm font-medium group-hover:text-[#F0A830] transition-colors">
        Learn more <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}
