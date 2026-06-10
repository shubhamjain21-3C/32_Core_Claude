import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { findUserByEmail } from '@/lib/store'
import { findCustomerByEmail, portalRoleCodeFromId } from '@/lib/users-db'
import { User, Mail, Phone, Calendar, Shield, Building2 } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  property_manager: 'Property Manager / Landlord',
  tenant:           'Tenant',
  student:          'Student',
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'customer') redirect('/portal/login')

  const email = session.user.email ?? ''

  // ── Source of truth: Supabase public.users ───────────────────────────────
  // Falls back to the in-memory store for the 9 seeded demo accounts that
  // were never inserted into Supabase.
  const dbUser = email ? await findCustomerByEmail(email) : null

  let firstName  = ''
  let middleName = ''
  let lastName   = ''
  let phone      = ''
  let company    = ''
  let portalRole = ''
  let createdAt  = ''

  if (dbUser) {
    firstName  = dbUser.FirstName || ''
    middleName = dbUser.MiddleName || ''
    lastName   = dbUser.Lastname || ''
    phone      = dbUser.Phone || ''
    company    = dbUser.Company || ''
    portalRole = (await portalRoleCodeFromId(dbUser.portal_role_id)) || ''
    createdAt  = dbUser.created_at ? dbUser.created_at.slice(0, 10) : ''
  } else {
    // Fallback: seeded demo accounts only
    const memUser = email ? findUserByEmail(email) : null
    const nameParts = (memUser?.name ?? '').split(' ')
    firstName  = nameParts[0] ?? ''
    lastName   = nameParts.slice(1).join(' ') ?? ''
    phone      = memUser?.phone ?? ''
    company    = memUser?.company ?? ''
    portalRole = memUser?.portalRole ?? ''
    createdAt  = memUser?.createdAt ?? ''
  }

  const fullName  = [firstName, middleName, lastName].filter(Boolean).join(' ') || email
  const roleLabel = ROLE_LABELS[portalRole] ?? 'Client'

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Client Portal</p>
        <h1 className="text-2xl font-bold font-heading text-[#2C1F14]">My Account</h1>
        <p className="text-[#8B3A2A] text-sm mt-1">Your profile details and account settings.</p>
      </div>

      {/* Avatar + role card */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-5"
        style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: 'rgba(212,134,10,0.15)', color: '#D4860A', border: '2px solid rgba(212,134,10,0.35)' }}
        >
          {(fullName || email || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-heading font-bold text-[#2C1F14] text-xl">{fullName}</p>
          <span
            className="inline-block mt-1 text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(212,134,10,0.12)', color: '#D4860A', border: '1px solid rgba(212,134,10,0.3)' }}
          >
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Details card */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(212,134,10,0.1)' }}>
          <h2 className="font-semibold text-[#2C1F14] font-heading">Personal Information</h2>
        </div>

        <div className="divide-y">
          {[
            { Icon: User,      label: 'First Name',  value: firstName   || '—' },
            { Icon: User,      label: 'Last Name',   value: lastName    || '—' },
            { Icon: Mail,      label: 'Email',       value: email       || '—' },
            { Icon: Phone,     label: 'Phone',       value: phone       || '—' },
            { Icon: Building2, label: 'Company',     value: company     || '—' },
            { Icon: Shield,    label: 'Account Type', value: roleLabel },
            { Icon: Calendar,  label: 'Member Since', value: createdAt  || '—' },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-6 py-4"
              style={{ borderBottom: '1px solid rgba(212,134,10,0.08)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,134,10,0.08)', border: '1px solid rgba(212,134,10,0.2)' }}
              >
                <Icon size={14} style={{ color: '#D4860A' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#8B3A2A] uppercase tracking-wide font-medium">{label}</p>
                <p className="text-[#2C1F14] text-sm mt-0.5 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit note */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{ background: 'rgba(212,134,10,0.06)', border: '1px solid rgba(212,134,10,0.2)' }}
      >
        <p className="text-[#8B3A2A]">
          To update your personal details or change your password, please{' '}
          <a href="/contact" className="font-medium underline" style={{ color: '#D4860A' }}>contact support</a>.
          Self-service profile editing is coming soon.
        </p>
      </div>
    </div>
  )
}
