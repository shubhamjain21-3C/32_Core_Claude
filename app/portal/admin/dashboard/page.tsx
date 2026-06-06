import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getAllCustomers, properties, customerServices } from '@/lib/store'
import { Users, Building2, Wrench, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/portal/admin-login')

  const customers      = getAllCustomers()
  const allProperties  = Array.from(properties.values())
  const allServices    = Array.from(customerServices.values())
  const totalRent      = allProperties.reduce((s, p) => s + p.monthlyRent, 0)
  const activeServices = allServices.filter(s => s.status === 'Active').length

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Admin Portal</p>
        <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">Business Overview</h1>
        <p className="text-[#8B3A2A] text-sm mt-1">All customers, properties, and services at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers',    value: customers.length,                        Icon: Users      },
          { label: 'Properties Managed', value: allProperties.length,                    Icon: Building2  },
          { label: 'Portfolio Rent/mo',  value: `£${totalRent.toLocaleString()}`,         Icon: TrendingUp },
          { label: 'Active Services',    value: activeServices,                           Icon: Wrench     },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(212,134,10,0.1)', border: '1px solid rgba(212,134,10,0.25)' }}
            >
              <Icon size={16} style={{ color: '#D4860A' }} />
            </div>
            <p className="text-2xl font-bold font-heading text-[#2C1F14]">{value}</p>
            <p className="text-[#8B3A2A] text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent customers */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-[#2C1F14]">Recent Customers</h2>
            <Link href="/portal/admin/customers" className="text-xs font-medium transition-colors" style={{ color: '#D4860A' }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {customers.slice(0, 5).map(c => (
              <div
                key={c.id}
                className="flex items-center gap-3 py-2"
                style={{ borderBottom: '1px solid rgba(212,134,10,0.1)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'rgba(212,134,10,0.12)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2C1F14] text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[#8B3A2A] text-xs truncate">{c.email}</p>
                </div>
                <p className="text-[#8B3A2A] text-xs shrink-0">{c.createdAt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent properties */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-[#2C1F14]">Recent Properties</h2>
            <Link href="/portal/admin/properties" className="text-xs font-medium transition-colors" style={{ color: '#D4860A' }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {allProperties.slice(0, 5).map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2"
                style={{ borderBottom: '1px solid rgba(212,134,10,0.1)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#2C1F14] text-sm font-medium truncate">{p.address}</p>
                  <p className="text-[#8B3A2A] text-xs">{p.type} · {p.postcode}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: '#D4860A' }}>£{p.monthlyRent.toLocaleString()}</p>
                  <span className={`text-[10px] font-medium ${p.status === 'Occupied' ? 'text-green-600' : 'text-amber-600'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
