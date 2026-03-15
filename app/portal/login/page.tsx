import type { Metadata } from 'next'
import Image from 'next/image'
import { LoginForm } from '@/components/portal/LoginForm'

export const metadata: Metadata = {
  title: 'Client Portal Login',
  description: 'Secure client portal access for 3C Core property management clients.',
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050d1a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl p-8 shadow-2xl shadow-[#050d1a]/50">
          <div className="text-center mb-8">
            <Image
              src="/logo/3CCore_Logo_Compact_Header.svg"
              alt="3C Core"
              width={240}
              height={40}
              className="h-10 w-auto mx-auto mb-6"
            />
            <h1 className="text-xl font-bold font-heading text-white mb-1">Client Portal</h1>
            <p className="text-[#7aaecc] text-sm">Sign in to access your property dashboard</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
