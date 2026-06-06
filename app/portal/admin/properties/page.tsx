import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { properties, users } from '@/lib/store'
import { MapPin } from 'lucide-react'

export default async function AdminPropertiesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/portal/admin-login')

  const allProperties = Array.from(properties.values())
  const totalRent     = allProperties.reduce((s, p) => s + p.monthlyRent, 0)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Admin Portal</p>
        <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">All Properties</h1>
        <p className="text-[#8B3A2A] text-sm mt-1">
          {allProperties.length} managed properties · Portfolio rent:{' '}
          <span className="font-semibold" style={{ color: '#D4860A' }}>£{totalRent.toLocaleString()}/mo</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {allProperties.map(p => {
          const owner = users.get(p.customerId)
          return (
            <div
              key={p.id}
              className="rounded-xl p-5 transition-all"
              style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
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

              <div className="flex items-start gap-1.5 mb-1">
                <MapPin size={12} className="mt-0.5 shrink-0" style={{ color: '#D4860A' }} />
                <p className="text-[#2C1F14] text-sm font-medium">{p.address}</p>
              </div>
              <p className="text-[#8B3A2A] text-xs ml-4 mb-3">{p.postcode}{p.bedrooms > 0 ? ` · ${p.bedrooms} bed` : ''}</p>

              <div className="flex items-center justify-between mb-3 pt-2" style={{ borderTop: '1px solid rgba(212,134,10,0.1)' }}>
                <div>
                  <p className="text-[10px] text-[#8B3A2A] uppercase tracking-wide">Rent</p>
                  <p className="font-bold font-heading" style={{ color: '#D4860A' }}>£{p.monthlyRent.toLocaleString()}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#8B3A2A] uppercase tracking-wide">Services</p>
                  <p className="text-[#2C1F14] text-sm">{p.serviceIds.length} active</p>
                </div>
              </div>

              {owner && (
                <div className="pt-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(212,134,10,0.1)' }}>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'rgba(212,134,10,0.12)', color: '#D4860A' }}
                  >
                    {owner.name.charAt(0)}
                  </div>
                  <p className="text-[#8B3A2A] text-xs">{owner.name}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
