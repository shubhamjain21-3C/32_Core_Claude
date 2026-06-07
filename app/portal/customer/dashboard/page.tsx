import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getPropertiesByCustomer, getServicesByCustomer, findUserByEmail } from '@/lib/store'
import { Building2, Wrench, TrendingUp, CheckCircle2, Plus, LayoutGrid } from 'lucide-react'

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  const myProperties  = getPropertiesByCustomer(session.user.id)
  const myServices    = getServicesByCustomer(session.user.id)

  const totalRent      = myProperties.reduce((s, p) => s + p.monthlyRent, 0)
  const occupied       = myProperties.filter(p => p.status === 'Occupied').length
  const activeServices = myServices.filter(s => s.status === 'Active').length
  const allBenefits    = myServices.flatMap(s => s.benefits)

  const firstName   = session.user.name?.split(' ')[0] ?? session.user.name ?? 'there'
  const fullUser    = session.user.email ? findUserByEmail(session.user.email) : null
  const portalRole  = fullUser?.portalRole ?? 'property_manager'

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Client Portal</p>
          <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">
            Welcome back, <span style={{ color: '#D4860A' }}>{firstName}</span>
          </h1>
          <p className="text-[#8B3A2A] text-sm mt-1">Here&apos;s your property portfolio overview.</p>
        </div>
        <Link
          href={`/services?role=${portalRole}`}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(212,134,10,0.1)',
            border: '1.5px solid rgba(212,134,10,0.35)',
            color: '#D4860A',
          }}
        >
          <LayoutGrid size={14} />
          Browse Services
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Properties',      value: myProperties.length,             Icon: Building2,  },
          { label: 'Occupied',        value: occupied,                         Icon: Building2,  },
          { label: 'Monthly Income',  value: `£${totalRent.toLocaleString()}`, Icon: TrendingUp, },
          { label: 'Active Services', value: activeServices,                   Icon: Wrench,     },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(212,134,10,0.1)', border: '1px solid rgba(212,134,10,0.25)' }}
              >
                <Icon size={16} style={{ color: '#D4860A' }} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-[#2C1F14]">{value}</p>
            <p className="text-[#8B3A2A] text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Properties */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-[#2C1F14]">Your Properties</h2>
            <Link
              href="/portal/customer/properties/new"
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: '#D4860A' }}
            >
              <Plus size={12} /> Add property
            </Link>
          </div>

          {myProperties.length === 0 ? (
            <p className="text-[#8B3A2A] text-sm text-center py-6">
              No properties yet.{' '}
              <Link href="/portal/customer/properties/new" className="underline" style={{ color: '#D4860A' }}>Add your first →</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {myProperties.slice(0, 4).map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: '1px solid rgba(212,134,10,0.12)' }}
                >
                  <div>
                    <p className="text-[#2C1F14] text-sm font-medium">{p.address}</p>
                    <p className="text-[#8B3A2A] text-xs">{p.type} · {p.bedrooms > 0 ? `${p.bedrooms} bed` : 'Commercial'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#D4860A' }}>£{p.monthlyRent.toLocaleString()}/mo</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'Occupied'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/portal/customer/properties" className="block mt-4 text-xs font-medium transition-colors" style={{ color: '#D4860A' }}>
            View all properties →
          </Link>
        </div>

        {/* Benefits */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
        >
          <h2 className="font-semibold font-heading text-[#2C1F14] mb-4">Benefits Achieved</h2>
          {allBenefits.length === 0 ? (
            <p className="text-[#8B3A2A] text-sm text-center py-6">Benefits will appear here once services are active.</p>
          ) : (
            <div className="space-y-2">
              {allBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: '#D4860A' }} />
                  <p className="text-[#2C1F14] text-sm">{b}</p>
                </div>
              ))}
            </div>
          )}
          <Link href="/portal/customer/services" className="block mt-4 text-xs font-medium transition-colors" style={{ color: '#D4860A' }}>
            View all services →
          </Link>
        </div>

      </div>
    </div>
  )
}
