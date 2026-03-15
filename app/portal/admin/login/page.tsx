import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { LoginForm } from '@/components/portal/LoginForm'

export const metadata: Metadata = { title: 'Admin Login | 3C Core', description: 'Staff-only admin portal access.' }

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-[#0d1f3c] border border-[#1a5090] rounded-2xl p-8 shadow-2xl shadow-[#050d1a]/50">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/logo/3CCore_Logo_Compact_Header.svg" alt="3C Core" width={240} height={40} className="h-10 w-auto mx-auto mb-6" />
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield size={16} className="text-[#4a90c4]" />
              <h1 className="text-xl font-bold font-heading text-white">Admin Portal</h1>
            </div>
            <p className="text-[#7aaecc] text-sm">3C Core staff access only</p>
          </div>

          <LoginForm provider="admin-login" />

          <div className="mt-6 text-center">
            <Link href="/portal/login" className="text-[#4a90c4] text-xs hover:text-[#7aaecc] transition-colors">
              ← Client portal login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
