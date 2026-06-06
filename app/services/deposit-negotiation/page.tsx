'use client'
import { Bot } from 'lucide-react'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ServiceTabNav } from '@/components/ui/ServiceTabNav'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import { BookingForm } from '@/components/forms/BookingForm'


export default function DepositNegotiationPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 50%,#F5C060 100%)' }}>
      <ServicePageHeader />
      <div className="relative px-6 py-10 text-center overflow-hidden" style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'rgba(212,134,10,0.15)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}>
            <Bot size={12} />AI-Assisted Service
          </div>
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">Deposit Negotiation Services</h1>
          <p className="mt-2 text-[#8B3A2A] text-base sm:text-lg">Fair, transparent deposit resolution — without the stress</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <ServiceTabNav>
          {(tab) => (
            <>
              {tab === 'description' && (
                <div className="space-y-8">
                  <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(212,134,10,0.08)', border: '1px solid rgba(212,134,10,0.25)' }}>
                    <Bot size={20} className="text-[#D4860A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#2C1F14] text-sm">AI-Powered Evidence Review — Powered by Claude</p>
                      <p className="text-xs text-[#8B3A2A] mt-0.5">Our AI cross-references check-in and check-out inventory reports, photos, and receipts to produce an objective deduction schedule — reducing disputes and accelerating settlements.</p>
                    </div>
                  </div>
                  <Section title="What Is Deposit Negotiation?">
                    <p>A structured process to agree fair deposit deductions at end of tenancy, working alongside the inventory and check-out report. 3C Core acts as a neutral facilitator between landlord and tenant — separate from formal deposit dispute schemes (TDS, DPS, MyDeposits) but can be used before escalating to those schemes.</p>
                  </Section>
                  <Section title="Why Use This Service?">
                    <ul className="space-y-2 text-sm text-[#2C1F14]">
                      <li>• Faster than formal dispute schemes (which can take months)</li>
                      <li>• Less confrontational — preserves the landlord-tenant relationship</li>
                      <li>• Evidence-based: uses inventory, photos, and receipts</li>
                      <li>• Cost-effective for both parties</li>
                    </ul>
                  </Section>
                  <Section title="How It Works">
                    <ol className="space-y-2 text-sm text-[#2C1F14]">
                      {DEPOSIT_STEPS.map((s, i) => (
                        <li key={i}><span className="font-semibold text-[#D4860A]">Step {i + 1}:</span> {s}</li>
                      ))}
                    </ol>
                  </Section>
                  <Section title="Deposit Protection Schemes">
                    <p className="mb-3">All deposits must be protected in a government-approved scheme within 30 days of tenancy start:</p>
                    <ul className="space-y-1.5 text-sm text-[#2C1F14]">
                      <li>• Tenancy Deposit Scheme (TDS)</li>
                      <li>• Deposit Protection Service (DPS)</li>
                      <li>• MyDeposits</li>
                    </ul>
                    <p className="mt-3 text-sm text-[#8B3A2A] font-medium">If your deposit is not protected, contact us immediately.</p>
                  </Section>
                  <div className="rounded-xl p-5" style={{ background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.3)' }}>
                    <h3 className="font-semibold text-[#8B3A2A] mb-2">Legal Notice</h3>
                    <p className="text-sm text-[#2C1F14]">Under the Housing Act 2004, landlords must protect deposits in a government-approved scheme. Failure to do so may result in the landlord being ordered to pay 1–3 times the deposit amount to the tenant.</p>
                  </div>
                </div>
              )}
              {tab === 'faqs' && (
                <div className="space-y-4">
                  {DEPOSIT_FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
                </div>
              )}
              {tab === 'prices' && (
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-[#D4860A] text-xl">Pricing</h2>
                  <p className="text-sm text-[#2C1F14]">Available as a one-off service or as part of a landlord subscription plan.</p>
                  <p className="text-sm">Contact us: <a href="mailto:contactus@3ccore.com" className="text-[#D4860A] underline">contactus@3ccore.com</a> · <a href="tel:07852254792" className="text-[#D4860A] underline">07852254792</a></p>
                </div>
              )}
              {tab === 'book' && (
                <BookingForm serviceType="Deposit Negotiation" />
              )}
            </>
          )}
        </ServiceTabNav>
      </div>
      <ComingSoonWidget />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading font-semibold text-[#D4860A] text-xl mb-3">{title}</h2>
      <div className="text-[#2C1F14] leading-relaxed">{children}</div>
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,134,10,0.2)' }}>
      <p className="font-semibold text-[#2C1F14] text-sm mb-1">Q: {q}</p>
      <p className="text-[#2C1F14] text-sm leading-relaxed">A: {a}</p>
    </div>
  )
}

const DEPOSIT_STEPS = [
  'Both parties register their positions via the portal',
  '3C Core reviews all evidence (inventory, photos, receipts)',
  'A fair deduction schedule is proposed',
  'Parties negotiate with 3C Core facilitating',
  'Agreed deductions documented and signed by both parties',
  'Deposit returned/deducted accordingly',
]

const DEPOSIT_FAQS = [
  { q: 'How is this different from a formal dispute scheme?', a: 'Formal schemes can take months and involve adjudication. Our negotiation service is faster, less confrontational, and keeps both parties in control of the outcome.' },
  { q: 'Can I still use TDS/DPS/MyDeposits after this?', a: 'Yes. Our service is independent of government schemes. If negotiation fails, you remain free to escalate to the formal scheme.' },
  { q: 'What evidence do I need?', a: 'The check-in and check-out inventory reports, photos, receipts for repairs, and any written communications between parties.' },
  { q: 'Is the outcome legally binding?', a: 'Only if both parties sign the agreed deduction schedule. We recommend both parties receive independent advice before signing.' },
  { q: 'What if my deposit was never protected?', a: 'Contact us immediately. Under the Housing Act 2004, landlords who fail to protect deposits can be ordered to pay 1–3x the deposit amount to the tenant.' },
]
