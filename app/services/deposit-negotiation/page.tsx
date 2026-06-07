'use client'
import { DirectBookingPage } from '@/components/booking/DirectBookingPage'

export default function DepositNegotiationPage() {
  return (
    <DirectBookingPage
      serviceCode="deposit"
      title="Deposit Negotiation"
      tagline="Fair, transparent deposit resolution — without the stress"
      bookingHeading="Request Deposit Negotiation"
      bookingSubheading="A structured process to agree fair deposit deductions at end of tenancy — faster than formal dispute schemes."
      submitLabel="Submit Request"
    />
  )
}
