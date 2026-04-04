'use client'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ServiceTabNav } from '@/components/ui/ServiceTabNav'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import { BookingForm } from '@/components/forms/BookingForm'


export default function MaintenancePage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 50%,#F5C060 100%)' }}>
      <ServicePageHeader />
      <div className="relative px-6 py-10 text-center overflow-hidden" style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">Property Maintenance & Compliance</h1>
          <p className="mt-2 text-[#8B3A2A] text-base sm:text-lg">Keeping your property safe, legal, and well-maintained</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <ServiceTabNav>
          {(tab) => (
            <>
              {tab === 'description' && (
                <div className="space-y-8">
                  <Section title="Compliance Checks We Offer">
                    <div className="grid sm:grid-cols-2 gap-5 mt-3">
                      {COMPLIANCE_ITEMS.map(item => (
                        <div key={item.title} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(212,134,10,0.25)' }}>
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <h3 className="font-semibold text-[#2C1F14] mb-1">{item.title}</h3>
                          <p className="text-xs text-[#8B3A2A] mb-2 uppercase tracking-wide font-medium">{item.frequency}</p>
                          <p className="text-sm text-[#2C1F14] leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                  <Section title="Cleaning Services">
                    <ul className="space-y-1.5 text-sm text-[#2C1F14]">
                      <li>• End of tenancy deep clean</li>
                      <li>• Interim property cleans</li>
                      <li>• Post-maintenance clean</li>
                    </ul>
                    <p className="mt-3 text-sm text-[#8B3A2A]">Contact us for cleaning quotes: <a href="mailto:c3propertiesuk@gmail.com" className="text-[#D4860A] underline">c3propertiesuk@gmail.com</a></p>
                    <p className="mt-2 text-xs text-[#8B3A2A] italic">Further maintenance services information coming soon.</p>
                  </Section>
                </div>
              )}
              {tab === 'faqs' && (
                <div className="space-y-4">
                  {MAINTENANCE_FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
                </div>
              )}
              {tab === 'prices' && (
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-[#D4860A] text-xl">Pricing</h2>
                  <p className="text-sm text-[#2C1F14]">We work with certified and approved contractors for all compliance checks. Prices vary by property size, location, and service type.</p>
                  <p className="text-sm">Contact us: <a href="mailto:c3propertiesuk@gmail.com" className="text-[#D4860A] underline">c3propertiesuk@gmail.com</a> · <a href="tel:07852254792" className="text-[#D4860A] underline">07852254792</a></p>
                </div>
              )}
              {tab === 'book' && (
                <BookingForm serviceType="Maintenance / Compliance" />
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

const COMPLIANCE_ITEMS = [
  { icon: '🔥', title: 'Gas Safety Certificate', frequency: 'Annual — Legal Requirement', desc: 'Must be carried out by a Gas Safe registered engineer. Includes smoke alarm and carbon monoxide alarm check. Landlord must provide tenant a copy within 28 days.' },
  { icon: '⚡', title: 'EICR', frequency: 'Every 5 Years — Legal Requirement', desc: 'Electrical Installation Condition Report. Carried out by a qualified electrician. Required under the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020.' },
  { icon: '🏠', title: 'EPC', frequency: 'Every 10 Years — Legal Requirement', desc: 'Energy Performance Certificate. Property must achieve minimum EPC rating of E. Must be provided to tenant before moving in. Minimum C rating expected in future legislation.' },
  { icon: '💧', title: 'Legionella Risk Assessment', frequency: 'Recommended Annually', desc: 'Required by the Health and Safety at Work Act 1974. Identifies risk of Legionella bacteria in water systems.' },
  { icon: '🔌', title: 'PAT Testing', frequency: 'Recommended Annually for HMOs', desc: 'Portable Appliance Testing for all electrical appliances provided by the landlord. Not a legal requirement for private rentals but strongly advised.' },
  { icon: '📋', title: 'Property Licensing', frequency: 'As Required', desc: 'HMO Licence (mandatory for 5+ unrelated people). Additional and Selective licensing vary by local authority. Failure to licence can result in unlimited fines and rent repayment orders.' },
]

const MAINTENANCE_FAQS = [
  { q: 'What happens if I don\'t have a gas safety certificate?', a: 'It is a criminal offence under the Gas Safety (Installation and Use) Regulations 1998. Landlords can face fines and imprisonment.' },
  { q: 'How do I know if my property needs an HMO licence?', a: 'If 5 or more people from 2 or more households share facilities, a mandatory HMO licence is required. Contact your local council to check additional or selective licensing requirements.' },
  { q: 'Do you arrange compliance checks directly?', a: 'Yes. We work with certified and approved contractors to arrange all compliance checks. Contact us to book.' },
  { q: 'What is the minimum EPC rating for a rental property?', a: 'Currently E. The government is expected to require a minimum of C in the near future for new and existing tenancies.' },
]
