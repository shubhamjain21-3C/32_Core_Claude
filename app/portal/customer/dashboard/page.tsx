import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getPropertiesByCustomer, getServicesByCustomer } from '@/lib/store'
import { Building2, Wrench, TrendingUp, CheckCircle2, Plus } from 'lucide-react'

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  const myProperties = getPropertiesByCustomer(session.user.id)
  const myServices   = getServicesByCustomer(session.user.id)

  const totalRent  = myProperties.reduce((s, p) => s + p.monthlyRent, 0)
  const occupied   = myProperties.filter(p => p.status === 'Occupied').length
  const activeServices = myServices.filter(s => s.status === 'Active').length
  const allBenefits    = myServices.flatMap(s => s.benefits)

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-1">Client Portal</p>
        <h1 className="text-2xl font-bold font-heading text-white">
          Welcome back, <span className="text-[#2a9fd4]">{session.user.name}</span>
        </h1>
        <p className="text-[#7aaecc] text-sm mt-1">Here&apos;s your property portfolio overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Properties',       value: myProperties.length, Icon: Building2,  color: '#2a7fd4' },
          { label: 'Occupied',         value: occupied,             Icon: Building2,  color: '#00ccff' },
          { label: 'Monthly Income',   value: `£${totalRent.toLocaleString()}`, Icon: TrendingUp, color: '#6ab4e8' },
          { label: 'Active Services',  value: activeServices,       Icon: Wrench,     color: '#4a90c4' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#1a5fa8]/20 border border-[#2a7fd4]/30 flex items-center justify-center">
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading" style={{ color }}>{value}</p>
            <p className="text-[#7aaecc] text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Properties summary */}
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-white">Your Properties</h2>
            <Link href="/portal/customer/properties/new" className="flex items-center gap-1 text-[#4a90c4] text-xs hover:text-[#6ab4e8] transition-colors">
              <Plus size={12} /> Add property
            </Link>
          </div>
          {myProperties.length === 0 ? (
            <p className="text-[#4a90c4] text-sm text-center py-6">No properties yet. <Link href="/portal/customer/properties/new" className="underline">Add your first →</Link></p>
          ) : (
            <div className="space-y-3">
              {myProperties.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50 last:border-0">
                  <div>
                    <p className="text-[#c8dff0] text-sm">{p.address}</p>
                    <p className="text-[#4a90c4] text-xs">{p.type} · {p.bedrooms > 0 ? `${p.bedrooms} bed` : 'Commercial'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6ab4e8] text-sm font-medium">£{p.monthlyRent.toLocaleString()}/mo</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'Occupied' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/portal/customer/properties" className="block mt-4 text-[#4a90c4] text-xs hover:text-[#6ab4e8] transition-colors">View all properties →</Link>
        </div>

        {/* Benefits */}
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
          <h2 className="font-semibold font-heading text-white mb-4">Benefits Achieved</h2>
          {allBenefits.length === 0 ? (
            <p className="text-[#4a90c4] text-sm text-center py-6">Benefits will appear here once services are active.</p>
          ) : (
            <div className="space-y-2">
              {allBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-[#00ccff] mt-0.5 shrink-0" />
                  <p className="text-[#c8dff0] text-sm">{b}</p>
                </div>
              ))}
            </div>
          )}
          <Link href="/portal/customer/services" className="block mt-4 text-[#4a90c4] text-xs hover:text-[#6ab4e8] transition-colors">View all services →</Link>
        </div>
      </div>
    </div>
  )
}
