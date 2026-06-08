'use client'
import { DirectBookingPage } from '@/components/booking/DirectBookingPage'

export default function DisputeResolutionPage() {
  return (
    <DirectBookingPage
      serviceCode="dispute"
      title="Dispute Resolution"
      tagline="Independent, professional mediation — reaching fair outcomes"
      bookingHeading="Request Dispute Resolution"
      bookingSubheading="Independent mediation between landlord and tenant — non-binding unless both parties agree in writing."
      submitLabel="Submit Request"
    />
  )
}
