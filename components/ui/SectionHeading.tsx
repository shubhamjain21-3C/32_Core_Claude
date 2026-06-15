import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  label?: string
  title: string
  highlight?: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ label, title, highlight, subtitle, align = 'center', className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-12', align === 'center' ? 'text-center' : 'text-left', className)}>
      {label && (
        <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-3 font-body">{label}</p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold font-heading text-white leading-tight">
        {title}{' '}
        {highlight && <span className="text-[#D4860A]">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[#B89060] text-sm leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  )
}
