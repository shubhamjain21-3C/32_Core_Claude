'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props { serviceType: string }

export function BookingForm({ serviceType }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const messageParts = [
        data.property_address ? `Property: ${data.property_address}` : '',
        data.postcode         ? `Postcode: ${data.postcode}`         : '',
        data.preferred_date   ? `Preferred Date: ${data.preferred_date}` : '',
        data.notes            ? `Notes: ${data.notes}`               : '',
      ].filter(Boolean)

      const payload = {
        name:    data.name,
        email:   data.email,
        phone:   data.phone || '',
        company: '',
        service: (data.service_type as string) || serviceType,
        message: messageParts.length ? messageParts.join('\n') : `Booking request for ${serviceType}.`,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setDone(true)
        form.reset()
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="font-heading font-bold text-[#2C1F14] text-xl mb-2">Booking Request Received</h3>
        <p className="text-[#8B3A2A]">Thank you! We&apos;ll confirm your booking within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h2 className="font-heading font-semibold text-[#D4860A] text-xl mb-2">Request a Booking</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" name="name" required />
        <Field label="Email Address" name="email" type="email" required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone Number" name="phone" type="tel" />
        <div>
          <label className="block text-sm font-medium text-[#2C1F14] mb-1">Service Type</label>
          <select name="service_type" className={inputCls} defaultValue="">
            <option value="" disabled>Select…</option>
            <option>Check-In Inventory</option>
            <option>Check-Out Inventory</option>
            <option>Both (Check-In & Check-Out)</option>
            <option>Midterm Inspection</option>
            <option>Dispute Resolution</option>
            <option>Maintenance / Compliance</option>
            <option>Deposit Negotiation</option>
          </select>
        </div>
      </div>

      <Field label="Property Address" name="property_address" required />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Preferred Date" name="preferred_date" type="date" />
        <Field label="Postcode" name="postcode" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C1F14] mb-1">Additional Notes</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Any specific requirements or access instructions…"
          className={inputCls + ' resize-none'}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-60"
        style={{ background: loading ? '#aaa' : '#D4860A' }}
      >
        {loading ? 'Sending…' : 'Request Booking'}
      </button>
    </form>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm text-[#2C1F14] border border-[rgba(212,134,10,0.35)] bg-white/70 focus:outline-none focus:border-[#D4860A] focus:ring-1 focus:ring-[#D4860A]'

function Field({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2C1F14] mb-1">
        {label}{required && <span className="text-[#D4860A]"> *</span>}
      </label>
      <input type={type} name={name} required={required} className={inputCls} />
    </div>
  )
}
