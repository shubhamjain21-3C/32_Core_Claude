import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function ServicePageHeader() {
  return (
    <header
      className="sticky top-0 z-40 h-16 flex items-center px-4 sm:px-8"
      style={{
        background: 'rgba(44,31,20,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(212,134,10,0.3)',
      }}
    >
      {/* Back to Home */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-[#F0A830] hover:text-white transition-colors text-sm font-medium mr-auto"
      >
        <ArrowLeft size={15} />
        Back to Home
      </Link>

      {/* Brand — centre */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center hidden sm:block">
        <p className="font-heading font-bold text-white text-base leading-none">3C Core</p>
        <p className="text-[#F0A830] text-[10px] tracking-[0.15em] uppercase mt-0.5">
          Connected | Consistent | Confident
        </p>
      </div>

      {/* Portal Login */}
      <Link
        href="/portal"
        className="ml-auto text-sm px-3 py-1.5 border border-[#F0A830] text-[#F0A830] rounded hover:bg-[rgba(212,134,10,0.2)] transition-colors"
      >
        Login
      </Link>
    </header>
  )
}
