import type { Metadata } from 'next'
import { CreditCard, Clock, Bell, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payments | 3C Core Client Portal',
  description: 'Manage your payments and invoices.',
}

const upcomingFeatures = [
  'View and download invoices',
  'Pay management fees online',
  'Set up recurring direct debits',
  'Track payment history',
  'Receive payment reminders by email',
  'Export statements for your accountant',
]

export default function PaymentsPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#1a5fa8]/20 border border-[#2a7fd4]/20">
            <CreditCard size={22} className="text-[#2a7fd4]" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Payments &amp; Invoices</h1>
        </div>
        <p className="text-[#7aaecc] text-sm ml-14">Manage your fees, invoices, and payment history</p>
      </div>

      {/* Coming Soon Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2a7fd4]/30 bg-[#0d1f3c] p-8 md:p-12 text-center">

        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a7fd4]/10 via-transparent to-[#00ccff]/5 pointer-events-none" />

        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-[#2a7fd4]/20 animate-ping" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#0a1c35] border-2 border-[#2a7fd4]/50">
            <Clock size={36} className="text-[#2a7fd4]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold font-heading text-white mb-3">Coming Soon</h2>
        <p className="text-[#00ccff] font-semibold tracking-widest text-sm uppercase mb-4">Stay Tuned</p>
        <p className="text-[#7aaecc] text-sm leading-relaxed max-w-md mx-auto mb-8">
          We&apos;re building a seamless payment experience for you. Soon you&apos;ll be able to manage
          all your invoices, fees, and payment history directly from your portal.
        </p>

        {/* Divider */}
        <div className="border-t border-[#1e3a5f] my-8" />

        {/* Upcoming Features */}
        <div className="text-left">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={14} className="text-[#4a90c4]" />
            <p className="text-[#4a90c4] text-xs uppercase tracking-widest font-medium">What&apos;s coming</p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-[#7aaecc]">
                <CheckCircle size={14} className="text-[#2a7fd4] mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <div className="mt-8 pt-6 border-t border-[#1e3a5f]">
          <p className="text-[#4a90c4] text-xs">
            In the meantime, contact your property manager for any payment queries.
          </p>
        </div>
      </div>
    </div>
  )
}
