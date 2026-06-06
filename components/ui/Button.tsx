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
    const base = 'inline-flex items-center justify-center font-medium tracking-wide rounded transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4860A] disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary:   'bg-[#D4860A] border border-[#D4860A] text-white hover:bg-[#F0A830] hover:border-[#F0A830] hover:shadow-lg hover:shadow-[#D4860A]/20',
      secondary: 'border border-[rgba(212,134,10,0.4)] text-[#8B3A2A] hover:border-[#D4860A] hover:text-[#2C1F14] hover:bg-[rgba(212,134,10,0.08)]',
      ghost:     'text-[#8B3A2A] hover:text-[#2C1F14] hover:bg-[rgba(212,134,10,0.08)]',
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
