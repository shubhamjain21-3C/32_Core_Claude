import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PortalSidebar } from '@/components/portal/PortalSidebar'

export default async function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  return (
    <div className="flex min-h-screen bg-[#FFF8EE]">
      <PortalSidebar role="customer" userName={session.user.name || session.user.email || 'Client'} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
