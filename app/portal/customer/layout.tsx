import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { findUserByEmail } from '@/lib/store'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { PortalTopBar } from '@/components/portal/PortalTopBar'

export default async function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  // Look up full user record to get portalRole
  const fullUser = session.user.email ? findUserByEmail(session.user.email) : null
  const portalRole = fullUser?.portalRole ?? undefined
  const userName   = session.user.name || session.user.email || 'Client'
  const userEmail  = session.user.email || ''

  return (
    <div className="flex min-h-screen bg-[#FFF8EE]">
      <PortalSidebar role="customer" userName={userName} />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalTopBar userName={userName} userEmail={userEmail} portalRole={portalRole} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
