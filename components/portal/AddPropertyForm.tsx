'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { services } from '@/data/services'
import toast from 'react-hot-toast'

const inputClass = 'w-full bg-white border border-[rgba(212,134,10,0.3)] text-[#2C1F14] placeholder-[#8B3A2A]/40 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4860A] focus:ring-1 focus:ring-[#D4860A] transition-colors'

export function AddPropertyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    address: '', postcode: '', type: 'Residential', bedrooms: 1,
    monthlyRent: 0, status: 'Vacant', serviceIds: [] as string[],
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const toggleService = (slug: string) =>
    setForm(f => ({
      ...f,
      serviceIds: f.serviceIds.includes(slug)
        ? f.serviceIds.filter(s => s !== slug)
        : [...f.serviceIds, slug],
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Property added successfully!')
        router.push('/portal/customer/properties')
        router.refresh()
      } else {
        toast.error('Failed to add property. Please check all fields.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">Property Address *</label>
        <input value={form.address} onChange={set('address')} required placeholder="e.g. 14 Maple Avenue" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">Postcode *</label>
          <input value={form.postcode} onChange={set('postcode')} required placeholder="e.g. SW1A 1AA" className={inputClass} />
        </div>
        <div>
          <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">Property Type</label>
          <select value={form.type} onChange={set('type')} className={inputClass}>
            {['Residential', 'HMO', 'Commercial', 'Student', 'Holiday Let'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">Bedrooms</label>
          <input type="number" min={0} max={20} value={form.bedrooms} onChange={set('bedrooms')} className={inputClass} />
        </div>
        <div>
          <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">Monthly Rent (£)</label>
          <input type="number" min={0} value={form.monthlyRent} onChange={set('monthlyRent')} placeholder="0" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[#2C1F14] text-xs font-medium mb-1.5 tracking-wide uppercase">Status</label>
        <select value={form.status} onChange={set('status')} className={inputClass}>
          {['Occupied', 'Vacant', 'Under Management', 'For Letting'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Services selection */}
      <div>
        <label className="block text-[#2C1F14] text-xs font-medium mb-3 tracking-wide uppercase">Services Required (select all that apply)</label>
        <div className="grid sm:grid-cols-2 gap-2">
          {services.map(s => (
            <label key={s.slug} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.serviceIds.includes(s.slug) ? 'border-[#D4860A] bg-[rgba(212,134,10,0.08)]' : 'border-[rgba(212,134,10,0.2)] hover:border-[#D4860A]'}`}>
              <input type="checkbox" checked={form.serviceIds.includes(s.slug)} onChange={() => toggleService(s.slug)} className="accent-[#D4860A]" />
              <span className="text-[#2C1F14] text-sm">{s.title}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" loading={loading} className="flex-1">
          {loading ? 'Adding…' : 'Add Property'}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
