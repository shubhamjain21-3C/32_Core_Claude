'use client'
import { DirectBookingPage } from '@/components/booking/DirectBookingPage'

export default function MidtermInspectionsPage() {
  return (
    <DirectBookingPage
      serviceCode="midterm"
      title="Midterm Property Inspection"
      tagline="Regular inspections — protecting your investment between tenancies"
      bookingHeading="Book a Midterm Inspection"
      bookingSubheading="An agent visits the property, documents condition with photos, and produces a report shared with all parties."
      submitLabel="Submit Booking"
    />
  )
}
