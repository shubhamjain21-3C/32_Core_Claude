import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Linkedin, Twitter, Facebook } from 'lucide-react'
import { NAV_LINKS, COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS } from '@/lib/constants'
import { services } from '@/data/services'

export function Footer() {
  return (
    <footer className="bg-[#0a1c35] border-t border-[#1e3a5f] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Image
                src="/logo/3CCore_Logo_Compact_Header.svg"
                alt="3C Core"
                width={200}
                height={40}
                className="h-10 w-auto opacity-85 mb-4"
              />
            </Link>
            <p className="text-[#7aaecc] text-sm leading-relaxed mb-6">
              Professional property management built on trust, precision, and lasting results.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                { Icon: Twitter,  href: '#', label: 'Twitter'  },
                { Icon: Facebook, href: '#', label: 'Facebook' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                   className="w-9 h-9 border border-[#1e3a5f] rounded flex items-center justify-center text-[#7aaecc] hover:border-[#2a7fd4] hover:text-[#6ab4e8] transition-colors duration-200">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide mb-4">Navigation</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[#7aaecc] text-sm hover:text-[#6ab4e8] transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide mb-4">Services</h3>
            <ul className="space-y-2.5">
              {services.map(s => (
                <li key={s.id}>
                  <Link href={`/services/${s.slug}`} className="text-[#7aaecc] text-sm hover:text-[#6ab4e8] transition-colors duration-200">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-[#7aaecc]">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#4a90c4]" />
                <span>{COMPANY_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[#7aaecc]">
                <Phone size={14} className="flex-shrink-0 text-[#4a90c4]" />
                <a href={`tel:${COMPANY_PHONE}`} className="hover:text-[#6ab4e8] transition-colors">{COMPANY_PHONE}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[#7aaecc]">
                <Mail size={14} className="flex-shrink-0 text-[#4a90c4]" />
                <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-[#6ab4e8] transition-colors">{COMPANY_EMAIL}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#1e3a5f] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#4a90c4] text-xs">© {new Date().getFullYear()} 3C Core Ltd. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-[#4a90c4]">
            <Link href="#" className="hover:text-[#7aaecc] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#7aaecc] transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-[#7aaecc] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
