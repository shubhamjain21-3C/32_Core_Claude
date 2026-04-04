'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const SUBJECTS = ['General Enquiry', 'Inventory Services', 'Midterm Inspection', 'Dispute Resolution', 'Maintenance / Compliance', 'Deposit Negotiation', 'Partnership / B2B', 'Complaint', 'Other']

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm text-[#2C1F14] border border-[rgba(212,134,10,0.35)] bg-white/70 focus:outline-none focus:border-[#D4860A] focus:ring-1 focus:ring-[#D4860A]'

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) { setDone(true) }
      else { toast.error('Something went wrong. Please try again.') }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-heading font-bold text-[#2C1F14] text-xl mb-2">Message Received</h3>
        <p className="text-[#8B3A2A] text-sm">Thank you! We&apos;ll respond within 3 business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-heading font-semibold text-[#D4860A] text-xl mb-2">Send Us a Message</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" name="name" required />
        <Field label="Email Address" name="email" type="email" required />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone Number" name="phone" type="tel" />
        <div>
          <label className="block text-sm font-medium text-[#2C1F14] mb-1">Subject</label>
          <select name="subject" className={inputCls} defaultValue="">
            <option value="" disabled>Select…</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C1F14] mb-1">Message <span className="text-[#D4860A]">*</span></label>
        <textarea name="message" required minLength={20} rows={5} placeholder="How can we help you?" className={inputCls + ' resize-none'} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-60"
        style={{ background: loading ? '#aaa' : '#D4860A' }}
      >
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

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
