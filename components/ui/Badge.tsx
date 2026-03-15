import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'blue' | 'cyan' | 'muted'
}

export function Badge({ children, className, variant = 'blue' }: BadgeProps) {
  const variants = {
    blue:  'bg-[#1a5fa8]/30 text-[#6ab4e8] border border-[#2a7fd4]/40',
    cyan:  'bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/30',
    muted: 'bg-[#1e3a5f]/50 text-[#7aaecc] border border-[#1e3a5f]',
  }
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
