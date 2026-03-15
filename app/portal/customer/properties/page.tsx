import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getPropertiesByCustomer } from '@/lib/store'
import { services } from '@/data/services'
import { Plus, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  const myProperties = getPropertiesByCustomer(session.user.id)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-1">Client Portal</p>
          <h1 className="text-2xl font-bold font-heading text-white">My Properties</h1>
        </div>
        <Link href="/portal/customer/properties/new" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Property
        </Link>
      </div>

      {myProperties.length === 0 ? (
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-12 text-center">
          <p className="text-[#7aaecc] mb-4">You haven&apos;t added any properties yet.</p>
          <Link href="/portal/customer/properties/new" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={14} /> Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {myProperties.map(p => {
            const activeServices = services.filter(s => p.serviceIds.includes(s.slug))
            return (
              <div key={p.id} className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6 hover:border-[#2a7fd4] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={p.status === 'Occupied' ? 'cyan' : 'muted'}>{p.status}</Badge>
                  <Badge variant="blue">{p.type}</Badge>
                </div>
                <div className="flex items-start gap-2 mb-1">
                  <MapPin size={14} className="text-[#4a90c4] mt-0.5 shrink-0" />
                  <p className="text-white font-medium text-sm">{p.address}</p>
                </div>
                <p className="text-[#4a90c4] text-xs ml-5 mb-4">{p.postcode} {p.bedrooms > 0 ? `· ${p.bedrooms} bedrooms` : ''}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-[#4a90c4] uppercase tracking-wide">Monthly Rent</p>
                    <p className="text-[#6ab4e8] font-bold font-heading text-lg">£{p.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#4a90c4] uppercase tracking-wide">Since</p>
                    <p className="text-[#c8dff0] text-sm">{p.createdAt}</p>
                  </div>
                </div>

                {activeServices.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#4a90c4] uppercase tracking-wide mb-2">Active Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeServices.map(s => (
                        <span key={s.id} className="text-[10px] bg-[#1a5fa8]/30 text-[#6ab4e8] border border-[#2a7fd4]/30 rounded px-2 py-0.5">{s.title}</span>
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
