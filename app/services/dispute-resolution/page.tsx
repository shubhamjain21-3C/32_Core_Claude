'use client'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ServiceTabNav } from '@/components/ui/ServiceTabNav'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import { BookingForm } from '@/components/forms/BookingForm'


export default function DisputeResolutionPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 50%,#F5C060 100%)' }}>
      <ServicePageHeader />
      <div className="relative px-6 py-10 text-center overflow-hidden" style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">Dispute Resolution Services</h1>
          <p className="mt-2 text-[#8B3A2A] text-base sm:text-lg">Independent, professional mediation — reaching fair outcomes</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <ServiceTabNav>
          {(tab) => (
            <>
              {tab === 'description' && (
                <div className="space-y-8">
                  <Section title="About This Service">
                    <p>3C Core&apos;s dispute resolution service is provided by independent mediators partnered with our team. This is a facilitative process aimed at reaching voluntary agreement between parties. It does not constitute legal advice or legal representation. Outcomes are only binding where both parties agree in writing.</p>
                  </Section>
                  <Section title="Types of Dispute We Handle">
                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                      {DISPUTE_TYPES.map(d => (
                        <div key={d.title} className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(212,134,10,0.2)' }}>
                          <h3 className="font-semibold text-[#2C1F14] text-sm mb-1">{d.title}</h3>
                          <p className="text-xs text-[#8B3A2A]">{d.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                  <Section title="How The Process Works">
                    <ol className="space-y-2 text-sm text-[#2C1F14]">
                      {DISPUTE_STEPS.map((s, i) => (
                        <li key={i}><span className="font-semibold text-[#D4860A]">Step {i + 1}:</span> {s}</li>
                      ))}
                    </ol>
                  </Section>
                  <div className="rounded-xl p-5" style={{ background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.3)' }}>
                    <h3 className="font-semibold text-[#8B3A2A] mb-2">Legal Disclaimer</h3>
                    <p className="text-sm text-[#2C1F14]">This service is a facilitative mediation process. It does not constitute legal advice, legal representation, or a legally binding adjudication unless expressly agreed in writing by both parties. For legal matters, always consult a qualified solicitor.</p>
                  </div>
                </div>
              )}
              {tab === 'faqs' && (
                <div className="space-y-4">
                  {DISPUTE_FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
                </div>
              )}
              {tab === 'prices' && (
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-[#D4860A] text-xl">Pricing</h2>
                  <p className="text-sm text-[#2C1F14]">Available as a one-off cost (paid by both parties) or as part of a subscription plan for landlords/tenants.</p>
                  <p className="text-sm text-[#2C1F14]">Contact us for exact costs: <a href="mailto:c3propertiesuk@gmail.com" className="text-[#D4860A] underline">c3propertiesuk@gmail.com</a> · <a href="tel:07852254792" className="text-[#D4860A] underline">07852254792</a></p>
                  <p className="text-xs text-[#8B3A2A]">Subscription holders receive discounted rates.</p>
                </div>
              )}
              {tab === 'book' && (
                <BookingForm serviceType="Dispute Resolution" />
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

const DISPUTE_TYPES = [
  { title: 'Check-Out Disputes', desc: 'Disagreements about property condition at end of tenancy and damage vs fair wear and tear.' },
  { title: 'Deposit Disputes', desc: 'Disputes over deposit deductions, working alongside TDS, DPS, MyDeposits schemes.' },
  { title: 'Maintenance Disputes', desc: 'Landlord vs tenant disagreement over repair responsibility, timelines, and standards.' },
  { title: 'Neighbour Disputes', desc: 'Noise, boundaries, shared spaces — mediated resolution before legal escalation.' },
  { title: 'Landlord–Tenant Disputes', desc: 'Rent arrears, tenancy breaches, and eviction-related concerns.' },
  { title: 'Property Owner Disputes', desc: 'Disputes between co-owners, freeholders, and leaseholders.' },
  { title: 'Buyer–Seller Disputes', desc: 'Pre-completion or post-completion disagreements on property transactions.' },
]

const DISPUTE_STEPS = [
  'Both parties submit their case details via the portal',
  '3C Core assigns an independent mediator',
  'Mediation sessions arranged (virtual or in-person)',
  'Mediator facilitates discussion and helps parties reach agreement',
  'If agreed, outcome is documented and signed by both parties',
  'Record kept for 6 years in line with our data retention policy',
]

const DISPUTE_FAQS = [
  { q: 'Is mediation legally binding?', a: 'Only if both parties sign a written agreement at the end. Otherwise it is voluntary and non-binding.' },
  { q: 'Do I need a solicitor?', a: 'No. Mediation is designed to be accessible without legal representation. However, you are free to seek legal advice independently.' },
  { q: 'How long does the process take?', a: 'Typically 2–6 weeks depending on the complexity of the dispute.' },
  { q: 'What evidence should I bring?', a: 'Inventory reports, photos, emails, tenancy agreements, receipts — anything relevant to the dispute.' },
  { q: 'What if we cannot reach agreement?', a: 'You remain free to pursue formal legal routes (First-tier Tribunal, County Court). Our mediation does not affect those rights.' },
  { q: 'Who pays?', a: 'Costs are shared between both parties unless agreed otherwise. Subscription holders receive discounted rates.' },
]
