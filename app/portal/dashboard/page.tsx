import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

// Legacy route — redirect based on role
export default async function PortalDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/portal/login')
  if (session.user.role === 'admin') redirect('/portal/admin/dashboard')
  redirect('/portal/customer/dashboard')
}
