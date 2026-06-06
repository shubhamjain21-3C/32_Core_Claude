import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getAllCustomers, properties, customerServices } from '@/lib/store'
import { Users, Building2, Wrench, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/portal/admin-login')

  const customers       = getAllCustomers()
  const allProperties   = Array.from(properties.values())
  const allServices     = Array.from(customerServices.values())
  const totalRent       = allProperties.reduce((s, p) => s + p.monthlyRent, 0)
  const activeServices  = allServices.filter(s => s.status === 'Active').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-1">Admin Portal</p>
        <h1 className="text-2xl font-bold font-heading text-white">Business Overview</h1>
        <p className="text-[#7aaecc] text-sm mt-1">All customers, properties, and services at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers',    value: customers.length,         Icon: Users,      color: '#2a7fd4' },
          { label: 'Properties Managed', value: allProperties.length,     Icon: Building2,  color: '#00ccff' },
          { label: 'Portfolio Rent/mo',  value: `£${totalRent.toLocaleString()}`, Icon: TrendingUp, color: '#6ab4e8' },
          { label: 'Active Services',    value: activeServices,            Icon: Wrench,     color: '#4a90c4' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-5">
            <div className="w-9 h-9 rounded-lg bg-[#1a5fa8]/20 border border-[#2a7fd4]/30 flex items-center justify-center mb-3">
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-2xl font-bold font-heading" style={{ color }}>{value}</p>
            <p className="text-[#7aaecc] text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent customers */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-white">Recent Customers</h2>
            <Link href="/portal/admin/customers" className="text-[#4a90c4] text-xs hover:text-[#6ab4e8] transition-colors">View all →</Link>
          </div>
          <div className="space-y-3">
            {customers.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-[#1e3a5f]/50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-[#1a5fa8]/30 flex items-center justify-center text-[#6ab4e8] text-sm font-bold">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-[#c8dff0] text-sm">{c.name}</p>
                  <p className="text-[#4a90c4] text-xs">{c.email}</p>
                </div>
                <p className="text-[#4a90c4] text-xs">{c.createdAt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent properties */}
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-white">Recent Properties</h2>
            <Link href="/portal/admin/properties" className="text-[#4a90c4] text-xs hover:text-[#6ab4e8] transition-colors">View all →</Link>
          </div>
          <div className="space-y-3">
            {allProperties.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[#1e3a5f]/50 last:border-0">
                <div className="flex-1">
                  <p className="text-[#c8dff0] text-sm">{p.address}</p>
                  <p className="text-[#4a90c4] text-xs">{p.type} · {p.postcode}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#6ab4e8] text-sm font-medium">£{p.monthlyRent.toLocaleString()}</p>
                  <span className={`text-[10px] ${p.status === 'Occupied' ? 'text-green-400' : 'text-amber-400'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
