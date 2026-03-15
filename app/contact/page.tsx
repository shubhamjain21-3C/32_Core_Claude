import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { ContactForm } from '@/components/contact/ContactForm'
import { COMPANY_ADDRESS, COMPANY_EMAIL, COMPANY_PHONE } from '@/lib/constants'
import { CircuitDecor } from '@/components/ui/CircuitDecor'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the 3C Core property management team.',
}

export default function ContactPage() {
  return (
    <div className="bg-[#050d1a]">
      <section className="relative py-20 bg-gradient-to-b from-[#071224] to-[#050d1a] overflow-hidden">
        <CircuitDecor position="tr" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Let&apos;s <span className="text-[#2a9fd4]">Connect</span>
          </h1>
          <p className="text-[#7aaecc] text-sm leading-relaxed max-w-xl mx-auto">
            Whether you have a single property or a large portfolio, we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl p-8">
              <h2 className="text-xl font-bold font-heading text-white mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl p-6">
              <h2 className="text-lg font-bold font-heading text-white mb-5">Contact Information</h2>
              <ul className="space-y-4">
                {[
                  { Icon: MapPin, label: 'Address', value: COMPANY_ADDRESS },
                  { Icon: Phone,  label: 'Phone',   value: COMPANY_PHONE,  href: `tel:${COMPANY_PHONE}` },
                  { Icon: Mail,   label: 'Email',   value: COMPANY_EMAIL,  href: `mailto:${COMPANY_EMAIL}` },
                  { Icon: Clock,  label: 'Hours',   value: 'Mon–Fri: 9am–6pm | Emergency: 24/7' },
                ].map(({ Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1a5fa8]/20 border border-[#2a7fd4]/30 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-[#6ab4e8]" />
                    </div>
                    <div>
                      <p className="text-[#4a90c4] text-[10px] tracking-wide uppercase mb-0.5">{label}</p>
                      {href
                        ? <a href={href} className="text-[#c8dff0] text-sm hover:text-[#6ab4e8] transition-colors">{value}</a>
                        : <p className="text-[#c8dff0] text-sm">{value}</p>
                      }
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Map placeholder */}
            <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl overflow-hidden h-52 flex items-center justify-center">
              <p className="text-[#4a90c4] text-sm">Map embed — update with your Google Maps API key</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
