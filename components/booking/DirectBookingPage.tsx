'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import { ServiceBookingForm, type ServiceCode } from '@/components/booking/ServiceBookingForm'

interface Props {
  serviceCode:    ServiceCode
  title:          string
  tagline:        string
  bookingHeading: string
  bookingSubheading?: string
  submitLabel?:   string
}

function DirectBookingPageInner({ serviceCode, title, tagline, bookingHeading, bookingSubheading, submitLabel }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('role') ?? (typeof window !== 'undefined' ? sessionStorage.getItem('3c_user_role') : null) ?? ''
  const backHref = role ? `/services?role=${role}` : '/services'

  // Open the form immediately — per spec these services go straight to the form.
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const roleParam = params.get('role')
    if (roleParam && typeof window !== 'undefined') {
      sessionStorage.setItem('3c_user_role', roleParam)
    }
  }, [params])

  function handleClose() {
    setOpen(false)
    router.push(backHref)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 50%,#F5C060 100%)' }}>
      <ServicePageHeader />

      <div className="relative px-6 py-10 text-center overflow-hidden" style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-2 text-[#8B3A2A] text-base sm:text-lg">{tagline}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-[#8B3A2A] hover:text-[#D4860A] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Services
        </Link>

        <p className="text-sm text-[#2C1F14] leading-relaxed mb-6 max-w-xl mx-auto">
          Tell us when you&apos;d like the service and the best time for a call-back — our team will confirm within 24 hours.
        </p>

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#D4860A' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F0A830' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#D4860A' }}
          >
            Open Booking Form
          </button>
        )}
      </div>

      <ServiceBookingForm
        open={open}
        onClose={handleClose}
        serviceCode={serviceCode}
        serviceLabel={title}
        heading={bookingHeading}
        subheading={bookingSubheading}
        submitLabel={submitLabel}
      />

      <ComingSoonWidget />
    </div>
  )
}

export function DirectBookingPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF8EE]" />}>
      <DirectBookingPageInner {...props} />
    </Suspense>
  )
}
