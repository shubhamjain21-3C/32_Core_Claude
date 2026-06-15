import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export function Card({ className, children, hover = true }: CardProps) {
  return (
    <div className={cn(
      'bg-[#3A2517] border border-[#5C3D28] rounded-xl p-6',
      hover && 'hover:border-[#D4860A] transition-colors duration-300',
      className
    )}>
      {children}
    </div>
  )
}
