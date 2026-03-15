import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from '@/components/portal/LoginForm'

export const metadata: Metadata = {
  title: 'Client Portal Login | 3C Core',
  description: 'Sign in to your 3C Core client portal.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl p-8 shadow-2xl shadow-[#050d1a]/50">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/logo/3CCore_Logo_Compact_Header.svg" alt="3C Core" width={240} height={40} className="h-10 w-auto mx-auto mb-6" />
            </Link>
            <h1 className="text-xl font-bold font-heading text-white mb-1">Client Portal</h1>
            <p className="text-[#7aaecc] text-sm">Sign in to access your property dashboard</p>
          </div>

          <LoginForm provider="customer-login" />

          <div className="mt-6 text-center space-y-3">
            <p className="text-[#7aaecc] text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/portal/register" className="text-[#6ab4e8] hover:text-[#00ccff] transition-colors font-medium">
                Create one free
              </Link>
            </p>
            <div className="border-t border-[#1e3a5f] pt-4">
              <Link href="/portal/admin/login" className="text-[#4a90c4] text-xs hover:text-[#7aaecc] transition-colors">
                3C Core staff? Admin login →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
