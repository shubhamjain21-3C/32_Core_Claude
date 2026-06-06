import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getServicesByCustomer, getPropertiesByCustomer } from '@/lib/store'
import { CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  const myServices   = getServicesByCustomer(session.user.id)
  const myProperties = getPropertiesByCustomer(session.user.id)
  const propMap      = Object.fromEntries(myProperties.map(p => [p.id, p]))

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Client Portal</p>
        <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">My Services &amp; Benefits</h1>
        <p className="text-[#8B3A2A] text-sm mt-1">Services 3C Core is actively managing for your portfolio.</p>
      </div>

      {myServices.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)' }}
        >
          <p className="text-[#8B3A2A] mb-4">No services active yet.</p>
          <Link
            href="/contact"
            className="inline-block text-sm font-semibold text-white px-4 py-2 rounded-lg"
            style={{ background: '#D4860A' }}
          >
            Enquire about a service
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {myServices.map(svc => {
            const property = propMap[svc.propertyId]
            return (
              <div
                key={svc.id}
                className="rounded-xl p-6 transition-all"
                style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-[#2C1F14] font-semibold font-heading text-lg">{svc.serviceName}</h3>
                    {property && (
                      <p className="text-[#8B3A2A] text-xs mt-0.5">{property.address}, {property.postcode}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[#8B3A2A] text-xs">
                      <Clock size={12} /> Since {svc.startDate}
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                      svc.status === 'Active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>{svc.status}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#8B3A2A] uppercase tracking-wide mb-3">Benefits &amp; Outcomes Achieved</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {svc.benefits.map((b: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg p-3"
                        style={{ background: '#FFF8EE', border: '1px solid rgba(212,134,10,0.15)' }}
                      >
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: '#D4860A' }} />
                        <p className="text-[#2C1F14] text-sm">{b}</p>
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
