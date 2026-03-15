import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Building2, FileText, MessageSquare, Bell, TrendingUp, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Client Dashboard',
  description: 'Your 3C Core property management dashboard.',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/portal/login')

  const widgets = [
    { Icon: Building2,      title: 'Properties',       value: '3',    desc: 'Active managed properties',   color: '#2a7fd4' },
    { Icon: TrendingUp,     title: 'Monthly Income',   value: '£4,850', desc: 'Net rental income this month', color: '#00ccff' },
    { Icon: Wrench,         title: 'Maintenance',      value: '2',    desc: 'Open maintenance requests',    color: '#6ab4e8' },
    { Icon: FileText,       title: 'Documents',        value: '12',   desc: 'Recent documents',             color: '#4a90c4' },
    { Icon: MessageSquare,  title: 'Messages',         value: '1',    desc: 'Unread messages',              color: '#2a7fd4' },
    { Icon: Bell,           title: 'Notifications',    value: '3',    desc: 'Action required',              color: '#00ccff' },
  ]

  return (
    <div className="min-h-screen bg-[#050d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-2">Client Portal</p>
          <h1 className="text-3xl font-bold font-heading text-white">
            Welcome back, <span className="text-[#2a9fd4]">{session.user?.name || session.user?.email}</span>
          </h1>
          <p className="text-[#7aaecc] text-sm mt-1">Here&apos;s an overview of your property portfolio.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {widgets.map(({ Icon, title, value, desc, color }) => (
            <div key={title} className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-5 hover:border-[#2a7fd4] transition-colors duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[#7aaecc] text-xs tracking-wide mb-0.5">{title}</p>
                  <p className="text-2xl font-bold font-heading" style={{ color }}>{value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#1a5fa8]/20 border border-[#2a7fd4]/30 flex items-center justify-center">
                  <Icon size={18} style={{ color }} />
                </div>
              </div>
              <p className="text-[#4a90c4] text-xs">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
            <h2 className="text-white font-semibold font-heading mb-4">Recent Documents</h2>
            {['Monthly Statement — Feb 2026', 'Tenancy Agreement — Flat 2', 'Gas Safety Certificate — 14 High St', 'EPC Report — Maple House'].map(doc => (
              <div key={doc} className="flex items-center gap-3 py-2.5 border-b border-[#1e3a5f]/50 last:border-0">
                <FileText size={14} className="text-[#4a90c4] flex-shrink-0" />
                <span className="text-[#c8dff0] text-sm">{doc}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
            <h2 className="text-white font-semibold font-heading mb-4">Quick Links</h2>
            {['View all properties', 'Submit maintenance request', 'Download statements', 'Contact your manager', 'View compliance status'].map(link => (
              <div key={link} className="flex items-center gap-3 py-2.5 border-b border-[#1e3a5f]/50 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2a7fd4]" />
                <a href="#" className="text-[#7aaecc] text-sm hover:text-[#6ab4e8] transition-colors">{link}</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
