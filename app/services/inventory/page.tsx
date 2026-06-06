'use client'
import { Bot } from 'lucide-react'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ServiceTabNav } from '@/components/ui/ServiceTabNav'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import { BookingForm } from '@/components/forms/BookingForm'


export default function InventoryPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 50%,#F5C060 100%)' }}>
      <ServicePageHeader />

      {/* Hero strip */}
      <div className="relative px-6 py-10 text-center overflow-hidden"
        style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'rgba(212,134,10,0.15)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}>
            <Bot size={12} />AI-Powered Service
          </div>
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">
            Check In / Check Out Inventory Services
          </h1>
          <p className="mt-2 text-[#8B3A2A] text-base sm:text-lg">
            Professional property inventories — legally sound, digitally delivered
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <ServiceTabNav>
          {(tab) => (
            <>
              {tab === 'description' && (
                <div className="space-y-10">
                  <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(212,134,10,0.08)', border: '1px solid rgba(212,134,10,0.25)' }}>
                    <Bot size={20} className="text-[#D4860A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#2C1F14] text-sm">AI-Assisted Reports — Powered by Claude</p>
                      <p className="text-xs text-[#8B3A2A] mt-0.5">Upload your photos and notes. Our AI analyses each room, flags damage, and produces a legally structured inventory report in under 3 minutes.</p>
                    </div>
                  </div>
                  <Section title="Why Inventories Matter">
                    <p>A property inventory is a detailed record of the condition and contents of a property at a specific point in time. Under tenancy deposit protection rules, a thorough inventory is essential for making or defending deposit deductions at the end of a tenancy.</p>
                    <p className="mt-3">Without a proper check-in inventory, landlords cannot legally make deposit deductions — and tenants have no documented baseline to challenge unfair claims. 3C Core provides both AI-assisted and professional agent inventory services.</p>
                  </Section>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <ServiceCard title="DIY with AI Assistance">
                      <ul className="space-y-2 text-sm text-[#2C1F14]">
                        <li>• You conduct the inspection yourself</li>
                        <li>• Upload photos and notes via the 3C Core platform</li>
                        <li>• AI refines your inputs into a professional, legally sound report</li>
                        <li>• Review and confirm before download</li>
                      </ul>
                    </ServiceCard>
                    <ServiceCard title="Professional Agent Inspection">
                      <ul className="space-y-2 text-sm text-[#2C1F14]">
                        <li>• A qualified inventory agent attends the property</li>
                        <li>• Full written report with timestamped photos</li>
                        <li>• Report shared digitally with all parties</li>
                        <li>• Legally defensible documentation</li>
                      </ul>
                    </ServiceCard>
                  </div>

                  <Section title="Check-In Inspection">
                    <p>Conducted at the start of the tenancy, documenting the condition of every room, fixture, and fitting. Tenants can review and add comments or photos (subject to landlord approval). All parties digitally sign the final report. Reports are stored for a maximum of 2 years.</p>
                  </Section>

                  <Section title="Check-Out Inspection">
                    <p>Conducted at the end of the tenancy and compared against the check-in report. Documents changes, damage, and missing items. Tenants can provide feedback and submit additional photos, subject to landlord approval before finalisation. All parties sign digitally.</p>
                  </Section>

                  <Callout title="Legal Implications">
                    <ul className="space-y-1.5 text-sm">
                      <li>• Failure to have a proper inventory can result in deposit disputes being lost automatically.</li>
                      <li>• Without a check-in report, landlords cannot legally make deposit deductions.</li>
                      <li>• Tenants: always request a copy of the inventory before signing your tenancy agreement.</li>
                    </ul>
                  </Callout>
                </div>
              )}

              {tab === 'faqs' && (
                <div className="space-y-4">
                  {INVENTORY_FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
                </div>
              )}

              {tab === 'prices' && (
                <div className="space-y-6">
                  <Section title="Pricing">
                    <p className="text-sm text-[#2C1F14] mb-4">Pricing will be confirmed upon booking. Contact us at <a href="mailto:contactus@3ccore.com" className="text-[#D4860A] underline">contactus@3ccore.com</a> or call <a href="tel:07852254792" className="text-[#D4860A] underline">07852254792</a> for a quote.</p>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ background: 'rgba(212,134,10,0.12)' }}>
                          <th className="text-left px-4 py-2 text-[#2C1F14] font-semibold border border-[rgba(212,134,10,0.2)]">Service</th>
                          <th className="text-left px-4 py-2 text-[#2C1F14] font-semibold border border-[rgba(212,134,10,0.2)]">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {INVENTORY_PRICES.map(row => (
                          <tr key={row.service}>
                            <td className="px-4 py-2 border border-[rgba(212,134,10,0.2)] text-[#2C1F14]">{row.service}</td>
                            <td className="px-4 py-2 border border-[rgba(212,134,10,0.2)] text-[#D4860A] font-medium">{row.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-4 text-xs text-[#8B3A2A]">Subscription plans for landlords with multiple properties — coming soon.</p>
                  </Section>
                </div>
              )}

              {tab === 'book' && (
                <BookingForm serviceType="Check In / Check Out Inventory" />
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

function ServiceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(212,134,10,0.08)', border: '1px solid rgba(212,134,10,0.25)' }}>
      <h3 className="font-heading font-semibold text-[#2C1F14] text-base mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.25)' }}>
      <h3 className="font-heading font-semibold text-[#8B3A2A] text-base mb-3">{title}</h3>
      <div className="text-[#2C1F14]">{children}</div>
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

const INVENTORY_FAQS = [
  { q: 'What is a property inventory?', a: 'A detailed record of the condition and contents of a property at a specific point in time — used to protect both landlords and tenants during a tenancy.' },
  { q: 'Is an inventory a legal requirement?', a: 'While not strictly required by law, it is strongly recommended and is essential for making or disputing deposit deductions under tenancy deposit protection schemes.' },
  { q: 'Who should be present at the inventory?', a: 'Ideally both the landlord (or their agent) and the tenant. All parties must sign the final report.' },
  { q: 'Can tenants add comments to the report?', a: 'Yes. Tenants can submit feedback, amendments, or additional photos. These are reviewed by the landlord before being added to the final report.' },
  { q: 'How long is the report kept?', a: 'Reports are retained for a maximum of 2 years in line with our data retention policy.' },
  { q: 'What happens if there is a dispute about the inventory?', a: 'A signed inventory report is the key piece of evidence. See our Dispute Resolution service for how we help resolve inventory disagreements.' },
  { q: 'Can I use my own photos?', a: 'Yes. With our DIY option, you upload your own photos and notes. Our AI will produce a professional-grade written report from your inputs.' },
]

const INVENTORY_PRICES = [
  { service: 'Check-In Inventory (DIY + AI)',        price: 'Contact Us' },
  { service: 'Check-In Inventory (Professional)',    price: 'Contact Us' },
  { service: 'Check-Out Inventory (DIY + AI)',       price: 'Contact Us' },
  { service: 'Check-Out Inventory (Professional)',   price: 'Contact Us' },
  { service: 'Combined Check-In & Check-Out',        price: 'Contact Us' },
]
