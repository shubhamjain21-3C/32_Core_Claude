import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { PortalTopBar } from '@/components/portal/PortalTopBar'

export default async function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  // portalRole is set by the customer-login NextAuth provider (sourced from
  // Supabase public.users on first authorize), so we can read it straight
  // from the session — no need to round-trip the in-memory store.
  const portalRole = session.user.portalRole ?? undefined
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
