import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'amber' | 'green' | 'muted' | 'blue' | 'cyan'
}

export function Badge({ children, className, variant = 'amber' }: BadgeProps) {
  const variants = {
    amber: 'bg-[rgba(212,134,10,0.12)] text-[#D4860A] border border-[rgba(212,134,10,0.35)]',
    green: 'bg-green-50 text-green-700 border border-green-200',
    muted: 'bg-[rgba(44,31,20,0.07)] text-[#8B3A2A] border border-[rgba(44,31,20,0.15)]',
    // legacy aliases kept for backward-compat
    blue:  'bg-[rgba(212,134,10,0.12)] text-[#D4860A] border border-[rgba(212,134,10,0.35)]',
    cyan:  'bg-green-50 text-green-700 border border-green-200',
  }
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
