'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { SERVICES_LIST } from '@/lib/constants'

const schema = z.object({
  name:    z.string().min(2, 'Name is required'),
  company: z.string().optional(),
  email:   z.string().email('Invalid email address'),
  phone:   z.string().optional(),
  service: z.string().min(1, 'Please select a service'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type FormData = z.infer<typeof schema>

const inputClass = 'w-full bg-[#1e0f05] border border-[#5C3D28] text-[#FDE8B0] placeholder-[#D4860A]/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4860A] transition-colors'

export function ContactForm() {
  const [sending, setSending] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setSending(true)
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) {
        toast.success('Message sent! We\'ll be in touch shortly.')
        reset()
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#B89060] text-xs mb-1.5 tracking-wide">Full Name *</label>
          <input {...register('name')} placeholder="Your full name" className={inputClass} />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-[#B89060] text-xs mb-1.5 tracking-wide">Company</label>
          <input {...register('company')} placeholder="Your company (optional)" className={inputClass} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#B89060] text-xs mb-1.5 tracking-wide">Email Address *</label>
          <input {...register('email')} type="email" placeholder="your@email.com" className={inputClass} />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-[#B89060] text-xs mb-1.5 tracking-wide">Phone Number</label>
          <input {...register('phone')} type="tel" placeholder="+44 (0) 000 000 0000" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[#B89060] text-xs mb-1.5 tracking-wide">Service of Interest *</label>
        <select {...register('service')} className={inputClass}>
          <option value="">Select a service…</option>
          {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="General Enquiry">General Enquiry</option>
        </select>
        {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service.message}</p>}
      </div>
      <div>
        <label className="block text-[#B89060] text-xs mb-1.5 tracking-wide">Message *</label>
        <textarea {...register('message')} rows={5} placeholder="Tell us about your property or enquiry…" className={inputClass + ' resize-none'} />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" size="lg" loading={sending} className="w-full">
        {sending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
