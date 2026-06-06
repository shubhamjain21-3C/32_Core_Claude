import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getAllCustomers, getPropertiesByCustomer, getServicesByCustomer } from '@/lib/store'

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/portal/admin-login')

  const customers = getAllCustomers()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Admin Portal</p>
        <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">All Customers</h1>
        <p className="text-[#8B3A2A] text-sm mt-1">{customers.length} registered client{customers.length !== 1 ? 's' : ''}</p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212,134,10,0.15)' }}>
              {['Client', 'Contact', 'Company', 'Properties', 'Services', 'Joined'].map(h => (
                <th
                  key={h}
                  className="text-left text-[10px] tracking-[2px] uppercase px-5 py-3 font-medium"
                  style={{ color: '#D4860A' }}
                >{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => {
              const props   = getPropertiesByCustomer(c.id)
              const svcs    = getServicesByCustomer(c.id)
              const activeS = svcs.filter(s => s.status === 'Active').length
              return (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-[rgba(212,134,10,0.04)]"
                  style={{ borderBottom: '1px solid rgba(212,134,10,0.1)' }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: 'rgba(212,134,10,0.12)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <p className="text-[#2C1F14] text-sm font-medium">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[#3D2B1F] text-xs">{c.email}</p>
                    <p className="text-[#8B3A2A] text-xs">{c.phone || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#3D2B1F] text-sm">{c.company || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold" style={{ color: '#D4860A' }}>{props.length}</span>
                    <span className="text-[#8B3A2A] text-xs ml-1">properties</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold" style={{ color: '#D4860A' }}>{activeS}</span>
                    <span className="text-[#8B3A2A] text-xs ml-1">active</span>
                  </td>
                  <td className="px-5 py-3.5 text-[#8B3A2A] text-xs">{c.createdAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
