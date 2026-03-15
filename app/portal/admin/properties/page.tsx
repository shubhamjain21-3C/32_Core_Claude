import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { properties, users } from '@/lib/store'
import { Badge } from '@/components/ui/Badge'
import { MapPin } from 'lucide-react'

export default async function AdminPropertiesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/portal/admin/login')

  const allProperties = Array.from(properties.values())
  const totalRent     = allProperties.reduce((s, p) => s + p.monthlyRent, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-1">Admin Portal</p>
        <h1 className="text-2xl font-bold font-heading text-white">All Properties</h1>
        <p className="text-[#7aaecc] text-sm mt-1">
          {allProperties.length} managed properties · Portfolio rent: <span className="text-[#6ab4e8] font-medium">£{totalRent.toLocaleString()}/mo</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {allProperties.map(p => {
          const owner = users.get(p.customerId)
          return (
            <div key={p.id} className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-5 hover:border-[#2a7fd4] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={p.status === 'Occupied' ? 'cyan' : 'muted'}>{p.status}</Badge>
                <Badge variant="blue">{p.type}</Badge>
              </div>
              <div className="flex items-start gap-1.5 mb-1">
                <MapPin size={12} className="text-[#4a90c4] mt-0.5 shrink-0" />
                <p className="text-white text-sm font-medium">{p.address}</p>
              </div>
              <p className="text-[#4a90c4] text-xs ml-4 mb-3">{p.postcode} {p.bedrooms > 0 ? `· ${p.bedrooms} bed` : ''}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] text-[#4a90c4] uppercase tracking-wide">Rent</p>
                  <p className="text-[#6ab4e8] font-bold font-heading">£{p.monthlyRent.toLocaleString()}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#4a90c4] uppercase tracking-wide">Services</p>
                  <p className="text-[#c8dff0] text-sm">{p.serviceIds.length} active</p>
                </div>
              </div>
              {owner && (
                <div className="border-t border-[#1e3a5f]/50 pt-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1a5fa8]/30 flex items-center justify-center text-[#6ab4e8] text-xs font-bold">
                    {owner.name.charAt(0)}
                  </div>
                  <p className="text-[#7aaecc] text-xs">{owner.name}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
