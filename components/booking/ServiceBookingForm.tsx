'use client'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { X, CheckCircle, Loader2, Lock, ChevronDown, LogIn, UserPlus, UserX } from 'lucide-react'
import type { LookupRow } from '@/types/database'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ServiceCode = 'inventory' | 'maintenance' | 'midterm' | 'dispute' | 'deposit' | 'letting'

interface Props {
  open:              boolean
  onClose:           () => void
  serviceCode:       ServiceCode
  serviceLabel:      string
  /** When true, force the user to pick a maintenance type first */
  requireMaintenanceType?: boolean
  /** Used to label the submit button — defaults to "Submit Booking" */
  submitLabel?:      string
  /** Heading shown at the top of the modal */
  heading?:          string
  /** Sub-heading text under the main heading */
  subheading?:       string
}

const SERVICE_TYPE_FALLBACK_LABELS: Record<ServiceCode, string> = {
  inventory:   'Inventory Management',
  maintenance: 'Maintenance & Cleaning',
  midterm:     'Midterm Property Inspection',
  dispute:     'Dispute Resolution',
  deposit:     'Deposit Negotiation',
  letting:     'Letting Services',
}

const ROLE_LABELS: Record<string, string> = {
  property_manager: 'Property Manager / Landlord',
  landlord:         'Landlord',
  tenant:           'Tenant',
  student:          'Student',
  others:           'Others',
}

// Reused styles — matches the existing amber/gold input look
const inputCls =
  'w-full px-3 py-2 rounded-lg text-sm text-[#2C1F14] border border-[rgba(212,134,10,0.35)] bg-white/85 focus:outline-none focus:border-[#D4860A] focus:ring-1 focus:ring-[#D4860A] transition-colors'
const labelCls = 'block text-xs font-medium text-[#8B3A2A] mb-1 tracking-wide'
const lockedFieldCls =
  'flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#2C1F14] border border-[rgba(212,134,10,0.25)] bg-[rgba(212,134,10,0.06)]'

// ── Component ─────────────────────────────────────────────────────────────────

