'use client'
import { useState } from 'react'
import { Mail, Phone, CheckCircle, Clock, Users, Home, GraduationCap } from 'lucide-react'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import toast, { Toaster } from 'react-hot-toast'

const TABS = ['Description', 'FAQs', 'Prices', 'Enquire Now'] as const
type Tab = typeof TABS[number]

const FAQS = [
  {
    q: 'Do I need a guarantor as a student?',
    a: 'Many student lets require a UK-based guarantor. International students may need to pay rent upfront. Contact us to discuss your circumstances.',
  },
  {
    q: 'What is included in the rent?',
    a: 'This varies per property. We will confirm which bills are included during the matching process.',
  },
  {
    q: 'How long does the process take?',
    a: 'Typically 1–3 weeks from enquiry to move-in, depending on referencing and property availability.',
  },
  {
    q: 'What documents do I need?',
    a: 'Photo ID, proof of address, proof of student status (for student lets), employment or income evidence, and Right to Rent documents.',
  },
  {
    q: 'Is there a fee to use this service?',
    a: 'No tenant fees under the Tenant Fees Act 2019. Our fee is charged to the landlord only.',
  },
]

const HOW_IT_WORKS = [
  'Submit your letting enquiry using the form below',
  '3C Core matches you with suitable properties',
  'Viewings arranged — virtual or in-person',
  'References and Right to Rent checks completed',
  'Tenancy agreement signed by all parties',
  'Keys handed over and tenancy begins',
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,134,10,0.2)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 py-4 flex justify-between items-center font-semibold text-[#2C1F14] text-sm"
        style={{ background: 'rgba(255,255,255,0.6)' }}
      >
        {q}
        <span className="ml-3 text-[#D4860A] text-lg leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 py-3 text-sm text-[#2C1F14] leading-relaxed" style={{ background: 'rgba(255,255,255,0.4)' }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function LettingServicesPage() {
  const [tab, setTab] = useState<Tab>('Description')
  const [role, setRole] = useState<'tenant' | 'student'>('tenant')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleEnquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.full_name,
          email: data.email,
          phone: data.phone || '',
          company: '',
          service: `Letting Services (${role})`,
          message: [
            role === 'student' ? `University: ${data.university || '—'}` : '',
            role === 'student' ? `Course Duration: ${data.course_duration || '—'}` : '',
            `Preferred Area: ${data.preferred_area || '—'}`,
            `Budget: £${data.budget_min || '?'}–£${data.budget_max || '?'} pcm`,
            `Move-in Date: ${data.move_in_date || '—'}`,
            `Lease Type: ${data.lease_type || '—'}`,
            `Bedrooms: ${data.bedrooms || '—'}`,
            data.notes ? `Notes: ${data.notes}` : '',
          ].filter(Boolean).join('\n'),
        }),
      })
      if (res.ok) {
        setDone(true)
        form.reset()
        toast.success('Enquiry submitted! We will be in touch shortly.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg text-sm text-[#2C1F14] border focus:outline-none focus:ring-1 focus:ring-[#D4860A]'
  const inputStyle = { borderColor: 'rgba(212,134,10,0.35)', background: 'rgba(255,255,255,0.7)' }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 60%,#F5C060 100%)' }}>
      <Toaster position="top-right" />
      <ServicePageHeader />

      {/* Hero */}
      <div className="relative px-6 py-10 text-center overflow-hidden" style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <div className="relative">
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">Letting Services</h1>
          <p className="mt-2 text-[#8B3A2A] text-base">
            Find your next home — short-term, long-term, and student lets
          </p>
        </div>
      </div>


      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'rgba(212,134,10,0.3)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderBottom: tab === t ? '2px solid #D4860A' : '2px solid transparent',
                color: tab === t ? '#D4860A' : '#8B3A2A',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Description */}
        {tab === 'Description' && (
          <div className="space-y-8 pb-12">
            <section>
              <h2 className="font-heading font-bold text-[#2C1F14] text-xl mb-4">Who This Service Is For</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: <Users size={18} />, title: 'Tenants', desc: 'Looking for rental properties — short or long term' },
                  { icon: <GraduationCap size={18} />, title: 'Students', desc: 'Accommodation near university, aligned with academic year' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,134,10,0.2)' }}>
                    <span className="text-[#D4860A] flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-[#2C1F14] text-sm">{item.title}</p>
                      <p className="text-[#8B3A2A] text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-heading font-bold text-[#2C1F14] text-xl mb-4">Types of Lets Available</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Short-Term Let',
                    bullets: ['Minimum 1 month', 'Flexible move-in dates', 'Fully or part-furnished', 'Ideal for professionals on contract'],
                  },
                  {
                    title: 'Long-Term Let',
                    bullets: ['6 months to 3 years', 'Assured Shorthold Tenancy (AST)', 'Standard UK tenancy terms', 'Ideal for settled tenants & families'],
                  },
                  {
                    title: 'Student Let',
                    bullets: ['Aligned with academic year', 'HMO and private studio options', 'All-bills-included options', 'University city locations'],
                  },
                ].map(card => (
                  <div key={card.title} className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,134,10,0.2)' }}>
                    <h3 className="font-heading font-semibold text-[#D4860A] text-base mb-3">{card.title}</h3>
                    <ul className="space-y-1.5">
                      {card.bullets.map(b => (
                        <li key={b} className="flex items-start gap-2 text-xs text-[#2C1F14]">
                          <CheckCircle size={12} className="text-[#D4860A] flex-shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-heading font-bold text-[#2C1F14] text-xl mb-4">How It Works</h2>
              <ol className="space-y-3">
                {HOW_IT_WORKS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#D4860A' }}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-[#2C1F14] pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="p-4 rounded-lg text-xs text-[#8B3A2A] leading-relaxed" style={{ background: 'rgba(139,58,42,0.06)', border: '1px solid rgba(139,58,42,0.2)' }}>
              3C Core acts as a letting agent in compliance with the Tenant Fees Act 2019, Housing Act 1988, and all applicable UK letting legislation. All tenants are subject to referencing and Right to Rent checks under the Immigration Act 2014.
            </section>
          </div>
        )}

        {/* FAQs */}
        {tab === 'FAQs' && (
          <div className="space-y-3 pb-12">
            {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        )}

        {/* Prices */}
        {tab === 'Prices' && (
          <div className="pb-12 space-y-4">
            <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,134,10,0.2)' }}>
              <Home size={32} className="text-[#D4860A] mx-auto mb-3" />
              <h2 className="font-heading font-bold text-[#2C1F14] text-xl mb-2">Free for Tenants & Students</h2>
              <p className="text-sm text-[#8B3A2A] max-w-md mx-auto">
                This service is completely free for tenants and students. Our fee is charged to the landlord only, in compliance with the Tenant Fees Act 2019.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:contactus@3ccore.com" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#D4860A]" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,134,10,0.2)' }}>
                <Mail size={16} />contactus@3ccore.com
              </a>
              <a href="tel:07852254792" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#D4860A]" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,134,10,0.2)' }}>
                <Phone size={16} />07852254792
              </a>
            </div>
          </div>
        )}

        {/* Enquire Now */}
        {tab === 'Enquire Now' && (
          <div className="pb-12 max-w-xl">
            {done ? (
              <div className="text-center py-12">
                <CheckCircle size={40} className="text-[#D4860A] mx-auto mb-4" />
                <h3 className="font-heading font-bold text-[#2C1F14] text-xl mb-2">Enquiry Received</h3>
                <p className="text-[#8B3A2A] text-sm">We will be in touch within 1 business day.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="space-y-4">
                <h2 className="font-heading font-semibold text-[#D4860A] text-xl mb-2">Letting Enquiry</h2>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-[#2C1F14] mb-1">I am a *</label>
                  <div className="flex gap-3">
                    {(['tenant', 'student'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize"
                        style={{
                          background: role === r ? '#D4860A' : 'rgba(255,255,255,0.6)',
                          color: role === r ? 'white' : '#2C1F14',
                          border: `1.5px solid ${role === r ? '#D4860A' : 'rgba(212,134,10,0.35)'}`,
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">Full Name *</label><input name="full_name" required className={inputCls} style={inputStyle} /></div>
                  <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">Email *</label><input name="email" type="email" required className={inputCls} style={inputStyle} /></div>
                </div>
                <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">Phone</label><input name="phone" type="tel" className={inputCls} style={inputStyle} /></div>

                {role === 'student' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">University</label><input name="university" className={inputCls} style={inputStyle} /></div>
                    <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">Course Duration</label><input name="course_duration" placeholder="e.g. 3 years" className={inputCls} style={inputStyle} /></div>
                  </div>
                )}

                <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">Preferred Area / Location</label><input name="preferred_area" placeholder="e.g. North London, Manchester" className={inputCls} style={inputStyle} /></div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">Budget Min (pcm £)</label><input name="budget_min" type="number" placeholder="800" className={inputCls} style={inputStyle} /></div>
                  <div><label className="block text-sm font-medium text-[#2C1F14] mb-1">Budget Max (pcm £)</label><input name="budget_max" type="number" placeholder="1500" className={inputCls} style={inputStyle} /></div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2C1F14] mb-1">Preferred Move-In Date</label>
                    <input name="move_in_date" type="date" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C1F14] mb-1">Lease Type</label>
                    <select name="lease_type" className={inputCls} style={inputStyle}>
                      <option value="">Select…</option>
                      <option>Short-term</option>
                      <option>Long-term</option>
                      <option>Student Let</option>
                      <option>Room Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C1F14] mb-1">Bedrooms Needed</label>
                  <select name="bedrooms" className={inputCls} style={inputStyle}>
                    <option value="">Any</option>
                    {[1,2,3,4,5].map(n => <option key={n}>{n} bedroom{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C1F14] mb-1">Additional Notes</label>
                  <textarea name="notes" rows={3} className={inputCls + ' resize-none'} style={inputStyle} placeholder="Any specific requirements…" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ background: loading ? '#aaa' : '#D4860A' }}
                >
                  {loading ? 'Submitting…' : 'Submit Enquiry'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <ComingSoonWidget />

      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
