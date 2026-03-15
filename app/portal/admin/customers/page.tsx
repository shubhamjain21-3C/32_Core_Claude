import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getAllCustomers, getPropertiesByCustomer, getServicesByCustomer } from '@/lib/store'

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/portal/admin/login')

  const customers = getAllCustomers()

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-1">Admin Portal</p>
        <h1 className="text-2xl font-bold font-heading text-white">All Customers</h1>
        <p className="text-[#7aaecc] text-sm mt-1">{customers.length} registered client{customers.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e3a5f]">
              {['Client', 'Contact', 'Company', 'Properties', 'Services', 'Joined'].map(h => (
                <th key={h} className="text-left text-[10px] text-[#4a90c4] tracking-[2px] uppercase px-5 py-3 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => {
              const props    = getPropertiesByCustomer(c.id)
              const svcs     = getServicesByCustomer(c.id)
              const activeS  = svcs.filter(s => s.status === 'Active').length
              return (
                <tr key={c.id} className="border-b border-[#1e3a5f]/40 last:border-0 hover:bg-[#1e3a5f]/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a5fa8]/30 flex items-center justify-center text-[#6ab4e8] text-sm font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <p className="text-[#c8dff0] text-sm font-medium">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[#7aaecc] text-xs">{c.email}</p>
                    <p className="text-[#4a90c4] text-xs">{c.phone || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#7aaecc] text-sm">{c.company || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[#2a9fd4] font-bold">{props.length}</span>
                    <span className="text-[#4a90c4] text-xs ml-1">properties</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[#00ccff] font-bold">{activeS}</span>
                    <span className="text-[#4a90c4] text-xs ml-1">active</span>
                  </td>
                  <td className="px-5 py-3.5 text-[#4a90c4] text-xs">{c.createdAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