export function ServiceBookingForm({
  open,
  onClose,
  serviceCode,
  serviceLabel,
  requireMaintenanceType = false,
  submitLabel,
  heading,
  subheading,
}: Props) {
  const { data: session, status } = useSession()
  const sessionRole = session?.user?.portalRole

  // Try to read the journey selection (set by the role-selection flow) when
  // there's no logged-in session — keeps the auto-fill experience consistent.
  const [journeyRole, setJourneyRole] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('3c_user_role')
    if (stored) setJourneyRole(stored)
  }, [])

  const resolvedRole = sessionRole ?? journeyRole ?? ''
  const isLoggedIn   = !!session?.user
  const [guestMode, setGuestMode] = useState(false)

  // ── Maintenance types (only when required) ──────────────────────────────────
  const [maintenanceTypes, setMaintenanceTypes] = useState<LookupRow[]>([])
  useEffect(() => {
    if (!requireMaintenanceType) return
    fetch('/api/lookups?table=ref_maintenance_types')
      .then(r => r.ok ? r.json() : [])
      .then((rows: LookupRow[]) => setMaintenanceTypes(Array.isArray(rows) ? rows : []))
      .catch(() => setMaintenanceTypes([]))
  }, [requireMaintenanceType])

  // ── Form state ──────────────────────────────────────────────────────────────
  const [fullName,       setFullName]       = useState('')
  const [email,          setEmail]          = useState('')
  const [phone,          setPhone]          = useState('')
  const [maintenanceType, setMaintenanceType] = useState('')
  const [summary,        setSummary]        = useState('')
  const [serviceDate,    setServiceDate]    = useState('')
  const [callBackTime,   setCallBackTime]   = useState('')
  const [submitting,     setSubmitting]     = useState(false)
  const [done,           setDone]           = useState(false)
  const [error,          setError]          = useState('')

  // Prefill from session when it loads
  useEffect(() => {
    if (session?.user?.name) setFullName(prev => prev || session.user.name!)
    if (session?.user?.email) setEmail(prev => prev || session.user.email!)
  }, [session])

  // Reset internal state when modal closes
  useEffect(() => {
    if (!open) {
      setDone(false)
      setError('')
      setSubmitting(false)
      setGuestMode(false)
      setMaintenanceType('')
      setSummary('')
      setServiceDate('')
      setCallBackTime('')
    }
  }, [open])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [open])

  // Show the rest of the booking fields only once a maintenance type is picked
  // (when one is required). Otherwise they show immediately.
  const showRestOfForm = useMemo(() => {
    if (!requireMaintenanceType) return true
    return !!maintenanceType
  }, [requireMaintenanceType, maintenanceType])

  const roleLabel  = resolvedRole ? (ROLE_LABELS[resolvedRole] ?? resolvedRole) : ''
  const svcLabel   = serviceLabel || SERVICE_TYPE_FALLBACK_LABELS[serviceCode]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (requireMaintenanceType && !maintenanceType) {
      setError('Please pick a maintenance type to continue.')
      return
    }
    if (!fullName.trim() || !email.trim() || !summary.trim() || !serviceDate || !callBackTime) {
      setError('Please fill out every required field.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCode,
          portalRole:      resolvedRole || undefined,
          fullName,
          email,
          phone,
          maintenanceType: maintenanceType || undefined,
          summary,
          serviceDate,
          callBackTime,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setError(data.message || 'Could not submit your booking. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center px-3 py-6 overflow-y-auto"
      style={{ background: 'rgba(30,15,5,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 100%)',
          border: '1.5px solid rgba(212,134,10,0.35)',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking form"
          className="absolute top-3 right-3 text-[#8B3A2A] hover:text-[#D4860A] transition-colors rounded-md p-1"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle size={42} className="text-[#D4860A] mx-auto mb-4" />
              <h3 className="font-heading font-bold text-[#2C1F14] text-xl mb-2">Booking Received</h3>
              <p className="text-sm text-[#8B3A2A] mb-6 leading-relaxed">
                Thanks — your request has been logged and our team will be in touch within 24 hours
                on the call-back time you provided.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: '#D4860A' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
              >
                Close
              </button>
            </div>
          ) : !isLoggedIn && !guestMode ? (
            <div className="space-y-4">
              <div className="mb-1">
                <p className="text-[10px] tracking-[0.18em] uppercase font-semibold" style={{ color: '#D4860A' }}>
                  Service Booking
                </p>
                <h3 className="font-heading font-bold text-[#2C1F14] text-xl mt-1">
                  {heading || `Book ${svcLabel}`}
                </h3>
                <p className="text-xs text-[#8B3A2A] mt-2">
                  How would you like to proceed?
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  href={`/portal/login?return=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/services')}`}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: '#D4860A', color: 'white', border: '1.5px solid #D4860A' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
                >
                  <LogIn size={16} />
                  Login to Your Account
                </Link>

                <Link
                  href="/portal/register"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(212,134,10,0.1)', color: '#D4860A', border: '1.5px solid rgba(212,134,10,0.35)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,134,10,0.2)'; e.currentTarget.style.borderColor = '#D4860A' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,134,10,0.1)'; e.currentTarget.style.borderColor = 'rgba(212,134,10,0.35)' }}
                >
                  <UserPlus size={16} />
                  Create an Account
                </Link>

                <button
                  type="button"
                  onClick={() => setGuestMode(true)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={{ background: 'transparent', color: '#8B3A2A', border: '1.5px solid rgba(139,58,42,0.25)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,58,42,0.06)'; e.currentTarget.style.borderColor = 'rgba(139,58,42,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(139,58,42,0.25)' }}
                >
                  <UserX size={16} />
                  Continue as Guest
                </button>
              </div>

              <p className="text-[10px] text-[#8B3A2A]/60 text-center mt-2">
                Logged-in users can track bookings in their portal dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-1">
                <p className="text-[10px] tracking-[0.18em] uppercase font-semibold" style={{ color: '#D4860A' }}>
                  {isLoggedIn ? 'Service Booking' : 'Guest Booking'}
                </p>
                <h3 className="font-heading font-bold text-[#2C1F14] text-xl mt-1">
                  {heading || `Book ${svcLabel}`}
                </h3>
                {subheading && (
                  <p className="text-xs text-[#8B3A2A] mt-1">{subheading}</p>
                )}
              </div>

              {/* Auto-filled fields ─────────────────────────────────────────── */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Your Role</label>
                  {resolvedRole ? (
                    <div className={lockedFieldCls}>
                      <span>{roleLabel}</span>
                      <Lock size={12} className="text-[#8B3A2A]/60" />
                    </div>
                  ) : (
                    <input
                      value={resolvedRole}
                      readOnly
                      placeholder="Not set — please log in or use the journey selector"
                      className={inputCls + ' italic opacity-70'}
                    />
                  )}
                </div>
                <div>
                  <label className={labelCls}>Service</label>
                  <div className={lockedFieldCls}>
                    <span>{svcLabel}</span>
                    <Lock size={12} className="text-[#8B3A2A]/60" />
                  </div>
                </div>
              </div>

              {/* Name + email — locked if logged in, editable otherwise */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Full Name <span className="text-[#D4860A]">*</span>
                    {isLoggedIn && <Lock size={10} className="inline ml-1 text-[#8B3A2A]/60" />}
                  </label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    readOnly={isLoggedIn}
                    required
                    className={isLoggedIn ? inputCls + ' bg-[rgba(212,134,10,0.06)]' : inputCls}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Email <span className="text-[#D4860A]">*</span>
                    {isLoggedIn && <Lock size={10} className="inline ml-1 text-[#8B3A2A]/60" />}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    readOnly={isLoggedIn}
                    required
                    className={isLoggedIn ? inputCls + ' bg-[rgba(212,134,10,0.06)]' : inputCls}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Phone <span className="text-[#8B3A2A]/60 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+44 (0) 000 000 0000"
                />
              </div>

              {/* Maintenance type (only when required) ─────────────────────── */}
              {requireMaintenanceType && (
                <div>
                  <label className={labelCls}>
                    Maintenance Type <span className="text-[#D4860A]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={maintenanceType}
                      onChange={e => setMaintenanceType(e.target.value)}
                      required
                      className={inputCls + ' appearance-none pr-8'}
                    >
                      <option value="">Select a maintenance type…</option>
                      {maintenanceTypes.map(m => (
                        <option key={m.code} value={m.code}>{m.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B3A2A] pointer-events-none" />
                  </div>
                  {maintenanceTypes.length === 0 && (
                    <p className="mt-1 text-[10px] text-[#8B3A2A]/70">
                      Loading types… if this stays empty, you can still pick &quot;Other&quot; and describe in the summary.
                    </p>
                  )}
                </div>
              )}

              {/* Rest of form revealed once a maintenance type is picked (if required) */}
              {showRestOfForm && (
                <>
                  <div>
                    <label className={labelCls}>
                      Summary / Description <span className="text-[#D4860A]">*</span>
                    </label>
                    <textarea
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      required
                      rows={3}
                      className={inputCls + ' resize-none'}
                      placeholder="Briefly describe what you need — address, property type, any access notes."
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>
                        Service Date <span className="text-[#D4860A]">*</span>
                      </label>
                      <input
                        type="date"
                        value={serviceDate}
                        onChange={e => setServiceDate(e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Call-back Time <span className="text-[#D4860A]">*</span>
                      </label>
                      <input
                        type="text"
                        value={callBackTime}
                        onChange={e => setCallBackTime(e.target.value)}
                        required
                        placeholder="e.g. Weekdays 10am–12pm"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p
                  className="text-[#8B3A2A] text-xs text-center py-2 px-3 rounded-lg"
                  style={{ background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.25)' }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || (requireMaintenanceType && !maintenanceType)}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: submitting ? '#aaa' : '#D4860A' }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#F0A830' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#D4860A' }}
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Submitting…' : (submitLabel || 'Submit Booking')}
              </button>

              {!isLoggedIn && guestMode && (
                <p className="text-[10px] text-[#8B3A2A]/70 text-center">
                  Booking as guest — your details won&apos;t be saved to a profile.{' '}
                  <button type="button" onClick={() => setGuestMode(false)} className="underline text-[#D4860A]">
                    Login instead
                  </button>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
