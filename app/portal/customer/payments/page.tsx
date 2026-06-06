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
        <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Client Portal</p>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">Payments &amp; Invoices</h1>
        </div>
        <p className="text-[#8B3A2A] text-sm">Manage your fees, invoices, and payment history</p>
      </div>

      {/* Coming Soon Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center"
        style={{ background: 'white', border: '1px solid rgba(212,134,10,0.25)', boxShadow: '0 2px 8px rgba(44,31,20,0.08)' }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,134,10,0.06) 0%, transparent 70%)' }}
        />

        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(212,134,10,0.15)' }}
          />
          <div
            className="relative flex items-center justify-center w-20 h-20 rounded-full"
            style={{ background: '#FFF8EE', border: '2px solid rgba(212,134,10,0.4)' }}
          >
            <Clock size={36} style={{ color: '#D4860A' }} />
          </div>
        </div>

        <h2 className="text-3xl font-bold font-heading text-[#2C1F14] mb-3">Coming Soon</h2>
        <p className="text-[#D4860A] font-semibold tracking-widest text-sm uppercase mb-4">Stay Tuned</p>
        <p className="text-[#8B3A2A] text-sm leading-relaxed max-w-md mx-auto mb-8">
          We&apos;re building a seamless payment experience for you. Soon you&apos;ll be able to manage
          all your invoices, fees, and payment history directly from your portal.
        </p>

        {/* Divider */}
        <div className="my-8" style={{ borderTop: '1px solid rgba(212,134,10,0.15)' }} />

        {/* Upcoming Features */}
        <div className="text-left">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={14} style={{ color: '#D4860A' }} />
            <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: '#D4860A' }}>What&apos;s coming</p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingFeatures.map(feature => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-[#3D2B1F]">
                <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: '#D4860A' }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(212,134,10,0.15)' }}>
          <p className="text-[#8B3A2A] text-xs">
            In the meantime, contact your property manager for any payment queries.
          </p>
        </div>
      </div>
    </div>
  )
}
