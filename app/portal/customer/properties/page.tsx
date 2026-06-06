import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getPropertiesByCustomer } from '@/lib/store'
import { services } from '@/data/services'
import { Plus, MapPin } from 'lucide-react'

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  const myProperties = getPropertiesByCustomer(session.user.id)

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Client Portal</p>
          <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">My Properties</h1>
        </div>
        <Link
          href="/portal/customer/properties/new"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
          style={{ background: '#D4860A' }}
        >
          <Plus size={14} /> Add Property
        </Link>
      </div>

      {myProperties.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)' }}
        >
          <p className="text-[#8B3A2A] mb-4">You haven&apos;t added any properties yet.</p>
          <Link
            href="/portal/customer/properties/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg"
            style={{ background: '#D4860A' }}
          >
            <Plus size={14} /> Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {myProperties.map(p => {
            const activeServices = services.filter(s => p.serviceIds.includes(s.slug))
            return (
              <div
                key={p.id}
                className="rounded-xl p-6 transition-all"
                style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
                onMouseEnter={undefined}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                    p.status === 'Occupied'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>{p.status}</span>
                  <span
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(212,134,10,0.1)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}
                  >{p.type}</span>
                </div>

                <div className="flex items-start gap-2 mb-1">
                  <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: '#D4860A' }} />
                  <p className="text-[#2C1F14] font-medium text-sm">{p.address}</p>
                </div>
                <p className="text-[#8B3A2A] text-xs ml-5 mb-4">
                  {p.postcode}{p.bedrooms > 0 ? ` · ${p.bedrooms} bedrooms` : ''}
                </p>

                <div className="flex items-center justify-between mb-4 pt-3" style={{ borderTop: '1px solid rgba(212,134,10,0.12)' }}>
                  <div>
                    <p className="text-[10px] text-[#8B3A2A] uppercase tracking-wide">Monthly Rent</p>
                    <p className="font-bold font-heading text-lg" style={{ color: '#D4860A' }}>£{p.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#8B3A2A] uppercase tracking-wide">Since</p>
                    <p className="text-[#2C1F14] text-sm">{p.createdAt}</p>
                  </div>
                </div>

                {activeServices.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#8B3A2A] uppercase tracking-wide mb-2">Active Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeServices.map(s => (
                        <span
                          key={s.id}
                          className="text-[10px] rounded px-2 py-0.5 font-medium"
                          style={{ background: 'rgba(212,134,10,0.1)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.25)' }}
                        >{s.title}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
