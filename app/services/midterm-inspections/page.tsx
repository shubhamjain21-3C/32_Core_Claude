'use client'
import { Bot } from 'lucide-react'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ServiceTabNav } from '@/components/ui/ServiceTabNav'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import { BookingForm } from '@/components/forms/BookingForm'


export default function MidtermInspectionsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 50%,#F5C060 100%)' }}>
      <ServicePageHeader />
      <div className="relative px-6 py-10 text-center overflow-hidden" style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'rgba(212,134,10,0.15)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}>
            <Bot size={12} />AI-Assisted Service
          </div>
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">Midterm Property Inspections</h1>
          <p className="mt-2 text-[#8B3A2A] text-base sm:text-lg">Regular inspections — protecting your investment between tenancies</p>
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
                      <p className="font-semibold text-[#2C1F14] text-sm">AI-Assisted Inspection Reports — Powered by Claude</p>
                      <p className="text-xs text-[#8B3A2A] mt-0.5">Our AI analyses inspection photos, identifies maintenance issues, and auto-generates structured midterm reports — flagging urgent items for immediate landlord attention.</p>
                    </div>
                  </div>
                  <Section title="What Are Midterm Inspections?">
                    <p>Conducted during an active tenancy (typically every 3–6 months), midterm inspections check that the property is being maintained to a satisfactory standard, identify maintenance issues early before they become costly, and confirm the tenant is complying with tenancy agreement conditions.</p>
                  </Section>
                  <Section title="Why They Matter">
                    <p>Landlords have a duty to maintain the property under the Landlord and Tenant Act 1985. Evidence of regular inspections protects landlords in disputes and ensures early identification of issues before they escalate into costly Section 11 repair liabilities.</p>
                  </Section>
                  <Section title="Our Process">
                    <ol className="space-y-2 text-sm text-[#2C1F14]">
                      <li><span className="font-semibold text-[#D4860A]">Step 1:</span> Inspection booked and tenant given 24–48 hours notice (legal requirement)</li>
                      <li><span className="font-semibold text-[#D4860A]">Step 2:</span> Agent visits and documents condition with photos and notes</li>
                      <li><span className="font-semibold text-[#D4860A]">Step 3:</span> Report produced (AI-assisted or by professional agent)</li>
                      <li><span className="font-semibold text-[#D4860A]">Step 4:</span> Report shared with landlord; tenant notified</li>
                      <li><span className="font-semibold text-[#D4860A]">Step 5:</span> Any issues flagged are tracked in the portal</li>
                    </ol>
                  </Section>
                  <Section title="Tenant Rights">
                    <ul className="space-y-1.5 text-sm text-[#2C1F14]">
                      <li>• Tenants must be given reasonable notice before any inspection</li>
                      <li>• Tenants may add comments to the report (subject to landlord approval)</li>
                      <li>• All parties receive a copy of the final signed report</li>
                    </ul>
                  </Section>
                </div>
              )}
              {tab === 'faqs' && (
                <div className="space-y-4">
                  {MIDTERM_FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
                </div>
              )}
              {tab === 'prices' && (
                <PricesPlaceholder service="Midterm Property Inspections" />
              )}
              {tab === 'book' && (
                <BookingForm serviceType="Midterm Property Inspection" />
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

function PricesPlaceholder({ service }: { service: string }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading font-semibold text-[#D4860A] text-xl">Pricing — {service}</h2>
      <p className="text-sm text-[#2C1F14]">Pricing is tailored to the size and type of property. Contact us for a personalised quote.</p>
      <p className="text-sm"><a href="mailto:contactus@3ccore.com" className="text-[#D4860A] underline">contactus@3ccore.com</a> · <a href="tel:07852254792" className="text-[#D4860A] underline">07852254792</a></p>
      <p className="text-xs text-[#8B3A2A] mt-2">Subscription plans for landlords with multiple properties — coming soon.</p>
    </div>
  )
}

const MIDTERM_FAQS = [
  { q: 'How much notice must a landlord give before an inspection?', a: 'In the UK, landlords must give at least 24 hours written notice before entering the property.' },
  { q: 'How often should midterm inspections be done?', a: 'Typically every 3–6 months. More frequently for HMOs or where issues have previously been identified.' },
  { q: 'Can a tenant refuse entry?', a: 'A tenant can reasonably delay entry but not refuse indefinitely. Persistent refusal may constitute a breach of tenancy.' },
  { q: 'Will the report be in my portal?', a: 'Yes. All reports are accessible in your secure client portal account.' },
  { q: 'What if issues are found during an inspection?', a: 'Issues are logged in our system, and both landlord and tenant are notified. We can help coordinate maintenance through our Maintenance & Cleaning service.' },
]
