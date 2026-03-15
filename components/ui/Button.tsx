'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium tracking-wide rounded transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary:   'bg-[#1a5fa8] border border-[#2a7fd4] text-white hover:bg-[#2a6db8] hover:border-[#00ccff] hover:shadow-lg hover:shadow-[#2a7fd4]/20',
      secondary: 'border border-[#2a7fd4] text-[#7aaecc] hover:border-[#00ccff] hover:text-white hover:bg-[#1a5fa8]/20',
      ghost:     'text-[#7aaecc] hover:text-white hover:bg-[#1e3a5f]/40',
    }
    const sizes = {
      sm: 'text-xs px-4 py-2',
      md: 'text-sm px-6 py-2.5',
      lg: 'text-sm px-8 py-3',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
