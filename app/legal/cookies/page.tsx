'use client'
import { useState, useEffect } from 'react'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'

type Prefs = { analytics: boolean; functionality: boolean; marketing: boolean }

export default function CookiesPage() {
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, functionality: false, marketing: false })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('3c_cookie_prefs')
    if (stored) {
      try { setPrefs(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  function savePrefs() {
    localStorage.setItem('3c_cookie_prefs', JSON.stringify(prefs))
    localStorage.setItem('3c_cookie_consent', 'custom')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function acceptAll() {
    const all = { analytics: true, functionality: true, marketing: true }
    setPrefs(all)
    localStorage.setItem('3c_cookie_prefs', JSON.stringify(all))
    localStorage.setItem('3c_cookie_consent', 'all')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function rejectAll() {
    const none = { analytics: false, functionality: false, marketing: false }
    setPrefs(none)
    localStorage.setItem('3c_cookie_prefs', JSON.stringify(none))
    localStorage.setItem('3c_cookie_consent', 'essential')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF8EE' }}>
      <ServicePageHeader />
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <h1 className="font-heading font-bold text-[#2C1F14] text-3xl mb-1">Cookie Settings &amp; Cookie Policy</h1>
        <p className="text-[#8B3A2A] text-sm mb-8">3C Core Ltd. — UK GDPR &amp; PECR Compliant</p>

        <Section title="What Are Cookies?">
          <P>Cookies are small text files placed on your device when you visit our website. They help us understand how visitors use our site and improve your experience.</P>
        </Section>

        <Section title="Types of Cookies We Use">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse mt-2">
              <thead>
                <tr style={{ background: 'rgba(212,134,10,0.12)' }}>
                  <th className="text-left px-3 py-2 border border-[rgba(212,134,10,0.2)] text-[#2C1F14]">Cookie Type</th>
                  <th className="text-left px-3 py-2 border border-[rgba(212,134,10,0.2)] text-[#2C1F14]">Purpose</th>
                  <th className="text-left px-3 py-2 border border-[rgba(212,134,10,0.2)] text-[#2C1F14]">Consent Required?</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TYPES.map(c => (
                  <tr key={c.type}>
                    <td className="px-3 py-2 border border-[rgba(212,134,10,0.15)] text-[#2C1F14] font-medium">{c.type}</td>
                    <td className="px-3 py-2 border border-[rgba(212,134,10,0.15)] text-[#2C1F14]">{c.purpose}</td>
                    <td className="px-3 py-2 border border-[rgba(212,134,10,0.15)] text-[#2C1F14]">{c.consent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Third-Party Cookies">
          <ul className="space-y-1 ml-2">
            <Li>Google Analytics — website usage statistics</Li>
            <Li>Google Ads / Facebook Pixel — advertising and remarketing</Li>
            <Li>Rightmove / Zoopla widgets — property search tools embedded in our site</Li>
          </ul>
        </Section>

        <Section title="Your Cookie Preferences">
          <div className="space-y-4 mt-3">
            <Toggle label="Strictly Necessary" description="Enable core website functions (e.g. contact forms, security)" checked={true} disabled />
            <Toggle label="Analytics / Performance Cookies" description="Track page views, session duration, traffic sources (e.g. Google Analytics)" checked={prefs.analytics} onChange={v => setPrefs(p => ({ ...p, analytics: v }))} />
            <Toggle label="Functionality Cookies" description="Remember your preferences (e.g. language, location)" checked={prefs.functionality} onChange={v => setPrefs(p => ({ ...p, functionality: v }))} />
            <Toggle label="Marketing / Targeting Cookies" description="Deliver relevant ads and track conversions (e.g. Facebook Pixel, Google Ads)" checked={prefs.marketing} onChange={v => setPrefs(p => ({ ...p, marketing: v }))} />
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={savePrefs} className="px-5 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: '#D4860A' }}>Save My Preferences</button>
            <button onClick={acceptAll} className="px-5 py-2 text-sm font-medium rounded-lg border border-[#D4860A] text-[#D4860A] hover:bg-[rgba(212,134,10,0.1)] transition-colors">Accept All</button>
            <button onClick={rejectAll} className="px-5 py-2 text-sm font-medium rounded-lg border border-[rgba(139,58,42,0.4)] text-[#8B3A2A] hover:bg-[rgba(139,58,42,0.08)] transition-colors">Reject All Non-Essential</button>
          </div>
          {saved && <p className="mt-3 text-sm text-[#2D5016] font-medium">✅ Preferences saved.</p>}
        </Section>

        <Section title="Managing Your Cookies">
          <P>You can control or delete cookies at any time via:</P>
          <ul className="space-y-1 ml-2">
            <Li>Our cookie consent banner when you first visit our site</Li>
            <Li>Your browser settings (Chrome, Firefox, Safari, Edge)</Li>
            <Li>Opt-out tools such as youronlinechoices.com</Li>
          </ul>
          <P className="mt-2">Disabling non-essential cookies will not affect your ability to use our core services. Our cookie consent records are stored in accordance with UK GDPR and the Privacy and Electronic Communications Regulations (PECR).</P>
        </Section>

        <Section title="Cookie Enquiries">
          <P>For any questions about our use of cookies, please contact us at <a href="mailto:contactus@3ccore.com" className="text-[#D4860A] underline">contactus@3ccore.com</a></P>
        </Section>
      </div>
      <ComingSoonWidget />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-heading font-semibold text-[#D4860A] text-xl mb-3">{title}</h2>
      {children}
    </div>
  )
}
function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[#2C1F14] text-sm leading-relaxed ${className ?? ''}`}>{children}</p>
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-[#2C1F14] text-sm leading-relaxed">• {children}</li>
}
function Toggle({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(212,134,10,0.2)' }}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative mt-0.5 w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-[#D4860A]' : 'bg-gray-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <div>
        <p className="font-medium text-[#2C1F14] text-sm">{label} {disabled && <span className="text-xs text-[#8B3A2A] font-normal">(cannot be disabled)</span>}</p>
        <p className="text-xs text-[#8B3A2A] mt-0.5">{description}</p>
      </div>
    </div>
  )
}

const COOKIE_TYPES = [
  { type: 'Strictly Necessary', purpose: 'Enable core website functions (e.g. contact forms, security)', consent: 'No — essential' },
  { type: 'Analytics/Performance', purpose: 'Track page views, session duration, traffic sources (e.g. Google Analytics)', consent: 'Yes' },
  { type: 'Functionality', purpose: 'Remember your preferences (e.g. language, location)', consent: 'Yes' },
  { type: 'Marketing/Targeting', purpose: 'Deliver relevant ads and track conversions (e.g. Facebook Pixel, Google Ads)', consent: 'Yes' },
]
