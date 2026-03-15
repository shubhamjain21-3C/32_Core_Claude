import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getServicesByCustomer, getPropertiesByCustomer } from '@/lib/store'
import { CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  const myServices    = getServicesByCustomer(session.user.id)
  const myProperties  = getPropertiesByCustomer(session.user.id)
  const propMap       = Object.fromEntries(myProperties.map(p => [p.id, p]))

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-1">Client Portal</p>
        <h1 className="text-2xl font-bold font-heading text-white">My Services & Benefits</h1>
        <p className="text-[#7aaecc] text-sm mt-1">Services 3C Core is actively managing for your portfolio.</p>
      </div>

      {myServices.length === 0 ? (
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-12 text-center">
          <p className="text-[#7aaecc] mb-4">No services active yet.</p>
          <Link href="/contact" className="btn-primary inline-block text-sm">Enquire about a service</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {myServices.map(svc => {
            const property = propMap[svc.propertyId]
            return (
              <div key={svc.id} className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl p-6 hover:border-[#2a7fd4] transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-white font-semibold font-heading text-lg">{svc.serviceName}</h3>
                    {property && (
                      <p className="text-[#4a90c4] text-xs mt-0.5">{property.address}, {property.postcode}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[#7aaecc] text-xs">
                      <Clock size={12} /> Since {svc.startDate}
                    </div>
                    <Badge variant={svc.status === 'Active' ? 'cyan' : 'muted'}>{svc.status}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#4a90c4] uppercase tracking-wide mb-3">Benefits & Outcomes Achieved</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {svc.benefits.map((b: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 bg-[#071224] border border-[#1e3a5f]/60 rounded-lg p-3">
                        <CheckCircle2 size={14} className="text-[#00ccff] mt-0.5 shrink-0" />
                        <p className="text-[#c8dff0] text-sm">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
