import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export function Card({ className, children, hover = true }: CardProps) {
  return (
    <div className={cn(
      'bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6',
      hover && 'hover:border-[#2a7fd4] transition-colors duration-300',
      className
    )}>
      {children}
    </div>
  )
}
