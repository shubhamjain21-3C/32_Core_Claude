'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { services } from '@/data/services'
import toast from 'react-hot-toast'

const inputClass = 'w-full bg-[#071224] border border-[#1e3a5f] text-[#c8dff0] placeholder-[#4a90c4]/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2a7fd4] transition-colors'

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
        <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Property Address *</label>
        <input value={form.address} onChange={set('address')} required placeholder="e.g. 14 Maple Avenue" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Postcode *</label>
          <input value={form.postcode} onChange={set('postcode')} required placeholder="e.g. SW1A 1AA" className={inputClass} />
        </div>
        <div>
          <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Property Type</label>
          <select value={form.type} onChange={set('type')} className={inputClass}>
            {['Residential', 'HMO', 'Commercial', 'Student', 'Holiday Let'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Bedrooms</label>
          <input type="number" min={0} max={20} value={form.bedrooms} onChange={set('bedrooms')} className={inputClass} />
        </div>
        <div>
          <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Monthly Rent (£)</label>
          <input type="number" min={0} value={form.monthlyRent} onChange={set('monthlyRent')} placeholder="0" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[#7aaecc] text-xs mb-1.5 tracking-wide">Status</label>
        <select value={form.status} onChange={set('status')} className={inputClass}>
          {['Occupied', 'Vacant', 'Under Management', 'For Letting'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Services selection */}
      <div>
        <label className="block text-[#7aaecc] text-xs mb-3 tracking-wide">Services Required (select all that apply)</label>
        <div className="grid sm:grid-cols-2 gap-2">
          {services.map(s => (
            <label key={s.slug} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.serviceIds.includes(s.slug) ? 'border-[#2a7fd4] bg-[#1a5fa8]/20' : 'border-[#1e3a5f] hover:border-[#2a7fd4]/50'}`}>
              <input type="checkbox" checked={form.serviceIds.includes(s.slug)} onChange={() => toggleService(s.slug)} className="accent-[#2a7fd4]" />
              <span className="text-[#c8dff0] text-sm">{s.title}</span>
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
