import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { PortalTopBar } from '@/components/portal/PortalTopBar'

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/portal/admin-login')

  const userName  = session.user.name || 'Admin'
  const userEmail = session.user.email || ''

  return (
    <div className="flex min-h-screen bg-[#FFF8EE]">
      <PortalSidebar role="admin" userName={userName} />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalTopBar userName={userName} userEmail={userEmail} portalRole="admin" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
