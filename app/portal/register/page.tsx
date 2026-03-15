import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { RegisterForm } from '@/components/portal/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account | 3C Core Portal',
  description: 'Register for a 3C Core client portal account.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl p-8 shadow-2xl shadow-[#050d1a]/50">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/logo/3CCore_Logo_Compact_Header.svg" alt="3C Core" width={240} height={40} className="h-10 w-auto mx-auto mb-6" />
            </Link>
            <h1 className="text-xl font-bold font-heading text-white mb-1">Create Your Account</h1>
            <p className="text-[#7aaecc] text-sm">Register to manage your properties with 3C Core</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-[#7aaecc] text-sm">
            Already have an account?{' '}
            <Link href="/portal/login" className="text-[#6ab4e8] hover:text-[#00ccff] transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
